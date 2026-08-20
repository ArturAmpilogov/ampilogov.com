import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { SiteHeader } from "@/components/site-header";
import { getPeopleDirectory } from "@/lib/genealogy";

type PersonPageProps = {
  params: Promise<{ personId: string }>;
};

const relationLabels = {
  parent: "Родитель",
  spouse: "Супруг(а)",
  child: "Ребёнок",
};

export function generateStaticParams() {
  return getPeopleDirectory().people.map((person) => ({ personId: person.personId }));
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { personId } = await params;
  const decodedPersonId = decodeURIComponent(personId);
  const person = getPeopleDirectory().people.find((entry) => entry.personId === decodedPersonId);
  if (!person) return { title: "Профиль не найден" };
  return {
    title: person.displayName,
    description: `${person.displayName}: документированные события, варианты имени и связанные люди.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { personId } = await params;
  const decodedPersonId = decodeURIComponent(personId);
  const person = getPeopleDirectory().people.find((entry) => entry.personId === decodedPersonId);
  if (!person) notFound();

  return (
    <main className="person-page">
      <SiteHeader />
      <article className="person-document section-shell">
        <Link className="person-back" href="/people">← Все профили</Link>

        <header className="person-heading">
          <div>
            <span className="eyebrow">Профиль · {person.personId}</span>
            <h1>{person.displayName}</h1>
            {person.variants.length ? (
              <p className="person-heading-variants">
                <span>В документах</span>
                {person.variants.join(" · ")}
              </p>
            ) : null}
          </div>
          <span className={`person-heading-state ${person.needsReview ? "is-review" : "is-documented"}`}>
            {person.needsReview ? "Есть вопросы к чтению" : "Документирован"}
          </span>
        </header>

        <dl className="person-facts">
          <div><dt>Рождение</dt><dd>{person.birthDate || "Не установлено"}</dd></div>
          <div><dt>Места</dt><dd>{person.places.join(", ") || "Проверяются"}</dd></div>
          <div><dt>Источники</dt><dd>{person.sources.length}</dd></div>
          <div><dt>Занятие</dt><dd>{person.occupations.join(", ") || "Не указано"}</dd></div>
        </dl>

        {person.relations.length || person.notes.length ? (
          <div className="person-context-grid">
            <section className="person-relations" aria-labelledby="relations-title">
              <div className="person-section-heading">
                <div>
                  <span className="section-label">Семейные связи</span>
                  <h2 id="relations-title">Связанные люди</h2>
                </div>
                <strong>{person.relations.length}</strong>
              </div>
              {person.relations.length ? (
                <div className="person-relations-list">
                  {person.relations.map((relation) => (
                    <Link href={`/people/${encodeURIComponent(relation.personId)}`} key={`${relation.relation}:${relation.personId}`}>
                      <small>{relationLabels[relation.relation]}</small>
                      <strong>{relation.name}</strong>
                      <span>Профиль →</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="person-context-empty">Подтверждённые связи пока не добавлены.</p>}
            </section>

            {person.notes.length ? (
              <section className="person-notes">
                <div className="person-section-heading">
                  <div>
                    <span className="section-label">Контекст</span>
                    <h2>Исследовательские заметки</h2>
                  </div>
                </div>
                {person.notes.map((note) => <p key={note}>{note}</p>)}
              </section>
            ) : null}
          </div>
        ) : null}

        <section className="person-documents" aria-labelledby="documents-title">
          <div className="person-section-heading">
            <div>
              <span className="section-label">Документальная хронология</span>
              <h2 id="documents-title">Источники</h2>
            </div>
            <strong>{person.sources.length}</strong>
          </div>

          {person.sources.length ? person.sources.map((source, index) => (
            <details key={source.sourceId} open={index === 0}>
              <summary>
                <span className="source-sequence">{String(index + 1).padStart(2, "0")}</span>
                <span className="person-source-icon"><RecordTypeIcon eventType={source.eventType} /></span>
                <span className="person-source-main">
                  <small>{source.role}</small>
                  <strong>{source.eventLabel}</strong>
                  <em>{source.place}</em>
                </span>
                <time>{source.date}</time>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="source-detail">
                <dl>
                  <div><dt>Как написано</dt><dd>{source.nameAsWritten}</dd></div>
                  <div><dt>Роль</dt><dd>{source.role}</dd></div>
                  {source.imageReference ? <div><dt>Ссылка в плёнке</dt><dd>{source.imageReference}</dd></div> : null}
                </dl>
                {!source.hasCompleteTranscription ? (
                  <div className="source-transcription-missing">
                    <strong>Полной расшифровки скана ещё нет</strong>
                    <p>Источник находится в обязательной очереди повторного чтения.</p>
                  </div>
                ) : null}
                {source.hasLiteralTranscription ? (
                  <div className="source-transcription">
                    <span>{source.hasCompleteTranscription ? "Буквальная расшифровка" : "Черновое чтение — неполная расшифровка"}</span>
                    <p>{source.transcription}</p>
                  </div>
                ) : null}
                {source.summary ? (
                  <div className="source-summary">
                    <span>Краткое описание — не расшифровка</span>
                    <p>{source.summary}</p>
                  </div>
                ) : null}
                {source.modernInterpretation ? (
                  <div className="source-modern">
                    <span>Современная запись</span>
                    <p>{source.modernInterpretation}</p>
                  </div>
                ) : null}
                {source.unresolved.length ? (
                  <div className="source-unresolved">
                    <span>Нужно уточнить</span>
                    <p>{source.unresolved.join(" · ")}</p>
                  </div>
                ) : null}
                <div className="source-actions">
                  <Link href={`/records/${encodeURIComponent(source.sourceId)}`}>Открыть запись →</Link>
                  {source.evidenceUrl ? <a href={source.evidenceUrl} target="_blank" rel="noreferrer">Снимок ↗</a> : null}
                  {source.externalUrl ? <a href={source.externalUrl} target="_blank" rel="noreferrer">{source.externalLabel} ↗</a> : null}
                </div>
              </div>
            </details>
          )) : <p className="person-no-sources">Источники ещё не привязаны к профилю.</p>}
        </section>
      </article>
    </main>
  );
}
