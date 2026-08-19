import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getArchiveRecord, getRecordsDirectory } from "@/lib/genealogy";

type RecordPageProps = {
  params: Promise<{ sourceId: string }>;
};

export function generateStaticParams() {
  return getRecordsDirectory().records.map((record) => ({ sourceId: record.sourceId }));
}

export async function generateMetadata({ params }: RecordPageProps): Promise<Metadata> {
  const { sourceId } = await params;
  const record = getArchiveRecord(decodeURIComponent(sourceId));
  if (!record) return { title: "Запись не найдена" };
  return {
    title: `${record.eventLabel}: ${record.people[0]?.name ?? record.date}`,
    description: `${record.date}, ${record.place}. Архивная запись, расшифровка и связанные профили.`,
  };
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { sourceId } = await params;
  const record = getArchiveRecord(decodeURIComponent(sourceId));
  if (!record) notFound();

  return (
    <main className="record-page">
      <SiteHeader />
      <article className="record-document section-shell">
        <Link className="record-back" href="/records">← Все записи</Link>

        <header className="record-heading">
          <div>
            <span className="eyebrow">{record.provider} · {record.sourceId}</span>
            <h1>{record.eventLabel}</h1>
            <p>{record.date} · {record.place}</p>
          </div>
          <div className="record-heading-actions">
            <span className={`record-state ${record.isComplete ? "is-complete" : "is-reading"}`}>
              {record.isComplete ? "Полная расшифровка" : "Требует полного чтения"}
            </span>
            {record.originalUrl ? (
              <a className="record-open-scan" href={record.originalUrl} target="_blank" rel="noreferrer">
                Открыть скан <span aria-hidden="true">↗</span>
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
            {record.modernInterpretation ? (
              <p>{record.modernInterpretation}</p>
            ) : (
              <p className="record-muted">Будет добавлено после буквальной расшифровки.</p>
            )}
            {record.summary ? (
              <details>
                <summary>Рабочее описание — не расшифровка</summary>
                <p>{record.summary}</p>
              </details>
            ) : null}
          </div>
        </section>

        <section className={`record-source ${record.mayDisplayEvidence && record.evidenceUrl ? "has-image" : "is-restricted"}`} aria-labelledby="source-title">
          {record.mayDisplayEvidence && record.evidenceUrl ? (
            <div className="record-scan">
              {/* The archive explicitly marks this copy as suitable for public display. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={record.evidenceUrl} alt={`Скан: ${record.eventLabel}, ${record.date}`} />
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
              {record.originalUrl ? <a href={record.originalUrl} target="_blank" rel="noreferrer">Открыть скан в FamilySearch ↗</a> : null}
              {record.indexedUrl ? <a href={record.indexedUrl} target="_blank" rel="noreferrer">Индекс FamilySearch ↗</a> : null}
              {record.repositoryUrl ? <a href={record.repositoryUrl} target="_blank" rel="noreferrer">Архив-хранитель ↗</a> : null}
            </div>
            {!record.mayDisplayEvidence ? (
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
              <Link href={`/people?person=${encodeURIComponent(person.personId)}`} key={`${person.personId}:${index}`}>
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
