import type { Metadata } from "next";
import { Suspense } from "react";
import { RecordsDirectory } from "@/components/records-directory";
import { SiteHeader } from "@/components/site-header";
import { getRecordsDirectoryIndex } from "@/lib/records-directory-index";

export const metadata: Metadata = {
  title: "Архивные записи",
  description: "Документы о фамильном ряде Ампилоговых по 1950 год: оригиналы, расшифровки и контекст.",
};

export default function RecordsPage() {
  const directory = getRecordsDirectoryIndex();

  return (
    <main className="records-page">
      <SiteHeader />
      <header className="records-masthead directory-masthead section-shell">
        <div>
          <span className="eyebrow">Первичные документы</span>
          <h1>Записи</h1>
        </div>
        <p>Документы до 1950 года: сканы, расшифровки, современное чтение и контекст.</p>
        <dl aria-label="Состав каталога">
          <div><dt>Записей</dt><dd>{directory.stats.records}</dd></div>
          <div><dt>Расшифровано</dt><dd>{directory.stats.complete}</dd></div>
          <div><dt>Копии сохранены</dt><dd>{directory.stats.withImages}</dd></div>
        </dl>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">Загрузка фильтров…</div>}>
        <RecordsDirectory minYear={directory.stats.minYear} maxYear={directory.stats.maxYear} />
      </Suspense>
    </main>
  );
}
