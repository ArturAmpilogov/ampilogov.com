import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "data/genealogy/indexes/dompredkov-anpilogov.json");
const OUTPUT_DIR = path.join(ROOT, "data/genealogy/sources/publications");
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1ZSoqya5thvsa2j_4Z-6RSqkCSLejHvy93V0MyxTK4Xk/edit?gid=0#gid=0";
const LIVE_INDEX_URL = "https://next-fast-table-gold.vercel.app/";

// These groups already have public Records based on the original, a full
// publication, or a richer card that enumerates every indexed occurrence.
const COVERED_GROUPS = new Map([
  ["1209-1-9768", ["RGADA-1209-1-9768-OREL-ANPILOGOVY"]],
  ["210-12-13", [
    "RGADA-210-12-13-L35",
    "RGADA-210-12-13-L65",
    "RGADA-210-12-13-L105",
    "RGADA-210-12-13-L106",
    "RGADA-210-12-13-L149",
    "RGADA-210-12-13-L151",
  ]],
  ["210-12-27", ["PUB-DOMPREDKOV-1629-OREL-ANPILOGOVY"]],
  ["210-12-1583", ["PUB-DOMPREDKOV-1686-1705-OREL-ANANYA-ANPILOGOV"]],
  ["210-12-1891", ["PUB-DOMPREDKOV-1700-LIVNY-ANPILOGOVY-ANPILOVY"]],
  ["210-14-502", [
    "RGADA-210-14-502-L67",
    "RGADA-210-14-502-L94",
    "RGADA-210-14-502-L109",
  ]],
  ["210-4-260", [
    "RGADA-210-4-260-L374OB",
    "RGADA-210-4-260-L375",
    "RGADA-210-4-260-L385OB",
    "RGADA-210-4-260-L388",
    "RGADA-210-4-260-L392OB",
    "RGADA-210-4-260-L393OB",
    "RGADA-210-4-260-L402",
    "RGADA-210-4-260-L403OB",
    "RGADA-210-4-260-L425",
  ]],
  ["210-4-270", ["PUB-KURKULEV-2026-KURSK-1628-L185-VASILY-SEMYONOV"]],
  ["210-6д-1", ["RGADA-210-6D-1-L109"]],
  ["210-9-1096", ["PUB-KURKULEV-KURSK-1632-ONPILOGOVY"]],
  ["сборн", ["PUB-DOMPREDKOV-SMUTA-1605-1618-FEDOR-ANPILOGOV"]],
]);

const RELATED_RECORDS = new Map([
  ["1157-1-9", ["PUB-DOMPREDKOV-1686-1705-OREL-ANANYA-ANPILOGOV"]],
  ["1157-1-19", ["PUB-DOMPREDKOV-1686-1705-OREL-ANANYA-ANPILOGOV"]],
  ["210-5-68", ["PUB-DOMPREDKOV-1689-OREL-ANPILOGOVY-NEPLYUEV"]],
]);

const GIVEN_NAME_NORMALIZATION = new Map([
  ["Аверка", "Аверкий"],
  ["Агей", "Аггей"],
  ["Афонька", "Афанасий"],
  ["Богдашка", "Богдан"],
  ["Васка", "Василий"],
  ["Гаврила", "Гавриил"],
  ["Гришка", "Григорий"],
  ["Деменшка", "Дементий"],
  ["Ермошка", "Ермолай"],
  ["Ивашка", "Иван"],
  ["Микифор", "Никифор"],
  ["Митка", "Дмитрий"],
  ["Нефедко", "Нефед"],
  ["Олешка", "Алексей"],
  ["Самошка", "Самойла"],
  ["Сережка", "Сергей"],
  ["Федка", "Фёдор"],
  ["Федотка", "Федот"],
  ["Филимо", "Филимон"],
  ["Фолимон", "Филимон"],
]);

function recordIdForDelo(delo) {
  const latin = delo
    .replaceAll("б", "B")
    .replaceAll("в", "V")
    .replaceAll("г", "G")
    .replaceAll("д", "D")
    .replaceAll("е", "E")
    .replaceAll("ё", "E")
    .replaceAll(/[^0-9A-Za-z]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
  return `PUB-DOMPREDKOV-INDEX-${latin}`;
}

function displayGiven(given) {
  if (!given || /^\.*$/.test(given)) return "[имя не прочитано]";
  if (given === "..кин") return "[имя оканчивается на -кин]";
  if (given === "Ма...") return "[имя начинается на Ма-]";
  if (given === "Ефи") return "Ефим [имя в указателе не завершено]";
  return GIVEN_NAME_NORMALIZATION.get(given) ?? given;
}

function yearBounds(leads) {
  const years = leads.flatMap((lead) =>
    `${lead.year?.delaRange ?? ""} ${lead.year?.asIndexed ?? ""}`
      .match(/(?:15|16|17|18|19|20)\d{2}/g) ?? [],
  ).map(Number);
  if (!years.length) return {};
  return { yearFrom: Math.min(...years), yearTo: Math.max(...years) };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function indexedDateDisplay(leads) {
  return unique(leads.map((lead) => lead.year?.asIndexed))
    .join(", ")
    .replaceAll("-", "–") || "дата уточняется";
}

function russianForm(count, one, few, many) {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  const last = count % 10;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

function normalizeCity(city) {
  return city === "Орел" ? "Орёл" : city;
}

const index = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
const grouped = Map.groupBy(index.leads, (lead) => lead.delo);
const written = [];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [delo, allLeads] of grouped) {
  if (COVERED_GROUPS.has(delo)) continue;

  const leads = allLeads.filter((lead) =>
    !["rejected-machine-match", "superseded-by-full-published-index", "covered-by-record"].includes(lead.status),
  );
  if (!leads.length) continue;

  const dossier = index.dela[delo] ?? {};
  const sourceId = recordIdForDelo(delo);
  const years = yearBounds(leads);
  const cities = unique(leads.map((lead) => lead.city));
  const urls = unique([
    dossier.url,
    ...leads.map((lead) => lead.freeIndexPage),
    ...leads.flatMap((lead) => lead.openAccessFinds ?? []),
    LIVE_INDEX_URL,
    SHEET_URL,
  ]);
  const citation = leads[0].archiveCitation;

  const mentions = leads.map((lead, indexInDelo) => ({
    mentionId: `${sourceId}-M${String(indexInDelo + 1).padStart(2, "0")}`,
    role: "person-named-in-published-index",
    displayName: `${displayGiven(lead.givenAsIndexed)} ${lead.surnameAsIndexed}`,
    nameAsIndexed: lead.nameAsIndexed,
    eventRole: `носитель фамильного ряда в открытом именном указателе; город в указателе: ${lead.city ?? "не указан"}`,
    status: "index-only-original-line-pending",
    uncertainties: [
      "Имя известно только по производному указателю; написание, отчество и контекст нужно сверить по рукописному листу.",
    ],
  }));

  const literalIndexLines = leads.map((lead) =>
    `${lead.nameAsIndexed} — ${lead.year?.asIndexed ?? "год не указан"}, ${lead.city ?? "город не указан"}, ${lead.archiveCitation}.`,
  );
  const mentionWord = russianForm(leads.length, "упоминание", "упоминания", "упоминаний");
  const lineAccusative = russianForm(leads.length, "строку", "строки", "строк");
  const indexedLineSubject = russianForm(
    leads.length,
    "индексная строка требует",
    "индексные строки требуют",
    "индексных строк требуют",
  );

  const record = {
    schemaVersion: 1,
    sourceId,
    isRecord: true,
    cardKind: "published-name-index-lead",
    cardKindNote: "Карточка фиксирует каждую строку открытого именного указателя. Это поисковая ссылка на первичный документ, а не буквальная расшифровка рукописи.",
    provider: "Открытый указатель «Дом предков» / Google-таблица / РГАДА",
    recordType: "published-name-index-lead",
    repository: {
      name: "Российский государственный архив древних актов",
      location: "Москва",
      url: "https://rgada.info/",
    },
    collection: {
      title: dossier.title ?? leads[0].delaTitle,
      archiveCitation: citation,
      sourceUrls: urls,
      sourceCaution: "Указатель сообщает архивный шифр, год, город и имя, но обычно не сообщает лист, отчество, возраст, родство и буквальный текст. Эти сведения нельзя восстанавливать догадкой.",
      ...(dossier.extent ? { extent: dossier.extent } : {}),
    },
    event: {
      type: "published-index-mention",
      date: {
        display: indexedDateDisplay(leads),
        ...years,
      },
      place: {
        asIndexed: cities.join(", ") || "не указан",
        normalized: cities.map(normalizeCity).join(", ") || "место уточняется",
        confidence: "index-only",
      },
    },
    mentions,
    indexData: {
      provider: "Дом предков",
      spreadsheetUrl: SHEET_URL,
      rows: leads.map((lead) => ({
        leadId: lead.leadId,
        archiveCitation: lead.archiveCitation,
        yearAsIndexed: lead.year?.asIndexed,
        cityAsIndexed: lead.city,
        nameAsIndexed: lead.nameAsIndexed,
        occurrenceInDelo: lead.occurrenceInDelo,
      })),
      warning: "Перечень является производным именным указателем. Поля nameAsIndexed и строки ниже не являются расшифровкой оригинала.",
    },
    transcription: {
      status: "name-index",
      suppliedText: `Точное упоминание в опубликованном указателе:\n${literalIndexLines.join("\n")}`,
      modernInterpretation: `В открытом именном указателе к делу перечислено ${leads.length} ${mentionWord} исследуемого фамильного ряда. Карточка сохраняет каждую строку отдельно и не объединяет одноимённых людей. Следующий обязательный шаг — найти соответствующие листы дела и выполнить полную буквальную расшифровку.\n\nСТРОКИ УКАЗАТЕЛЯ. ${literalIndexLines.join(" ")}`,
    },
    context: {
      documentContext: dossier.title ?? leads[0].delaTitle,
      archiveDescription: dossier.note ?? "Подробный контекст дела сохранён по открытой публикации и архивной описи; точное положение именных строк внутри дела неизвестно.",
      whatItProves: `Открытый указатель связывает ${leads.length} ${lineAccusative} фамильного ряда с ${citation}.`,
      whatItDoesNotProve: "Без изображения нельзя подтвердить написание фамилии, установить отчества, родство, оклад, возраст, службу или тождество с людьми из других книг.",
      mapDecision: "Карточка не создаёт точку или маршрут на карте: место известно только из производного указателя, а первичная строка ещё не проверена.",
    },
    summary: {
      status: "needs-source-leaf-and-full-transcription",
      text: `${citation}: ${leads.length} ${indexedLineSubject} поиска листов и полной расшифровки.`,
    },
    review: {
      status: "source-and-transcription-needed",
      unresolved: [
        "Найти точный лист каждой индексной строки.",
        "Получить или открыть изображение рукописи.",
        "Расшифровать полную статью, включая отчество, службу, оклад, семью и соседний контекст.",
        "Сверить чтение фамилии с оригиналом и только затем решать вопрос о профилях и связях между людьми.",
      ],
    },
    ...(RELATED_RECORDS.has(delo) ? { relatedRecords: RELATED_RECORDS.get(delo) } : {}),
  };

  const outputPath = path.join(OUTPUT_DIR, `${sourceId}.json`);
  writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);
  written.push(path.relative(ROOT, outputPath));
}

console.log(`Created or updated ${written.length} public index-lead Records.`);
for (const file of written) console.log(file);
