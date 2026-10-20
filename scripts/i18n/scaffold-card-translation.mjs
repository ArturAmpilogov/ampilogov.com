#!/usr/bin/env node
// Creates or refreshes a card translation file:
//   pnpm i18n:card <en|uk|be> <records|people> <id> [<id> …]
//   pnpm i18n:card <en|uk|be> <records|people> --status   (coverage of existing files)
//
// The file lists every Russian string the card displays as a key. Fill in the
// values; an empty value keeps the Russian text. Existing translations are kept,
// and keys whose Russian text no longer appears on the card are dropped (the
// card changed — translate the new text). See src/lib/card-translations.ts.
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const root = process.cwd();
const [locale, kind, ...rest] = process.argv.slice(2).filter((arg) => arg !== "--");
const locales = ["en", "uk", "be"];
const kinds = ["records", "people"];

if (!locales.includes(locale) || !kinds.includes(kind) || rest.length === 0) {
  console.error("Usage: pnpm i18n:card <en|uk|be> <records|people> <id…> | --status");
  process.exit(1);
}

// Keys that hold identifiers, URLs, search text or the literal transcription:
// never shown as translatable prose.
const skippedKeys = new Set([
  "sourceId", "personId", "possiblePersonId", "placeId", "url", "originalUrl", "indexedUrl",
  "evidenceUrl", "repositoryUrl", "externalUrl", "searchText", "literal", "transcription",
  "imageReference", "fileName", "provider", "eventType", "reviewState", "evidenceRightsStatus",
  "sex", "normalizedSurname", "year", "birthYear", "sourceIds", "pathname",
]);

function loadGenealogyModule() {
  const file = path.join(root, "src/lib/genealogy.ts");
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText;
  const loaded = new Module(file);
  loaded.filename = file;
  loaded.paths = Module._nodeModulePaths(path.dirname(file));
  loaded._compile(output, file);
  return loaded.exports;
}

function collectStrings(value, key, found) {
  if (key && skippedKeys.has(key)) return;
  if (typeof value === "string") {
    if (/[А-Яа-яЁёІіЇїЄєЎў]/.test(value)) found.add(value.trim());
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, null, found);
  } else if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) collectStrings(child, childKey, found);
  }
}

const directory = path.join(root, "translations", locale, kind);
const fileFor = (id) => path.join(directory, `${id}.json`);
const readExisting = (id) => (fs.existsSync(fileFor(id)) ? JSON.parse(fs.readFileSync(fileFor(id), "utf8")) : null);

const genealogy = loadGenealogyModule();
const cardFor = (id) => (kind === "records" ? genealogy.getArchiveRecord(id) : genealogy.getDirectoryPerson(id));

if (rest[0] === "--status") {
  const ids = fs.existsSync(directory)
    ? fs.readdirSync(directory).filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5))
    : [];
  for (const id of ids) {
    const card = cardFor(id);
    if (!card) {
      console.log(`${id}: card no longer exists`);
      continue;
    }
    const strings = new Set();
    collectStrings(card, null, strings);
    const { strings: existing = {} } = readExisting(id) ?? {};
    const done = [...strings].filter((value) => existing[value]).length;
    console.log(`${id}: ${done}/${strings.size} strings translated`);
  }
  process.exit(0);
}

fs.mkdirSync(directory, { recursive: true });
for (const id of rest) {
  const card = cardFor(id);
  if (!card) {
    console.error(`${id}: no public ${kind} card with this id`);
    process.exitCode = 1;
    continue;
  }
  const strings = new Set();
  collectStrings(card, null, strings);
  const { strings: existing = {} } = readExisting(id) ?? {};
  const merged = Object.fromEntries([...strings].map((value) => [value, existing[value] ?? ""]));
  const file = { locale, kind, id, strings: merged };
  fs.writeFileSync(fileFor(id), `${JSON.stringify(file, null, 2)}\n`);
  const done = Object.values(merged).filter(Boolean).length;
  console.log(`${path.relative(root, fileFor(id))}: ${done}/${strings.size} strings translated`);
}

spawnSync(process.execPath, [path.join(root, "scripts/i18n/build-card-translation-manifest.mjs")], { stdio: "inherit" });
