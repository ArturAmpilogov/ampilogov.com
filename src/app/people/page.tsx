import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PeopleDirectory } from "@/components/people-directory";
import { SiteHeader } from "@/components/site-header";
import { getPeopleDirectory } from "@/lib/genealogy";

export const metadata: Metadata = {
  title: "Профили людей",
  description: "Поиск и просмотр людей, упомянутых в документах об Ампилоговых и вариантах фамилии.",
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string; search?: string }>;
}) {
  const directory = getPeopleDirectory();
  const { person, search = "" } = await searchParams;
  if (person && directory.people.some((entry) => entry.personId === person)) {
    redirect(`/people/${encodeURIComponent(person)}`);
  }

  return (
    <main className="people-page">
      <SiteHeader />
      <header className="people-masthead section-shell">
        <div>
          <span className="eyebrow">Документальный архив</span>
          <h1>Профили</h1>
        </div>
        <p>
          Люди, связанные с архивными записями: варианты имени, места,
          родственные связи и документальная хронология каждого человека.
        </p>
        <dl aria-label="Состав архива">
          <div><dt>Людей</dt><dd>{directory.stats.people}</dd></div>
          <div><dt>Источников</dt><dd>{directory.stats.sources}</dd></div>
          <div><dt>Расшифровано</dt><dd>{directory.stats.transcribedSources}/{directory.stats.sources}</dd></div>
        </dl>
      </header>
      <PeopleDirectory people={directory.people} initialQuery={search} />
    </main>
  );
}
