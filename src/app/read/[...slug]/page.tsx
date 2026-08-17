import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/markdown-article";
import { ArticleToc, ReadingProgress } from "@/components/reading-tools";
import { SiteHeader } from "@/components/site-header";
import {
  getAdjacentDocuments,
  getAllDocuments,
  getDocument,
  getDocumentsBySection,
} from "@/lib/docs";

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

  return (
    <main className="reading-page">
      <ReadingProgress />
      <SiteHeader />

      <div className="reading-shell">
        <aside className="book-rail">
          <Link className="back-link" href="/">← На обложку</Link>
          <span className="eyebrow">{document.sectionLabel}</span>
          <ol>
            {sectionDocuments.map((entry, index) => (
              <li key={entry.slug}>
                <Link className={entry.slug === document.slug ? "is-current" : undefined} href={`/read/${entry.slug}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {entry.title}
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        <article className="article-column">
          <div className="article-meta">
            <span>{document.sectionLabel}</span>
            <span>{document.sourcePath}</span>
          </div>
          <MarkdownArticle content={document.content} sourcePath={document.sourcePath} />

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

        <aside className="toc-rail">
          <ArticleToc headings={document.headings} />
        </aside>
      </div>
    </main>
  );
}
