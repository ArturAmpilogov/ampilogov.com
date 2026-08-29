/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Fragment } from "react";
import { SiteHeader } from "@/components/site-header";
import { getChapterMeta } from "@/lib/chapter-meta";
import { getAllDocuments, getDocumentsBySection } from "@/lib/docs";

export default function Home() {
  const allDocuments = getAllDocuments();
  const chapters = getDocumentsBySection("book");
  const people = getDocumentsBySection("people").length;
  const records = getDocumentsBySection("records").length;

  return (
    <main>
      <section className="cover" aria-labelledby="cover-title">
        <SiteHeader tone="ink" />
        <div className="cover-scan" aria-hidden="true">
          <img
            className="cover-document"
            src="/archive/evidence/rgada/f181-op2-d120/0060.jpg"
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
          <Link className="text-link text-link--light" href={`/read/${chapters[0]?.slug ?? "book/01-overview"}`}>
            Начать чтение <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="scan-caption">
          РГАДА · ф. 181 · оп. 2 · д. 120 · л. 58 об.
        </p>
        <div className="scroll-cue" aria-hidden="true">
          <span />
          Листать
        </div>
      </section>

      <section className="principle section-shell" aria-labelledby="principle-title">
        <div className="section-label">
          <span>01</span>
          Принцип книги
        </div>
        <div className="principle-copy">
          <h2 id="principle-title">Сходство фамилии не доказывает родство.</h2>
          <p>
            Каждая связь здесь опирается на документ. Факты, гипотезы и направления поиска
            живут раздельно — так история не превращается в красивую, но вымышленную легенду.
          </p>
        </div>
        <div className="principle-mark" aria-hidden="true">А</div>
      </section>

      <section className="chapters section-shell" id="chapters" aria-labelledby="chapters-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Книга</span>
            <h2 id="chapters-title">История</h2>
          </div>
          <p>{chapters.length} цельных исторических разделов</p>
        </div>

        <ol className="chapter-list">
          {chapters.map((chapter, index) => {
            const meta = getChapterMeta(chapter.slug);
            const previousMeta = index > 0 ? getChapterMeta(chapters[index - 1].slug) : undefined;
            const showGroup = meta && meta.group !== previousMeta?.group;

            return (
              <Fragment key={chapter.slug}>
                {showGroup ? (
                  <li className="chapter-group-label">
                    <span>{meta.groupLabel}</span>
                  </li>
                ) : null}
                <li>
                  <Link href={`/read/${chapter.slug}`}>
                    <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="chapter-copy">
                      <strong>{chapter.title}</strong>
                      <small>{chapter.excerpt}</small>
                    </span>
                    <span className="chapter-arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </section>

      <section className="archive-section section-shell" aria-labelledby="archive-title">
        <div className="archive-intro">
          <span className="eyebrow">Живой архив</span>
          <h2 id="archive-title">Текст растёт вместе с доказательствами.</h2>
        </div>
        <div className="archive-stats" aria-label="Состав книги">
          <div><strong>{allDocuments.length}</strong><span>материалов</span></div>
          <div><strong>{people}</strong><span>реестра людей</span></div>
          <div><strong>{records}</strong><span>карточки документов</span></div>
        </div>
        <div className="archive-links">
          <Link href="/people">Люди <span>↗</span></Link>
          <Link href="/read/records/README">Документы и фотокопии <span>↗</span></Link>
          <Link href="/read/research/sources">Реестр источников <span>↗</span></Link>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <Link className="wordmark" href="/">АМПИЛОГОВЫ</Link>
        <p>Документальная история фамилии и разных родов.</p>
        <Link className="text-link" href="/read/research/open-questions">Продолжить исследование ↗</Link>
      </footer>
    </main>
  );
}
