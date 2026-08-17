/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getAllDocuments, getDocumentsBySection } from "@/lib/docs";

const routeLabels: Record<string, string> = {
  "migration/routes/orel-livny-shchigry": "Орёл → Ливенские Щигры",
  "migration/routes/kursk-oboyan": "Курск → Обоянь",
  "migration/routes/chernozem-to-taurida": "Курско-Орловский край → Таврия",
  "migration/routes/taurida-to-crimea": "Материковая Таврия → Крым",
};

export default function Home() {
  const allDocuments = getAllDocuments();
  const chapters = getDocumentsBySection("book");
  const migrations = getDocumentsBySection("migration").filter((document) =>
    document.slug.includes("/routes/"),
  );
  const people = getDocumentsBySection("people").length;
  const records = getDocumentsBySection("records").length;

  return (
    <main>
      <section className="cover" aria-labelledby="cover-title">
        <SiteHeader tone="ink" />
        <div className="cover-scan" aria-hidden="true">
          <img src="/archive/evidence/rgada/f181-op2-d120/0060.jpg" alt="" />
        </div>
        <div className="cover-shade" />
        <div className="cover-content">
          <p className="cover-kicker">Документальная генеалогическая книга · XI–XX века</p>
          <h1 id="cover-title">
            История имени
            <span>и разных родов</span>
          </h1>
          <p className="cover-deck">
            Ампилоговы · Анпилоговы · Анпиловы
          </p>
          <Link className="text-link text-link--light" href={`/read/${chapters[0]?.slug ?? "book/00-method"}`}>
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
            <h2 id="chapters-title">Главы</h2>
          </div>
          <p>{chapters.length} цельных исторических разделов</p>
        </div>

        <ol className="chapter-list">
          {chapters.map((chapter, index) => (
            <li key={chapter.slug}>
              <Link href={`/read/${chapter.slug}`}>
                <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="chapter-copy">
                  <strong>{chapter.title}</strong>
                  <small>{chapter.excerpt}</small>
                </span>
                <span className="chapter-arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="migration-section" id="migration" aria-labelledby="migration-title">
        <div className="section-shell migration-inner">
          <div className="section-heading section-heading--dark">
            <div>
              <span className="eyebrow">География поиска</span>
              <h2 id="migration-title">Переселения</h2>
            </div>
            <p>Маршрут становится фактом только после документа о конкретном человеке.</p>
          </div>

          <div className="route-line" aria-label="Исследуемые направления переселений">
            {migrations.map((route, index) => (
              <Link href={`/read/${route.slug}`} key={route.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{routeLabels[route.slug] ?? route.title}</strong>
              </Link>
            ))}
          </div>
        </div>
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
          <Link href="/read/people/README">Люди и профили <span>↗</span></Link>
          <Link href="/read/records/README">Документы и фотокопии <span>↗</span></Link>
          <Link href="/read/research/sources">Реестр источников <span>↗</span></Link>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <Link className="wordmark" href="/">АМПИЛОГОВЫ</Link>
        <p>Документальная история имени и разных родов.</p>
        <Link className="text-link" href="/read/research/open-questions">Продолжить исследование ↗</Link>
      </footer>
    </main>
  );
}
