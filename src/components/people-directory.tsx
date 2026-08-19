"use client";

import { useMemo, useState } from "react";
import type { DirectoryPerson } from "@/lib/genealogy";

type Filter = "all" | "documented" | "review";
type Sort = "name" | "year";

const relationLabels = {
  parent: "Родитель",
  spouse: "Супруг(а)",
  child: "Ребёнок",
};

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

export function PeopleDirectory({ people, initialPersonId = "" }: { people: DirectoryPerson[]; initialPersonId?: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("name");
  const [selectedId, setSelectedId] = useState(
    people.some((person) => person.personId === initialPersonId)
      ? initialPersonId
      : people[0]?.personId ?? "",
  );
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = normalize(query);
    return people
      .filter((person) => {
        const matchesQuery = !normalizedQuery || normalize(person.searchText).includes(normalizedQuery);
        const matchesFilter =
          filter === "all" ||
          (filter === "review" ? person.needsReview : !person.needsReview);
        return matchesQuery && matchesFilter;
      })
      .sort((left, right) => {
        if (sort === "year") {
          const leftYear = left.birthYear || "9999";
          const rightYear = right.birthYear || "9999";
          const yearDifference = leftYear.localeCompare(rightYear);
          if (yearDifference !== 0) return yearDifference;
        }
        return left.displayName.localeCompare(right.displayName, "ru");
      });
  }, [filter, people, query, sort]);

  const selected =
    filteredPeople.find((person) => person.personId === selectedId) ?? filteredPeople[0];

  function selectPerson(personId: string, openOnMobile = true) {
    setSelectedId(personId);
    if (openOnMobile) setMobileProfileOpen(true);
  }

  function selectRelation(personId: string) {
    setQuery("");
    setFilter("all");
    selectPerson(personId, false);
  }

  return (
    <section className="people-workspace section-shell" aria-label="Поиск и просмотр профилей">
      <div className="people-toolbar">
        <label className="people-search">
          <span>Поиск по архиву</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, фамилия, вариант, место, текст записи…"
              type="search"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">×</button> : null}
          </div>
        </label>

        <div className="people-filters" aria-label="Фильтр профилей">
          {([
            ["all", "Все"],
            ["documented", "Документированы"],
            ["review", "Требуют чтения"],
          ] as const).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-active" : undefined}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="people-sort">
          <span>Порядок</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="name">По имени</option>
            <option value="year">По году рождения</option>
          </select>
        </label>
      </div>

      <div className="people-result-line" aria-live="polite">
        <strong>{filteredPeople.length}</strong>
        <span>{query ? "совпадений" : "профилей в выборке"}</span>
        {query ? <small>по запросу «{query}»</small> : null}
      </div>

      <div className="people-layout">
        <div className="people-list" role="list" aria-label="Люди">
          {filteredPeople.map((person) => (
            <button
              type="button"
              key={person.personId}
              aria-current={person.personId === selected?.personId ? "true" : undefined}
              className={person.personId === selected?.personId ? "is-selected" : undefined}
              onClick={() => selectPerson(person.personId)}
            >
              <span className="person-index">{person.personId}</span>
              <span className="person-list-main">
                <strong>{person.displayName}</strong>
                <small>
                  {person.birthYear ? `${person.birthYear} · ` : ""}
                  {person.places.join(" · ") || "место проверяется"}
                </small>
              </span>
              <span className="person-source-count">
                {person.sources.length}
                <small>ист.</small>
              </span>
              <span className={`person-state ${person.needsReview ? "is-review" : "is-documented"}`}>
                {person.needsReview ? "проверить" : "готово"}
              </span>
              <span className="person-open" aria-hidden="true">↗</span>
            </button>
          ))}
          {filteredPeople.length === 0 ? (
            <div className="people-empty">
              <strong>Совпадений нет</strong>
              <p>Попробуйте фамилию без окончания или название места.</p>
              <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Сбросить фильтры</button>
            </div>
          ) : null}
        </div>

        <aside className={`person-panel ${mobileProfileOpen ? "is-mobile-open" : ""}`} aria-label="Выбранный профиль">
          <div className="person-panel-scrim" onClick={() => setMobileProfileOpen(false)} aria-hidden="true" />
          {selected ? (
            <article className="person-profile" key={selected.personId}>
              <button className="person-panel-close" type="button" onClick={() => setMobileProfileOpen(false)}>
                ← К списку
              </button>
              <header>
                <div className="person-profile-kicker">
                  <span>{selected.personId}</span>
                  <span>{selected.needsReview ? "Есть вопросы к чтению" : "Документирован"}</span>
                </div>
                <h2>{selected.displayName}</h2>
                {selected.variants.length ? (
                  <p className="person-variants">
                    В документах: {selected.variants.join(" · ")}
                  </p>
                ) : null}
              </header>

              <dl className="person-facts">
                <div><dt>Рождение</dt><dd>{selected.birthDate || "Не установлено"}</dd></div>
                <div><dt>Места</dt><dd>{selected.places.join(", ") || "Проверяются"}</dd></div>
                <div><dt>Источники</dt><dd>{selected.sources.length}</dd></div>
                {selected.occupations.length ? <div><dt>Занятие</dt><dd>{selected.occupations.join(", ")}</dd></div> : null}
              </dl>

              {selected.relations.length ? (
                <section className="person-relations" aria-labelledby="relations-title">
                  <h3 id="relations-title">Связанные люди</h3>
                  <div>
                    {selected.relations.map((relation) => (
                      <button type="button" key={`${relation.relation}:${relation.personId}`} onClick={() => selectRelation(relation.personId)}>
                        <small>{relationLabels[relation.relation]}</small>
                        <strong>{relation.name}</strong>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="person-documents" aria-labelledby="documents-title">
                <div className="person-section-heading">
                  <h3 id="documents-title">Документы</h3>
                  <span>{selected.sources.length}</span>
                </div>
                {selected.sources.length ? selected.sources.map((source, index) => (
                  <details key={source.sourceId} open={index === 0}>
                    <summary>
                      <span className="source-sequence">{String(index + 1).padStart(2, "0")}</span>
                      <span>
                        <strong>{source.eventLabel}</strong>
                        <small>{source.date} · {source.place}</small>
                      </span>
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
                        <a href={`/records/${encodeURIComponent(source.sourceId)}`}>Открыть запись →</a>
                        {source.evidenceUrl ? <a href={source.evidenceUrl} target="_blank" rel="noreferrer">Снимок ↗</a> : null}
                        {source.externalUrl ? <a href={source.externalUrl} target="_blank" rel="noreferrer">{source.externalLabel} ↗</a> : null}
                      </div>
                    </div>
                  </details>
                )) : <p className="person-no-sources">Источники ещё не привязаны к профилю.</p>}
              </section>

              {selected.notes.length ? (
                <section className="person-notes">
                  <h3>Исследовательские заметки</h3>
                  {selected.notes.map((note) => <p key={note}>{note}</p>)}
                </section>
              ) : null}
            </article>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
