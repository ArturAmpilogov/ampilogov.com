import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { getChapterMeta } from "@/lib/chapter-meta";

export const DOCS_ROOT = path.join(process.cwd(), "docs");

const sectionNames: Record<string, string> = {
  book: "Книга",
  migration: "Переселения",
  people: "Люди",
  records: "Документы",
  places: "Места",
  research: "Исследование",
  leads: "Находки",
  evidence: "Фотокопии",
};

const sectionOrder = [
  "book",
  "migration",
  "people",
  "records",
  "places",
  "research",
  "leads",
  "evidence",
];

export type BookDocument = {
  slug: string;
  sourcePath: string;
  title: string;
  excerpt: string;
  section: string;
  sectionLabel: string;
  content: string;
  headings: { id: string; title: string; depth: number }[];
};

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : absolutePath;
  });
}

function cleanInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function headingId(value: string) {
  return cleanInlineMarkdown(value)
    .toLocaleLowerCase("ru")
    .replace(/[«»“”„'".,:;!?()[\]{}]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractTitle(content: string, fallback: string) {
  const title = content.match(/^#\s+(.+)$/m)?.[1];
  return cleanInlineMarkdown(title ?? fallback);
}

function extractExcerpt(content: string) {
  const blocks = content
    .replace(/^#.*$/gm, "")
    .split(/\n\s*\n/)
    .map(cleanInlineMarkdown)
    .filter(
      (block) =>
        block.length > 45 &&
        !block.startsWith("-") &&
        !block.startsWith("1.") &&
        !block.startsWith("```"),
    );

  const excerpt = blocks[0] ?? "Документальный раздел генеалогической книги.";
  return excerpt.length > 190 ? `${excerpt.slice(0, 187).trim()}…` : excerpt;
}

function extractHeadings(content: string) {
  const seen = new Map<string, number>();

  return [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => {
    const title = cleanInlineMarkdown(match[2]);
    const base = headingId(title);
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);

    return {
      id: occurrence === 0 ? base : `${base}-${occurrence}`,
      title,
      depth: match[1].length,
    };
  });
}

function toDocument(absolutePath: string): BookDocument {
  const sourcePath = path.relative(DOCS_ROOT, absolutePath).split(path.sep).join("/");
  const slug = sourcePath.replace(/\.md$/, "");
  const section = slug.split("/")[0] || "book";
  const content = readFileSync(absolutePath, "utf8");
  const fallback = path.basename(slug).replace(/[-_]/g, " ");

  return {
    slug,
    sourcePath,
    title: extractTitle(content, fallback),
    excerpt: extractExcerpt(content),
    section,
    sectionLabel: sectionNames[section] ?? "Материалы",
    content,
    headings: extractHeadings(content),
  };
}

export function getAllDocuments() {
  return walk(DOCS_ROOT)
    .filter((file) => file.endsWith(".md"))
    .map(toDocument)
    .sort((left, right) => {
      const sectionDifference =
        sectionOrder.indexOf(left.section) - sectionOrder.indexOf(right.section);
      if (sectionDifference !== 0) return sectionDifference;

      if (left.section === "book" && right.section === "book") {
        const orderDifference =
          (getChapterMeta(left.slug)?.order ?? 50) -
          (getChapterMeta(right.slug)?.order ?? 50);
        if (orderDifference !== 0) return orderDifference;
      }

      return left.slug.localeCompare(right.slug, "ru", { numeric: true });
    });
}

export function getDocumentsBySection(section: string) {
  return getAllDocuments().filter((document) => document.section === section);
}

export function getDocument(slugParts: string[]) {
  const slug = slugParts.join("/");
  return getAllDocuments().find((document) => document.slug === slug);
}

export function getAdjacentDocuments(document: BookDocument) {
  const sectionDocuments = getDocumentsBySection(document.section);
  const index = sectionDocuments.findIndex((entry) => entry.slug === document.slug);

  return {
    previous: index > 0 ? sectionDocuments[index - 1] : undefined,
    next: index >= 0 ? sectionDocuments[index + 1] : undefined,
  };
}

export function resolveDocumentUrl(sourcePath: string, url?: string) {
  if (!url || /^(https?:|mailto:|#|\/)/.test(url)) return url;

  const [pathname, hash] = url.split("#");
  const decodedPath = decodeURIComponent(pathname);
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), decodedPath),
  );

  if (resolved.endsWith(".md")) {
    const slug = resolved.slice(0, -3);
    return `/read/${slug}${hash ? `#${hash}` : ""}`;
  }

  return `/archive/${resolved}${hash ? `#${hash}` : ""}`;
}
