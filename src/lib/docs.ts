import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { defaultLocale, type Locale } from "@/i18n/config";
import { defineCopy } from "@/i18n/copy";
import { getChapterMeta } from "@/lib/chapter-meta";

export const DOCS_ROOT = path.join(process.cwd(), "docs");
/** translations/<locale>/docs mirrors docs/; a missing file falls back to Russian. */
export const TRANSLATIONS_ROOT = path.join(process.cwd(), "translations");

const copy = defineCopy({
  sections: {
    book: "Книга",
    migration: "Переселения",
    people: "Люди",
    records: "Документы",
    places: "Места",
    research: "Исследование",
    leads: "Находки",
    evidence: "Фотокопии",
  } as Record<string, string>,
  otherSection: "Материалы",
  fallbackExcerpt: "Документальный раздел генеалогической книги.",
}, {
  en: {
    sections: {
      book: "Book",
      migration: "Migrations",
      people: "People",
      records: "Documents",
      places: "Places",
      research: "Research",
      leads: "Leads",
      evidence: "Photocopies",
    },
    otherSection: "Materials",
    fallbackExcerpt: "A documentary section of the family history book.",
  },
  uk: {
    sections: {
      book: "Книга",
      migration: "Переселення",
      people: "Люди",
      records: "Документи",
      places: "Місця",
      research: "Дослідження",
      leads: "Знахідки",
      evidence: "Фотокопії",
    },
    otherSection: "Матеріали",
    fallbackExcerpt: "Документальний розділ генеалогічної книги.",
  },
  be: {
    sections: {
      book: "Кніга",
      migration: "Перасяленні",
      people: "Людзі",
      records: "Дакументы",
      places: "Месцы",
      research: "Даследаванне",
      leads: "Знаходкі",
      evidence: "Фотакопіі",
    },
    otherSection: "Матэрыялы",
    fallbackExcerpt: "Дакументальны раздзел генеалагічнай кнігі.",
  },
});

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

// Working research notes (archive requests, hypotheses, open questions) stay in the
// repository but are not published: the research section shows only the source registry.
const publishedResearchDocuments = new Set(["research/sources"]);

function isPublishedSlug(slug: string) {
  return !slug.startsWith("research/") || publishedResearchDocuments.has(slug);
}

/** Source codes listed in the public registry; other codes live only in the working notes. */
export function getPublishedSourceIds() {
  return new Set(
    readFileSync(path.join(DOCS_ROOT, "research/sources.md"), "utf8")
      .match(/^### S-[A-Z0-9-]+/gm)
      ?.map((heading) => heading.slice(4)) ?? [],
  );
}

export type BookDocument = {
  slug: string;
  sourcePath: string;
  title: string;
  excerpt: string;
  section: string;
  sectionLabel: string;
  content: string;
  headings: { id: string; title: string; depth: number }[];
  locale: Locale;
  /** False when the requested locale has no translation and the Russian text is shown. */
  translated: boolean;
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

function extractExcerpt(content: string, fallback: string) {
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

  const excerpt = blocks[0] ?? fallback;
  return excerpt.length > 190 ? `${excerpt.slice(0, 187).trim()}…` : excerpt;
}

function extractHeadings(content: string) {
  const seen = new Map<string, number>();

  // Headings inside the folded research notes stay out of the chapter outline.
  const articleContent = content.split("{{RESEARCH_NOTES}}")[0];

  return [...articleContent.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => {
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

function translationPath(locale: Locale, sourcePath: string) {
  return path.join(TRANSLATIONS_ROOT, locale, "docs", ...sourcePath.split("/"));
}

export function hasDocumentTranslation(locale: Locale, sourcePath: string) {
  return locale === defaultLocale || existsSync(translationPath(locale, sourcePath));
}

function toDocument(absolutePath: string, locale: Locale): BookDocument {
  const sourcePath = path.relative(DOCS_ROOT, absolutePath).split(path.sep).join("/");
  const slug = sourcePath.replace(/\.md$/, "");
  const section = slug.split("/")[0] || "book";
  const useTranslation = locale !== defaultLocale && hasDocumentTranslation(locale, sourcePath);
  const translated = locale === defaultLocale || useTranslation;
  // sourcePath stays the Russian file's path: relative links resolve against it.
  const content = readFileSync(useTranslation ? translationPath(locale, sourcePath) : absolutePath, "utf8");
  const fallback = path.basename(slug).replace(/[-_]/g, " ");
  const text = copy[translated ? locale : defaultLocale];

  return {
    slug,
    sourcePath,
    title: extractTitle(content, fallback),
    excerpt: getChapterMeta(slug, translated ? locale : defaultLocale)?.description
      ?? extractExcerpt(content, text.fallbackExcerpt),
    section,
    sectionLabel: copy[locale].sections[section] ?? copy[locale].otherSection,
    content,
    headings: extractHeadings(content),
    locale,
    translated,
  };
}

export function getAllDocuments(locale: Locale = defaultLocale) {
  return walk(DOCS_ROOT)
    .filter((file) => file.endsWith(".md"))
    .map((file) => toDocument(file, locale))
    .filter((document) => isPublishedSlug(document.slug))
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

export function getDocumentsBySection(section: string, locale: Locale = defaultLocale) {
  return getAllDocuments(locale).filter((document) => document.section === section);
}

export function getDocument(slugParts: string[], locale: Locale = defaultLocale) {
  const slug = slugParts.join("/");
  return getAllDocuments(locale).find((document) => document.slug === slug);
}

export function getAdjacentDocuments(document: BookDocument) {
  const sectionDocuments = getDocumentsBySection(document.section, document.locale);
  const index = sectionDocuments.findIndex((entry) => entry.slug === document.slug);

  return {
    previous: index > 0 ? sectionDocuments[index - 1] : undefined,
    next: index >= 0 ? sectionDocuments[index + 1] : undefined,
  };
}

export function resolveDocumentUrl(sourcePath: string, url?: string) {
  if (url?.startsWith("/read/") && !isPublishedSlug(url.slice("/read/".length).split("#")[0])) {
    return undefined;
  }
  if (!url || /^(https?:|mailto:|#|\/)/.test(url)) return url;

  const [pathname, hash] = url.split("#");
  const decodedPath = decodeURIComponent(pathname);
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), decodedPath),
  );

  if (resolved.endsWith(".md")) {
    const slug = resolved.slice(0, -3);
    if (!isPublishedSlug(slug)) return undefined;
    return `/read/${slug}${hash ? `#${hash}` : ""}`;
  }

  return `/archive/${resolved}${hash ? `#${hash}` : ""}`;
}
