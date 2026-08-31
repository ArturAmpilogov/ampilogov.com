#!/usr/bin/env node

const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const publicKey = valueAfter("--public-key");
const patternText = valueAfter("--pattern");
const maxDepth = Number(valueAfter("--max-depth") ?? 6);

if (!publicKey || !patternText) {
  console.error(
    "Usage: node scripts/research/search-yandex-public-tree.mjs --public-key <url> --pattern <regex> [--max-depth 6]",
  );
  process.exit(1);
}

const pattern = new RegExp(patternText, "iu");
const endpoint = "https://cloud-api.yandex.net/v1/disk/public/resources";
let currentLevel = ["/"];
const matches = [];
let directoryCount = 0;
let itemCount = 0;

async function listDirectory(path, offset = 0) {
  const url = new URL(endpoint);
  url.searchParams.set("public_key", publicKey);
  url.searchParams.set("path", path);
  url.searchParams.set("limit", "200");
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    headers: { "user-agent": "ampilogov-research/1.0" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${path}`);
  }
  return response.json();
}

async function listAllItems(path) {
  const allItems = [];
  let offset = 0;
  while (true) {
    const resource = await listDirectory(path, offset);
    const embedded = resource._embedded;
    const items = embedded?.items ?? [];
    allItems.push(...items);
    offset += items.length;
    if (!embedded || items.length === 0 || offset >= embedded.total) break;
  }
  return allItems;
}

for (let depth = 0; depth <= maxDepth && currentLevel.length > 0; depth += 1) {
  const nextLevel = [];
  for (let start = 0; start < currentLevel.length; start += 12) {
    const batch = currentLevel.slice(start, start + 12);
    const results = await Promise.all(
      batch.map(async (path) => ({ path, items: await listAllItems(path) })),
    );
    for (const result of results) {
      directoryCount += 1;
      for (const item of result.items) {
        itemCount += 1;
        if (pattern.test(`${item.name}\n${item.path}`)) {
          matches.push({ type: item.type, name: item.name, path: item.path });
        }
        if (item.type === "dir" && depth < maxDepth) nextLevel.push(item.path);
      }
    }
    if (directoryCount % 100 < batch.length) {
      console.error(`Просмотрено каталогов: ${directoryCount}; объектов: ${itemCount}`);
    }
  }
  currentLevel = nextLevel;
}

console.log(
  JSON.stringify(
    {
      publicKey,
      pattern: patternText,
      maxDepth,
      directoryCount,
      itemCount,
      matches,
    },
    null,
    2,
  ),
);
