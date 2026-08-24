import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { SiteHeader } from "@/components/site-header";
import { getArchiveRecord, getRecordsDirectory } from "@/lib/genealogy";

type RecordPageProps = {
  params: Promise<{ sourceId: string }>;
};

const legacyRecordDestinations: Record<string, string> = {
  "RGADA-210-12-13": "/records?search=RGADA-210-12-13",
};

function confidenceLabel(confidence: string) {
  return ({ high: "высокая", medium: "средняя", low: "низкая" } as Record<string, string>)[confidence] ?? confidence;
}

function interpretationSection(paragraph: string) {
  const match = paragraph.match(/^([А-ЯЁ0-9][А-ЯЁ0-9 ,:;«»()—–-]+)\.\s+([\s\S]+)$/);
  return match ? { heading: match[1], text: match[2] } : { heading: null, text: paragraph };
}

const personRoleOrder: Record<string, number> = {
  "человек, давший название": 0,
  "владелец поместья": 1,
  муж: 2,
  "ведущий кандидат на мужа": 3,
  "исследовательский кандидат": 4,
  писец: 5,
  "должностное лицо": 6,
};

export function generateStaticParams() {
  return getRecordsDirectory().records.map((record) => ({ sourceId: record.sourceId }));
}

export async function generateMetadata({ params }: RecordPageProps): Promise<Metadata> {
  const { sourceId } = await params;
  const decodedSourceId = decodeURIComponent(sourceId);
  if (legacyRecordDestinations[decodedSourceId]) {
    return {
      title: "Смотренный список 1626 года",
      description: "Шесть самостоятельных записей РГАДА, ф. 210, оп. 12, д. 13.",
    };
  }
  const record = getArchiveRecord(decodedSourceId);
  if (!record) return { title: "Запись не найдена" };
  return {
    title: `${record.eventLabel}: ${record.primaryPerson?.name ?? record.date}`,
    description: `${record.date}, ${record.place}. Архивная запись, расшифровка и связанные профили.`,
  };
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { sourceId } = await params;
  const decodedSourceId = decodeURIComponent(sourceId);
  const legacyDestination = legacyRecordDestinations[decodedSourceId];
  if (legacyDestination) redirect(legacyDestination);
  const record = getArchiveRecord(decodedSourceId);
  if (!record) notFound();
  const hasEvidenceAsset = Boolean(record.evidenceFragments.length || record.evidenceUrl);
  const hasEvidence = record.mayDisplayEvidence && hasEvidenceAsset;
  const people = [...record.people].sort(
    (left, right) => (personRoleOrder[left.role] ?? 10) - (personRoleOrder[right.role] ?? 10),
  );
  const nameExplanationCount = people.reduce(
    (total, person) => total + person.nameAnalysis.length,
    0,
  );
  const eponym = people.find((person) => person.role === "человек, давший название");
  const laterEstateHolders = ["Микита Старков", "Верига Булбин", "Семён Юрлов"]
    .map((name) => people.find((person) => person.name === name))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));
  const researchCandidate = people.find((person) => person.role === "ведущий кандидат на мужа") ??
    people.find((person) => person.role === "исследовательский кандидат");
  const proofThreshold = eponym?.nameAnalysis.find((item) => item.label === "Что должно доказать тождество кандидата");
  const eponymStoryLabels = [
    "Главный вывод на сегодня",
    "Что известно о самом человеке",
    "Как найдено имя",
    "Смысл названия",
    "Разбор по частям",
    "Форма имени",
    "Крестильное и повседневное имя",
    "Самый ранний прямой носитель имени: Анфилоф Селиванов",
    "Ближайшая патронимическая параллель: Тонкой Онфилогов",
    "Может ли отец Тонкого быть нашим Онфилогом",
    "Документированный путь из Прилука через Тверь",
    "Новый тверской след: «Анфилов починок»",
    "Почему Анфилов починок ещё не наше Онфилогово",
    "Что должно доказать тождество кандидата",
  ];
  const eponymStory = eponymStoryLabels
    .map((label) => eponym?.nameAnalysis.find((item) => item.label === label))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="record-page">
      <SiteHeader />
      <article className="record-document section-shell">
        <Link className="record-back" href="/records">← Все записи</Link>

        <header className="record-heading">
          <div>
            <span className="eyebrow">{record.provider} · {record.sourceId}</span>
            <h1>{record.primaryPerson?.name ?? record.eventLabel}</h1>
            <p className="record-heading-meta">
              <span className="record-heading-type">
                <RecordTypeIcon eventType={record.eventType} />
                <span>{record.eventLabel}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{record.date}</span>
              <span aria-hidden="true">·</span>
              <span>{record.place}</span>
            </p>
          </div>
          <div className="record-heading-actions">
            <span
              className={`record-state is-${record.reviewState}`}
              title={record.reviewDescription}
            >
              {record.reviewLabel}
            </span>
            {record.originalUrl ? (
              <a className="record-open-scan" href={record.originalUrl} target="_blank" rel="noreferrer">
                {record.originalLabel} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </header>

        {record.directoryFacts.length ? (
          <dl className="record-derived-facts" aria-label="Ключевые факты и расчёты">
            {record.directoryFacts.map((fact) => (
              <div key={`${fact.label}:${fact.value}`}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <section className={`record-texts${people.length >= 6 ? " is-deep-reading" : ""}`} aria-label="Тексты записи">
          <div className="record-literal">
            <div className="record-literal-heading">
              <div>
                <span className="section-label">Как в документе</span>
                <h2>Буквальная расшифровка</h2>
              </div>
            </div>
            {record.literal ? (
              <blockquote>{record.literal}</blockquote>
            ) : (
              <div className="record-text-missing">
                <strong>{record.status.includes("index-only") ? "Это сводная карточка именного индекса" : "Полного текста пока нет"}</strong>
                <p>{record.status.includes("index-only")
                  ? "Индексные события, имена, даты и ссылки уже собраны ниже. Буквальные тексты оригинальных актов хранятся в отдельных карточках по мере проверки сканов."
                  : "Запись остаётся в очереди. Краткое описание не считается расшифровкой."}</p>
              </div>
            )}
          </div>
          <div className="record-modern">
            <span className="section-label">Современное чтение</span>
            <h2>{record.people.length ? "Имена, биографии и смысл" : "Смысл документа"}</h2>
            <div className="record-modern-sections">
              <section>
                <h3>{record.people.length ? `Имена: ${people.length} · пояснений: ${nameExplanationCount}` : "Что именно установлено"}</h3>
                {record.people.length ? (
                  <p className="record-modern-section-lede">
                    Здесь разобрано не только чтение имён. Для каждого человека показаны его роль,
                    варианты написания, родственные и владельческие связи, хронология, география,
                    сила доказательства и точная граница между фактом и гипотезой.
                  </p>
                ) : (
                  <p className="record-modern-section-lede">
                    Это общий документ или архивная зацепка без доступного поимённого списка. Ниже показан установленный исторический контекст; персональные карточки появятся только после обнаружения фамилии в оригинале или надёжной расшифровке.
                  </p>
                )}
                {record.people.length ? (
                  <nav className="record-name-index" aria-label="Указатель имён в разборе">
                    <span>Перейти к человеку</span>
                    <div>
                      {people.map((person, index) => (
                        <a href={`#record-person-${index}`} key={`${person.personId ?? person.name}:index`}>
                          {person.name}
                        </a>
                      ))}
                    </div>
                  </nav>
                ) : null}
                {eponym ? (
                  <div className="record-name-dossier" aria-label="Подробный вывод об имени Онфилог и названии Онфилогово">
                    <header>
                      <span>Имя, топоним и найденный человек</span>
                      <h4>Что уже можно рассказать об Онфилоге</h4>
                      <p>
                        Ниже не словарная справка, а цепочка доказательства: что сообщает само название,
                        каким могло быть крестильное имя, кто найден в документах нужного поколения и
                        где заканчивается установленный факт.
                      </p>
                    </header>
                    <dl>
                      {eponymStory.map((item, index) => (
                        <div className={index === 0 ? "is-verdict" : undefined} key={item.label}>
                          <dt>{item.label}</dt>
                          <dd>{item.text}</dd>
                        </div>
                      ))}
                    </dl>
                    {researchCandidate ? (
                      <aside>
                        <span>Параллельная владельческая гипотеза</span>
                        <strong>{researchCandidate.name}</strong>
                        <p>
                          {researchCandidate.nameAnalysis[0]?.text ?? researchCandidate.details[0]}
                          {proofThreshold ? ` ${proofThreshold.text}` : ""}
                        </p>
                      </aside>
                    ) : null}
                  </div>
                ) : null}
                {laterEstateHolders.length === 3 ? (
                  <div className="record-name-overview" aria-label="Что произошло с владением после 1634/1635 года">
                    {laterEstateHolders.map((person, index) => (
                      <section key={person.name}>
                        <span>{index + 1} · новый документ XVII века</span>
                        <h4>{person.name}</h4>
                        <p>{person.nameAnalysis[0]?.text ?? person.details[0]}</p>
                      </section>
                    ))}
                    <section>
                      <span>Вывод из трёх статей</span>
                      <h4>Бывшее владение Стефаниды распалось</h4>
                      <p>
                        Анфилогово оказалось у Старкова; Никольское Свечино, Садыково и Ишково —
                        у Булбина; Воронино и Попово — у Юрлова. Все они уже названы пустошами.
                        Это подтверждает продолжение истории именно нашего селения, но ни одного
                        из трёх позднейших держателей нельзя называть основателем.
                      </p>
                    </section>
                  </div>
                ) : null}
                {record.people.length ? (
                  <ul className="record-modern-names">
                    {people.map((person, index) => (
                    <li
                      className={person.role === "человек, давший название" ? "is-eponym" : undefined}
                      id={`record-person-${index}`}
                      key={`${person.personId ?? person.name}:${index}`}
                    >
                      {person.role === "человек, давший название" ? (
                        <span className="record-modern-name-kicker">Главный человек этой находки</span>
                      ) : null}
                      <div className="record-modern-name-heading">
                        <strong>{person.name}</strong>
                        <span>{person.eventRole ?? person.role}</span>
                      </div>
                      {person.alternateNames.length ? (
                        <p className="record-modern-name-variants">
                          <b>Формы имени:</b> {person.alternateNames.join(" · ")}
                        </p>
                      ) : null}
                      {person.details.map((detail, detailIndex) => (
                        <p className="record-modern-name-detail" key={`${detail}:${detailIndex}`}>{detail}</p>
                      ))}
                      {person.nameAnalysis.length ? (
                        <dl className="record-modern-name-analysis">
                          {person.nameAnalysis.map((item, itemIndex) => (
                            <div
                              className={item.label === "Главный вывод на сегодня" ? "is-verdict" : undefined}
                              key={`${item.label}:${itemIndex}`}
                            >
                              <dt>{item.label}</dt>
                              <dd>{item.text}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {person.places.map((place, placeIndex) => (
                        <p className="record-modern-name-place" key={`${place.relation}:${place.label}:${placeIndex}`}>
                          <b>{place.relation}:</b> {place.label}
                        </p>
                      ))}
                    </li>
                    ))}
                  </ul>
                ) : (
                  <div className="record-text-missing">
                    <strong>Поимённого списка в доступной части источника нет</strong>
                    <p>Здесь собраны содержание приказа или ведомости, обстоятельства переселения, маршрут, даты, архивные шифры и направление дальнейшего поиска фамилии.</p>
                  </div>
                )}
              </section>
              <section>
                <h3>Смысл: что эта запись добавляет к истории семьи</h3>
                <p className="record-modern-section-lede">
                  Ниже — связное объяснение самого источника: какое событие он фиксирует,
                  кого называет, с какими местами и родственниками связывает и что именно
                  добавляет к истории семьи или её переселения.
                </p>
                <div className="record-interpretation-sections">
                  {record.modernInterpretation.split(/\n{2,}/).map((paragraph, index) => {
                    const section = interpretationSection(paragraph);
                    return (
                      <section key={index}>
                        {section.heading ? <h4>{section.heading}</h4> : null}
                        <p>{section.text}</p>
                      </section>
                    );
                  })}
                </div>
              </section>
            </div>
            {record.summary && record.summary !== record.modernInterpretation ? (
              <details>
                <summary>Рабочее описание — не расшифровка</summary>
                <p>{record.summary}</p>
              </details>
            ) : null}
          </div>
        </section>

        {record.fieldFacts.length ? (
          <section className="record-extracted" aria-labelledby="record-extracted-title">
            <div className="record-section-heading">
              <div>
                <span className="section-label">Все данные строки</span>
                <h2 id="record-extracted-title">Что извлечено из документа</h2>
              </div>
              <span>{record.fieldFacts.length}</span>
            </div>
            <dl>
              {record.fieldFacts.map((fact, index) => (
                <div key={`${fact.label}:${index}`}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {record.contextSections.length ? (
          <section className="record-context" aria-labelledby="record-context-title">
            <div className="record-section-heading">
              <div>
                <span className="section-label">За пределами одной строки</span>
                <h2 id="record-context-title">Исторический и исследовательский контекст</h2>
              </div>
              <span>{record.contextSections.reduce((total, section) => total + section.items.length, 0)}</span>
            </div>
            <div className="record-context-sections">
              {record.contextSections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  <dl>
                    {section.items.map((item, index) => (
                      <div key={`${item.label}:${index}`}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        ) : null}

        {record.placeTags.length ? (
          <section className="record-geography" aria-labelledby="record-geography-title">
            <div>
              <span className="section-label">Географические теги</span>
              <h2 id="record-geography-title">Все места, связанные с записью</h2>
            </div>
            <div className="record-geography-tags">
              {record.placeTags.map((tag, index) => (
                <Link href="/map" key={`${tag.relation}:${tag.label}:${index}`}>
                  <small>{tag.relation}</small>
                  <strong>{tag.label}</strong>
                  {tag.confidence ? <span>уверенность: {confidenceLabel(tag.confidence)}</span> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className={`record-source ${hasEvidence ? "has-image" : "is-restricted"}`} aria-labelledby="source-title">
          {hasEvidence ? (
            <div className="record-evidence-stack">
              {record.evidenceFragments.map((fragment, index) => (
                <figure className="record-scan record-scan-fragment" key={`${fragment.url}:${index}`}>
                  <a href={fragment.url} target="_blank" rel="noreferrer" aria-label={`${fragment.label}: открыть изображение в полном размере`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fragment.url} alt={`${fragment.label}: ${record.eventLabel}, ${record.date}`} />
                  </a>
                  <figcaption>{fragment.label} · открыть в полном размере ↗</figcaption>
                </figure>
              ))}
              {record.evidenceUrl ? (
                <figure className="record-scan record-scan-page">
                  <a href={record.evidenceUrl} target="_blank" rel="noreferrer" aria-label="Открыть полный лист в исходном размере">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.evidenceUrl} alt={`Полный лист: ${record.eventLabel}, ${record.date}`} />
                  </a>
                  <figcaption>Полный лист · открыть в полном размере ↗</figcaption>
                </figure>
              ) : null}
            </div>
          ) : null}
          <div className="record-source-meta">
            <span className="section-label" id="source-title">Источник и оригинал</span>
            <dl>
              <div><dt>Коллекция</dt><dd>{record.collection}</dd></div>
              <div><dt>Хранится</dt><dd>{record.repository}</dd></div>
              <div><dt>Место архива</dt><dd>{record.repositoryLocation}</dd></div>
              {record.imageReference ? <div><dt>Позиция</dt><dd>{record.imageReference}</dd></div> : null}
              <div><dt>Дата</dt><dd>{record.date}</dd></div>
              <div><dt>Место события</dt><dd>{record.place}</dd></div>
            </dl>
            <div className="record-source-links">
              {record.originalUrl ? <a href={record.originalUrl} target="_blank" rel="noreferrer">{record.originalLabel} ↗</a> : null}
              {record.indexedUrl ? <a href={record.indexedUrl} target="_blank" rel="noreferrer">{record.indexedLabel} ↗</a> : null}
              {record.repositoryUrl ? <a href={record.repositoryUrl} target="_blank" rel="noreferrer">Архив-хранитель ↗</a> : null}
              {record.additionalLinks.map((link) => (
                <a href={link.url} key={`${link.label}:${link.url}`} target="_blank" rel="noreferrer">{link.label} ↗</a>
              ))}
            </div>
            {record.sourceCopies.length > 1 ? (
              <div className="record-source-copies">
                <h3>Экземпляры этой записи</h3>
                <p>Это одно событие, подтверждённое несколькими архивными копиями или индексами.</p>
                <ol>
                  {record.sourceCopies.map((copy) => (
                    <li key={copy.sourceId}>
                      <small>{copy.sourceId}</small>
                      <strong>{copy.collection}</strong>
                      <span>{[copy.repository, copy.imageReference, copy.place].filter(Boolean).join(" · ")}</span>
                      <div>
                        {copy.originalUrl ? <a href={copy.originalUrl} target="_blank" rel="noreferrer">Оригинал ↗</a> : null}
                        {copy.indexedUrl ? <a href={copy.indexedUrl} target="_blank" rel="noreferrer">Индекс ↗</a> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {!hasEvidenceAsset ? (
              <p className="record-rights-note">
                Скан исходной строки пока не сохранён. {record.unresolved[0]}
              </p>
            ) : !record.mayDisplayEvidence ? (
              <p className="record-rights-note">Локальная копия не публикуется до проверки прав. {record.rightsNote}</p>
            ) : null}
          </div>
        </section>

        <section className="record-people" aria-labelledby="record-people-title">
          <div className="record-section-heading">
            <div>
              <span className="section-label">Связи</span>
              <h2 id="record-people-title">Упомянутые люди</h2>
            </div>
            <span>{record.people.length}</span>
          </div>
          <div className="record-people-list">
            {record.people.map((person, index) => person.personId ? (
              <Link href={`/people/${encodeURIComponent(person.personId)}`} key={`${person.personId}:${index}`}>
                <small>{person.eventRole ?? person.role}</small>
                <strong>{person.name}</strong>
                {person.alternateNames.length ? <i>{person.alternateNames.join(" · ")}</i> : null}
                {person.places.length || person.details.length ? <em>{[
                  ...person.details,
                  ...person.places.map((place) => `${place.relation}: ${place.label}`),
                ].join(" · ")}</em> : null}
                <span>Профиль →</span>
              </Link>
            ) : (
              <div key={`${person.name}:${index}`}>
                <small>{person.eventRole ?? person.role}</small>
                <strong>{person.name}</strong>
                {person.alternateNames.length ? <i>{person.alternateNames.join(" · ")}</i> : null}
                {person.places.length || person.details.length ? <em>{[
                  ...person.details,
                  ...person.places.map((place) => `${place.relation}: ${place.label}`),
                ].join(" · ")}</em> : null}
                <span>Профиль ещё не создан</span>
              </div>
            ))}
          </div>
        </section>

        {record.migrations.length ? (
          <section className="record-migrations" aria-labelledby="record-migrations-title">
            <div>
              <span className="section-label">География</span>
              <h2 id="record-migrations-title">Следы перемещения</h2>
            </div>
            <div>
              {record.migrations.map((migration, index) => (
                <article key={`${migration.personId ?? "unknown"}:${index}`}>
                  <strong>{migration.from} <span>→</span> {migration.to}</strong>
                  <p>{migration.basis}</p>
                  <small>Уверенность: {confidenceLabel(migration.confidence)}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
