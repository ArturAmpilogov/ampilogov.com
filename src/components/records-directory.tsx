"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArchiveRecord } from "@/lib/genealogy";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { YearRangeFilter } from "@/components/year-range-filter";

type Filter = "all" | "complete" | "incomplete" | "human";

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

function recordYear(record: ArchiveRecord) {
  const years = `${record.year} ${record.date}`.match(/\b[0-9]{4}\b/g) ?? [];
  return years.map(Number).find((year) => year >= 1000 && year <= 2099) ?? null;
}

export function RecordsDirectory({
  records,
  initialQuery = "",
}: {
  records: ArchiveRecord[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("all");
  const yearBounds = useMemo(() => {
    const years = records
      .map(recordYear)
      .filter((year): year is number => year !== null);
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    };
  }, [records]);
  const [yearRange, setYearRange] = useState(() => ({
    startYear: yearBounds.minYear,
    endYear: yearBounds.maxYear,
  }));

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return records.filter((record) => {
      const matchesQuery = !needle || normalize(record.searchText).includes(needle);
      const matchesFilter = filter === "all" ||
        (filter === "complete" && record.reviewState === "complete") ||
        (filter === "incomplete" && record.reviewState !== "complete") ||
        (filter === "human" && record.reviewState === "human-review");
      const year = recordYear(record);
      const fullRange = yearRange.startYear === yearBounds.minYear &&
        yearRange.endYear === yearBounds.maxYear;
      const matchesYear = year === null
        ? fullRange
        : year >= yearRange.startYear && year <= yearRange.endYear;
      return matchesQuery && matchesFilter && matchesYear;
    });
  }, [filter, query, records, yearBounds, yearRange]);

  return (
    <section className="records-workspace section-shell" aria-label="Каталог архивных записей">
      <div className="records-toolbar">
        <label className="records-search">
          <span>Поиск по записям</span>
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, вариант фамилии, место, год, текст…"
              autoComplete="off"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">×</button> : null}
          </div>
        </label>
        <div className="records-filters" aria-label="Статус расшифровки">
          {([
            ["all", "Все"],
            ["complete", "Расшифрованы"],
            ["incomplete", "Незавершённые"],
            ["human", "Нужна помощь"],
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
      </div>

      <YearRangeFilter
        minYear={yearBounds.minYear}
        maxYear={yearBounds.maxYear}
        startYear={yearRange.startYear}
        endYear={yearRange.endYear}
        onChange={setYearRange}
      />

      <div className="records-result-line" aria-live="polite">
        <strong>{filtered.length}</strong>
        <span>{query ? "совпадений" : "записей в выборке"}</span>
      </div>

      <div className="records-list" role="list">
        {filtered.map((record, index) => (
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
        {filtered.length === 0 ? (
          <div className="records-empty">
            <strong>Записей не найдено</strong>
            <p>Попробуйте часть фамилии, имя или год.</p>
            <button type="button" onClick={() => {
              setQuery("");
              setFilter("all");
              setYearRange({ startYear: yearBounds.minYear, endYear: yearBounds.maxYear });
            }}>Сбросить фильтры</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
