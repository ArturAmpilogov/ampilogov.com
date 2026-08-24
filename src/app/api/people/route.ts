import { getPeopleDirectoryIndex } from "@/lib/directory-index";
import type { DirectoryPage, PeopleDirectoryResult } from "@/lib/directory-index-types";
import { boundedDirectoryLimit, boundedDirectoryYear, directoryCursor, normalizeDirectorySearch } from "@/lib/directory-search";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeDirectorySearch(url.searchParams.get("search") ?? "");
  const status = url.searchParams.get("status") ?? "all";
  const index = getPeopleDirectoryIndex();
  const requestedFrom = boundedDirectoryYear(url.searchParams.get("from"), index.stats.minYear, index.stats.minYear, index.stats.maxYear);
  const requestedTo = boundedDirectoryYear(url.searchParams.get("to"), index.stats.maxYear, index.stats.minYear, index.stats.maxYear);
  const from = Math.min(requestedFrom, requestedTo);
  const to = Math.max(requestedFrom, requestedTo);
  const cursor = directoryCursor(url.searchParams.get("cursor"));
  const limit = boundedDirectoryLimit(url.searchParams.get("limit"));
  const fullRange = from === index.stats.minYear && to === index.stats.maxYear;

  const matches = index.people.filter((person) => {
    const matchesQuery = !query || person.searchText.includes(query);
    const matchesStatus = status === "all" ||
      (status === "review" ? person.needsReview : !person.needsReview);
    const matchesYear = person.minYear === null || person.maxYear === null
      ? fullRange
      : person.minYear <= to && person.maxYear >= from;
    return matchesQuery && matchesStatus && matchesYear;
  });
  const nextOffset = cursor + limit;
  const body: DirectoryPage<PeopleDirectoryResult> = {
    items: matches.slice(cursor, nextOffset).map(({ searchText, ...person }) => {
      void searchText;
      return person;
    }),
    total: matches.length,
    nextCursor: nextOffset < matches.length ? String(nextOffset) : null,
  };

  return Response.json(body, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
