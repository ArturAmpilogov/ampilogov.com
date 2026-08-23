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

        <section className="record-texts" aria-label="Тексты записи">
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
                <strong>Полного текста пока нет</strong>
                <p>Запись остаётся в очереди. Краткое описание не считается расшифровкой.</p>
              </div>
            )}
          </div>
          <div className="record-modern">
            <span className="section-label">Современное чтение</span>
            <h2>Имена и смысл</h2>
            <p>{record.modernInterpretation}</p>
            {record.summary && record.summary !== record.modernInterpretation ? (
              <details>
                <summary>Рабочее описание — не расшифровка</summary>
                <p>{record.summary}</p>
              </details>
            ) : null}
          </div>
        </section>

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
                <small>{person.role}</small>
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
                <small>{person.role}</small>
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
                  <small>Уверенность: {migration.confidence}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
