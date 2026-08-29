import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ChapterPeriod } from "@/components/chapter-period";
import { MarkdownArticle } from "@/components/markdown-article";
import { KeepCurrentChapterVisible, ReadingProgress } from "@/components/reading-tools";
import { SiteHeader } from "@/components/site-header";
import { SourceRegistry } from "@/components/source-registry";
import { getChapterMeta } from "@/lib/chapter-meta";
import {
  getAdjacentDocuments,
  getAllDocuments,
  getDocument,
  getDocumentsBySection,
} from "@/lib/docs";
import { getSourceRegistryIndex } from "@/lib/source-registry-index";

type PageProps = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllDocuments().map((document) => ({ slug: document.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const document = getDocument((await params).slug);
  if (!document) return {};
  return {
    title: document.title,
    description: document.excerpt,
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const document = getDocument((await params).slug);
  if (!document) notFound();

  const sectionDocuments = getDocumentsBySection(document.section);
  const { previous, next } = getAdjacentDocuments(document);
  const chapterMeta = getChapterMeta(document.slug);
  const periodDocuments = chapterMeta
    ? sectionDocuments.filter((entry) => {
        const meta = getChapterMeta(entry.slug);
        return meta?.group === chapterMeta.group && meta.period;
      })
    : [];
  const periodPosition = periodDocuments.findIndex((entry) => entry.slug === document.slug) + 1;
  const sourceRegistry = document.slug === "research/sources" ? getSourceRegistryIndex() : null;

  return (
    <main className="reading-page">
      <ReadingProgress />
      <SiteHeader />

      <div className="reading-shell">
        <aside className="book-rail">
          <KeepCurrentChapterVisible />
          <Link className="back-link" href="/">← На обложку</Link>
          <span className="eyebrow">{document.sectionLabel}</span>
          <ol>
            {sectionDocuments.map((entry, index) => {
              const meta = getChapterMeta(entry.slug);
              const previousMeta = index > 0 ? getChapterMeta(sectionDocuments[index - 1].slug) : undefined;
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

        <article className="article-column">
          {chapterMeta?.period && periodPosition > 0 ? (
            <ChapterPeriod meta={chapterMeta} position={periodPosition} total={periodDocuments.length} />
          ) : null}
          {sourceRegistry ? (
            <SourceRegistry registry={sourceRegistry} title={document.title} />
          ) : (
            <MarkdownArticle content={document.content} sourcePath={document.sourcePath} />
          )}

          <nav className="page-turn" aria-label="Соседние материалы">
            {previous ? (
              <Link href={`/read/${previous.slug}`}>
                <span>Назад</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/read/${next.slug}`}>
                <span>Далее</span>
                <strong>{next.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        </article>
      </div>
    </main>
  );
}
