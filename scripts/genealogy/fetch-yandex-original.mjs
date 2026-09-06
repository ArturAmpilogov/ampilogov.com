#!/usr/bin/env node

/**
 * Downloads the original archival raster exposed by the Yandex Archive viewer.
 * The viewer first issues a short-lived grant; this script follows that same
 * documented application flow and never writes the grant token to stdout.
 *
 * Usage:
 *   node scripts/genealogy/fetch-yandex-original.mjs --catalog UUID --scan 137 --out /private/tmp/leaf.jpg
 */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);

const catalogId = args.get("--catalog");
const scan = Number(args.get("--scan"));
const output = args.get("--out");
if (!catalogId || !Number.isInteger(scan) || !output) {
  console.error("Использование: node scripts/genealogy/fetch-yandex-original.mjs --catalog UUID --scan N --out /private/tmp/leaf.jpg");
  process.exit(1);
}

const pageUrl = `https://yandex.ru/archive/catalog/${catalogId}/${scan}`;
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36";
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "yandex-original-"));
const pagePath = path.join(temporaryDirectory, "page.html");
const grantPath = path.join(temporaryDirectory, "grant.json");
const configPath = path.join(temporaryDirectory, "curl.conf");
try {
  // The public page accepts a normal browser request through curl; Node fetch
  // is occasionally challenged by the provider even with the same UA.
  await run("curl", ["--fail", "--silent", "--show-error", "--location", "--user-agent", userAgent, "--output", pagePath, pageUrl]);
  const html = await readFile(pagePath, "utf8");
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const from = html.indexOf(marker);
  const to = from < 0 ? -1 : html.indexOf("</script>", from);
  if (from < 0 || to < 0) throw new Error("Не найдено описание листа в ответе Яндекс Архива");
  const pageData = JSON.parse(html.slice(from + marker.length, to));
  const nodeId = pageData.props?.pageProps?.currentNode?.id;
  if (!nodeId) throw new Error("В описании листа отсутствует идентификатор изображения");

  await run("curl", [
    "--fail", "--silent", "--show-error", "--location", "--user-agent", userAgent,
    "--referer", pageUrl, "--header", "Content-Type: application/json", "--header", "Accept: application/json",
    "--data", JSON.stringify({ nodeId, type: "original" }), "--output", grantPath,
    "https://yandex.ru/archive/api/image-grant",
  ]);
  const grant = JSON.parse(await readFile(grantPath, "utf8"));
  if (!grant?.url || !grant?.token) throw new Error("Ответ Яндекса не содержит временный URL оригинала");

  await writeFile(configPath, [
    `url = "https://yandex.ru${grant.url}"`,
    `header = "X-Archive-Image-Token: ${grant.token}"`,
    `header = "Referer: ${pageUrl}"`,
    'header = "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"',
    `user-agent = "${userAgent}"`,
  ].join("\n"));
  await run("curl", ["--fail", "--silent", "--show-error", "--location", "--config", configPath, "--output", output]);
  const bytes = (await readFile(output)).byteLength;
  console.log(JSON.stringify({ catalogId, scan, nodeId, output, bytes, kind: "yandex-original" }));
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
