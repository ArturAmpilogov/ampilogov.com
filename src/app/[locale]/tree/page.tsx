import type { Metadata } from "next";
import { FamilyTree } from "@/components/family-tree";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";
import { getFamilyTreeDirectory } from "@/lib/genealogy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  return {
    title: copy[locale].metaTitle,
    description: copy[locale].metaDescription,
    alternates: localeAlternates(locale, "/tree"),
  };
}

const copy = defineCopy({
  metaTitle: "Дерево",
  metaDescription: "Интерактивное документальное дерево носителей фамильного ряда Ампилоговых по 1950 год.",
  eyebrow: "Родословная схема",
  title: "Дерево",
  lead: "Связи, известные по документам. Пунктир означает, что связь требует дальнейшей проверки.",
}, {
  en: {
    metaTitle: "Family tree",
    metaDescription: "An interactive documentary tree of the Ampilogov surname family up to 1950.",
    eyebrow: "Genealogical chart",
    title: "Tree",
    lead: "Links known from documents. A dashed line means the link still needs to be verified.",
  },
  uk: {
    metaTitle: "Дерево",
    metaDescription: "Інтерактивне документальне дерево носіїв прізвищевого ряду Ампілогових до 1950 року.",
    eyebrow: "Родовідна схема",
    title: "Дерево",
    lead: "Зв’язки, відомі з документів. Пунктир означає, що зв’язок потребує подальшої перевірки.",
  },
  be: {
    metaTitle: "Дрэва",
    metaDescription: "Інтэрактыўнае дакументальнае дрэва носьбітаў прозвішчавага шэрагу Ампілогавых да 1950 года.",
    eyebrow: "Радаводная схема",
    title: "Дрэва",
    lead: "Сувязі, вядомыя з дакументаў. Пункцір азначае, што сувязь патрабуе далейшай праверкі.",
  },
});

export default async function TreePage({ params }: { params: Promise<{ locale: string }> }) {
  const text = copy[setRequestLocale((await params).locale)];
  const directory = getFamilyTreeDirectory();
  return (
    <main className="tree-page">
      <SiteHeader />
      <header className="tree-masthead section-shell">
        <div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h1>{text.title}</h1>
        </div>
        <p>{text.lead}</p>
      </header>
      <FamilyTree directory={directory} />
    </main>
  );
}
