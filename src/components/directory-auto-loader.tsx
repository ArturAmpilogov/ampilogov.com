"use client";

import { useEffect, useRef } from "react";

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
          ? "Загружаем следующую часть"
          : hasMore
            ? `Показано ${loaded} из ${total}`
            : `Показаны все результаты · ${total}`}
      </strong>
      {hasMore ? <small>{isLoading ? "Новые строки появятся здесь" : "Продолжайте прокрутку"}</small> : null}
    </div>
  );
}
