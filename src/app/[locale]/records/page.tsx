import type { Metadata } from "next";
import { Suspense } from "react";
import { RecordsDirectory } from "@/components/records-directory";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";
import { getRecordsDirectoryIndex } from "@/lib/records-directory-index";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  return {
    title: copy[locale].metaTitle,
    description: copy[locale].metaDescription,
    alternates: localeAlternates(locale, "/records"),
  };
}

const copy = defineCopy({
  metaTitle: "Архивные записи",
  metaDescription: "Документы о фамильном ряде Ампилоговых по 1950 год: оригиналы, расшифровки и контекст.",
  eyebrow: "Первичные документы",
  title: "Записи",
  lead: "Документы до 1950 года: сканы, расшифровки, современное чтение и контекст.",
  statsLabel: "Состав каталога",
  records: "Записей",
  complete: "Расшифровано",
  loading: "Загрузка фильтров…",
}, {
  en: {
    metaTitle: "Archival records",
    metaDescription: "Documents on the Ampilogov surname family up to 1950: originals, transcriptions and context.",
    eyebrow: "Primary documents",
    title: "Records",
    lead: "Documents up to 1950: scans, transcriptions, a modern reading and context.",
    statsLabel: "Catalogue contents",
    records: "Records",
    complete: "Transcribed",
    loading: "Loading filters…",
  },
  uk: {
    metaTitle: "Архівні записи",
    metaDescription: "Документи про прізвищевий ряд Ампілогових до 1950 року: оригінали, транскрипції та контекст.",
    eyebrow: "Первинні документи",
    title: "Записи",
    lead: "Документи до 1950 року: скани, транскрипції, сучасне прочитання і контекст.",
    statsLabel: "Склад каталогу",
    records: "Записів",
    complete: "Розшифровано",
    loading: "Завантаження фільтрів…",
  },
  be: {
    metaTitle: "Архіўныя запісы",
    metaDescription: "Дакументы пра прозвішчавы шэраг Ампілогавых да 1950 года: арыгіналы, расшыфроўкі і кантэкст.",
    eyebrow: "Першасныя дакументы",
    title: "Запісы",
    lead: "Дакументы да 1950 года: сканы, расшыфроўкі, сучаснае чытанне і кантэкст.",
    statsLabel: "Склад каталога",
    records: "Запісаў",
    complete: "Расшыфравана",
    loading: "Загрузка фільтраў…",
  },
});

export default async function RecordsPage({ params }: { params: Promise<{ locale: string }> }) {
  const text = copy[setRequestLocale((await params).locale)];
  const directory = getRecordsDirectoryIndex();

  return (
    <main className="records-page">
      <SiteHeader />
      <header className="records-masthead directory-masthead section-shell">
        <div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h1>{text.title}</h1>
        </div>
        <p>{text.lead}</p>
        <dl aria-label={text.statsLabel}>
          <div><dt>{text.records}</dt><dd>{directory.stats.records}</dd></div>
          <div><dt>{text.complete}</dt><dd>{directory.stats.complete}</dd></div>
        </dl>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">{text.loading}</div>}>
        <RecordsDirectory minYear={directory.stats.minYear} maxYear={directory.stats.maxYear} />
      </Suspense>
    </main>
  );
}
