#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-exact-datefrom1899-2026-09-12-pages-001-018.json");
const searchUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&dateFrom=1899&is_digitized=0&updateDate=0&searchZone=name%3Bsheet&rankMode=by_date&sortOrder=ascending&index=archive&excludeSeen=0";

// Exact live order captured in a hidden IAB tab on 2026-09-12.
const refsByPage = [
  ["41116a74-46c7-4a10-8bd1-9e8262e215a5/387","41116a74-46c7-4a10-8bd1-9e8262e215a5/270","aae25a32-bdd9-4379-9ee5-03e5f351c61a/8","13c848b4-e8a6-4346-b7ac-0b66e390a383/159","13c848b4-e8a6-4346-b7ac-0b66e390a383/9","183fad9b-4eae-4cad-9a42-225296044e85/344","08d51c6f-6917-4ac6-8c85-3b6755d082b2/156","13c848b4-e8a6-4346-b7ac-0b66e390a383/66","13c848b4-e8a6-4346-b7ac-0b66e390a383/52","13c848b4-e8a6-4346-b7ac-0b66e390a383/126"],
  ["08d51c6f-6917-4ac6-8c85-3b6755d082b2/156","13c848b4-e8a6-4346-b7ac-0b66e390a383/9","13c848b4-e8a6-4346-b7ac-0b66e390a383/159","88537e1c-09b7-400b-bc45-f819bdf3b730/8","13c848b4-e8a6-4346-b7ac-0b66e390a383/144","e9306a29-ea40-4416-8854-0dfa659eb539/55","13c848b4-e8a6-4346-b7ac-0b66e390a383/164","110fa313-3d37-4924-b63e-760a555db085/121","762247df-37b9-4a21-8877-0d3ee1109411/145","13c848b4-e8a6-4346-b7ac-0b66e390a383/60"],
  ["13c848b4-e8a6-4346-b7ac-0b66e390a383/164","88537e1c-09b7-400b-bc45-f819bdf3b730/8","762247df-37b9-4a21-8877-0d3ee1109411/145","07723ff5-4c56-4c10-85d4-6543a4fb313e/104","13c848b4-e8a6-4346-b7ac-0b66e390a383/83","13c848b4-e8a6-4346-b7ac-0b66e390a383/22","f0b97a0f-0bb8-423a-801f-89c06cf90ab6/94","e9306a29-ea40-4416-8854-0dfa659eb539/57","5bb8ec8a-6805-4295-ba48-7518be1d2aaa/91","13c848b4-e8a6-4346-b7ac-0b66e390a383/168"],
  ["13c848b4-e8a6-4346-b7ac-0b66e390a383/217","5bb8ec8a-6805-4295-ba48-7518be1d2aaa/91","f0b97a0f-0bb8-423a-801f-89c06cf90ab6/94","e9306a29-ea40-4416-8854-0dfa659eb539/57","13c848b4-e8a6-4346-b7ac-0b66e390a383/46","13c848b4-e8a6-4346-b7ac-0b66e390a383/168","13c848b4-e8a6-4346-b7ac-0b66e390a383/114","e9306a29-ea40-4416-8854-0dfa659eb539/36","13c848b4-e8a6-4346-b7ac-0b66e390a383/125","13c848b4-e8a6-4346-b7ac-0b66e390a383/135"],
  ["13c848b4-e8a6-4346-b7ac-0b66e390a383/138","13c848b4-e8a6-4346-b7ac-0b66e390a383/17","13c848b4-e8a6-4346-b7ac-0b66e390a383/125","13c848b4-e8a6-4346-b7ac-0b66e390a383/114","13c848b4-e8a6-4346-b7ac-0b66e390a383/89","13c848b4-e8a6-4346-b7ac-0b66e390a383/131","110fa313-3d37-4924-b63e-760a555db085/153","4dcaee14-e8c2-4b0b-8082-570caa8063bb/288","13c848b4-e8a6-4346-b7ac-0b66e390a383/133","13c848b4-e8a6-4346-b7ac-0b66e390a383/178"],
  ["13c848b4-e8a6-4346-b7ac-0b66e390a383/178","13c848b4-e8a6-4346-b7ac-0b66e390a383/150","13c848b4-e8a6-4346-b7ac-0b66e390a383/71","13c848b4-e8a6-4346-b7ac-0b66e390a383/132","13c848b4-e8a6-4346-b7ac-0b66e390a383/107","13c848b4-e8a6-4346-b7ac-0b66e390a383/171","13c848b4-e8a6-4346-b7ac-0b66e390a383/133","13c848b4-e8a6-4346-b7ac-0b66e390a383/44","762247df-37b9-4a21-8877-0d3ee1109411/97","13c848b4-e8a6-4346-b7ac-0b66e390a383/118"],
  ["a10756ac-e75d-421b-8ab6-c9fd0c37883d/281","9e0e2775-88fa-4a41-8e07-30bd228340b5/163","17176562-3ac5-4bcc-bf34-f6e29510bdbc/81","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/11","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/144","6158f811-7a02-444c-aecd-eddd72cf14d9/131","2ea6c060-5d59-4fdd-83b5-a1d1e91cc8c4/74","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/158","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/139","0fae0607-e87c-4cae-bab7-f680b816a1a1/167"],
  ["086b3d86-0f40-4a18-8e77-fd60f5d99afa/119","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/58","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/63","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/162","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/190","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/197","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/101","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/12","2ea6c060-5d59-4fdd-83b5-a1d1e91cc8c4/122","17176562-3ac5-4bcc-bf34-f6e29510bdbc/66"],
  ["d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/260","086b3d86-0f40-4a18-8e77-fd60f5d99afa/119","f40bfba0-ee18-439c-90e2-3f7f5400d154/112","0a7f6607-ebd3-475a-83f7-852765f0d611/71","c357be34-a2dd-40e7-9976-9ad14696171a/7","5534512e-24ad-46e0-8d08-fab576c69ff7/160","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/24","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/172","9e0e2775-88fa-4a41-8e07-30bd228340b5/150","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/82"],
  ["d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/20","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/130","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/148","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/82","5534512e-24ad-46e0-8d08-fab576c69ff7/160","9e0e2775-88fa-4a41-8e07-30bd228340b5/150","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/57","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/172","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/200","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/39"],
  ["9e0e2775-88fa-4a41-8e07-30bd228340b5/189","2ea6c060-5d59-4fdd-83b5-a1d1e91cc8c4/175","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/75","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/5","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/19","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/132","c7bc1c3a-d866-4458-bebd-cdb5e91c4832/188","17176562-3ac5-4bcc-bf34-f6e29510bdbc/72","f3ba69c5-1afc-4621-9fd1-30efcd9f0ea7/109","1a7bfb24-b4b0-47fa-aff9-c61cb551373e/33"],
  ["1a7bfb24-b4b0-47fa-aff9-c61cb551373e/33","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/19","33654e15-a03b-4fdf-b1e5-5ca92826133f/111","50a75a9b-9ade-409f-a3df-26e872340852/32","6158f811-7a02-444c-aecd-eddd72cf14d9/162","5534512e-24ad-46e0-8d08-fab576c69ff7/50","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/77","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/14","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/143","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/78"],
  ["d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/95","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/14","6158f811-7a02-444c-aecd-eddd72cf14d9/162","610e774a-fb19-4664-8f2b-3518bac3ffb9/158","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/140","6158f811-7a02-444c-aecd-eddd72cf14d9/113","d132049d-d622-4aa7-bcd1-dcd63e3f7a7c/143","5735f66a-84cc-4f03-b063-5f849be58130/53","93b0ba2e-5a97-46cf-9fe3-3b05edf86273/157","a8dc0163-373d-40f2-a9dc-ac3052ea6fe9/178"],
  ["a5c333b7-18ad-4d39-8c61-23458f256064/23","a5c333b7-18ad-4d39-8c61-23458f256064/146","5735f66a-84cc-4f03-b063-5f849be58130/53","37ed5eed-2468-40f0-ad75-eff2ffc1fc24/39","a8dc0163-373d-40f2-a9dc-ac3052ea6fe9/209","7758e09d-e214-4567-994f-513e58708918/301","a8dc0163-373d-40f2-a9dc-ac3052ea6fe9/61","1191ae76-26fd-4163-b327-fdb6d845665c/279","1191ae76-26fd-4163-b327-fdb6d845665c/294","a5c333b7-18ad-4d39-8c61-23458f256064/181"],
  ["a5c333b7-18ad-4d39-8c61-23458f256064/181","a5c333b7-18ad-4d39-8c61-23458f256064/19","5735f66a-84cc-4f03-b063-5f849be58130/316","1191ae76-26fd-4163-b327-fdb6d845665c/274","1191ae76-26fd-4163-b327-fdb6d845665c/279","08b4c31b-ad26-452e-b6df-c1cbae23161c/194","93b0ba2e-5a97-46cf-9fe3-3b05edf86273/145","a8dc0163-373d-40f2-a9dc-ac3052ea6fe9/38","ccff6c49-e3e6-4df2-9c25-eeeaea3a7953/247","3bc4e547-d620-4b0a-b3a5-7d2d93db0a16/195"],
  ["3bc4e547-d620-4b0a-b3a5-7d2d93db0a16/195","5ec92452-4572-4143-b2da-90c912d26ba8/47","1191ae76-26fd-4163-b327-fdb6d845665c/297","5ec92452-4572-4143-b2da-90c912d26ba8/60","a5c333b7-18ad-4d39-8c61-23458f256064/7","5ec92452-4572-4143-b2da-90c912d26ba8/45","5735f66a-84cc-4f03-b063-5f849be58130/80","f26cebd0-61a3-4823-86d0-1b68b778df94/123","7758e09d-e214-4567-994f-513e58708918/247","1191ae76-26fd-4163-b327-fdb6d845665c/254"],
  ["a8e0a0c2-7ad5-4eb2-aad8-43b03d49b24d/53","5735f66a-84cc-4f03-b063-5f849be58130/96","1191ae76-26fd-4163-b327-fdb6d845665c/258","7758e09d-e214-4567-994f-513e58708918/247","20843122-e220-4a68-a4ca-477a06516b25/238","20843122-e220-4a68-a4ca-477a06516b25/228","0da322c9-b95d-460a-af7d-edd3c7588ab3/14","46598f71-e62a-4c4a-b25a-88f3a326e5dd/148","8dc70350-9264-4091-b0a5-3a70d2fc574b/54","46598f71-e62a-4c4a-b25a-88f3a326e5dd/179"],
  ["0da322c9-b95d-460a-af7d-edd3c7588ab3/14","46598f71-e62a-4c4a-b25a-88f3a326e5dd/47","881b7e83-61d1-4dc5-b568-ba7696d48729/7","6bb282aa-d41a-4d93-9e4c-8ab5ed5a12a4/72","b2b047ed-c64d-4795-8572-3064a6f2ed33/52","7a8e1f42-da53-48c5-86fb-08aec685c430/89","0da322c9-b95d-460a-af7d-edd3c7588ab3/10","42cf3901-6956-423d-8e4b-18ee4aed8a29/68","22cbdc59-478e-47a3-ae72-f0f8067bacf0/172","260a6b3b-e80d-4a28-aa68-bafe750fe942/355"],
];

async function filesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursive(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }))).flat();
}

function canonicalYandexUrls(value, urls = new Set()) {
  if (typeof value === "string" && value.includes("yandex.ru/archive/catalog/")) {
    try {
      const url = new URL(value);
      urls.add(`${url.origin}${url.pathname}`.replace(/\/$/, ""));
    } catch {}
  } else if (Array.isArray(value)) {
    for (const item of value) canonicalYandexUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) canonicalYandexUrls(item, urls);
  }
  return urls;
}

const sourcesByUrl = new Map();
for (const file of await filesRecursive(path.join(root, "data/genealogy/sources"))) {
  let source;
  try { source = JSON.parse(await readFile(file, "utf8")); } catch { continue; }
  if (!source.sourceId) continue;
  const evidencePaths = [source.evidence?.path, ...(source.evidence?.fragments?.map((item) => item.path) ?? [])].filter(Boolean);
  for (const url of canonicalYandexUrls(source)) {
    const entries = sourcesByUrl.get(url) ?? [];
    entries.push({ sourceId: source.sourceId, sourceFile: path.relative(root, file), evidencePaths, isRecord: source.isRecord, publicCore: source.publicCore, reviewStatus: source.review?.status ?? null });
    sourcesByUrl.set(url, entries);
  }
}

const seen = new Set();
const results = refsByPage.flatMap((refs, pageIndex) => refs.map((ref, positionIndex) => {
  const [catalogId, scanText] = ref.split("/");
  const canonicalUrl = `https://yandex.ru/archive/catalog/${ref}`;
  const linked = sourcesByUrl.get(canonicalUrl) ?? [];
  const duplicate = seen.has(canonicalUrl);
  seen.add(canonicalUrl);
  return {
    ordinal: pageIndex * 10 + positionIndex + 1,
    page: pageIndex + 1,
    position: positionIndex + 1,
    catalogId,
    scanNumber: Number(scanText),
    canonicalUrl,
    status: linked.length ? (duplicate ? "complete-duplicate-position" : "complete-with-primary-record") : "missing-record",
    sourceIds: [...new Set(linked.map((item) => item.sourceId))].sort(),
    sourceFiles: [...new Set(linked.map((item) => item.sourceFile))].sort(),
    evidencePaths: [...new Set(linked.flatMap((item) => item.evidencePaths))].sort(),
  };
}));

const missing = results.filter((row) => row.status === "missing-record");
const unique = new Set(results.map((row) => row.canonicalUrl));
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-exact-datefrom1899-2026-09-12-pages-001-018",
  status: missing.length ? "in-progress" : "complete",
  capturedAt: "2026-09-12",
  verifiedAt: "2026-09-12",
  query: { text: "Анпилогов", dateFrom: 1899, isDigitized: false, updateDate: false, searchZone: ["name", "sheet"], rankMode: "by_date", sortOrder: "ascending", index: "archive", excludeSeen: false, url: searchUrl },
  liveSearch: { reportedResultCount: 724, reportedPageCount: 73, reviewedPageRange: [1, 18], rowsPerPage: 10 },
  policy: { manuallyReadPrimaryScans: true, yandexOcrUsedOnlyForNavigation: true, fullHeaderTargetEvidenceRequired: true, privateVercelBlobBackupRequired: true, publicCutoffYear: 1950 },
  progress: { pagesReviewed: 18, rowsReviewed: results.length, uniqueScansReviewed: unique.size, duplicatePositions: results.length - unique.size, coveredUniqueScans: unique.size - new Set(missing.map((row) => row.canonicalUrl)).size, missingUniqueScans: new Set(missing.map((row) => row.canonicalUrl)).size, rowsRemaining: missing.length },
  pages: refsByPage.map((refs, index) => ({ page: index + 1, reviewStatus: refs.some((ref) => !sourcesByUrl.has(`https://yandex.ru/archive/catalog/${ref}`)) ? "in-progress" : "complete", rows: 10, uniqueScans: new Set(refs).size, refs })),
  results,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ progress: manifest.progress, missing: missing.map((row) => `${row.page}:${row.position} ${row.catalogId}/${row.scanNumber}`) }, null, 2));
