#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const root = process.cwd();
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const manifestPath = args.get("--manifest");
if (!manifestPath) throw new Error("Нужен --manifest path/to/search.json");

const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
const only = new Set(String(args.get("--only") ?? "").split(",").filter(Boolean));
const allRows = (manifest.batches?.flatMap((batch) => batch.results) ?? manifest.results ?? [])
  .filter((row) => row.capture !== false || only.has(`${row.catalogId}/${row.scanNumber}`))
  .filter((row) => !only.size || only.has(`${row.catalogId}/${row.scanNumber}`));
let uniqueRows = [...new Map(allRows.map((row) => [`${row.catalogId}/${row.scanNumber}`, row])).values()];
const shardCount = Math.max(1, Number(args.get("--shard-count") ?? 1));
const shardIndex = Math.max(0, Number(args.get("--shard-index") ?? 0));
if (shardCount > 1) {
  if (shardIndex >= shardCount) throw new Error("--shard-index должен быть меньше --shard-count");
  uniqueRows = uniqueRows.filter((row) => {
    const key = `${row.catalogId}/${row.scanNumber}`;
    let hash = 2166136261;
    for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
    return hash % shardCount === shardIndex;
  });
}
const searchTerm = manifest.queryText ?? manifest.query?.text ?? "";
// Ищем не только нормализованную форму из запроса, но и документальные
// окончания/варианты (Ампліева, Ампилонов, оборванное «Ампи…»). Граница
// слева не даёт принять за фамильный ряд отчества вроде «Евлампіева».
const searchStem = searchTerm.slice(0, 3);
const surnameSeriesStems = searchTerm === "Ампилогов"
  ? ["Амп", "Анп", "Апп", "Амф", "Анф", "Онп", "Вамп", "Акп", "Алп", "Амт"]
  : [searchStem];
const targetPattern = searchStem
  ? new RegExp(`(?:^|[^А-Яа-яЁёѢѣІі])(?:${surnameSeriesStems.map((stem) => stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "iu")
  : null;
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36";
const metadataRoot = path.join(tmpdir(), `${manifest.searchRunId.toLowerCase()}-metadata`);
await mkdir(metadataRoot, { recursive: true });

const exists = async (file) => {
  try { await access(file); return true; } catch { return false; }
};

if (args.get("--skip-complete") === "true") {
  const completeness = await Promise.all(uniqueRows.map(async (row) => {
    const prefix = String(row.scanNumber).padStart(4, "0");
    const evidenceDir = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
    return Promise.all(["full-view", "header", "target-entry"].map((kind) => exists(path.join(evidenceDir, `${prefix}-${kind}.png`))))
      .then((states) => states.every(Boolean));
  }));
  uniqueRows = uniqueRows.filter((_, index) => !completeness[index]);
}
const from = Math.max(1, Number(args.get("--from") ?? 1));
const limit = Math.max(1, Number(args.get("--limit") ?? uniqueRows.length));
const rows = uniqueRows.slice(from - 1, from - 1 + limit);

const bbox = (points) => {
  if (!Array.isArray(points) || !points.length) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
};

const crop = async (input, output, image, box, minimumWidth = 0) => {
  const left = Math.max(0, Math.floor(box.left));
  const top = Math.max(0, Math.floor(box.top));
  const right = Math.min(image.width, Math.ceil(box.right));
  const bottom = Math.min(image.height, Math.ceil(box.bottom));
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  await run("sips", ["-c", String(height), String(width), "--cropOffset", String(top), String(left), input, "--out", output]);
  if (minimumWidth && width < minimumWidth) {
    await run("sips", ["--resampleWidth", String(minimumWidth), output, "--out", output]);
  }
};

for (const [position, row] of rows.entries()) {
  const scan = Number(row.scanNumber);
  const prefix = String(scan).padStart(4, "0");
  const evidenceDir = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
  const full = path.join(evidenceDir, `${prefix}-full-view.png`);
  const header = path.join(evidenceDir, `${prefix}-header.png`);
  const target = path.join(evidenceDir, `${prefix}-target-entry.png`);
  await mkdir(evidenceDir, { recursive: true });

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "yandex-batch-"));
  try {
    const pageUrl = `https://yandex.ru/archive/catalog/${row.catalogId}/${scan}`;
    const pagePath = path.join(temporaryDirectory, "page.html");
    const marker = '<script id="__NEXT_DATA__" type="application/json">';
    let pageData;
    for (let attempt = 1; attempt <= 8; attempt++) {
      await run("curl", ["--fail", "--silent", "--show-error", "--location", "--user-agent", userAgent, "--output", pagePath, pageUrl]);
      const html = await readFile(pagePath, "utf8");
      const markerFrom = html.indexOf(marker);
      const markerTo = markerFrom < 0 ? -1 : html.indexOf("</script>", markerFrom);
      if (markerFrom >= 0 && markerTo >= 0) {
        pageData = JSON.parse(html.slice(markerFrom + marker.length, markerTo));
        break;
      }
      if (attempt < 8) await delay(attempt * 2500);
    }
    if (!pageData) throw new Error(`Нет __NEXT_DATA__ после повторов: ${pageUrl}`);
    const pageProps = pageData.props?.pageProps ?? {};
    const node = pageProps.currentNode;
    if (!node?.id || !node?.originalImageSize) throw new Error(`Нет описания изображения: ${pageUrl}`);
    await writeFile(path.join(metadataRoot, `${row.catalogId}-${scan}.json`), `${JSON.stringify({ row, pageProps }, null, 2)}\n`);

    if (!(await exists(full))) {
      let converted = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const grantPath = path.join(temporaryDirectory, "grant.json");
          await run("curl", [
            "--fail", "--silent", "--show-error", "--location", "--user-agent", userAgent,
            "--referer", pageUrl, "--header", "Content-Type: application/json", "--header", "Accept: application/json",
            "--data", JSON.stringify({ nodeId: node.id, type: "original" }), "--output", grantPath,
            "https://yandex.ru/archive/api/image-grant",
          ]);
          const grant = JSON.parse(await readFile(grantPath, "utf8"));
          if (!grant?.url || !grant?.token) throw new Error(`Нет grant оригинала: ${pageUrl}`);
          const original = path.join(temporaryDirectory, "original-image");
          await run("curl", [
            "--fail", "--silent", "--show-error", "--location", "--user-agent", userAgent,
            "--referer", pageUrl, "--header", `X-Archive-Image-Token: ${grant.token}`,
            "--output", original, `https://yandex.ru${grant.url}`,
          ]);
          await run("sips", ["-s", "format", "png", original, "--out", full]);
          converted = true;
          break;
        } catch (error) {
          if (attempt === 5) throw error;
          await delay(attempt * 2000);
        }
      }
      if (!converted) throw new Error(`Не удалось сохранить оригинал: ${pageUrl}`);
    }

    const image = node.originalImageSize;
    if (!(await exists(header))) {
      const headerHeight = Math.min(image.height, Math.max(260, Math.round(image.height * 0.28)));
      await crop(full, header, image, { left: 0, top: 0, right: image.width, bottom: headerHeight }, 900);
    }
    if (!(await exists(target))) {
      const textBlocks = node.textBlocks ?? [];
      const joined = node.joinedTextBlocks ?? [];
      const matched = textBlocks.flatMap((block, index) => targetPattern?.test(block.text ?? "") ? [bbox(joined[index]?.points)] : []).filter(Boolean);
      let box;
      if (matched.length) {
        box = {
          left: Math.min(...matched.map((item) => item.left)) - 90,
          top: image.height - Math.max(...matched.map((item) => item.bottom)) - 140,
          right: Math.max(...matched.map((item) => item.right)) + 90,
          bottom: image.height - Math.min(...matched.map((item) => item.top)) + 140,
        };
      } else {
        box = { left: image.width * 0.08, top: image.height * 0.12, right: image.width * 0.92, bottom: image.height * 0.88 };
      }
      await crop(full, target, image, box, 1200);
    }
    console.log(`${position + 1}/${rows.length} ${row.catalogId}/${scan}`);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

console.log(JSON.stringify({ captured: rows.length, metadataRoot }));
