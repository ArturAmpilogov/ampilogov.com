import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PeopleDirectory } from "@/components/people-directory";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import { localeAlternates } from "@/i18n/metadata";
import { localizeHref } from "@/i18n/routing";
import { setRequestLocale } from "@/i18n/server";
import { getPeopleDirectoryIndex } from "@/lib/people-directory-index";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  return {
    title: copy[locale].metaTitle,
    description: copy[locale].metaDescription,
    alternates: localeAlternates(locale, "/people"),
  };
}

const copy = defineCopy({
  metaTitle: "Люди",
  metaDescription: "Люди фамильного ряда Ампилоговых и его документированных вариантов по 1950 год.",
  eyebrow: "Документальный архив",
  title: "Люди",
  lead: "Носители фамильного ряда и документированные варианты фамилии.",
  statsLabel: "Состав архива",
  people: "Людей",
  loading: "Загрузка фильтров…",
}, {
  en: {
    metaTitle: "People",
    metaDescription: "People of the Ampilogov surname family and its documented variants up to 1950.",
    eyebrow: "Documentary archive",
    title: "People",
    lead: "Bearers of the surname family and its documented variants.",
    statsLabel: "Archive contents",
    people: "People",
    loading: "Loading filters…",
  },
  uk: {
    metaTitle: "Люди",
    metaDescription: "Люди прізвищевого ряду Ампілогових та його задокументованих варіантів до 1950 року.",
    eyebrow: "Документальний архів",
    title: "Люди",
    lead: "Носії прізвищевого ряду та задокументовані варіанти прізвища.",
    statsLabel: "Склад архіву",
    people: "Людей",
    loading: "Завантаження фільтрів…",
  },
  be: {
    metaTitle: "Людзі",
    metaDescription: "Людзі прозвішчавага шэрагу Ампілогавых і яго задакументаваных варыянтаў да 1950 года.",
    eyebrow: "Дакументальны архіў",
    title: "Людзі",
    lead: "Носьбіты прозвішчавага шэрагу і задакументаваныя варыянты прозвішча.",
    statsLabel: "Склад архіва",
    people: "Людзей",
    loading: "Загрузка фільтраў…",
  },
});

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ person?: string; search?: string }>;
}) {
  const locale = setRequestLocale((await params).locale);
  const text = copy[locale];
  const directory = getPeopleDirectoryIndex();
  const { person } = await searchParams;
  if (person && directory.people.some((entry) => entry.personId === person)) {
    redirect(localizeHref(locale, `/people/${encodeURIComponent(person)}`));
  }

  return (
    <main className="people-page">
      <SiteHeader />
      <header className="people-masthead directory-masthead section-shell">
        <div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h1>{text.title}</h1>
        </div>
        <p>{text.lead}</p>
        <dl aria-label={text.statsLabel}>
          <div><dt>{text.people}</dt><dd>{directory.stats.people}</dd></div>
        </dl>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">{text.loading}</div>}>
        <PeopleDirectory minYear={directory.stats.minYear} maxYear={directory.stats.maxYear} />
      </Suspense>
    </main>
  );
}
