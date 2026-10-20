#!/usr/bin/env node
// Checks translations/<locale>/docs/**.md against the Russian docs/:
//  - the same {{TOKEN}} lines, link targets, [S-…] codes and heading levels;
//  - whether the Russian file changed since it was translated
//    (translations/doc-sources.json keeps the hash of the translated version).
//
//   pnpm i18n:check            report problems (exit 1 on structural mismatch)
//   pnpm i18n:check --stamp    record the current Russian hashes as translated
//                              (run after updating a translation)
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "docs");
const translationsRoot = path.join(root, "translations");
const stampFile = path.join(translationsRoot, "doc-sources.json");
const locales = ["en", "uk", "be"];
const stamp = process.argv.includes("--stamp");

const walk = (directory) => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith(".md") ? [full] : [];
  })
  : [];

const hash = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const tokens = (text) => text.match(/\{\{[A-Z_]+(?::[a-z0-9-]+)?\}\}/g) ?? [];
const links = (text) => [...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((match) => match[1]);
const sources = (text) => text.match(/\[S-[A-Z0-9-]+\]/g) ?? [];
const headings = (text) => (text.match(/^#{1,6}(?= )/gm) ?? []).map((marks) => marks.length);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const stamps = fs.existsSync(stampFile) ? JSON.parse(fs.readFileSync(stampFile, "utf8")) : {};
let structural = 0;
let stale = 0;
let total = 0;

for (const locale of locales) {
  for (const file of walk(path.join(translationsRoot, locale, "docs"))) {
    total += 1;
    const sourcePath = path.relative(path.join(translationsRoot, locale, "docs"), file).split(path.sep).join("/");
    const label = `${locale}/${sourcePath}`;
    const originalFile = path.join(docsRoot, sourcePath);
    if (!fs.existsSync(originalFile)) {
      console.log(`✗ ${label}: no Russian original`);
      structural += 1;
      continue;
    }
    const original = fs.readFileSync(originalFile, "utf8");
    const translated = fs.readFileSync(file, "utf8");
    const problems = [
      !same(tokens(original), tokens(translated)) && "{{TOKEN}} lines differ",
      !same(links(original), links(translated)) && "link targets differ",
      !same(sources(original), sources(translated)) && "[S-…] codes differ",
      !same(headings(original), headings(translated)) && "heading structure differs",
    ].filter(Boolean);
    if (problems.length) {
      structural += 1;
      console.log(`✗ ${label}: ${problems.join("; ")}`);
    }
    const key = `${locale}/${sourcePath}`;
    if (stamp) {
      stamps[key] = hash(original);
    } else if (stamps[key] !== hash(original)) {
      stale += 1;
      console.log(`• ${label}: the Russian text changed since this translation`);
    }
  }
}

if (stamp) {
  const sorted = Object.fromEntries(Object.entries(stamps).sort(([left], [right]) => left.localeCompare(right)));
  fs.writeFileSync(stampFile, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Stamped ${total} translations.`);
} else {
  console.log(`${total} translated documents · ${structural} with structural problems · ${stale} to update`);
  if (structural) process.exitCode = 1;
}
