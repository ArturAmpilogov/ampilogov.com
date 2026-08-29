import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PeopleDirectory } from "@/components/people-directory";
import { SiteHeader } from "@/components/site-header";
import { getPeopleDirectoryIndex } from "@/lib/people-directory-index";

export const metadata: Metadata = {
  title: "Люди",
  description: "Люди фамильного ряда Ампилоговых и его документированных вариантов по 1950 год.",
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string; search?: string }>;
}) {
  const directory = getPeopleDirectoryIndex();
  const { person } = await searchParams;
  if (person && directory.people.some((entry) => entry.personId === person)) {
    redirect(`/people/${encodeURIComponent(person)}`);
  }

  return (
    <main className="people-page">
      <SiteHeader />
      <header className="people-masthead directory-masthead section-shell">
        <div>
          <span className="eyebrow">Документальный архив</span>
          <h1>Люди</h1>
        </div>
        <p>Носители фамильного ряда и документированные варианты фамилии.</p>
        <dl aria-label="Состав архива">
          <div><dt>Людей</dt><dd>{directory.stats.people}</dd></div>
          <div><dt>Источников</dt><dd>{directory.stats.sources}</dd></div>
          <div><dt>Расшифровано</dt><dd>{directory.stats.transcribedSources}/{directory.stats.sources}</dd></div>
        </dl>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">Загрузка фильтров…</div>}>
        <PeopleDirectory minYear={directory.stats.minYear} maxYear={directory.stats.maxYear} />
      </Suspense>
    </main>
  );
}
