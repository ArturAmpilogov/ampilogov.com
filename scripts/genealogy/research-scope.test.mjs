import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import ts from "typescript";

// Use the same loader as the directory generator, exposing pure gates only in
// the test module so the production API does not need test-only exports.
const filename = path.resolve("src/lib/genealogy.ts");
const source = fs.readFileSync(filename, "utf8") + `
export const scopeTests = { isGenealogyRecordSource, personBelongsToResearchScope,
  mentionHasAmpilogovSurname, mentionBelongsToResearchScope,
  sourceIsWithinPublicResearchPeriod, personIsWithinPublicResearchPeriod,
  sourceChronologyKey, sourceRoleLabel, sourcePeople };
`;
const loaded = new Module(filename);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    esModuleInterop: true, resolveJsonModule: true },
}).outputText, filename);
const gates = loaded.exports.scopeTests;
const family = { personId: "family", displayName: "Иван Петрович Анфилогов",
  surname: { normalized: "Анфилогов" } };
const early = { personId: "early", displayName: "Анфилоф Селиванов", researchSubject: true };
const people = new Map([[family.personId, family], [early.personId, early]]);
const record = (mention = { personId: "family" }) => ({ sourceId: "fixture", mentions: [mention] });

test("explicit private scope overrides surname, early-name and context admission", () => {
  assert.equal(gates.isGenealogyRecordSource({ ...record(), publicCore: false }, people), false);
  assert.equal(gates.isGenealogyRecordSource({ ...record({ personId: "early" }), publicCore: false,
    isRecord: true, researchScope: "family-origin-context" }, people), false);
  assert.equal(gates.personBelongsToResearchScope({ ...early, publicCore: false }), false);
  assert.equal(gates.personIsWithinPublicResearchPeriod(family, [{ sourceId: "private", publicCore: false }]), false);
});

test("late patronymics and rejected index names do not establish a surname", () => {
  for (const name of ["Павел Анфилогов Ширяев", "Степан Анфилогов Тарасов", "Яков Анфилогов Мельников"]) {
    assert.equal(gates.isGenealogyRecordSource(record({ nameAsTranscribed: name })), false, name);
  }
  assert.equal(gates.isGenealogyRecordSource(record({ nameAsTranscribed: "Павел Петров Ширяев",
    nameAsIndexed: "Павел Анфилогов" })), false);
  assert.equal(gates.isGenealogyRecordSource(record({ personId: "family", surnameSeries: false }), people), false);
});

test("reviewed surname-first lists and legacy isRecord flags remain supported", () => {
  assert.equal(gates.isGenealogyRecordSource(record({ surnameSeries: true,
    nameAsTranscribed: "АНПИЛОГОВЪ, Василій Николаевъ" })), true);
  assert.equal(gates.isGenealogyRecordSource({ ...record(), isRecord: false }, people), true);
  assert.equal(gates.isGenealogyRecordSource(record({ nameAsTranscribed: "Иванъ Петровъ Анфилоговъ" })), true);
});

test("explicit early personal-name subjects remain in Records but not surname map observations", () => {
  const mention = { personId: "early", surnameSeries: false, nameAsTranscribed: "Анфилоф Селиванов" };
  assert.equal(gates.isGenealogyRecordSource(record(mention), people), true);
  assert.equal(gates.personBelongsToResearchScope(early), true);
  assert.equal(gates.mentionHasAmpilogovSurname(mention, people), false);
  assert.equal(gates.sourcePeople(record(mention), people)[0].personId, "early");
});

test("a supported original spelling survives without linking an out-of-scope profile", () => {
  const profiles = new Map([["variant", { personId: "variant", displayName: "Тарас Ампалов",
    surname: { normalized: "Ампалов" } }]]);
  const original = record({ personId: "variant", surnameSeries: true, nameAsTranscribed: "Тарасъ Степановъ Ампиловъ" });
  assert.equal(gates.isGenealogyRecordSource(original, profiles), true);
  assert.equal(gates.sourcePeople(original, profiles)[0].personId, null);
  const baev = new Map([["baev", { personId: "baev", displayName: "Дмитрий Ампилович Баев" }]]);
  assert.equal(gates.isGenealogyRecordSource(record({ personId: "baev", surnameSeries: true,
    nameAsTranscribed: "Дмитрий Ампилов Баев" }), baev), false);
});

test("1950 is inclusive for all supported source date fields", () => {
  for (const field of ["iso", "date", "birthIso", "baptismIso", "deathIso", "burialIso", "marriageIso", "display"]) {
    assert.equal(gates.sourceIsWithinPublicResearchPeriod({ event: { date: { [field]: "1950-12-31" } } }), true, field);
    assert.equal(gates.sourceIsWithinPublicResearchPeriod({ event: { date: { [field]: "1951-01-01" } } }), false, field);
  }
});

test("chronology uses years and dates, retaining uncertain display ranges", () => {
  const entries = [
    { sourceId: "late", event: { date: { display: "14 ноября 1872" } } },
    { sourceId: "early", event: { date: { display: "1833–1835", yearFrom: 1833, yearTo: 1835 } } },
    { sourceId: "marriage", event: { date: { display: "20 июля 1852", iso: "1852-07-20" } } },
    { sourceId: "same-year", event: { date: { date: "1852-01-01" } } },
  ];
  const saved = JSON.stringify(entries);
  assert.deepEqual([...entries].sort((a, b) => gates.sourceChronologyKey(a).localeCompare(gates.sourceChronologyKey(b)))
    .map((entry) => entry.sourceId), ["early", "same-year", "marriage", "late"]);
  assert.equal(JSON.stringify(entries), saved);
  assert.equal(gates.sourceChronologyKey(entries[0], { event: { date: { iso: "1860-01-02" } } }), "1860-01-02");
});

test("new participant roles have Russian labels", () => {
  for (const role of ["resident", "parishioner", "surety-groom", "surety-groom-signatory", "signatory", "registered-family-member"]) {
    assert.match(gates.sourceRoleLabel(role), /[а-яё]/i, role);
  }
});


test("documented fita and Ampelov spellings remain in the surname series", () => {
  for (const spelling of ["Амѳилоговъ", "Ампеловъ"]) {
    const mention = { surnameSeries: true, nameAsTranscribed: `Павелъ ${spelling}` };
    assert.equal(gates.isGenealogyRecordSource(record(mention)), true, spelling);
    assert.equal(gates.mentionHasAmpilogovSurname(mention), true, spelling);
    assert.equal(gates.personBelongsToResearchScope({ personId: "spelling", displayName: `Павел ${spelling}` }), true, spelling);
  }
});
