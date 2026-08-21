"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DirectoryPerson } from "@/lib/genealogy";

type Filter = "all" | "documented" | "review";

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

export function PeopleDirectory({
  people,
  initialQuery = "",
}: {
  people: DirectoryPerson[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return people.filter((person) => {
      const matchesQuery = !needle || normalize(person.searchText).includes(needle);
      const matchesFilter = filter === "all" ||
        (filter === "review" ? person.needsReview : !person.needsReview);
      return matchesQuery && matchesFilter;
    });
  }, [filter, people, query]);

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
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="people-result-line" aria-live="polite">
        <strong>{filtered.length}</strong>
        <span>{query ? "совпадений" : "профилей в выборке"}</span>
      </div>

      <div className="people-list" role="list">
        {filtered.map((person, index) => (
          <Link href={`/people/${encodeURIComponent(person.personId)}`} key={person.personId} className="person-row">
            <span className="person-row-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="person-row-main">
              <small>{person.personId}{person.normalizedSurname ? ` · ${person.normalizedSurname}` : ""}</small>
              <strong>{person.displayName}</strong>
              {person.variants.length ? <em>{person.variants.join(" · ")}</em> : null}
            </span>
            <span className="person-row-context">
              <strong>{person.birthDate || "Дата рождения не установлена"}</strong>
              <small>{person.places.join(" · ") || "Место проверяется"}</small>
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
        ))}

        {filtered.length === 0 ? (
          <div className="people-empty">
            <strong>Профили не найдены</strong>
            <p>Попробуйте часть фамилии, имя или название места.</p>
            <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Сбросить фильтры</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
