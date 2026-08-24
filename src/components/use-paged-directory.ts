"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DirectoryPage } from "@/lib/directory-index-types";

export function usePagedDirectory<T>({
  endpoint,
  params,
}: {
  endpoint: string;
  params: URLSearchParams;
}) {
  const queryString = params.toString();
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loadingMore = useRef(false);

  useEffect(() => {
    const id = ++requestId.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      loadingMore.current = false;
      setIsLoading(true);
      setIsLoadingMore(false);
      setError(null);
      try {
        const response = await fetch(`${endpoint}?${queryString}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Directory request failed: ${response.status}`);
        const page = await response.json() as DirectoryPage<T>;
        if (requestId.current !== id) return;
        setItems(page.items);
        setTotal(page.total);
        setNextCursor(page.nextCursor);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        if (requestId.current !== id) return;
        setItems([]);
        setTotal(0);
        setNextCursor(null);
        setError("Не удалось загрузить каталог. Попробуйте ещё раз.");
      } finally {
        if (requestId.current === id) setIsLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [endpoint, queryString]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore.current) return;
    const id = requestId.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    try {
      const nextParams = new URLSearchParams(queryString);
      nextParams.set("cursor", nextCursor);
      const response = await fetch(`${endpoint}?${nextParams.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Directory request failed: ${response.status}`);
      const page = await response.json() as DirectoryPage<T>;
      if (requestId.current !== id) return;
      setItems((current) => [...current, ...page.items]);
      setTotal(page.total);
      setNextCursor(page.nextCursor);
      setError(null);
    } catch {
      if (requestId.current !== id) return;
      setError("Не удалось загрузить следующую часть каталога.");
    } finally {
      loadingMore.current = false;
      if (requestId.current === id) setIsLoadingMore(false);
    }
  }, [endpoint, nextCursor, queryString]);

  return { items, total, nextCursor, isLoading, isLoadingMore, error, loadMore };
}
