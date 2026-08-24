"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { PeopleDirectoryResult } from "@/lib/directory-index-types";
import { DirectoryAutoLoader } from "@/components/directory-auto-loader";
import { YearRangeFilter } from "@/components/year-range-filter";
import { useDirectoryUrlFilters } from "@/components/use-directory-url-filters";
import { usePagedDirectory } from "@/components/use-paged-directory";

type Filter = "all" | "documented" | "review";
const FILTERS = ["all", "documented", "review"] as const satisfies readonly Filter[];

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

function relationFacts(person: PeopleDirectoryResult) {
  const facts = new Map<string, Set<string>>();
  const add = (label: string, name: string) => {
    const names = facts.get(label) ?? new Set<string>();
    names.add(name);
    facts.set(label, names);
  };

  for (const relation of person.relations) {
    if (relation.relation === "spouse") {
      const label = relation.sex === "female" || (relation.sex !== "male" && person.sex === "male")
        ? "Супруга"
        : relation.sex === "male" || person.sex === "female"
          ? "Супруг"
          : "Супруг(а)";
      add(label, relation.name);
    } else if (relation.relation === "parent") {
      add(relation.sex === "female" ? "Мать" : relation.sex === "male" ? "Отец" : "Родитель", relation.name);
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

export function PeopleDirectory({
  minYear,
  maxYear,
}: {
  minYear: number;
  maxYear: number;
}) {
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
    minYear,
    maxYear,
  });
  const requestParams = useMemo(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (query.trim()) params.set("search", query.trim());
    if (filter !== "all") params.set("status", filter);
    if (yearRange.startYear !== minYear) params.set("from", String(yearRange.startYear));
    if (yearRange.endYear !== maxYear) params.set("to", String(yearRange.endYear));
    return params;
  }, [filter, maxYear, minYear, query, yearRange]);
  const {
    items: people,
    total,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = usePagedDirectory<PeopleDirectoryResult>({ endpoint: "/api/people", params: requestParams });

  return (
    <section className="people-workspace section-shell" aria-label="Каталог профилей людей">
      <div className="people-toolbar">
        <label className="people-search">
          <span>Поиск по ФИО</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, отчество, фамилия…"
              type="search"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">×</button> : null}
          </div>
        </label>

        <div className="directory-filter-panel">
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
            {isFiltered ? <button className="directory-filter-reset" type="button" onClick={reset}>Сбросить</button> : null}
          </div>
          <YearRangeFilter
            showBounds={false}
            minYear={minYear}
            maxYear={maxYear}
            startYear={yearRange.startYear}
            endYear={yearRange.endYear}
            onChange={setYearRange}
          />
        </div>
      </div>

      <div className="people-result-line" aria-live="polite">
        <strong>{isLoading ? "…" : total}</strong>
        <span>{query ? "совпадений" : "профилей в выборке"}</span>
        <small><b>[год–год]</b> — расчётный интервал</small>
      </div>
      {error ? <p className="directory-error" role="alert">{error}</p> : null}

      <div className={`people-list${isLoading ? " is-loading" : ""}`} role="list" aria-busy={isLoading}>
        {people.map((person, index) => {
          const relations = relationFacts(person);
          const documentedYears = person.sourceYears;
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
                <strong>{person.sourceCount}</strong>
                <small>{sourceWord(person.sourceCount)}</small>
              </span>
              <span className={`person-row-status ${person.needsReview ? "is-review" : "is-documented"}`}>
                {person.needsReview ? "Проверить" : "Готово"}
              </span>
              <span className="person-row-open" aria-hidden="true">↗</span>
            </Link>
          );
        })}

        {!isLoading && people.length === 0 ? (
          <div className="people-empty">
            <strong>Профили не найдены</strong>
            <p>Попробуйте часть фамилии, имя или название места.</p>
            <button type="button" onClick={() => {
              reset();
            }}>Сбросить фильтры</button>
          </div>
        ) : null}
      </div>
      <DirectoryAutoLoader
        hasMore={Boolean(nextCursor)}
        isLoading={isLoading || isLoadingMore}
        loaded={people.length}
        total={total}
        onLoadMore={loadMore}
      />
    </section>
  );
}
