"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { SourceRegistryEntry, SourceRegistryIndex } from "@/lib/source-registry-index";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";

const copy = defineCopy({
  eyebrow: "Исследовательский аппарат",
  searchLabel: "Найти источник",
  searchPlaceholder: "Шифр, название, тип или статус…",
  clearSearch: "Очистить поиск",
  count: (visible: number, total: number) => `${visible} из ${total}`,
  entryFallback: "Описание источника",
  loadError: "Описание не загрузилось.",
  retry: "Повторить",
  loading: "Загружаем описание…",
  empty: "Источники не найдены. Попробуйте часть шифра или названия.",
}, {
  en: {
    eyebrow: "Research apparatus",
    searchLabel: "Find a source",
    searchPlaceholder: "Reference code, title, type or status…",
    clearSearch: "Clear search",
    count: (visible, total) => `${visible} of ${total}`,
    entryFallback: "Source description",
    loadError: "The description failed to load.",
    retry: "Retry",
    loading: "Loading the description…",
    empty: "No sources found. Try part of a reference code or title (titles are in Russian).",
  },
  uk: {
    eyebrow: "Дослідницький апарат",
    searchLabel: "Знайти джерело",
    searchPlaceholder: "Шифр, назва, тип або статус…",
    clearSearch: "Очистити пошук",
    count: (visible, total) => `${visible} з ${total}`,
    entryFallback: "Опис джерела",
    loadError: "Опис не завантажився.",
    retry: "Повторити",
    loading: "Завантажуємо опис…",
    empty: "Джерел не знайдено. Спробуйте частину шифру або назви (назви російською).",
  },
  be: {
    eyebrow: "Даследчы апарат",
    searchLabel: "Знайсці крыніцу",
    searchPlaceholder: "Шыфр, назва, тып або статус…",
    clearSearch: "Ачысціць пошук",
    count: (visible, total) => `${visible} з ${total}`,
    entryFallback: "Апісанне крыніцы",
    loadError: "Апісанне не загрузілася.",
    retry: "Паўтарыць",
    loading: "Загружаем апісанне…",
    empty: "Крыніц не знойдзена. Паспрабуйце частку шыфра або назвы (назвы па-руску).",
  },
});

type LoadedSource = {
  sourceId: string;
  title: string;
  content: string;
};

function normalizedSearch(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ru").replace(/ё/g, "е");
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a {...props} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {children}
      </a>
    );
  },
};

export function SourceRegistry({ registry, title }: { registry: SourceRegistryIndex; title: string }) {
  const text = copy[useLocale()];
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(() => new Map<string, LoadedSource>());
  const [requestState, setRequestState] = useState<{ id: string; state: "loading" | "error" } | null>(null);
  const entriesById = useMemo(() => new Map(
    registry.groups.flatMap((group) => group.entries.map((entry) => [entry.id, entry] as const)),
  ), [registry.groups]);
  const normalizedQuery = normalizedSearch(query.trim());
  const visibleGroups = useMemo(() => {
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return registry.groups.map((group) => ({
      ...group,
      entries: queryTokens.length
        ? group.entries.filter((entry) => {
          const searchable = normalizedSearch([
            entry.sourceId,
            entry.title,
            entry.type,
            entry.status,
          ].join(" "));
          return queryTokens.every((token) => searchable.includes(token));
        })
        : group.entries,
    })).filter((group) => group.entries.length);
  }, [normalizedQuery, registry.groups]);

  const loadEntry = async (entry: SourceRegistryEntry, updateHash = true) => {
    if (activeId === entry.id && loaded.has(entry.id)) {
      setActiveId(null);
      return;
    }
    setActiveId(entry.id);
    if (updateHash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${entry.id}`);
    if (loaded.has(entry.id)) return;

    setRequestState({ id: entry.id, state: "loading" });
    try {
      const response = await fetch(entry.path);
      if (!response.ok) throw new Error(`Source registry request failed: ${response.status}`);
      const payload = await response.json() as LoadedSource;
      setLoaded((current) => {
        const next = new Map(current);
        next.set(entry.id, payload);
        return next;
      });
      setRequestState(null);
    } catch (error) {
      console.error(error);
      setRequestState({ id: entry.id, state: "error" });
    }
  };

  useEffect(() => {
    const openHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1)).toLocaleLowerCase("ru");
      const entry = entriesById.get(id);
      if (!entry) return;
      void loadEntry(entry, false).then(() => {
        window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      });
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
    // The hash is the external source of truth; opening an entry updates it directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesById]);

  const visibleCount = visibleGroups.reduce((total, group) => total + group.entries.length, 0);

  return (
    <div className="source-registry">
      <header className="source-registry__heading">
        <span>{text.eyebrow}</span>
        <h1>{title}</h1>
      </header>
      <div className="source-registry__intro">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{registry.intro}</ReactMarkdown>
      </div>
      <label className="source-registry__search">
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
        <small>{text.count(visibleCount, entriesById.size)}</small>
      </label>

      <div className="source-registry__groups">
        {visibleGroups.map((group) => (
          <section key={group.title}>
            <header>
              <h2>{group.title}</h2>
              <span>{group.entries.length}</span>
            </header>
            <div className="source-registry__entries">
              {group.entries.map((entry) => {
                const isOpen = activeId === entry.id;
                const payload = loaded.get(entry.id);
                const state = requestState?.id === entry.id ? requestState.state : null;
                return (
                  <article id={entry.id} className={isOpen ? "is-open" : undefined} key={entry.sourceId}>
                    <button type="button" onClick={() => void loadEntry(entry)} aria-expanded={isOpen}>
                      <span>{entry.sourceId}</span>
                      <strong>{entry.title}</strong>
                      <small>{entry.type || entry.status || text.entryFallback}</small>
                      <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                    </button>
                    {isOpen ? (
                      <div className="source-registry__detail">
                        {payload ? (
                          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                            {payload.content}
                          </ReactMarkdown>
                        ) : state === "error" ? (
                          <div className="source-registry__error">
                            <p>{text.loadError}</p>
                            <button type="button" onClick={() => void loadEntry(entry)}>{text.retry}</button>
                          </div>
                        ) : <p className="source-registry__loading">{text.loading}</p>}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!visibleCount ? <p className="source-registry__empty">{text.empty}</p> : null}
    </div>
  );
}
