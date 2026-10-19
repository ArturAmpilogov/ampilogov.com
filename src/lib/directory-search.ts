export function normalizeDirectorySearch(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

// Every word of the query must occur somewhere in the entry, in any order:
// "Сила Анфилов" finds "Сила Филимонович Анфилов".
export function matchesDirectorySearch(searchText: string, query: string) {
  return query.split(" ").every((term) => searchText.includes(term));
}

export function boundedDirectoryLimit(value: string | null) {
  if (value === null || value.trim() === "") return 50;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(100, Math.max(1, parsed)) : 50;
}

export function directoryCursor(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function boundedDirectoryYear(
  value: string | null,
  fallback: number,
  minYear: number,
  maxYear: number,
) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(maxYear, Math.max(minYear, parsed)) : fallback;
}
