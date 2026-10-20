"use client";

import { useMemo } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import type { PeopleDirectoryResult } from "@/lib/directory-index-types";
import { DirectoryAutoLoader } from "@/components/directory-auto-loader";
import { YearRangeFilter } from "@/components/year-range-filter";
import { useDirectoryUrlFilters } from "@/components/use-directory-url-filters";
import { usePagedDirectory } from "@/components/use-paged-directory";

type Filter = "all" | "documented" | "review";
const FILTERS = ["all", "documented", "review"] as const satisfies readonly Filter[];

type RelationKey = "wife" | "husband" | "spouse" | "father" | "mother" | "parent" | "children";

const copy = defineCopy({
  catalog: "Каталог людей",
  searchLabel: "Поиск по ФИО",
  searchPlaceholder: "Имя, отчество, фамилия…",
  clearSearch: "Очистить поиск",
  matches: "совпадений",
  inSelection: "человек в выборке",
  status: "Статус",
  statuses: { all: "Все", documented: "Документированы", review: "Требуют проверки" },
  resetFilters: "Сбросить фильтры",
  relations: {
    wife: "Супруга",
    husband: "Супруг",
    spouse: "Супруг(а)",
    father: "Отец",
    mother: "Мать",
    parent: "Родитель",
    children: "Дети",
  } satisfies Record<RelationKey, string>,
  lifespan: (birth: string, death: string) => `Рождение: ${birth}; смерть: ${death}`,
  inSources: "В источниках:",
  age: (age: string) => `Возраст — ${age}`,
  placePending: "Место проверяется",
  sourceWord: (count: number): string => {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return "источников";
    if (mod10 === 1) return "источник";
    if (mod10 >= 2 && mod10 <= 4) return "источника";
    return "источников";
  },
  needsReview: "Проверить",
  documented: "Готово",
  emptyTitle: "Люди не найдены",
  emptyHint: "Попробуйте часть фамилии, имя или название места.",
}, {
  en: {
    catalog: "Catalogue of people",
    searchLabel: "Search by name",
    searchPlaceholder: "First name, patronymic, surname…",
    clearSearch: "Clear search",
    matches: "matches",
    inSelection: "people in selection",
    status: "Status",
    statuses: { all: "All", documented: "Documented", review: "Need checking" },
    resetFilters: "Reset filters",
    relations: {
      wife: "Wife",
      husband: "Husband",
      spouse: "Spouse",
      father: "Father",
      mother: "Mother",
      parent: "Parent",
      children: "Children",
    },
    lifespan: (birth, death) => `Birth: ${birth}; death: ${death}`,
    inSources: "In sources:",
    age: (age) => `Age — ${age}`,
    placePending: "Place being checked",
    sourceWord: (count) => (count === 1 ? "source" : "sources"),
    needsReview: "Check",
    documented: "Done",
    emptyTitle: "No people found",
    emptyHint: "Try part of a surname, a first name or a place name. Names are searched in Russian.",
  },
  uk: {
    catalog: "Каталог людей",
    searchLabel: "Пошук за ПІБ",
    searchPlaceholder: "Ім'я, по батькові, прізвище…",
    clearSearch: "Очистити пошук",
    matches: "збігів",
    inSelection: "осіб у вибірці",
    status: "Статус",
    statuses: { all: "Усі", documented: "Задокументовані", review: "Потребують перевірки" },
    resetFilters: "Скинути фільтри",
    relations: {
      wife: "Дружина",
      husband: "Чоловік",
      spouse: "Чоловік / дружина",
      father: "Батько",
      mother: "Мати",
      parent: "Батько або мати",
      children: "Діти",
    },
    lifespan: (birth, death) => `Народження: ${birth}; смерть: ${death}`,
    inSources: "У джерелах:",
    age: (age) => `Вік — ${age}`,
    placePending: "Місце перевіряється",
    sourceWord: (count) => {
      const mod100 = count % 100;
      const mod10 = count % 10;
      if (mod100 >= 11 && mod100 <= 14) return "джерел";
      if (mod10 === 1) return "джерело";
      if (mod10 >= 2 && mod10 <= 4) return "джерела";
      return "джерел";
    },
    needsReview: "Перевірити",
    documented: "Готово",
    emptyTitle: "Людей не знайдено",
    emptyHint: "Спробуйте частину прізвища, ім'я або назву місця. Імена шукаються російською.",
  },
  be: {
    catalog: "Каталог людзей",
    searchLabel: "Пошук па прозвішчы і імені",
    searchPlaceholder: "Імя, імя па бацьку, прозвішча…",
    clearSearch: "Ачысціць пошук",
    matches: "супадзенняў",
    inSelection: "чалавек у выбарцы",
    status: "Статус",
    statuses: { all: "Усе", documented: "Задакументаваныя", review: "Патрабуюць праверкі" },
    resetFilters: "Скінуць фільтры",
    relations: {
      wife: "Жонка",
      husband: "Муж",
      spouse: "Муж / жонка",
      father: "Бацька",
      mother: "Маці",
      parent: "Бацька або маці",
      children: "Дзеці",
    },
    lifespan: (birth, death) => `Нараджэнне: ${birth}; смерць: ${death}`,
    inSources: "У крыніцах:",
    age: (age) => `Узрост — ${age}`,
    placePending: "Месца правяраецца",
    sourceWord: (count) => {
      const mod100 = count % 100;
      const mod10 = count % 10;
      if (mod100 >= 11 && mod100 <= 14) return "крыніц";
      if (mod10 === 1) return "крыніца";
      if (mod10 >= 2 && mod10 <= 4) return "крыніцы";
      return "крыніц";
    },
    needsReview: "Праверыць",
    documented: "Гатова",
    emptyTitle: "Людзей не знойдзена",
    emptyHint: "Паспрабуйце частку прозвішча, імя або назву месца. Імёны шукаюцца па-руску.",
  },
});

function EmphasizedYears({ value }: { value: string }) {
  return value.split(/(\d{4})/).map((part, index) =>
    /^\d{4}$/.test(part) ? <b key={`${part}-${index}`}>{part}</b> : part
  );
}

function relationFacts(person: PeopleDirectoryResult, labels: Record<RelationKey, string>) {
  const facts = new Map<RelationKey, Set<string>>();
  const add = (key: RelationKey, name: string) => {
    const names = facts.get(key) ?? new Set<string>();
    names.add(name);
    facts.set(key, names);
  };

  for (const relation of person.relations) {
    if (relation.relation === "spouse") {
      const key: RelationKey = relation.sex === "female" || (relation.sex !== "male" && person.sex === "male")
        ? "wife"
        : relation.sex === "male" || person.sex === "female"
          ? "husband"
          : "spouse";
      add(key, relation.name);
    } else if (relation.relation === "parent") {
      add(relation.sex === "female" ? "mother" : relation.sex === "male" ? "father" : "parent", relation.name);
    } else if (relation.relation === "child") {
      add("children", relation.name);
    }
  }

  const order: RelationKey[] = ["wife", "husband", "spouse", "father", "mother", "parent", "children"];
  return order.flatMap((key) => {
    const names = facts.get(key);
    return names?.size ? [{ label: labels[key], names: [...names] }] : [];
  });
}

export function PeopleDirectory({
  minYear,
  maxYear,
}: {
  minYear: number;
  maxYear: number;
}) {
  const text = copy[useLocale()];
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
    <section className="people-workspace section-shell" aria-label={text.catalog}>
      <div className="people-toolbar">
        <label className="people-search">
          <span>{text.searchLabel}</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
              type="search"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label={text.clearSearch}>×</button> : null}
          </div>
        </label>

        <div className="directory-filter-panel">
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

      <div className="people-result-line">
        <span className="directory-result-count" aria-live="polite">
          <strong>{isLoading ? "…" : total}</strong>
          <span>{query ? text.matches : text.inSelection}</span>
        </span>
        <span className="directory-result-controls">
          <label className="directory-status-select">
            <span>{text.status}</span>
            <span className="directory-status-select__field">
              <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
                <option value="all">{text.statuses.all}</option>
                <option value="documented">{text.statuses.documented}</option>
                <option value="review">{text.statuses.review}</option>
              </select>
            </span>
          </label>
          <button
            className="directory-filter-reset"
            type="button"
            onClick={reset}
            disabled={!isFiltered}
            aria-label={text.resetFilters}
            title={text.resetFilters}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5.5 8.5A7.5 7.5 0 1 1 4.8 14" />
              <path d="M5.5 3.8v4.7H1" />
            </svg>
          </button>
        </span>
      </div>
      {error ? <p className="directory-error" role="alert">{error}</p> : null}

      <div className={`people-list${isLoading ? " is-loading" : ""}`} role="list" aria-busy={isLoading}>
        {people.map((person, index) => {
          const relations = relationFacts(person, text.relations);
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
                  aria-label={text.lifespan(person.life.birth, person.life.death)}
                >
                  <span><EmphasizedYears value={person.life.birth} /></span>
                  <i aria-hidden="true">—</i>
                  <span><EmphasizedYears value={person.life.death} /></span>
                </strong>
                {hasUncertainLifeDate && documentedYears.length ? (
                  <span className="person-row-source-years">
                    <b>{text.inSources}</b> {documentedYears.join(" · ")}
                  </span>
                ) : null}
                <small className="person-row-life-meta">
                  {person.life.age ? <span className="person-row-age">{text.age(person.life.age)}</span> : null}
                  <span>{person.places.join(" · ") || text.placePending}</span>
                </small>
              </span>
              <span className="person-row-sources">
                <strong>{person.sourceCount}</strong>
                <small>{text.sourceWord(person.sourceCount)}</small>
              </span>
              <span className={`person-row-status ${person.needsReview ? "is-review" : "is-documented"}`}>
                {person.needsReview ? text.needsReview : text.documented}
              </span>
              <span className="person-row-open" aria-hidden="true">↗</span>
            </Link>
          );
        })}

        {!isLoading && people.length === 0 ? (
          <div className="people-empty">
            <strong>{text.emptyTitle}</strong>
            <p>{text.emptyHint}</p>
            <button type="button" onClick={() => {
              reset();
            }}>{text.resetFilters}</button>
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
