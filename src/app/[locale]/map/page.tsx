import type { Metadata } from "next";
import { Suspense } from "react";
import { FamilySettlementMap } from "@/components/family-settlement-map";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";
import { getMapDirectoryManifest } from "@/lib/map-directory-index";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  return {
    title: copy[locale].metaTitle,
    description: copy[locale].metaDescription,
    alternates: localeAlternates(locale, "/map"),
  };
}

const copy = defineCopy({
  metaTitle: "Карта расселения",
  metaDescription: "География семей Ампилоговых по архивным документам: места, поколения и документированные перемещения.",
  eyebrow: "География документов",
  title: "Карта расселения",
  loading: "Загрузка карты…",
}, {
  en: {
    metaTitle: "Settlement map",
    metaDescription: "The geography of the Ampilogov families in archival documents: places, generations and documented moves.",
    eyebrow: "Geography of the documents",
    title: "Settlement map",
    loading: "Loading the map…",
  },
  uk: {
    metaTitle: "Мапа розселення",
    metaDescription: "Географія родин Ампілогових за архівними документами: місця, покоління та задокументовані переміщення.",
    eyebrow: "Географія документів",
    title: "Мапа розселення",
    loading: "Завантаження мапи…",
  },
  be: {
    metaTitle: "Мапа рассялення",
    metaDescription: "Геаграфія сем’яў Ампілогавых паводле архіўных дакументаў: месцы, пакаленні і задакументаваныя перамяшчэнні.",
    eyebrow: "Геаграфія дакументаў",
    title: "Мапа рассялення",
    loading: "Загрузка мапы…",
  },
});

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  const text = copy[setRequestLocale((await params).locale)];
  const directory = getMapDirectoryManifest();

  return (
    <main className="settlement-map-page">
      <SiteHeader />
      <header className="settlement-map-masthead section-shell">
        <div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h1>{text.title}</h1>
        </div>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">{text.loading}</div>}>
        <FamilySettlementMap
          range={directory.range}
          dataVersion={directory.version}
          directoryPath={directory.directoryPath}
        />
      </Suspense>
    </main>
  );
}
