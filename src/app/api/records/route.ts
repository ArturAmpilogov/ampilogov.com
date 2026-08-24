import { getRecordsDirectoryIndex } from "@/lib/directory-index";
import type { DirectoryPage, RecordDirectoryResult } from "@/lib/directory-index-types";
import { boundedDirectoryLimit, boundedDirectoryYear, directoryCursor, normalizeDirectorySearch } from "@/lib/directory-search";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeDirectorySearch(url.searchParams.get("search") ?? "");
  const status = url.searchParams.get("status") ?? "all";
  const index = getRecordsDirectoryIndex();
  const requestedFrom = boundedDirectoryYear(url.searchParams.get("from"), index.stats.minYear, index.stats.minYear, index.stats.maxYear);
  const requestedTo = boundedDirectoryYear(url.searchParams.get("to"), index.stats.maxYear, index.stats.minYear, index.stats.maxYear);
  const from = Math.min(requestedFrom, requestedTo);
  const to = Math.max(requestedFrom, requestedTo);
  const cursor = directoryCursor(url.searchParams.get("cursor"));
  const limit = boundedDirectoryLimit(url.searchParams.get("limit"));
  const fullRange = from === index.stats.minYear && to === index.stats.maxYear;

  const matches = index.records.filter((record) => {
    const matchesQuery = !query || record.searchText.includes(query);
    const matchesStatus = status === "all" ||
      (status === "complete" && record.reviewState === "complete") ||
      (status === "incomplete" && record.reviewState !== "complete") ||
      (status === "human" && record.reviewState === "human-review");
    const matchesYear = record.year === null ? fullRange : record.year >= from && record.year <= to;
    return matchesQuery && matchesStatus && matchesYear;
  });
  const nextOffset = cursor + limit;
  const body: DirectoryPage<RecordDirectoryResult> = {
    items: matches.slice(cursor, nextOffset).map(({ searchText, ...record }) => {
      void searchText;
      return record;
    }),
    total: matches.length,
    nextCursor: nextOffset < matches.length ? String(nextOffset) : null,
  };

  return Response.json(body, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
