"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { DirectoryPerson } from "@/lib/genealogy";
import { YearRangeFilter } from "@/components/year-range-filter";
import { useDirectoryUrlFilters } from "@/components/use-directory-url-filters";

type Filter = "all" | "documented" | "review";
const FILTERS = ["all", "documented", "review"] as const satisfies readonly Filter[];

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

function sourceWord(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return "источников";
  if (mod10 === 1) return "источник";
  if (mod10 >= 2 && mod10 <= 4) return "источника";
  return "источников";
}

function EmphasizedYears({ value }: { value: string }) {
  return value.split(/(\d{4})/).map((part, index) =>
    /^\d{4}$/.test(part) ? <b key={`${part}-${index}`}>{part}</b> : part
  );
}

function historicalYears(values: string[]) {
  return [...new Set(values.flatMap((value) =>
    (value.match(/\b[0-9]{4}\b/g) ?? [])
      .map(Number)
      .filter((year) => year >= 1000 && year <= 2099)
  ))].sort((left, right) => left - right);
}

function sourceYears(person: DirectoryPerson) {
  return historicalYears(person.sources.map((source) => source.date));
}

function relationFacts(person: DirectoryPerson, peopleById: Map<string, DirectoryPerson>) {
  const facts = new Map<string, Set<string>>();
  const add = (label: string, name: string) => {
    const names = facts.get(label) ?? new Set<string>();
    names.add(name);
    facts.set(label, names);
  };

  for (const relation of person.relations) {
    const related = peopleById.get(relation.personId);
    if (relation.relation === "spouse") {
      const label = related?.sex === "female" || (related?.sex !== "male" && person.sex === "male")
        ? "Супруга"
        : related?.sex === "male" || person.sex === "female"
          ? "Супруг"
          : "Супруг(а)";
      add(label, relation.name);
    } else if (relation.relation === "parent") {
      add(related?.sex === "female" ? "Мать" : related?.sex === "male" ? "Отец" : "Родитель", relation.name);
    } else if (relation.relation === "child") {
      add("Дети", relation.name);
    }
  }

  const order = ["Супруга", "Супруг", "Супруг(а)", "Отец", "Мать", "Родитель", "Дети"];
  return order.flatMap((label) => {
    const names = facts.get(label);
    return names?.size ? [{ label, names: [...names] }] : [];
  });
}

function personYearSpan(person: DirectoryPerson) {
  const values = [
    person.birthDate,
    person.birthYear,
    person.life.birth,
    person.life.death,
    ...person.sources.map((source) => source.date),
  ];
  const years = values.flatMap((value) =>
    [...value.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)].map((match) => Number(match[1]))
  );
  return years.length ? { minYear: Math.min(...years), maxYear: Math.max(...years) } : null;
}

export function PeopleDirectory({
  people,
}: {
  people: DirectoryPerson[];
}) {
  const peopleById = useMemo(() => new Map(
    people.map((person) => [person.personId, person]),
  ), [people]);
  const spansByPerson = useMemo(() => new Map(
    people.map((person) => [person.personId, personYearSpan(person)]),
  ), [people]);
  const yearBounds = useMemo(() => {
    const spans = [...spansByPerson.values()].filter((span) => span !== null);
    return {
      minYear: Math.min(...spans.map((span) => span.minYear)),
      maxYear: Math.max(...spans.map((span) => span.maxYear)),
    };
  }, [spansByPerson]);
  const {
    query,
    setQuery,
    status: filter,
    setStatus: setFilter,
    yearRange,
    setYearRange,
    reset,
    isFiltered,
  } = useDirectoryUrlFilters({
    statuses: FILTERS,
    defaultStatus: "all",
    minYear: yearBounds.minYear,
    maxYear: yearBounds.maxYear,
  });

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return people.filter((person) => {
      const matchesQuery = !needle || normalize(person.searchText).includes(needle);
      const matchesFilter = filter === "all" ||
        (filter === "review" ? person.needsReview : !person.needsReview);
      const span = spansByPerson.get(person.personId);
      const fullRange = yearRange.startYear === yearBounds.minYear &&
        yearRange.endYear === yearBounds.maxYear;
      const matchesYear = span
        ? span.minYear <= yearRange.endYear && span.maxYear >= yearRange.startYear
        : fullRange;
      return matchesQuery && matchesFilter && matchesYear;
    });
  }, [filter, people, query, spansByPerson, yearRange]);

  return (
    <section className="people-workspace section-shell" aria-label="Каталог профилей людей">
      <div className="people-toolbar">
        <label className="people-search">
          <span>Поиск по профилям</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, вариант фамилии, место, текст записи…"
              type="search"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">×</button> : null}
          </div>
        </label>

        <div className="directory-filter-panel">
          <div className="directory-filter-panel__heading">
            <span>Фильтры</span>
            {isFiltered ? <button type="button" onClick={reset}>Сбросить</button> : null}
          </div>
          <div className="directory-filter-panel__status">
            <span>Статус</span>
            <div className="people-filters" aria-label="Статус профиля">
              {([
                ["all", "Все"],
                ["documented", "Документированы"],
                ["review", "Требуют проверки"],
              ] as const).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? "is-active" : undefined}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <YearRangeFilter
            minYear={yearBounds.minYear}
            maxYear={yearBounds.maxYear}
            startYear={yearRange.startYear}
            endYear={yearRange.endYear}
            onChange={setYearRange}
          />
        </div>
      </div>

      <div className="people-result-line" aria-live="polite">
        <strong>{filtered.length}</strong>
        <span>{query ? "совпадений" : "профилей в выборке"}</span>
        <small><b>[год–год]</b> — расчётный интервал</small>
      </div>

      <div className="people-list" role="list">
        {filtered.map((person, index) => {
          const relations = relationFacts(person, peopleById);
          const documentedYears = sourceYears(person);
          const hasUncertainLifeDate = person.life.birth.includes("?") || person.life.death.includes("?");

          return (
            <Link href={`/people/${encodeURIComponent(person.personId)}`} key={person.personId} className="person-row">
              <span className="person-row-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="person-row-main">
                <small>{person.personId}{person.normalizedSurname ? ` · ${person.normalizedSurname}` : ""}</small>
                <strong>{person.displayName}</strong>
                {person.variants.length ? <em>{person.variants.join(" · ")}</em> : null}
                {relations.length ? (
                  <span className="person-row-relations">
                    {relations.map((relation) => (
                      <span key={relation.label}>
                        <b>{relation.label}:</b> {relation.names.join(" · ")}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
              <span className="person-row-context">
                <strong
                  className="person-row-lifespan"
                  aria-label={`Рождение: ${person.life.birth}; смерть: ${person.life.death}`}
                >
                  <span><EmphasizedYears value={person.life.birth} /></span>
                  <i aria-hidden="true">—</i>
                  <span><EmphasizedYears value={person.life.death} /></span>
                </strong>
                {hasUncertainLifeDate && documentedYears.length ? (
                  <span className="person-row-source-years">
                    <b>В источниках:</b> {documentedYears.join(" · ")}
                  </span>
                ) : null}
                <small className="person-row-life-meta">
                  {person.life.age ? <span className="person-row-age">Возраст — {person.life.age}</span> : null}
                  <span>{person.places.join(" · ") || "Место проверяется"}</span>
                </small>
              </span>
              <span className="person-row-sources">
                <strong>{person.sources.length}</strong>
                <small>{sourceWord(person.sources.length)}</small>
              </span>
              <span className={`person-row-status ${person.needsReview ? "is-review" : "is-documented"}`}>
                {person.needsReview ? "Проверить" : "Готово"}
              </span>
              <span className="person-row-open" aria-hidden="true">↗</span>
            </Link>
          );
        })}

        {filtered.length === 0 ? (
          <div className="people-empty">
            <strong>Профили не найдены</strong>
            <p>Попробуйте часть фамилии, имя или название места.</p>
            <button type="button" onClick={() => {
              reset();
            }}>Сбросить фильтры</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
