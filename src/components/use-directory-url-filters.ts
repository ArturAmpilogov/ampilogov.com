"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type YearRange = { startYear: number; endYear: number };

function boundedYear(value: string | null, fallback: number, minYear: number, maxYear: number) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(maxYear, Math.max(minYear, parsed)) : fallback;
}

export function useDirectoryUrlFilters<Status extends string>({
  statuses,
  defaultStatus,
  minYear,
  maxYear,
}: {
  statuses: readonly Status[];
  defaultStatus: Status;
  minYear: number;
  maxYear: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = searchParams.toString();

  const readUrl = useMemo(() => {
    const params = new URLSearchParams(urlState);
    const requestedStatus = params.get("status") as Status | null;
    const status = requestedStatus && statuses.includes(requestedStatus) ? requestedStatus : defaultStatus;
    const startYear = boundedYear(params.get("from"), minYear, minYear, maxYear);
    const endYear = boundedYear(params.get("to"), maxYear, minYear, maxYear);
    return {
      query: params.get("search") ?? "",
      status,
      yearRange: {
        startYear: Math.min(startYear, endYear),
        endYear: Math.max(startYear, endYear),
      },
    };
  }, [defaultStatus, maxYear, minYear, statuses, urlState]);

  const [query, setQuery] = useState(readUrl.query);
  const [status, setStatus] = useState<Status>(readUrl.status);
  const [yearRange, setYearRange] = useState<YearRange>(readUrl.yearRange);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(urlState);
      const trimmedQuery = query.trim();

      if (trimmedQuery) params.set("search", trimmedQuery);
      else params.delete("search");

      if (status !== defaultStatus) params.set("status", status);
      else params.delete("status");

      if (yearRange.startYear !== minYear) params.set("from", String(yearRange.startYear));
      else params.delete("from");

      if (yearRange.endYear !== maxYear) params.set("to", String(yearRange.endYear));
      else params.delete("to");

      const nextState = params.toString();
      if (nextState !== urlState) {
        window.history.replaceState(null, "", nextState ? `${pathname}?${nextState}` : pathname);
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [defaultStatus, maxYear, minYear, pathname, query, status, urlState, yearRange]);

  const reset = () => {
    setQuery("");
    setStatus(defaultStatus);
    setYearRange({ startYear: minYear, endYear: maxYear });
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    yearRange,
    setYearRange,
    reset,
    isFiltered: Boolean(query.trim()) || status !== defaultStatus ||
      yearRange.startYear !== minYear || yearRange.endYear !== maxYear,
  };
}
