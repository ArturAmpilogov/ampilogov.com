import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ChapterPeriod } from "@/components/chapter-period";
import { MarkdownArticle } from "@/components/markdown-article";
import { KeepCurrentChapterVisible, ReadingProgress } from "@/components/reading-tools";
import { SiteHeader } from "@/components/site-header";
import { SourceRegistry } from "@/components/source-registry";
import { type Locale, locales } from "@/i18n/config";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import { messages } from "@/i18n/messages";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";
import { getChapterMeta } from "@/lib/chapter-meta";
import {
  getAdjacentDocuments,
  getAllDocuments,
  getDocument,
  getDocumentsBySection,
} from "@/lib/docs";
import { getSourceRegistryIndex } from "@/lib/source-registry-index";

type PageProps = { params: Promise<{ locale: string; slug: string[] }> };

const copy = defineCopy({
  backToCover: "← На обложку",
  adjacent: "Соседние материалы",
  previous: "Назад",
  next: "Далее",
}, {
  en: { backToCover: "← Back to cover", adjacent: "Adjacent pages", previous: "Previous", next: "Next" },
  uk: { backToCover: "← На обкладинку", adjacent: "Сусідні матеріали", previous: "Назад", next: "Далі" },
  be: { backToCover: "← На вокладку", adjacent: "Суседнія матэрыялы", previous: "Назад", next: "Далей" },
});

export function generateStaticParams() {
  return getAllDocuments().map((document) => ({ slug: document.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = setRequestLocale(localeParam);
  const document = getDocument(slug, locale);
  if (!document) return {};
  const translatedLocales = locales.filter((entry: Locale) => getDocument(slug, entry)?.translated);
  return {
    title: document.title,
    description: document.excerpt,
    alternates: localeAlternates(locale, `/read/${document.slug}`, translatedLocales),
    // An untranslated page shows the Russian text; keep it out of the index in other languages.
    robots: document.translated ? undefined : { index: false, follow: true },
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = setRequestLocale(localeParam);
  const document = getDocument(slug, locale);
  if (!document) notFound();
  const text = copy[locale];

  const sectionDocuments = getDocumentsBySection(document.section, locale);
  const { previous, next } = getAdjacentDocuments(document);
  const chapterMeta = getChapterMeta(document.slug, locale);
  const periodPosition = sectionDocuments.findIndex((entry) => entry.slug === document.slug) + 1;
  const sourceRegistry = document.slug === "research/sources" ? getSourceRegistryIndex(locale) : null;

  return (
    <main className="reading-page">
      <ReadingProgress />
      <SiteHeader />

      <div className="reading-shell">
        <aside className="book-rail">
          <KeepCurrentChapterVisible />
          <Link className="back-link" href="/">{text.backToCover}</Link>
          <span className="eyebrow">{document.sectionLabel}</span>
          <ol>
            {sectionDocuments.map((entry, index) => {
              const meta = getChapterMeta(entry.slug, locale);
              const previousMeta = index > 0 ? getChapterMeta(sectionDocuments[index - 1].slug, locale) : undefined;
              const showGroup = document.section === "book" && meta && meta.group !== previousMeta?.group;

              return (
                <Fragment key={entry.slug}>
                  {showGroup ? <li className="book-rail-group">{meta.groupLabel}</li> : null}
                  <li>
                    <Link
                      aria-current={entry.slug === document.slug ? "page" : undefined}
                      className={entry.slug === document.slug ? "is-current" : undefined}
                      href={`/read/${entry.slug}`}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {entry.title}
                    </Link>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </aside>

        <article className="article-column" lang={document.translated ? undefined : "ru"}>
          {document.translated ? null : (
            <p className="translation-notice" lang={locale}>{messages[locale].language.untranslatedPage}</p>
          )}
          {chapterMeta?.period && periodPosition > 0 ? (
            <ChapterPeriod meta={chapterMeta} position={periodPosition} total={sectionDocuments.length} />
          ) : null}
          {sourceRegistry ? (
            <SourceRegistry registry={sourceRegistry} title={document.title} />
          ) : (
            <MarkdownArticle content={document.content} sourcePath={document.sourcePath} />
          )}

          <nav className="page-turn" aria-label={text.adjacent}>
            {previous ? (
              <Link href={`/read/${previous.slug}`}>
                <span>{text.previous}</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/read/${next.slug}`}>
                <span>{text.next}</span>
                <strong>{next.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        </article>
      </div>
    </main>
  );
}
