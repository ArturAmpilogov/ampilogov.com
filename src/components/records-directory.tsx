"use client";

import { useMemo } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import type { RecordDirectoryResult } from "@/lib/directory-index-types";
import { DirectoryAutoLoader } from "@/components/directory-auto-loader";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { YearRangeFilter } from "@/components/year-range-filter";
import { useDirectoryUrlFilters } from "@/components/use-directory-url-filters";
import { usePagedDirectory } from "@/components/use-paged-directory";

type Filter = "all" | "complete" | "incomplete" | "human";
const FILTERS = ["all", "complete", "incomplete", "human"] as const satisfies readonly Filter[];

const copy = defineCopy({
  catalog: "Каталог архивных записей",
  searchLabel: "Поиск по ФИО",
  searchPlaceholder: "Имя, отчество, фамилия…",
  clearSearch: "Очистить поиск",
  matches: "совпадений",
  inSelection: "записей в выборке",
  status: "Статус",
  statuses: { all: "Все", complete: "Расшифрованы", incomplete: "Незавершённые", human: "Нужна помощь" },
  resetFilters: "Сбросить фильтры",
  extraFacts: "Дополнительные сведения",
  emptyTitle: "Записей не найдено",
  emptyHint: "Попробуйте часть фамилии, имя или год.",
}, {
  en: {
    catalog: "Catalogue of archival records",
    searchLabel: "Search by name",
    searchPlaceholder: "First name, patronymic, surname…",
    clearSearch: "Clear search",
    matches: "matches",
    inSelection: "records in selection",
    status: "Status",
    statuses: { all: "All", complete: "Transcribed", incomplete: "Unfinished", human: "Help needed" },
    resetFilters: "Reset filters",
    extraFacts: "Additional details",
    emptyTitle: "No records found",
    emptyHint: "Try part of a surname, a first name or a year. Names are searched in Russian.",
  },
  uk: {
    catalog: "Каталог архівних записів",
    searchLabel: "Пошук за ПІБ",
    searchPlaceholder: "Ім'я, по батькові, прізвище…",
    clearSearch: "Очистити пошук",
    matches: "збігів",
    inSelection: "записів у вибірці",
    status: "Статус",
    statuses: { all: "Усі", complete: "Розшифровані", incomplete: "Незавершені", human: "Потрібна допомога" },
    resetFilters: "Скинути фільтри",
    extraFacts: "Додаткові відомості",
    emptyTitle: "Записів не знайдено",
    emptyHint: "Спробуйте частину прізвища, ім'я або рік. Імена шукаються російською.",
  },
  be: {
    catalog: "Каталог архіўных запісаў",
    searchLabel: "Пошук па прозвішчы і імені",
    searchPlaceholder: "Імя, імя па бацьку, прозвішча…",
    clearSearch: "Ачысціць пошук",
    matches: "супадзенняў",
    inSelection: "запісаў у выбарцы",
    status: "Статус",
    statuses: { all: "Усе", complete: "Расшыфраваныя", incomplete: "Незавершаныя", human: "Патрэбна дапамога" },
    resetFilters: "Скінуць фільтры",
    extraFacts: "Дадатковыя звесткі",
    emptyTitle: "Запісаў не знойдзена",
    emptyHint: "Паспрабуйце частку прозвішча, імя або год. Імёны шукаюцца па-руску.",
  },
});

export function RecordsDirectory({
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
    items: records,
    total,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = usePagedDirectory<RecordDirectoryResult>({ endpoint: "/api/records", params: requestParams });

  return (
    <section className="records-workspace section-shell" aria-label={text.catalog}>
      <div className="records-toolbar">
        <label className="records-search">
          <span>{text.searchLabel}</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
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

      <div className="records-result-line">
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
                <option value="complete">{text.statuses.complete}</option>
                <option value="incomplete">{text.statuses.incomplete}</option>
                <option value="human">{text.statuses.human}</option>
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

      <div className={`records-list${isLoading ? " is-loading" : ""}`} role="list" aria-busy={isLoading}>
        {records.map((record, index) => (
          <Link href={`/records/${encodeURIComponent(record.sourceId)}`} key={record.sourceId} className="record-row">
            <span className="record-row-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="record-row-event">
              <small className="record-row-type">
                <RecordTypeIcon eventType={record.eventType} />
                <span>{record.eventLabel}</span>
              </small>
              <strong>{record.primaryPerson?.name ?? record.eventLabel}</strong>
              {record.primaryPerson?.alternateNames.length ? (
                <span className="record-row-alternates">
                  {record.primaryPerson.alternateNames.join(" · ")}
                </span>
              ) : null}
              {record.directoryFacts.length ? (
                <span className="record-row-facts" aria-label={text.extraFacts}>
                  {record.directoryFacts.map((fact) => (
                    <span className="record-row-fact" key={`${fact.label}:${fact.value}`}>
                      <b>{fact.label}</b>
                      <span>{fact.value}</span>
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
            <span className="record-row-context">
              <strong>{record.date}</strong>
              <small>{record.place}</small>
            </span>
            <span
              className={`record-row-status is-${record.reviewState}`}
              title={record.reviewDescription}
            >
              {record.reviewLabel}
            </span>
            <span className="record-row-open" aria-hidden="true">↗</span>
          </Link>
        ))}
        {!isLoading && records.length === 0 ? (
          <div className="records-empty">
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
        loaded={records.length}
        total={total}
        onLoadMore={loadMore}
      />
    </section>
  );
}
