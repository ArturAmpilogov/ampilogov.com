import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { SiteHeader } from "@/components/site-header";
import { getPeopleDirectoryIndex } from "@/lib/people-directory-index";
import { getDirectoryPerson } from "@/lib/genealogy";

type PersonPageProps = {
  params: Promise<{ personId: string }>;
};

const relationLabels = {
  parent: "Родитель",
  spouse: "Супруг(а)",
  child: "Ребёнок",
  sibling: "Брат / сестра",
  "foster-parent": "Приёмный родитель",
  "foster-child": "Приёмыш",
};

function compactPlaceLabels(places: string[]) {
  const unique = [...new Map(
    places
      .map((place) => place.trim())
      .filter(Boolean)
      .map((place) => [place.toLocaleLowerCase("ru-RU"), place]),
  ).values()];

  return unique.filter((place, index) => {
    const normalized = place.toLocaleLowerCase("ru-RU");
    return !unique.some((other, otherIndex) => (
      otherIndex !== index
      && other.length > place.length
      && other.toLocaleLowerCase("ru-RU").startsWith(`${normalized},`)
    ));
  });
}

export function generateStaticParams() {
  return getPeopleDirectoryIndex().people.map((person) => ({ personId: person.personId }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { personId } = await params;
  const decodedPersonId = decodeURIComponent(personId);
  const person = getDirectoryPerson(decodedPersonId);
  if (!person) return { title: "Человек не найден" };
  return {
    title: person.displayName,
    description: `${person.displayName}: документированные события, варианты имени и связанные люди.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { personId } = await params;
  const decodedPersonId = decodeURIComponent(personId);
  const person = getDirectoryPerson(decodedPersonId);
  if (!person) notFound();
  const places = compactPlaceLabels(person.places);
  const contextSectionCount = Number(person.relations.length > 0) + Number(person.notes.length > 0);

  return (
    <main className="person-page">
      <SiteHeader />
      <article className="person-document section-shell">
        <Link className="person-back" href="/people">← Все люди</Link>

        <header className="person-heading">
          <div>
            <span className="eyebrow">Человек · {person.personId}</span>
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
          <div>
            <dt>Жизнь</dt>
            <dd>
              {person.birthDate || "Рождение не установлено"}
              {" — "}
              {person.life.death === "?" ? "смерть не установлена" : person.life.death}
            </dd>
          </div>
          <div><dt>Места</dt><dd>{places.join(" · ") || "Проверяются"}</dd></div>
          <div><dt>Источники</dt><dd>{person.sources.length}</dd></div>
          <div><dt>Занятие</dt><dd>{person.occupations.join(", ") || "Не указано"}</dd></div>
        </dl>

        {person.nameAnalysis.length ? (
          <section className="person-name-analysis" aria-labelledby="person-name-analysis-title">
            <div className="person-section-heading">
              <div>
                <span className="section-label">Не только написание</span>
                <h2 id="person-name-analysis-title">Имя и смысл</h2>
              </div>
              <strong>{person.nameAnalysis.length}</strong>
            </div>
            <p className="person-name-analysis-lede">
              Разбираем буквальную форму, патроним, роль человека, время и географию,
              а также отдельно отмечаем, что документ доказывает и чего из него выводить нельзя.
            </p>
            <dl>
              {person.nameAnalysis.map((item, index) => (
                <div key={`${item.label}:${index}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {person.relations.length || person.notes.length ? (
          <div className={`person-context-grid${contextSectionCount === 1 ? " is-single" : ""}`}>
            {person.relations.length ? (
              <section className="person-relations" aria-labelledby="relations-title">
                <div className="person-section-heading">
                  <div>
                    <span className="section-label">Родство</span>
                    <h2 id="relations-title">Семейные связи</h2>
                  </div>
                  <strong>{person.relations.length}</strong>
                </div>
                <div className="person-relations-list">
                  {person.relations.map((relation) => (
                    <Link href={`/people/${encodeURIComponent(relation.personId)}`} key={`${relation.relation}:${relation.personId}`}>
                      <small>{relationLabels[relation.relation]}</small>
                      <strong>{relation.name}</strong>
                      <span>
                        {relation.life.birth === "?" ? "?" : relation.life.birth}
                        {" — "}
                        {relation.life.death === "?" ? "?" : relation.life.death}
                        {" · открыть →"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {person.notes.length ? (
              <section className="person-notes">
                <div className="person-section-heading">
                  <div>
                    <span className="section-label">Контекст</span>
                    <h2>Заметки</h2>
                  </div>
                </div>
                {person.notes.map((note) => <p key={note}>{note}</p>)}
              </section>
            ) : null}
          </div>
        ) : null}

        {person.researchLeads.length ? (
          <section className="person-research-leads" aria-labelledby="research-leads-title">
            <div className="person-section-heading">
              <div>
                <span className="section-label">Отдельные Records, спорные чтения и проверяемые связи</span>
                <h2 id="research-leads-title">Интересные находки</h2>
              </div>
              <strong>{person.researchLeads.length}</strong>
            </div>
            <p className="person-research-leads-intro">
              Здесь собраны спорные чтения, возможные повторные упоминания, архивные маршруты
              и боковые линии, которые нельзя без проверки превращать в подтверждённые события
              биографии или родство. Ссылка на Record показана там, где уже есть отдельный документ.
            </p>
            <div className="person-research-leads-list">
              {person.researchLeads.map((lead, index) => (
                <article key={`${lead.label}:${index}`}>
                  <small>{lead.label}</small>
                  <p>{lead.summary}</p>
                  {lead.people.length || lead.sourceIds.length ? (
                    <div>
                      {lead.people.map((related) => (
                        <Link href={`/people/${encodeURIComponent(related.personId)}`} key={related.personId}>
                          {related.name} →
                        </Link>
                      ))}
                      {lead.sourceIds.map((sourceId) => (
                        <Link href={`/records/${encodeURIComponent(sourceId)}`} key={sourceId}>
                          Record {sourceId} ↗
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="person-documents" aria-labelledby="documents-title">
          <div className="person-section-heading">
            <div>
              <span className="section-label">Документы</span>
              <h2 id="documents-title">Хронология</h2>
            </div>
            <strong>{person.sources.length}</strong>
          </div>

          {person.sources.length ? (
            <div className="person-source-timeline">
              {person.sources.map((source, index) => (
                <article key={source.sourceId}>
                  <span className="source-sequence">{String(index + 1).padStart(2, "0")}</span>
                  <span className="person-source-icon"><RecordTypeIcon eventType={source.eventType} /></span>
                  <div className="person-source-main">
                    <small>{source.role}</small>
                    <strong>{source.eventLabel}</strong>
                    <em>{source.place}</em>
                    {source.nameAsWritten ? <span>В документе: {source.nameAsWritten}</span> : null}
                  </div>
                  <time>{source.date}</time>
                  <Link href={`/records/${encodeURIComponent(source.sourceId)}`}>
                    Открыть запись <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : <p className="person-no-sources">Источники ещё не привязаны к этому человеку.</p>}
        </section>
      </article>
    </main>
  );
}
