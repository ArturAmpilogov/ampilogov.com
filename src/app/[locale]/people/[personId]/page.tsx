import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordTypeIcon } from "@/components/record-type-icon";
import { SiteHeader } from "@/components/site-header";
import { defaultLocale, locales, toLocale } from "@/i18n/config";
import Link from "@/i18n/link";
import { messages } from "@/i18n/messages";
import { localeAlternates } from "@/i18n/metadata";
import { hasCardTranslation, translatedCardIds } from "@/i18n/routing";
import { setRequestLocale } from "@/i18n/server";
import { getCardTranslator } from "@/lib/card-translations";
import { getPeopleDirectoryIndex } from "@/lib/people-directory-index";
import { getDirectoryPerson } from "@/lib/genealogy";
import { personPageCopy } from "./person-page.copy";

type PersonPageProps = {
  params: Promise<{ locale: string; personId: string }>;
};

function compactPlaceLabels(places: string[]) {
  const unique = [...new Map(
    places
      .map((place) => place.trim())
      .filter(Boolean)
      .map((place) => [place.toLocaleLowerCase("ru-RU"), place]),
  ).values()];

  return unique.filter((place, index) => {
    const normalized = place.toLocaleLowerCase("ru-RU");
    return !unique.some((other, otherIndex) => (
      otherIndex !== index
      && other.length > place.length
      && other.toLocaleLowerCase("ru-RU").startsWith(`${normalized},`)
    ));
  });
}

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = toLocale(params.locale);
  const personIds = locale === defaultLocale
    ? getPeopleDirectoryIndex().people.map((person) => person.personId)
    : translatedCardIds(locale, "people");
  return personIds.map((personId) => ({ personId }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { locale: localeParam, personId } = await params;
  const locale = setRequestLocale(localeParam);
  const text = personPageCopy[locale];
  const decodedPersonId = decodeURIComponent(personId);
  const person = getDirectoryPerson(decodedPersonId);
  if (!person) return { title: text.meta.notFound };
  const { t } = getCardTranslator(locale, "people", decodedPersonId);
  const availableLocales = locales.filter((entry) => hasCardTranslation(entry, "people", decodedPersonId));
  return {
    title: t(person.displayName),
    description: text.meta.description(t(person.displayName)),
    alternates: localeAlternates(locale, `/people/${encodeURIComponent(decodedPersonId)}`, availableLocales),
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { locale: localeParam, personId } = await params;
  const locale = setRequestLocale(localeParam);
  const text = personPageCopy[locale];
  const decodedPersonId = decodeURIComponent(personId);
  const person = getDirectoryPerson(decodedPersonId);
  if (!person) notFound();
  const { translated, t, tMaybe } = getCardTranslator(locale, "people", decodedPersonId);
  const places = compactPlaceLabels(person.places);
  const contextSectionCount = Number(person.relations.length > 0) + Number(person.notes.length > 0);

  return (
    <main className="person-page">
      <SiteHeader />
      <article className="person-document section-shell">
        {translated ? null : <p className="translation-notice">{messages[locale].language.untranslatedCard}</p>}
        <Link className="person-back" href="/people">{text.back}</Link>

        <header className="person-heading">
          <div>
            <span className="eyebrow">{text.eyebrow} · {person.personId}</span>
            <h1>{t(person.displayName)}</h1>
            {person.variants.length ? (
              <p className="person-heading-variants">
                <span>{text.inDocuments}</span>
                {person.variants.map(t).join(" · ")}
              </p>
            ) : null}
          </div>
          <span className={`person-heading-state ${person.needsReview ? "is-review" : "is-documented"}`}>
            {person.needsReview ? text.needsReview : text.documented}
          </span>
        </header>

        <dl className="person-facts">
          <div>
            <dt>{text.life}</dt>
            <dd>
              {person.birthDate === "" ? text.birthUnknown : t(person.birthDate)}
              {" — "}
              {person.life.death === "?" ? text.deathUnknown : t(person.life.death)}
            </dd>
          </div>
          <div><dt>{text.places}</dt><dd>{places.map(t).join(" · ") || text.placesPending}</dd></div>
          <div><dt>{text.sources}</dt><dd>{person.sources.length}</dd></div>
          <div><dt>{text.occupation}</dt><dd>{person.occupations.map(t).join(", ") || text.occupationMissing}</dd></div>
        </dl>

        {person.nameAnalysis.length ? (
          <section className="person-name-analysis" aria-labelledby="person-name-analysis-title">
            <div className="person-section-heading">
              <div>
                <span className="section-label">{text.nameAnalysisLabel}</span>
                <h2 id="person-name-analysis-title">{text.nameAnalysisTitle}</h2>
              </div>
              <strong>{person.nameAnalysis.length}</strong>
            </div>
            <p className="person-name-analysis-lede">
              {text.nameAnalysisLede}
            </p>
            <dl>
              {person.nameAnalysis.map((item, index) => (
                <div key={`${item.label}:${index}`}>
                  <dt>{t(item.label)}</dt>
                  <dd>{t(item.text)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {person.relations.length || person.notes.length ? (
          <div className={`person-context-grid${contextSectionCount === 1 ? " is-single" : ""}`}>
            {person.relations.length ? (
              <section className="person-relations" aria-labelledby="relations-title">
                <div className="person-section-heading">
                  <div>
                    <span className="section-label">{text.relationsLabel}</span>
                    <h2 id="relations-title">{text.relationsTitle}</h2>
                  </div>
                  <strong>{person.relations.length}</strong>
                </div>
                <div className="person-relations-list">
                  {person.relations.map((relation) => (
                    <Link href={`/people/${encodeURIComponent(relation.personId)}`} key={`${relation.relation}:${relation.personId}`}>
                      <small>{text.relationLabels[relation.relation]}</small>
                      <strong>{t(relation.name)}</strong>
                      <span>
                        {relation.life.birth === "?" ? "?" : t(relation.life.birth)}
                        {" — "}
                        {relation.life.death === "?" ? "?" : t(relation.life.death)}
                        {text.openRelation}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {person.notes.length ? (
              <section className="person-notes">
                <div className="person-section-heading">
                  <div>
                    <span className="section-label">{text.notesLabel}</span>
                    <h2>{text.notesTitle}</h2>
                  </div>
                </div>
                {person.notes.map((note) => <p key={note}>{t(note)}</p>)}
              </section>
            ) : null}
          </div>
        ) : null}

        {person.researchLeads.length ? (
          <section className="person-research-leads" aria-labelledby="research-leads-title">
            <div className="person-section-heading">
              <div>
                <span className="section-label">{text.leadsLabel}</span>
                <h2 id="research-leads-title">{text.leadsTitle}</h2>
              </div>
              <strong>{person.researchLeads.length}</strong>
            </div>
            <p className="person-research-leads-intro">
              {text.leadsIntro}
            </p>
            <div className="person-research-leads-list">
              {person.researchLeads.map((lead, index) => (
                <article key={`${lead.label}:${index}`}>
                  <small>{t(lead.label)}</small>
                  <p>{t(lead.summary)}</p>
                  {lead.people.length || lead.sourceIds.length ? (
                    <div>
                      {lead.people.map((related) => (
                        <Link href={`/people/${encodeURIComponent(related.personId)}`} key={related.personId}>
                          {t(related.name)} →
                        </Link>
                      ))}
                      {lead.sourceIds.map((sourceId) => (
                        <Link href={`/records/${encodeURIComponent(sourceId)}`} key={sourceId}>
                          Record {sourceId} ↗
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="person-documents" aria-labelledby="documents-title">
          <div className="person-section-heading">
            <div>
              <span className="section-label">{text.documentsLabel}</span>
              <h2 id="documents-title">{text.documentsTitle}</h2>
            </div>
            <strong>{person.sources.length}</strong>
          </div>

          {person.sources.length ? (
            <div className="person-source-timeline">
              {person.sources.map((source, index) => (
                <article key={source.sourceId}>
                  <span className="source-sequence">{String(index + 1).padStart(2, "0")}</span>
                  <span className="person-source-icon"><RecordTypeIcon eventType={source.eventType} /></span>
                  <div className="person-source-main">
                    <small>{t(source.role)}</small>
                    <strong>{t(source.eventLabel)}</strong>
                    <em>{t(source.place)}</em>
                    {source.nameAsWritten ? <span>{text.inDocument}{tMaybe(source.nameAsWritten)}</span> : null}
                  </div>
                  <time>{t(source.date)}</time>
                  <Link href={`/records/${encodeURIComponent(source.sourceId)}`}>
                    {text.openRecord}<span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : <p className="person-no-sources">{text.noSources}</p>}
        </section>
      </article>
    </main>
  );
}
