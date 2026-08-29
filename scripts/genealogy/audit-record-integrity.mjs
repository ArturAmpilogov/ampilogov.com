import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const genealogyRoot = path.join(root, "data/genealogy");
const summaryOnly = process.argv.includes("--summary");

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const loadDirectory = async (relativeDirectory, idKey) => {
  const directory = path.join(genealogyRoot, relativeDirectory);
  const records = [];
  for (const absoluteFile of await jsonFiles(directory)) {
    const record = JSON.parse(await readFile(absoluteFile, "utf8"));
    if (!record[idKey]) continue;
    records.push({
      record,
      absoluteFile,
      file: path.relative(root, absoluteFile),
    });
  }
  return records;
};

const peopleEntries = await loadDirectory("people", "personId");
const sourceEntries = await loadDirectory("sources", "sourceId");
const familyEntries = await loadDirectory("families", "familyId");
const people = new Map(peopleEntries.map((entry) => [entry.record.personId, entry]));
const families = new Map(familyEntries.map((entry) => [entry.record.familyId, entry]));

const findings = [];
const add = (severity, code, file, message, extra = {}) => findings.push({ severity, code, file, message, ...extra });

for (const [kind, entries, idKey] of [
  ["person", peopleEntries, "personId"],
  ["family", familyEntries, "familyId"],
  ["source", sourceEntries, "sourceId"],
]) {
  const ownersById = new Map();
  for (const entry of entries) {
    const id = entry.record[idKey];
    const owners = ownersById.get(id) ?? [];
    owners.push(entry);
    ownersById.set(id, owners);
  }
  for (const [id, owners] of ownersById) {
    if (owners.length < 2) continue;
    add("error", `duplicate-${kind}-id`, owners[0].file, `${id}: ${owners.map((owner) => owner.file).join(", ")}`);
  }
}

const sourceEventIso = (source, kind, mention) => {
  const event = mention?.event ?? source.event ?? {};
  const date = event.date ?? {};
  if (kind === "birth") return date.birthIso ?? (event.type === "birth" ? date.iso : null);
  if (kind === "death") return date.deathIso ?? (event.type === "death" ? date.iso : null);
  if (kind === "marriage") return date.marriageIso ?? (event.type === "marriage" ? date.iso : null);
  return null;
};

const sourceEventYear = (source, kind, mention) => {
  const event = mention?.event ?? source.event ?? {};
  const date = event.date ?? {};
  const iso = kind === "birth"
    ? date.birthIso ?? date.iso
    : kind === "death"
      ? date.deathIso ?? date.iso
      : date.marriageIso ?? date.iso;
  const isoYear = typeof iso === "string" ? iso.match(/^(?:14|15|16|17|18|19)\d{2}/)?.[0] : null;
  if (isoYear) return isoYear;
  const display = typeof date.display === "string" ? date.display : "";
  const years = [...new Set(display.match(/(?:14|15|16|17|18|19)\d{2}/g) ?? [])];
  return years.length === 1 ? years[0] : null;
};

const profileDate = (person, kind) => {
  const fact = person?.[kind];
  const exactIso = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  if (typeof fact === "string") return exactIso(fact);
  if (fact && typeof fact === "object") {
    return exactIso(fact.date)
      ?? exactIso(fact.iso)
      ?? exactIso(fact.date?.iso);
  }
  return exactIso(person?.dates?.[kind]?.iso);
};

const birthRoles = new Set(["child", "baptized-child", "newborn", "twin", "subject"]);
const marriageRoles = new Set(["bride", "groom", "spouse", "couple"]);
const factsByPerson = new Map();

const canonicalNameToken = (value) => {
  const token = (value ?? "")
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[^а-я]/gu, "");
  const equivalents = new Map([
    ["иоанн", "иван"], ["иаков", "яков"], ["симеон", "семен"],
    ["стефан", "степан"], ["феодор", "федор"], ["димитрий", "дмитрий"],
    ["илия", "илья"], ["параскева", "прасковья"], ["парасковья", "прасковья"], ["матрона", "матрена"],
    ["акилина", "акулина"], ["гаврил", "гавриил"], ["пелагия", "пелагея"],
    ["сергий", "сергей"], ["евфим", "евфимий"], ["иулиания", "юлиания"],
    ["захар", "захарий"], ["прокофий", "прокофей"], ["елисавета", "елизавета"],
    ["евстафий", "астафий"], ["парфений", "парфен"], ["георгий", "егор"],
    ["аврам", "авраам"], ["ефими", "ефим"], ["евфими", "ефим"], ["евфим", "ефим"], ["евфимий", "ефим"], ["ефимий", "ефим"],
    ["иаким", "иоаким"], ["аким", "иоаким"], ["иульян", "юлиан"], ["иулиан", "юлиан"],
    ["кассиян", "касьян"], ["прокопи", "прокоп"], ["прокопь", "прокоп"], ["леонти", "леонт"], ["леонть", "леонт"],
    ["илларион", "ларион"], ["давид", "давыд"], ["артем", "артемий"], ["артемь", "артемий"],
    ["викул", "вукол"], ["аврат", "абрат"], ["абрам", "абрат"],
    ["иосиф", "осип"], ["георги", "егор"],
  ]);
  return equivalents.get(token) ?? token;
};

const patronymicStem = (value) => {
  const token = canonicalNameToken(value);
  const match = token.match(/^(.+?)(?:ович|евич|ич|овна|евна|инична)$/u);
  if (!match) return null;
  return canonicalNameToken(match[1]);
};

const comparableName = (value) => {
  const raw = (value ?? "").trim();
  if (!raw || raw.startsWith("[")) return { given: null, patronymic: null };
  const prefixes = new Set(["приходской", "священник", "диакон", "псаломщик", "дьячок", "иерей", "протоиерей"]);
  const rawTokens = raw.replace(/[()]/gu, " ").split(/\s+/u).filter(Boolean);
  while (rawTokens.length && prefixes.has(canonicalNameToken(rawTokens[0]))) rawTokens.shift();
  const surnameLike = (token) => /^(?:амп|анп|онп|онф|анф|ант|ап)[а-я]*ов[аы]?$/u.test(canonicalNameToken(token));
  if (rawTokens.length >= 2 && surnameLike(rawTokens[0])) rawTokens.push(rawTokens.shift());
  const tokens = rawTokens.map(canonicalNameToken).filter(Boolean);
  if (tokens.length === 1 && surnameLike(tokens[0])) return { given: null, patronymic: null };
  let patronymic = patronymicStem(tokens[1]);
  if (!patronymic && tokens.length >= 3) {
    const historicalPatronymic = tokens[1]?.match(/^(.+?)(?:ов|ев|ин|ова|ева|ина)$/u)?.[1];
    if (historicalPatronymic) patronymic = canonicalNameToken(historicalPatronymic);
  }
  return {
    given: tokens[0] ?? null,
    patronymic,
  };
};

const personNameCandidates = (person) => [person.displayName, ...(person.nameVariants ?? []), ...(person.alternateNames ?? [])]
  .filter((value) => typeof value === "string")
  .map(comparableName);

const rememberFact = (personId, kind, iso, sourceId, file) => {
  if (!personId || !iso) return;
  const facts = factsByPerson.get(personId) ?? { birth: new Map(), death: new Map(), marriage: new Map() };
  const owners = facts[kind].get(iso) ?? [];
  owners.push({ sourceId, file });
  facts[kind].set(iso, owners);
  factsByPerson.set(personId, facts);
};

const localEvidenceItems = (source) => {
  const values = [];
  const collect = (value, part = "evidence") => {
    if (!value || typeof value !== "object") return;
    if (typeof value.path === "string") values.push({ part: value.part ?? value.kind ?? part, path: value.path, sha256: value.sha256 });
    for (const [key, child] of Object.entries(value)) {
      if (key === "path" || key === "sha256") continue;
      if (Array.isArray(child)) child.forEach((entry, index) => collect(entry, `${key}.${index + 1}`));
      else if (child && typeof child === "object") collect(child, key);
    }
  };
  collect(source.evidence);
  if (typeof source.evidence?.localBackup === "string") {
    values.push({ part: "localBackup", path: source.evidence.localBackup, sha256: source.evidence.localBackupSha256 });
  }
  return [...new Map(values.map((item) => [item.path, item])).values()];
};

const sha256File = async (absolutePath) => createHash("sha256").update(await readFile(absolutePath)).digest("hex");
let localEvidenceCount = 0;
let verifiedHashCount = 0;

for (const { record: source, file } of sourceEntries) {
  const evidenceItems = localEvidenceItems(source);
  if (evidenceItems.length) localEvidenceCount += 1;

  if (["target-not-verified", "target-partially-visible", "wrong-image", "mismatched"].includes(source.evidence?.quality?.status)) {
    add("warning", "evidence-target-not-verified", file, `${source.sourceId}: ${source.evidence.quality.status}`);
  }

  for (const item of evidenceItems) {
    const absolutePath = path.join(root, item.path);
    try {
      await access(absolutePath);
    } catch {
      add("error", "missing-local-evidence", file, `${source.sourceId}: ${item.path}`);
      continue;
    }
    if (item.sha256) {
      const actual = await sha256File(absolutePath);
      if (actual !== item.sha256) add("error", "evidence-hash-mismatch", file, `${source.sourceId}: ${item.path}`, { expected: item.sha256, actual });
      else verifiedHashCount += 1;
    }
  }

  for (const mention of source.mentions ?? []) {
    if (!mention.personId || !people.has(mention.personId)) continue;
    const person = people.get(mention.personId).record;
    const mentionName = comparableName(mention.modernName ?? mention.displayName);
    const candidateNames = personNameCandidates(person);
    if (mentionName.given && candidateNames.length && !candidateNames.some((candidate) => candidate.given === mentionName.given)) {
      add("warning", "linked-person-given-name-mismatch", file, `${source.sourceId}/${mention.mentionId}: ${mention.modernName ?? mention.displayName} → ${mention.personId} ${person.displayName}`, {
        sourceId: source.sourceId,
        mentionId: mention.mentionId,
        personId: mention.personId,
      });
    } else if (mentionName.patronymic && candidateNames.some((candidate) => candidate.patronymic) && !candidateNames.some((candidate) => candidate.patronymic === mentionName.patronymic)) {
      add("warning", "linked-person-patronymic-mismatch", file, `${source.sourceId}/${mention.mentionId}: ${mention.modernName ?? mention.displayName} → ${mention.personId} ${person.displayName}`, {
        sourceId: source.sourceId,
        mentionId: mention.mentionId,
        personId: mention.personId,
      });
    }
    let kind = null;
    if (birthRoles.has(mention.role)) kind = "birth";
    else if ((mention.role ?? "").startsWith("deceased") || ["buried", "death-subject"].includes(mention.role)) kind = "death";
    else if (marriageRoles.has(mention.role)) kind = "marriage";
    if (!kind) continue;

    const recordIso = sourceEventIso(source, kind, mention);
    rememberFact(mention.personId, kind, recordIso, source.sourceId, file);
    const personIso = profileDate(person, kind);
    if (recordIso && personIso && recordIso !== personIso) {
      const variants = person?.[kind]?.dateVariants ?? [];
      add(variants.includes(recordIso) ? "warning" : "error", `${kind}-date-mismatch`, file, `${source.sourceId}/${mention.mentionId}: Record ${recordIso}, ${mention.personId} ${personIso}`, {
        sourceId: source.sourceId,
        mentionId: mention.mentionId,
        personId: mention.personId,
      });
    }
    if (!recordIso) {
      const recordYear = sourceEventYear(source, kind, mention);
      const profileYear = personIso?.slice(0, 4) ?? null;
      if (recordYear && profileYear && recordYear !== profileYear) {
        add("error", `${kind}-year-mismatch`, file, `${source.sourceId}/${mention.mentionId}: Record ${recordYear}, ${mention.personId} ${profileYear}`, {
          sourceId: source.sourceId,
          mentionId: mention.mentionId,
          personId: mention.personId,
        });
      }
    }
  }

  for (const [field, value] of [
    ["summary.text", source.summary?.text],
    ["transcription.modernInterpretation", source.transcription?.modernInterpretation],
    ...((source.mentions ?? []).flatMap((mention) => [
      [`mentions.${mention.mentionId}.displayName`, mention.displayName],
      [`mentions.${mention.mentionId}.modernName`, mention.modernName],
    ])),
  ]) {
    if (field === "summary.text" && /индексное имя.+Феодор.+исправлено/u.test(value ?? "")) continue;
    if (typeof value === "string" && /(?:^|[^А-Яа-яЁё])Феодор(?:ович|овна)?(?=$|[^А-Яа-яЁё])/u.test(value)) {
      add("warning", "noncanonical-modern-feodor", file, `${source.sourceId} ${field}: ${value}`);
    }
  }
}

for (const [personId, facts] of factsByPerson) {
  for (const kind of ["birth", "death"]) {
    if (facts[kind].size <= 1) continue;
    const detail = [...facts[kind]].map(([iso, owners]) => `${iso}: ${owners.map((owner) => owner.sourceId).join(", ")}`).join("; ");
    const variants = people.get(personId).record?.[kind]?.dateVariants ?? [];
    const allDocumented = [...facts[kind].keys()].every((iso) => iso === profileDate(people.get(personId).record, kind) || variants.includes(iso));
    add(allDocumented ? "warning" : "error", `multiple-${kind}-dates`, people.get(personId).file, `${personId}: ${detail}`, { personId });
  }
}

for (const { record: person, file } of peopleEntries) {
  if (/(?:^|[^А-Яа-яЁё])Феодор(?:ович|овна)?(?=$|[^А-Яа-яЁё])/u.test(person.displayName ?? "")) {
    add("warning", "noncanonical-profile-feodor", file, `${person.personId}: ${person.displayName}`, { personId: person.personId });
  }
  const birth = profileDate(person, "birth");
  const death = profileDate(person, "death");
  if (birth && death && birth > death) add("error", "birth-after-death", file, `${person.personId}: ${birth} > ${death}`, { personId: person.personId });
}

for (const { record: family, file } of familyEntries) {
  const spouseIds = family.spouses ?? [];
  const childIds = family.children ?? [];
  if (new Set(spouseIds).size !== spouseIds.length) add("error", "duplicate-family-spouse", file, `${family.familyId}: ${spouseIds.join(", ")}`);
  if (new Set(childIds).size !== childIds.length) add("error", "duplicate-family-child", file, `${family.familyId}: ${childIds.join(", ")}`);
  for (const personId of spouseIds.filter((personId) => childIds.includes(personId))) {
    add("error", "family-spouse-is-child", file, `${family.familyId}: ${personId}`);
  }

  for (const childId of childIds) {
    const childBirth = profileDate(people.get(childId)?.record, "birth");
    if (!childBirth) continue;
    const childTime = Date.parse(`${childBirth}T00:00:00Z`);
    for (const parentId of spouseIds) {
      const parent = people.get(parentId)?.record;
      const parentBirth = profileDate(parent, "birth");
      const parentDeath = profileDate(parent, "death");
      if (parentBirth) {
        const age = (childTime - Date.parse(`${parentBirth}T00:00:00Z`)) / (365.2425 * 86_400_000);
        if (age < 12) add("error", "parent-too-young", file, `${family.familyId}: ${parentId} ${parentBirth} → ${childId} ${childBirth} (${age.toFixed(1)} лет)`);
        else if (age > 85) add("warning", "parent-age-unlikely", file, `${family.familyId}: ${parentId} ${parentBirth} → ${childId} ${childBirth} (${age.toFixed(1)} лет)`);
      }
      if (parentDeath) {
        const daysAfterDeath = (childTime - Date.parse(`${parentDeath}T00:00:00Z`)) / 86_400_000;
        if (daysAfterDeath > 310) add("error", "child-after-parent-death", file, `${family.familyId}: ${parentId} умер ${parentDeath}, ${childId} родился ${childBirth}`);
      }
    }
  }

  const marriageIso = family.marriage?.date ?? family.marriage?.iso;
  if (!marriageIso) continue;
  for (const personId of family.spouses ?? []) {
    const birth = profileDate(people.get(personId)?.record, "birth");
    const death = profileDate(people.get(personId)?.record, "death");
    if (birth && marriageIso < birth) add("error", "marriage-before-birth", file, `${family.familyId}/${personId}: ${marriageIso} < ${birth}`);
    if (death && marriageIso > death) add("error", "marriage-after-death", file, `${family.familyId}/${personId}: ${marriageIso} > ${death}`);
  }
}

const grouped = Object.groupBy(findings, (finding) => finding.code);
const errors = findings.filter((finding) => finding.severity === "error");
const warnings = findings.filter((finding) => finding.severity === "warning");

console.log(`Проверено: ${sourceEntries.length} Records, ${peopleEntries.length} людей, ${familyEntries.length} семей.`);
console.log(`Локальные изображения указаны у ${localEvidenceCount} Records; подтверждено SHA-256: ${verifiedHashCount} файлов.`);
console.log(`Ошибки: ${errors.length}. Предупреждения: ${warnings.length}.`);
for (const [code, values] of Object.entries(grouped).sort(([left], [right]) => left.localeCompare(right))) {
  console.log(`- ${code}: ${values.length}`);
  if (!summaryOnly) for (const value of values) console.log(`  ${value.file}: ${value.message}`);
}

if (errors.length) process.exitCode = 1;
