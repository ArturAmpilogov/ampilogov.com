#!/usr/bin/env node

import { execFile } from "node:child_process";
import { readFile, rename, unlink } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const values = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  values.set(process.argv[index], process.argv[index + 1]);
}

const url = values.get("--url");
const outputPrefix = values.get("--output-prefix");
const pageCount = Number(values.get("--pages"));
const expectedDocs = Number(values.get("--expected-docs"));
const expectedPages = Number(values.get("--expected-pages") ?? pageCount);
const attempts = Number(values.get("--attempts") ?? 30);
if (!url || !outputPrefix || !pageCount || !expectedDocs) {
  throw new Error("Нужны --url, --output-prefix, --pages и --expected-docs");
}

const marker = '<script id="__NEXT_DATA__" type="application/json">';
const pageProps = async (file) => {
  const html = await readFile(file, "utf8");
  const from = html.indexOf(marker);
  const to = from < 0 ? -1 : html.indexOf("</script>", from);
  if (from < 0 || to < 0) throw new Error("Нет __NEXT_DATA__");
  return JSON.parse(html.slice(from + marker.length, to)).props.pageProps;
};

const stable = async (file, page) => {
  try {
    const props = await pageProps(file);
    return Number(props.pageNum) === page
      && Number(props.totalPages) === expectedPages
      && Number(props.totalDocs) === expectedDocs
      && Array.isArray(props.items)
      && props.items.length === 10;
  } catch {
    return false;
  }
};

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36";

for (let page = 1; page <= pageCount; page++) {
  const output = `${outputPrefix}${page}.html`;
  if (await stable(output, page)) {
    console.log(`${page}/${pageCount} уже стабильно`);
    continue;
  }
  let accepted = false;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const candidate = `${output}.candidate`;
    await run("curl", [
      "--fail", "--silent", "--show-error", "--location", "--retry", "3", "--retry-delay", "2",
      "--user-agent", userAgent, "--output", candidate, `${url}&pageNum=${page}`,
    ]);
    if (await stable(candidate, page)) {
      await rename(candidate, output);
      accepted = true;
      console.log(`${page}/${pageCount} стабилизировано с попытки ${attempt}`);
      break;
    }
    await unlink(candidate).catch(() => {});
    await delay(350);
  }
  if (!accepted) throw new Error(`Страница ${page} не достигла согласованного снимка ${expectedDocs}`);
}
