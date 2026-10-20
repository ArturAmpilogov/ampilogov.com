/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";
import { getDocumentsBySection } from "@/lib/docs";

const copy = defineCopy({
  title: "Ампилоговы",
  thesis: "История фамилии и родов",
  deck: "Ампилоговы · Анпилоговы · Ампиловы · Анпиловы · Анфилоговы · Онфилоговы",
  start: "Начать чтение",
  scanCaption: "РГАДА · ф. 181 · оп. 2 · д. 120 · л. 58 об.",
}, {
  en: {
    title: "Ampilogovs",
    thesis: "The history of a surname and its families",
    deck: "Ampilogov · Anpilogov · Ampilov · Anpilov · Anfilogov · Onfilogov",
    start: "Start reading",
    scanCaption: "РГАДА · f. 181 · op. 2 · d. 120 · fol. 58v",
  },
  uk: {
    title: "Ампілогови",
    thesis: "Історія прізвища і родів",
    deck: "Ампілогови · Анпілогови · Ампілови · Анпілови · Анфілогови · Онфілогови",
    start: "Почати читання",
    scanCaption: "РГАДА · ф. 181 · оп. 2 · спр. 120 · арк. 58 зв.",
  },
  be: {
    title: "Ампілогавы",
    thesis: "Гісторыя прозвішча і родаў",
    deck: "Ампілогавы · Анпілогавы · Ампілавы · Анпілавы · Анфілогавы · Онфілогавы",
    start: "Пачаць чытанне",
    scanCaption: "РГАДА · ф. 181 · воп. 2 · спр. 120 · арк. 58 адв.",
  },
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { alternates: localeAlternates(setRequestLocale((await params).locale), "/") };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = setRequestLocale((await params).locale);
  const text = copy[locale];
  const chapters = getDocumentsBySection("book", locale);

  return (
    <main>
      <section className="cover" aria-labelledby="cover-title">
        <SiteHeader tone="ink" />
        <div className="cover-scan" aria-hidden="true">
          <img
            className="cover-document"
            src="/artwork/rgada-0060-hero.jpg"
            alt=""
          />
          <div className="cover-highlight">
            <img src="/artwork/0060-anfilogov-highlight.png" alt="" />
          </div>
        </div>
        <div className="cover-shade" />
        <div className="cover-content">
          <h1 id="cover-title">{text.title}</h1>
          <p className="cover-thesis">{text.thesis}</p>
          <p className="cover-deck">{text.deck}</p>
          <Link className="cover-cta" href={`/read/${chapters[0]?.slug ?? "book/01-surname-by-ear"}`}>
            {text.start}
            <svg width="30" height="14" viewBox="0 0 30 14" fill="none" aria-hidden="true">
              <path d="M1 7h27M22 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <p className="scan-caption">{text.scanCaption}</p>
      </section>
    </main>
  );
}
