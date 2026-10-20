import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { RecordAnalysisAppendix } from "@/components/record-analysis-appendix";
import { SiteHeader } from "@/components/site-header";
import { defaultLocale, type Locale, locales, toLocale } from "@/i18n/config";
import Link from "@/i18n/link";
import { messages } from "@/i18n/messages";
import { localeAlternates } from "@/i18n/metadata";
import { hasCardTranslation, localizeHref, translatedCardIds } from "@/i18n/routing";
import { setRequestLocale } from "@/i18n/server";
import { getCardTranslator } from "@/lib/card-translations";
import { getRecordsDirectoryIndex } from "@/lib/records-directory-index";
import { getArchiveRecord } from "@/lib/genealogy";
import { onfilogovoNarrative } from "./onfilogovo-narrative.copy";
import { recordPageCopy } from "./record-page.copy";

type RecordPageProps = {
  params: Promise<{ locale: string; sourceId: string }>;
};

const legacyRecordDestinations: Record<string, string> = {
  "RGADA-210-12-13": "/records?search=RGADA-210-12-13",
};

// Paragraphs of the modern interpretation may open with an ALL-CAPS heading.
// Russian keeps its original pattern; translations use any uppercase letters.
function interpretationSection(paragraph: string, locale: Locale) {
  const match = locale === defaultLocale
    ? paragraph.match(/^([А-ЯЁ0-9][А-ЯЁ0-9 ,:;«»()—–-]+)\.\s+([\s\S]+)$/)
    : paragraph.match(/^([\p{Lu}0-9][\p{Lu}0-9 ,:;«»“”"'’()—–-]+)\.\s+([\s\S]+)$/u);
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

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = toLocale(params.locale);
  const sourceIds = locale === defaultLocale
    ? getRecordsDirectoryIndex().records.map((record) => record.sourceId)
    : translatedCardIds(locale, "records");
  return sourceIds.map((sourceId) => ({ sourceId }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: RecordPageProps): Promise<Metadata> {
  const { locale: localeParam, sourceId } = await params;
  const locale = setRequestLocale(localeParam);
  const text = recordPageCopy[locale];
  const decodedSourceId = decodeURIComponent(sourceId);
  if (legacyRecordDestinations[decodedSourceId]) {
    return {
      title: text.meta.legacyTitle,
      description: text.meta.legacyDescription,
    };
  }
  const record = getArchiveRecord(decodedSourceId);
  if (!record) return { title: text.meta.notFound };
  const { t, tMaybe } = getCardTranslator(locale, "records", decodedSourceId);
  const availableLocales = locales.filter((entry) => hasCardTranslation(entry, "records", decodedSourceId));
  return {
    title: `${t(record.eventLabel)}: ${tMaybe(record.primaryPerson?.name) ?? t(record.date)}`,
    description: text.meta.description(t(record.date), t(record.place)),
    alternates: localeAlternates(locale, `/records/${encodeURIComponent(decodedSourceId)}`, availableLocales),
  };
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { locale: localeParam, sourceId } = await params;
  const locale = setRequestLocale(localeParam);
  const text = recordPageCopy[locale];
  const decodedSourceId = decodeURIComponent(sourceId);
  const legacyDestination = legacyRecordDestinations[decodedSourceId];
  if (legacyDestination) redirect(localizeHref(locale, legacyDestination));
  const record = getArchiveRecord(decodedSourceId);
  if (!record) notFound();
  const { translated, t, tMaybe } = getCardTranslator(locale, "records", decodedSourceId);
  // The literal transcription always stays in Russian.
  const literalLang = locale === defaultLocale ? undefined : "ru";
  const analysisAppendix = getRecordsDirectoryIndex().appendices?.[decodedSourceId] ?? null;
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
    "Новый тверской региональный кандидат: отец Пешка Лодыгина",
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
  const isOnfilogovoRecord = decodedSourceId === "PUB-PKMG-1540-TVER-P111-ONFILOGOVO";
  const onfilogovoNameThesis = isOnfilogovoRecord ? onfilogovoNarrative[locale].thesis : [];
  const onfilogovoNameGuide = isOnfilogovoRecord ? onfilogovoNarrative[locale].guide : [];

  return (
    <main className="record-page">
      <SiteHeader />
      <article className="record-document section-shell">
        {translated ? null : <p className="translation-notice">{messages[locale].language.untranslatedCard}</p>}
        <Link className="record-back" href="/records">{text.back}</Link>

        <header className="record-heading">
          <div>
            <span className="eyebrow">{record.provider} · {record.sourceId}</span>
            <h1>{tMaybe(record.primaryPerson?.name) ?? t(record.eventLabel)}</h1>
            <p className="record-heading-meta">
              <span className="record-heading-type">
                <RecordTypeIcon eventType={record.eventType} />
                <span>{t(record.eventLabel)}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{t(record.date)}</span>
              <span aria-hidden="true">·</span>
              <span>{t(record.place)}</span>
            </p>
          </div>
          <div className="record-heading-actions">
            <span
              className={`record-state is-${record.reviewState}`}
              title={t(record.reviewDescription)}
            >
              {t(record.reviewLabel)}
            </span>
            {record.originalUrl ? (
              <a className="record-open-scan" href={record.originalUrl} target="_blank" rel="noreferrer">
                {t(record.originalLabel)} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </header>

        {record.directoryFacts.length ? (
          <dl className="record-derived-facts" aria-label={text.factsLabel}>
            {record.directoryFacts.map((fact) => (
              <div key={`${fact.label}:${fact.value}`}>
                <dt>{t(fact.label)}</dt>
                <dd>{t(fact.value)}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <section className={`record-texts${people.length >= 6 ? " is-deep-reading" : ""}`} aria-label={text.textsLabel}>
          <div className="record-literal">
            <div className="record-literal-heading">
              <div>
                <span className="section-label">{text.literalLabel}</span>
                <h2>{text.literalTitle}</h2>
              </div>
            </div>
            {record.literal ? (
              <blockquote lang={literalLang}>{record.literal}</blockquote>
            ) : (
              <div className="record-text-missing">
                <strong>{record.status.includes("index-only") ? text.indexOnlyTitle : text.noTextTitle}</strong>
                <p>{record.status.includes("index-only")
                  ? text.indexOnlyText
                  : text.noTextText}</p>
              </div>
            )}
          </div>
          <div className="record-modern">
            <span className="section-label">{text.modernLabel}</span>
            <h2>{record.people.length ? text.modernTitlePeople : text.modernTitleDocument}</h2>
            <div className="record-modern-sections">
              <section>
                <h3>{record.people.length ? text.namesHeading(people.length, nameExplanationCount) : text.establishedHeading}</h3>
                {record.people.length ? (
                  <p className="record-modern-section-lede">
                    {text.peopleLede}
                  </p>
                ) : (
                  <p className="record-modern-section-lede">
                    {text.documentLede}
                  </p>
                )}
                {onfilogovoNameThesis.length ? (
                  <section className="record-name-thesis" aria-labelledby="record-name-thesis-title">
                    <header>
                      <span>{text.thesisEyebrow}</span>
                      <h4 id="record-name-thesis-title">{text.thesisTitle}</h4>
                      <p>
                        {text.thesisLede}
                      </p>
                    </header>
                    <ol>
                      {onfilogovoNameThesis.map((item, index) => (
                        <li key={item.title}>
                          <span>{String(index + 1).padStart(2, "0")} · {item.label}</span>
                          <h5>{item.title}</h5>
                          <p>{item.text}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}
                {record.people.length ? (
                  <nav className="record-name-index" aria-label={text.nameIndexLabel}>
                    <span>{text.nameIndexTitle}</span>
                    <div>
                      {people.map((person, index) => (
                        <a href={`#record-person-${index}`} key={`${person.personId ?? person.name}:index`}>
                          {t(person.name)}
                        </a>
                      ))}
                    </div>
                  </nav>
                ) : null}
                {onfilogovoNameGuide.length ? (
                  <section className="record-name-guide" aria-labelledby="record-name-guide-title">
                    <header>
                      <span>{text.guideEyebrow}</span>
                      <h4 id="record-name-guide-title">{text.guideTitle}</h4>
                      <p>
                        {text.guideLede}
                      </p>
                    </header>
                    <ol>
                      {onfilogovoNameGuide.map((item) => (
                        <li key={item.name}>
                          <div>
                            <span>{item.kind}</span>
                            <strong>{item.name}</strong>
                            <em>{item.status}</em>
                            {item.personId || item.sourceId ? (
                              <div className="record-name-guide-links">
                                {item.personId ? <Link href={`/people/${item.personId}`}>{text.guidePersonLink}</Link> : null}
                                {item.sourceId ? <Link href={`/records/${item.sourceId}`}>{text.guideRecordLink}</Link> : null}
                              </div>
                            ) : null}
                          </div>
                          <div className="record-name-guide-body">
                            <p>{item.text}</p>
                            <dl>
                              {item.facts.map(([label, value]) => (
                                <div key={label}>
                                  <dt>{label}</dt>
                                  <dd>{value}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}
                {eponym ? (
                  <div className="record-name-dossier" aria-label={text.dossierLabel}>
                    <header>
                      <span>{text.dossierEyebrow}</span>
                      <h4>{text.dossierTitle}</h4>
                      <p>
                        {text.dossierLede}
                      </p>
                    </header>
                    <dl>
                      {eponymStory.map((item, index) => (
                        <div className={index === 0 ? "is-verdict" : undefined} key={item.label}>
                          <dt>{t(item.label)}</dt>
                          <dd>{t(item.text)}</dd>
                        </div>
                      ))}
                    </dl>
                    {researchCandidate ? (
                      <aside>
                        <span>{text.parallelHypothesis}</span>
                        <strong>{t(researchCandidate.name)}</strong>
                        <p>
                          {tMaybe(researchCandidate.nameAnalysis[0]?.text ?? researchCandidate.details[0])}
                          {proofThreshold ? ` ${t(proofThreshold.text)}` : ""}
                        </p>
                      </aside>
                    ) : null}
                  </div>
                ) : null}
                {laterEstateHolders.length === 3 ? (
                  <div className="record-name-overview" aria-label={text.overviewLabel}>
                    {laterEstateHolders.map((person, index) => (
                      <section key={person.name}>
                        <span>{text.overviewKicker(index + 1)}</span>
                        <h4>{t(person.name)}</h4>
                        <p>{tMaybe(person.nameAnalysis[0]?.text ?? person.details[0])}</p>
                      </section>
                    ))}
                    <section>
                      <span>{text.overviewConclusionLabel}</span>
                      <h4>{text.overviewConclusionTitle}</h4>
                      <p>
                        {text.overviewConclusionText}
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
                        <span className="record-modern-name-kicker">{text.eponymKicker}</span>
                      ) : null}
                      <div className="record-modern-name-heading">
                        <strong>{t(person.name)}</strong>
                        <span>{t(person.eventRole ?? person.role)}</span>
                      </div>
                      {person.alternateNames.length ? (
                        <p className="record-modern-name-variants">
                          <b>{text.nameForms}</b> {person.alternateNames.map(t).join(" · ")}
                        </p>
                      ) : null}
                      {person.details.map((detail, detailIndex) => (
                        <p className="record-modern-name-detail" key={`${detail}:${detailIndex}`}>{t(detail)}</p>
                      ))}
                      {person.nameAnalysis.length && !analysisAppendix ? (
                        <dl className="record-modern-name-analysis">
                          {person.nameAnalysis.map((item, itemIndex) => (
                            <div
                              className={item.label === "Главный вывод на сегодня" ? "is-verdict" : undefined}
                              key={`${item.label}:${itemIndex}`}
                            >
                              <dt>{t(item.label)}</dt>
                              <dd>{t(item.text)}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {person.places.map((place, placeIndex) => (
                        <p className="record-modern-name-place" key={`${place.relation}:${place.label}:${placeIndex}`}>
                          <b>{t(place.relation)}:</b> {t(place.label)}
                        </p>
                      ))}
                    </li>
                    ))}
                  </ul>
                ) : (
                  <div className="record-text-missing">
                    <strong>{text.noListTitle}</strong>
                    <p>{text.noListText}</p>
                  </div>
                )}
                {analysisAppendix ? (
                  <RecordAnalysisAppendix
                    path={analysisAppendix.path}
                    count={analysisAppendix.count}
                  />
                ) : null}
              </section>
              <section>
                <h3>{text.meaningHeading}</h3>
                <p className="record-modern-section-lede">
                  {text.meaningLede}
                </p>
                <div className="record-interpretation-sections">
                  {t(record.modernInterpretation).split(/\n{2,}/).map((paragraph, index) => {
                    const section = interpretationSection(paragraph, locale);
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
                <summary>{text.workingSummary}</summary>
                <p>{t(record.summary)}</p>
              </details>
            ) : null}
          </div>
        </section>

        {record.fieldFacts.length ? (
          <section className="record-extracted" aria-labelledby="record-extracted-title">
            <div className="record-section-heading">
              <div>
                <span className="section-label">{text.extractedLabel}</span>
                <h2 id="record-extracted-title">{text.extractedTitle}</h2>
              </div>
              <span>{record.fieldFacts.length}</span>
            </div>
            <dl>
              {record.fieldFacts.map((fact, index) => (
                <div key={`${fact.label}:${index}`}>
                  <dt>{t(fact.label)}</dt>
                  <dd>{t(fact.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {record.contextSections.length ? (
          <section className="record-context" aria-labelledby="record-context-title">
            <div className="record-section-heading">
              <div>
                <span className="section-label">{text.contextLabel}</span>
                <h2 id="record-context-title">{text.contextTitle}</h2>
              </div>
              <span>{record.contextSections.reduce((total, section) => total + section.items.length, 0)}</span>
            </div>
            <div className="record-context-sections">
              {record.contextSections.map((section) => (
                <section key={section.heading}>
                  <h3>{t(section.heading)}</h3>
                  <dl>
                    {section.items.map((item, index) => (
                      <div key={`${item.label}:${index}`}>
                        <dt>{t(item.label)}</dt>
                        <dd>{t(item.value)}</dd>
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
              <span className="section-label">{text.geographyLabel}</span>
              <h2 id="record-geography-title">{text.geographyTitle}</h2>
            </div>
            <div className="record-geography-tags">
              {record.placeTags.map((tag, index) => (
                <Link href="/map" key={`${tag.relation}:${tag.label}:${index}`}>
                  <small>{t(tag.relation)}</small>
                  <strong>{t(tag.label)}</strong>
                  {tag.confidence ? <span>{text.confidencePrefix}{text.confidence[tag.confidence] ?? tag.confidence}</span> : null}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fragment.url} alt={`${t(fragment.label)}: ${t(record.eventLabel)}, ${t(record.date)}`} />
                  <figcaption>{t(fragment.label)}{text.archivalCopySuffix}</figcaption>
                </figure>
              ))}
              {record.evidenceUrl ? (
                <figure className="record-scan record-scan-page">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={record.evidenceUrl} alt={`${text.fullSheet}: ${t(record.eventLabel)}, ${t(record.date)}`} />
                  <figcaption>{text.fullSheetCaption}</figcaption>
                </figure>
              ) : null}
            </div>
          ) : null}
          <div className="record-source-meta">
            <span className="section-label" id="source-title">{text.sourceLabel}</span>
            {record.originalUrl ? (
              <a className="record-source-primary" href={record.originalUrl} target="_blank" rel="noreferrer">
                <span>{t(record.originalLabel)}</span>
                <b aria-hidden="true">↗</b>
              </a>
            ) : null}
            <dl>
              <div><dt>{text.collection}</dt><dd>{t(record.collection)}</dd></div>
              <div><dt>{text.repository}</dt><dd>{t(record.repository)}</dd></div>
              <div><dt>{text.repositoryLocation}</dt><dd>{t(record.repositoryLocation)}</dd></div>
              {record.imageReference ? <div><dt>{text.imageReference}</dt><dd>{record.imageReference}</dd></div> : null}
              <div><dt>{text.date}</dt><dd>{t(record.date)}</dd></div>
              <div><dt>{text.place}</dt><dd>{t(record.place)}</dd></div>
            </dl>
            <div className="record-source-links">
              {record.indexedUrl ? <a href={record.indexedUrl} target="_blank" rel="noreferrer">{t(record.indexedLabel)} ↗</a> : null}
              {record.repositoryUrl ? <a href={record.repositoryUrl} target="_blank" rel="noreferrer">{text.repositoryLink}</a> : null}
              {record.additionalLinks.map((link) => (
                <a href={link.url} key={`${link.label}:${link.url}`} target="_blank" rel="noreferrer">{t(link.label)} ↗</a>
              ))}
            </div>
            {record.sourceCopies.length > 1 ? (
              <div className="record-source-copies">
                <h3>{text.copiesTitle}</h3>
                <p>{text.copiesText}</p>
                <ol>
                  {record.sourceCopies.map((copy) => (
                    <li key={copy.sourceId}>
                      <small>{copy.sourceId}</small>
                      <strong>{t(copy.collection)}</strong>
                      <span>{[tMaybe(copy.repository), copy.imageReference, tMaybe(copy.place)].filter(Boolean).join(" · ")}</span>
                      <div>
                        {copy.originalUrl ? <a href={copy.originalUrl} target="_blank" rel="noreferrer">{text.originalLink}</a> : null}
                        {copy.indexedUrl ? <a href={copy.indexedUrl} target="_blank" rel="noreferrer">{text.indexLink}</a> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {!hasEvidenceAsset && !record.hasLocalBackup ? (
              <p className="record-rights-note">
                {text.noScan}{tMaybe(record.unresolved[0])}
              </p>
            ) : !record.mayDisplayEvidence && record.hasLocalBackup ? (
              <p className="record-rights-note">
                {text.restricted}{tMaybe(record.rightsNote)}
              </p>
            ) : null}
          </div>
        </section>

        <section className="record-people" aria-labelledby="record-people-title">
          <div className="record-section-heading">
            <div>
              <span className="section-label">{text.peopleLabel}</span>
              <h2 id="record-people-title">{text.peopleTitle}</h2>
            </div>
            <span>{record.people.length}</span>
          </div>
          <div className="record-people-list">
            {record.people.map((person, index) => person.personId ? (
              <Link href={`/people/${encodeURIComponent(person.personId)}`} key={`${person.personId}:${index}`}>
                <small>{t(person.eventRole ?? person.role)}</small>
                <strong>{t(person.name)}</strong>
                {person.alternateNames.length ? <i>{person.alternateNames.map(t).join(" · ")}</i> : null}
                {person.places.length || person.details.length ? <em>{[
                  ...person.details.map(t),
                  ...person.places.map((place) => `${t(place.relation)}: ${t(place.label)}`),
                ].join(" · ")}</em> : null}
                <span>{text.openPerson}</span>
              </Link>
            ) : (
              <div key={`${person.name}:${index}`}>
                <small>{t(person.eventRole ?? person.role)}</small>
                <strong>{t(person.name)}</strong>
                {person.alternateNames.length ? <i>{person.alternateNames.map(t).join(" · ")}</i> : null}
                {person.places.length || person.details.length ? <em>{[
                  ...person.details.map(t),
                  ...person.places.map((place) => `${t(place.relation)}: ${t(place.label)}`),
                ].join(" · ")}</em> : null}
                {person.possiblePersonId ? (
                  <span>
                    {text.noProfileBeforeCheck}{" "}
                    <Link className="record-possible-person" href={`/people/${encodeURIComponent(person.possiblePersonId)}`}>
                      {text.possibleMatch}{tMaybe(person.possiblePersonName) ?? person.possiblePersonId} →
                    </Link>
                  </span>
                ) : person.isResearchObject ? (
                  <span>{text.researchObject}</span>
                ) : person.profileGap ? (
                  <span>{text.profileGap[person.profileGap]}</span>
                ) : (
                  <span>{text.noPersonCard}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {record.migrations.length ? (
          <section className="record-migrations" aria-labelledby="record-migrations-title">
            <div>
              <span className="section-label">{text.migrationsLabel}</span>
              <h2 id="record-migrations-title">{text.migrationsTitle}</h2>
            </div>
            <div>
              {record.migrations.map((migration, index) => (
                <article key={`${migration.personId ?? "unknown"}:${index}`}>
                  <strong>{t(migration.from)} <span>→</span> {t(migration.to)}</strong>
                  <p>{t(migration.basis)}</p>
                  <small>{text.migrationConfidence}{text.confidence[migration.confidence] ?? migration.confidence}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
