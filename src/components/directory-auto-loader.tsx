"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";

const copy = defineCopy({
  loading: "Загружаем следующую часть",
  shown: (loaded: number, total: number) => `Показано ${loaded} из ${total}`,
  allShown: (total: number) => `Показаны все результаты · ${total}`,
  loadingHint: "Новые строки появятся здесь",
  scrollHint: "Продолжайте прокрутку",
}, {
  en: {
    loading: "Loading the next part",
    shown: (loaded, total) => `Showing ${loaded} of ${total}`,
    allShown: (total) => `All results shown · ${total}`,
    loadingHint: "New rows will appear here",
    scrollHint: "Keep scrolling",
  },
  uk: {
    loading: "Завантажуємо наступну частину",
    shown: (loaded, total) => `Показано ${loaded} з ${total}`,
    allShown: (total) => `Показано всі результати · ${total}`,
    loadingHint: "Нові рядки з'являться тут",
    scrollHint: "Прокручуйте далі",
  },
  be: {
    loading: "Загружаем наступную частку",
    shown: (loaded, total) => `Паказана ${loaded} з ${total}`,
    allShown: (total) => `Паказаны ўсе вынікі · ${total}`,
    loadingHint: "Новыя радкі з'явяцца тут",
    scrollHint: "Працягвайце пракрутку",
  },
});

export function DirectoryAutoLoader({
  hasMore,
  isLoading,
  loaded,
  total,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  loaded: number;
  total: number;
  onLoadMore: () => void;
}) {
  const text = copy[useLocale()];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    }, { rootMargin: "600px 0px", threshold: 0.01 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!loaded) return null;

  return (
    <div
      ref={sentinelRef}
      className={`directory-stream-status${isLoading ? " is-loading" : hasMore ? "" : " is-complete"}`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      <span className="directory-stream-status__indicator" aria-hidden="true" />
      <strong>
        {isLoading
          ? text.loading
          : hasMore
            ? text.shown(loaded, total)
            : text.allShown(total)}
      </strong>
      {hasMore ? <small>{isLoading ? text.loadingHint : text.scrollHint}</small> : null}
    </div>
  );
}
