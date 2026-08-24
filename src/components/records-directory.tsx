"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { RecordDirectoryResult } from "@/lib/directory-index-types";
import { DirectoryAutoLoader } from "@/components/directory-auto-loader";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { YearRangeFilter } from "@/components/year-range-filter";
import { useDirectoryUrlFilters } from "@/components/use-directory-url-filters";
import { usePagedDirectory } from "@/components/use-paged-directory";

type Filter = "all" | "complete" | "incomplete" | "human";
const FILTERS = ["all", "complete", "incomplete", "human"] as const satisfies readonly Filter[];

export function RecordsDirectory({
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
    items: records,
    total,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = usePagedDirectory<RecordDirectoryResult>({ endpoint: "/api/records", params: requestParams });

  return (
    <section className="records-workspace section-shell" aria-label="Каталог архивных записей">
      <div className="records-toolbar">
        <label className="records-search">
          <span>Поиск по ФИО</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, отчество, фамилия…"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">×</button> : null}
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
          <span>{query ? "совпадений" : "записей в выборке"}</span>
        </span>
        <span className="directory-result-controls">
          <label className="directory-status-select">
            <span>Статус</span>
            <span className="directory-status-select__field">
              <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
                <option value="all">Все</option>
                <option value="complete">Расшифрованы</option>
                <option value="incomplete">Незавершённые</option>
                <option value="human">Нужна помощь</option>
              </select>
            </span>
          </label>
          <button
            className="directory-filter-reset"
            type="button"
            onClick={reset}
            disabled={!isFiltered}
            aria-label="Сбросить фильтры"
            title="Сбросить фильтры"
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
                <span className="record-row-facts" aria-label="Дополнительные сведения">
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
            <strong>Записей не найдено</strong>
            <p>Попробуйте часть фамилии, имя или год.</p>
            <button type="button" onClick={() => {
              reset();
            }}>Сбросить фильтры</button>
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
