import type { Metadata } from "next";
import { RecordsDirectory } from "@/components/records-directory";
import { SiteHeader } from "@/components/site-header";
import { getRecordsDirectory } from "@/lib/genealogy";

export const metadata: Metadata = {
  title: "Архивные записи",
  description: "Документы FamilySearch: ссылки на оригиналы, буквальные расшифровки и современное чтение.",
};

type RecordsPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const { search = "" } = await searchParams;
  const directory = getRecordsDirectory();

  return (
    <main className="records-page">
      <SiteHeader />
      <header className="records-masthead section-shell">
        <div>
          <span className="eyebrow">Первичные документы</span>
          <h1>Записи</h1>
        </div>
        <p>
          Каждый скан существует отдельно от профилей: оригинальная ссылка,
          буквальная расшифровка, современное чтение и упомянутые люди.
        </p>
        <dl aria-label="Состав каталога">
          <div><dt>Записей</dt><dd>{directory.stats.records}</dd></div>
          <div><dt>Расшифровано</dt><dd>{directory.stats.complete}</dd></div>
          <div><dt>Копии сохранены</dt><dd>{directory.stats.withImages}</dd></div>
        </dl>
      </header>
      <RecordsDirectory records={directory.records} initialQuery={search} />
    </main>
  );
}
