"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArchiveRecord } from "@/lib/genealogy";

type Filter = "all" | "complete" | "reading";

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
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

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return records.filter((record) => {
      const matchesQuery = !needle || normalize(record.searchText).includes(needle);
      const matchesFilter = filter === "all" ||
        (filter === "complete" ? record.isComplete : !record.isComplete);
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, records]);

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
            ["reading", "В работе"],
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

      <div className="records-result-line" aria-live="polite">
        <strong>{filtered.length}</strong>
        <span>{query ? "совпадений" : "записей в выборке"}</span>
      </div>

      <div className="records-list" role="list">
        {filtered.map((record, index) => (
          <Link href={`/records/${encodeURIComponent(record.sourceId)}`} key={record.sourceId} className="record-row">
            <span className="record-row-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="record-row-event">
              <small>{record.eventLabel}</small>
              <strong>{record.people[0]?.name ?? "Имя уточняется"}</strong>
              {record.people[0]?.alternateNames.length ? (
                <span className="record-row-alternates">
                  {record.people[0].alternateNames.join(" · ")}
                </span>
              ) : null}
            </span>
            <span className="record-row-context">
              <strong>{record.date}</strong>
              <small>{record.place}</small>
            </span>
            <span className={`record-row-status ${record.isComplete ? "is-complete" : "is-reading"}`}>
              {record.isComplete ? "расшифровано" : "требует чтения"}
            </span>
            <span className="record-row-open" aria-hidden="true">↗</span>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="records-empty">
            <strong>Записей не найдено</strong>
            <p>Попробуйте часть фамилии, имя или год.</p>
            <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Сбросить фильтры</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
