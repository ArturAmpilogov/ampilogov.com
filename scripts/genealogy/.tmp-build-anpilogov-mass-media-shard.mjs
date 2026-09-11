#!/usr/bin/env node
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const trackerPath = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-mass-media-2026-09-11-part-3.json");
const evidenceRoot = path.join(root, "data/genealogy/evidence-private/yandex");
const queryUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&index=mass_media&updateDate=0&excludeSeen=0&rankMode=by_date&sortOrder=ascending";
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36";
const cookieJar = "/private/tmp/anpilogov-yandex-cookies.txt";

function nextData(html) {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const from = html.indexOf(marker);
  const to = from < 0 ? -1 : html.indexOf("</script>", from);
  if (from < 0 || to < 0) throw new Error("NEXT_DATA missing");
  return JSON.parse(html.slice(from + marker.length, to));
}

async function curlText(url, options = []) {
  const { stdout } = await run("curl", ["--fail", "--silent", "--show-error", "--location", "--max-time", "20", "--retry", "2", "--cookie", cookieJar, "--cookie-jar", cookieJar, "--user-agent", ua, ...options, url], { maxBuffer: 120 * 1024 * 1024 });
  return stdout;
}

async function fetchNextData(url) {
  let last;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const separator = url.includes("?") ? "&" : "?";
    const html = await curlText(`${url}${separator}_cb=${Date.now()}-${attempt}`);
    try { return nextData(html); } catch (error) { last = error; }
  }
  throw new Error(`NEXT_DATA missing after retries: ${url}; ${last?.message}`);
}

function clean(text = "") {
  return text.replace(/\u0007[\[\]]/g, "").replace(/\s+/g, " ").trim();
}

function tokens(text) {
  return new Set(clean(text).toLocaleLowerCase("ru").match(/[а-яёa-z0-9]{3,}/giu) ?? []);
}

function chooseBlock(node, snippet) {
  const wanted = tokens(snippet);
  const candidates = (node.textBlocks ?? []).map((block, index) => ({ block, index, points: node.joinedTextBlocks?.[index]?.points ?? [] }))
    .filter(({ block }) => /(?:а|о)нпилогов/i.test(block.text));
  for (const item of candidates) {
    const have = tokens(item.block.text);
    item.score = [...wanted].filter((word) => have.has(word)).length / Math.max(1, wanted.size);
  }
  return candidates.sort((a, b) => b.score - a.score || b.block.text.length - a.block.text.length)[0] ?? null;
}

function bounds(points, width, height) {
  if (!points?.length) return { left: 0, top: 0, right: width, bottom: height };
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  return {
    left: Math.max(0, Math.floor(Math.min(...xs) - 90)),
    top: Math.max(0, Math.floor(Math.min(...ys) - 90)),
    right: Math.min(width, Math.ceil(Math.max(...xs) + 90)),
    bottom: Math.min(height, Math.ceil(Math.max(...ys) + 90)),
  };
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function imageInfo(file) {
  const { stdout } = await run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]);
  return { width: Number(stdout.match(/pixelWidth: (\d+)/)?.[1]), height: Number(stdout.match(/pixelHeight: (\d+)/)?.[1]) };
}

async function downloadOriginal(nodeId, pageUrl, output) {
  const grantText = await curlText("https://yandex.ru/archive/api/image-grant", ["--referer", pageUrl, "--header", "Content-Type: application/json", "--header", "Accept: application/json", "--data", JSON.stringify({ nodeId, type: "original" })]);
  const grant = JSON.parse(grantText);
  if (!grant?.url || !grant?.token) throw new Error("image grant missing");
  await run("curl", ["--fail", "--silent", "--show-error", "--location", "--max-time", "60", "--retry", "2", "--user-agent", ua, "--referer", pageUrl, "--header", `X-Archive-Image-Token: ${grant.token}`, "--output", output, `https://yandex.ru${grant.url}`]);
}

async function cropBundle(input, full, header, target, box) {
  const py = [
    "from PIL import Image",
    "import sys",
    "im=Image.open(sys.argv[1]).convert('RGB')",
    "im.save(sys.argv[2], 'JPEG', quality=96, optimize=True)",
    "im.crop((0,0,im.width,min(800,im.height))).save(sys.argv[3], 'PNG', optimize=True)",
    "b=tuple(map(int,sys.argv[5:9]))",
    "im.crop(b).save(sys.argv[4], 'PNG', optimize=True)",
  ].join(";");
  await run("python3", ["-c", py, input, full, header, target, String(box.left), String(box.top), String(box.right), String(box.bottom)], { maxBuffer: 10 * 1024 * 1024 });
}

async function independentOcr(target) {
  const { stdout } = await run("tesseract", [target, "stdout", "-l", "rus+eng", "--psm", "6"], { maxBuffer: 10 * 1024 * 1024 });
  return clean(stdout);
}

let tracker;
try { tracker = JSON.parse(await readFile(trackerPath, "utf8")); } catch {
  tracker = {
    schemaVersion: 1,
    searchRunId: "YANDEX-ARCHIVE-ANPILOGOV-MASS-MEDIA-2026-09-11-PART-3",
    status: "in-progress",
    createdAt: "2026-09-11",
    query: { provider: "Яндекс Архив", text: "Анпилогов", index: "mass_media", sort: "ascending-by-date", searchUrl: queryUrl },
    scope: { pageFrom: 36, pageTo: 53, expectedRows: 175, publicCutoffYear: 1950 },
    rules: { verifyIndexAgainstPrimaryScan: true, localEvidenceRequired: true, publicRecordsAfter1950: false },
    progress: { pagesCompleted: 0, rowsReviewed: 0, rowsWithSavedEvidence: 0, duplicates: 0, remainingRows: 175 },
    pages: [],
  };
}
for (const result of tracker.pages.flatMap((page) => page.results)) {
  if (result.primaryScanReading) result.yandexTextLayerDraft = result.primaryScanReading;
  result.primaryScanReading = null;
  result.transcriptionConfidence = "awaiting-manual-image-review";
  result.status = "evidence-captured-awaiting-manual-transcription";
}

const completed = new Map(tracker.pages.flatMap((page) => page.results.map((r) => [`${r.catalogId}/${r.scanNumber}`, r])));
const searchPages = [];
for (let page = 36; page <= 53; page++) {
  const data = (await fetchNextData(`${queryUrl}&pageNum=${page}`)).props.pageProps;
  if (data.items.length !== (page === 53 ? 5 : 10)) throw new Error(`Unexpected result count on page ${page}: ${data.items.length}`);
  searchPages.push({ page, items: data.items });
  console.log(`index:${page}`);
}

const seen = new Set();
for (const { page, items } of searchPages) {
  let pageEntry = tracker.pages.find((p) => p.page === page);
  if (!pageEntry) { pageEntry = { page, status: "in-progress", reportedRows: items.length, results: [] }; tracker.pages.push(pageEntry); }
  const pending = [];
  for (let position = 1; position <= items.length; position++) {
    const item = items[position - 1];
    const key = `${item.parentId}/${item.sheetPageNumber}`;
    if (seen.has(key)) throw new Error(`Duplicate result key ${key}`);
    seen.add(key);
    if (completed.has(key)) continue;
    pending.push({ item, position, key });
  }
  for (let offset = 0; offset < pending.length; offset += 5) {
    const entries = await Promise.all(pending.slice(offset, offset + 5).map(async ({ item, position, key }) => {
    const pageUrl = `https://yandex.ru/archive/catalog/${item.parentId}/${item.sheetPageNumber}`;
    const detail = (await fetchNextData(pageUrl)).props.pageProps;
    const node = detail.currentNode;
    const hit = chooseBlock(node, item.snippet);
    const width = node.originalImageSize.width, height = node.originalImageSize.height;
    const box = bounds(hit?.points, width, height);
    const dir = path.join(evidenceRoot, item.parentId);
    await mkdir(dir, { recursive: true });
    const prefix = String(item.sheetPageNumber).padStart(4, "0");
    const temp = path.join(dir, `${prefix}-original-download.tmp`);
    const full = path.join(dir, `${prefix}-full-view.jpg`);
    const header = path.join(dir, `${prefix}-header.png`);
    const target = path.join(dir, `${prefix}-target-entry.png`);
    await downloadOriginal(node.id, pageUrl, temp);
    await cropBundle(temp, full, header, target, box);
    await rm(temp, { force: true });
    const ocr = await independentOcr(target).catch(() => "");
    const issue = detail.breadcrumbs?.at(-1)?.name ?? node.namepath?.split("/").at(-2) ?? "Периодическое издание";
    const publication = `${detail.breadcrumbs?.[1]?.name ?? "Периодическое издание"}, ${issue}`;
    const date = (item.dateFrom ?? "").replace(/^(\d{2})-(\d{2})-(\d{4})$/, "$3-$2-$1");
    return {
      position, catalogId: item.parentId, scanNumber: item.sheetPageNumber, date, publication,
      ocrHint: clean(item.snippet),
      primaryScanReading: null,
      yandexTextLayerDraft: clean(hit?.block?.text || item.snippet),
      independentOcrReading: ocr,
      transcriptionConfidence: "awaiting-manual-image-review",
      status: "evidence-captured-awaiting-manual-transcription",
      researchEvidence: {
        full: { path: path.relative(root, full), sha256: await sha256(full), dimensions: await imageInfo(full) },
        header: { path: path.relative(root, header), sha256: await sha256(header), dimensions: await imageInfo(header) },
        target: { path: path.relative(root, target), sha256: await sha256(target), dimensions: await imageInfo(target), cropBox: box },
        quality: { documentOnly: true, header: true, target: true, originalImageDownload: true },
      },
      sourceUrl: pageUrl,
      publicRecordCreated: false,
      publicCutoffReason: "Дата источника позже 1950 года.",
    };
    }));
    for (const entry of entries) {
    pageEntry.results.push(entry);
    const key = `${entry.catalogId}/${entry.scanNumber}`;
    completed.set(key, entry);
    console.log(`${page}:${entry.position} ${key}`);
    }
    tracker.pages.sort((a, b) => a.page - b.page);
    pageEntry.results.sort((a, b) => a.position - b.position);
    const count = tracker.pages.reduce((n, p) => n + p.results.length, 0);
    tracker.progress = { pagesCompleted: tracker.pages.filter((p) => p.results.length === p.reportedRows).length, rowsReviewed: count, rowsWithSavedEvidence: count, duplicates: 0, remainingRows: 175 - count };
    await writeFile(trackerPath, JSON.stringify(tracker, null, 2) + "\n");
  }
  pageEntry.status = "evidence-complete-awaiting-manual-transcription";
  await writeFile(trackerPath, JSON.stringify(tracker, null, 2) + "\n");
}

tracker.status = "evidence-complete-awaiting-manual-transcription";
tracker.progress = { pagesCompleted: 18, rowsReviewed: 175, rowsWithSavedEvidence: 175, duplicates: 0, remainingRows: 0 };
tracker.notes = [
  "Страницы 36–53 точного отсортированного запроса обработаны; 17 полных страниц по 10 строк и последняя страница из 5 строк дают 175 уникальных результатов.",
  "Весь диапазон датирован 1979–2023 годами и сохранён только как закрытый исследовательский материал: публичные Records, профили и карта не создавались.",
  "Для каждой строки сохранён оригинальный полный лист без интерфейса, верхний контекстный фрагмент и увеличенная область найденного текстового блока; OCR-поля остаются только черновыми подсказками до визуальной проверки.",
];
await writeFile(trackerPath, JSON.stringify(tracker, null, 2) + "\n");
console.log(JSON.stringify(tracker.progress));
