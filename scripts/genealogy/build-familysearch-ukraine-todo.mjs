import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const rawPath = process.argv[2] ?? "/tmp/familysearch-a-star-todo-raw.json";
const outputPath = path.join(
  root,
  "data/genealogy/todos/familysearch-ukraine-a-star.json",
);
const reviewedIndexPath = path.join(
  root,
  "data/genealogy/indexes/familysearch-reviewed.json",
);
const searchesPath = path.join(
  root,
  "data/genealogy/searches/familysearch.json",
);
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");

const raw = JSON.parse(await readFile(rawPath, "utf8"));
const reviewedIndex = JSON.parse(await readFile(reviewedIndexPath, "utf8"));
const searches = JSON.parse(await readFile(searchesPath, "utf8"));

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[ъь]/g, "")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();

const normalizeSurname = (value) => {
  const normalized = normalize(value);
  return normalized.endsWith("ова") ? normalized.slice(0, -1) : normalized;
};

const levenshtein = (left, right) => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array(right.length + 1);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    for (let index = 0; index < current.length; index += 1) {
      previous[index] = current[index];
    }
  }
  return previous[right.length];
};

const targetSurnameVariants = [
  "Ампилогов",
  "Анпилогов",
  "Ампилов",
  "Анпилов",
  "Онпилогов",
  "Онфилогов",
  "Анфилогов",
  "Антилогов",
  "Ампологов",
  "Анпологов",
  "Ампелогов",
  "Анпелогов",
  "Анпиллогов",
  "Анпимгов",
  "Ампылогов",
  "Амплогов",
  "Аменлогов",
  "Аминлогов",
  "Арепилогов",
].map(normalizeSurname);

for (const surname of reviewedIndex.observedSurnameForms ?? []) {
  const normalized = normalizeSurname(surname);
  if (normalized && !targetSurnameVariants.includes(normalized)) {
    targetSurnameVariants.push(normalized);
  }
}

const sourceFiles = (await readdir(sourcesDir))
  .filter((file) => file.endsWith(".json"))
  .sort();
const knownNames = new Set();

for (const sourceFile of sourceFiles) {
  const source = JSON.parse(
    await readFile(path.join(sourcesDir, sourceFile), "utf8"),
  );
  for (const mention of source.mentions ?? []) {
    for (const value of [
      mention.displayName,
      mention.modernName,
      mention.nameAsIndexed,
      mention.nameAsTranscribed,
      mention.nameAsWritten,
    ]) {
      const normalized = normalize(value);
      if (
        normalized &&
        !normalized.includes("неразборчив") &&
        !normalized.includes("неуверенно") &&
        normalized.split(" ").length >= 2
      ) {
        knownNames.add(normalized);
      }
    }
  }
}

const knownNamesByFirst = new Map();
for (const knownName of knownNames) {
  const firstName = knownName.split(" ")[0];
  const bucket = knownNamesByFirst.get(firstName) ?? [];
  bucket.push(knownName);
  knownNamesByFirst.set(firstName, bucket);
}

const processedRecordArks = new Map();
const processedImageArks = new Map();

for (const [url, sourceId] of Object.entries(reviewedIndex.arkToSourceId ?? {})) {
  const record = url.match(/\/1:1:([^?]+)/)?.[1];
  const image = url.match(/\/3:1:([^?]+)/)?.[1];
  if (record) processedRecordArks.set(record, `source:${sourceId}`);
  if (image) processedImageArks.set(image, `source:${sourceId}`);
}

for (const searchRun of searches.searchRuns ?? []) {
  for (const page of searchRun.pages ?? []) {
    for (const value of page.reviewedRecordArks ?? []) {
      const record = value.match(/\/1:1:([^?]+)/)?.[1];
      if (record && !processedRecordArks.has(record)) {
        processedRecordArks.set(record, `reviewed:${searchRun.searchRunId}`);
      }
    }
  }
}

const uniqueRows = new Map();
for (const row of raw.rows ?? []) {
  if (!row.recordArk) continue;
  const existing = uniqueRows.get(row.recordArk);
  if (!existing || (!existing.imageArk && row.imageArk)) {
    uniqueRows.set(row.recordArk, row);
  }
}

const analyzeSurname = (name) => {
  const tokens = normalize(name).split(" ").filter(Boolean);
  let best = {
    token: tokens.at(-1) ?? "",
    matchedVariant: targetSurnameVariants[0],
    distance: Number.POSITIVE_INFINITY,
  };
  for (const tokenValue of tokens) {
    const token = normalizeSurname(tokenValue);
    for (const variant of targetSurnameVariants) {
      const distance = levenshtein(token, variant);
      if (distance < best.distance) {
        best = { token: tokenValue, matchedVariant: variant, distance };
      }
    }
  }
  const tokenLength = normalizeSurname(best.token).length;
  const level =
    best.distance === 0
      ? "exact-variant"
      : best.distance <= 2 && tokenLength >= 7
        ? "strong-variant"
        : best.distance <= 3 && tokenLength >= 5
          ? "possible-variant"
          : "unrelated";
  return { ...best, level };
};

const analyzeName = (name) => {
  const normalizedName = normalize(name);
  const tokens = normalizedName.split(" ").filter(Boolean);
  const candidates = knownNamesByFirst.get(tokens[0]) ?? [];
  let closest = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const knownName of candidates) {
    const candidateDistance = levenshtein(normalizedName, knownName);
    if (candidateDistance < distance) {
      closest = knownName;
      distance = candidateDistance;
    }
  }
  const sameFirstAndPatronymic = candidates.some((knownName) => {
    const knownTokens = knownName.split(" ");
    return tokens[1] && tokens[1] === knownTokens[1];
  });
  const level =
    distance === 0
      ? "exact-known-name"
      : distance <= 2
        ? "close-known-name"
        : sameFirstAndPatronymic
          ? "same-given-and-patronymic"
          : candidates.length
            ? "known-given-name-only"
            : "unseen-given-name";
  return {
    normalizedName,
    level,
    matchedKnownName: closest,
    distance: Number.isFinite(distance) ? distance : null,
  };
};

const items = [...uniqueRows.values()].map((row) => {
  const surnameSimilarity = analyzeSurname(row.name);
  const nameSimilarity = analyzeName(row.name);
  const processedBy =
    processedRecordArks.get(row.recordArk) ??
    (row.imageArk ? processedImageArks.get(row.imageArk) : null) ??
    null;
  let workflowStatus;
  let reason;
  if (processedBy) {
    workflowStatus = "already-processed";
    reason = processedBy;
  } else if (surnameSimilarity.level === "exact-variant") {
    workflowStatus = row.imageArk ? "todo-high" : "todo-medium";
    reason = row.imageArk
      ? "Точная известная форма фамилии; оригинал доступен."
      : "Точная известная форма фамилии; ссылка на оригинал не показана в строке."
  } else if (surnameSimilarity.level === "strong-variant") {
    workflowStatus = row.imageArk ? "todo-high" : "todo-medium";
    reason = row.imageArk
      ? "Близкое вероятное искажение фамилии; оригинал доступен."
      : "Близкое вероятное искажение фамилии; требуется открыть карточку."
  } else if (surnameSimilarity.level === "possible-variant") {
    workflowStatus = "todo-review";
    reason = "Пограничная форма фамилии: требуется ручная проверка строки и оригинала."
  } else {
    workflowStatus = "screened-out-unrelated";
    reason = "Ни один компонент имени не похож на целевые формы фамилии достаточно близко."
  }
  return {
    recordArk: row.recordArk,
    recordUrl: row.recordUrl,
    imageArk: row.imageArk ?? null,
    imageUrl: row.imageUrl ?? null,
    name: row.name,
    collectionHeading: row.heading,
    eventText: row.eventText,
    surnameSimilarity,
    nameSimilarity,
    workflowStatus,
    reason,
  };
});

const statusOrder = [
  "todo-high",
  "todo-medium",
  "todo-review",
  "already-processed",
  "screened-out-unrelated",
];
items.sort((left, right) => {
  const statusDifference =
    statusOrder.indexOf(left.workflowStatus) -
    statusOrder.indexOf(right.workflowStatus);
  if (statusDifference) return statusDifference;
  const surnameDifference =
    left.surnameSimilarity.distance - right.surnameSimilarity.distance;
  if (surnameDifference) return surnameDifference;
  return left.name.localeCompare(right.name, "ru");
});

const queues = Object.fromEntries(
  statusOrder.map((status) => [
    status,
    items
      .filter((item) => item.workflowStatus === status)
      .map((item) => item.recordArk),
  ]),
);

const counts = Object.fromEntries(
  statusOrder.map((status) => [status, queues[status].length]),
);
const todoCount =
  counts["todo-high"] + counts["todo-medium"] + counts["todo-review"];

const payload = {
  schemaVersion: 1,
  generatedAt: "2026-08-23",
  provider: "FamilySearch",
  purpose:
    "Полный рабочий TODO украинской выдачи по маске А*гов после удаления уже обработанных ARK.",
  query: {
    recordCountry: "Ukraine",
    surname: "А*гов",
    url: "https://www.familysearch.org/en/search/record/results?count=100&q.recordCountry=Ukraine&q.surname=%D0%90%2A%D0%B3%D0%BE%D0%B2",
  },
  coverage: {
    reportedResultCountAtStart: raw.observedTotal ?? 3387,
    reportedResultCountAfterPagination: 2444,
    rawRowsCapturedAcrossPasses: raw.rows?.length ?? 0,
    pageVisitsCaptured: raw.pages?.length ?? 0,
    uniqueRecordLinksCaptured: items.length,
    note: "FamilySearch меняет число и порядок результатов во время перелистывания. Список фиксирует все уникальные ARK, реально показанные в устойчивых проходах; счётчик 3387 не является стабильным числом уникальных ссылок.",
  },
  summary: {
    uniqueRecordLinks: items.length,
    alreadyProcessedAndRemovedFromTodo: counts["already-processed"],
    remainingTodo: todoCount,
    highPriorityWithVisibleOriginal: counts["todo-high"],
    mediumPriorityNeedsRecordOpen: counts["todo-medium"],
    borderlineNeedsManualReview: counts["todo-review"],
    screenedOutAsUnrelated: counts["screened-out-unrelated"],
  },
  plan: {
    externalBatchSize: 100,
    checkpointEvery: 20,
    stages: [
      "Сначала todo-high: открыть оригинал, сохранить полный кадр и целевой фрагмент, расшифровать все читаемые поля.",
      "Затем todo-medium: открыть карточку, найти привязанный оригинал и повторить полный цикл доказательства.",
      "После основного прохода вручную проверить todo-review; не считать карточкой без подтверждения оригиналом.",
      "После каждой сотни пересобрать familysearch-reviewed.json и удалить обработанные ARK из очередей.",
      "В конце повторить живую выдачу, чтобы подобрать ARK, появившиеся из-за перетасовки FamilySearch.",
    ],
    completionRule:
      "Карточка считается завершённой только после дедупликации события, снимка оригинала, полной расшифровки и успешного аудита.",
  },
  targetSurnameVariants: [...new Set(targetSurnameVariants)].sort((a, b) =>
    a.localeCompare(b, "ru"),
  ),
  queues,
  items,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      output: path.relative(root, outputPath),
      coverage: payload.coverage,
      summary: payload.summary,
    },
    null,
    2,
  ),
);
