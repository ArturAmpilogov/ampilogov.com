/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getDocumentsBySection } from "@/lib/docs";

export default function Home() {
  const chapters = getDocumentsBySection("book");

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
          <h1 id="cover-title">Ампилоговы</h1>
          <p className="cover-thesis">История фамилии и родов</p>
          <p className="cover-deck">
            Ампилоговы · Анпилоговы · Ампиловы · Анпиловы · Анфилоговы · Онфилоговы
          </p>
          <Link className="cover-cta" href={`/read/${chapters[0]?.slug ?? "book/01-surname-by-ear"}`}>
            Начать чтение
            <svg width="30" height="14" viewBox="0 0 30 14" fill="none" aria-hidden="true">
              <path d="M1 7h27M22 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <p className="scan-caption">
          РГАДА · ф. 181 · оп. 2 · д. 120 · л. 58 об.
        </p>
      </section>
    </main>
  );
}
