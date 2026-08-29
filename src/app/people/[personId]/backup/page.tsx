import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getArchiveBackupAssets, getArchiveRecord, getDirectoryPerson } from "@/lib/genealogy";

type PersonBackupPageProps = {
  params: Promise<{ personId: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Закрытые архивные копии человека",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function PersonBackupPage({ params }: PersonBackupPageProps) {
  const { personId } = await params;
  const person = getDirectoryPerson(decodeURIComponent(personId));
  if (!person) notFound();

  const records = person.sources
    .map((source) => getArchiveRecord(source.sourceId))
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .filter((record, index, all) => all.findIndex((item) => item.sourceId === record.sourceId) === index)
    .filter((record) => getArchiveBackupAssets(record.sourceId).length > 0);

  return (
    <main className="person-page">
      <SiteHeader />
      <article className="person-document section-shell">
        <Link className="person-back" href={`/people/${encodeURIComponent(person.personId)}`}>
          ← Открытая карточка
        </Link>
        <header className="person-heading">
          <div>
            <span className="eyebrow">Закрытые исследовательские копии · {person.personId}</span>
            <h1>{person.displayName}</h1>
            <p>Сохранённые листы и увеличенные фрагменты из связанных Records.</p>
          </div>
        </header>

        <section className="person-sources" aria-labelledby="person-backups-title">
          <div className="person-section-heading">
            <div>
              <span className="section-label">Внутренняя проверка</span>
              <h2 id="person-backups-title">Архивные копии</h2>
            </div>
            <strong>{records.length}</strong>
          </div>
          <p className="record-rights-note">
            Материалы закрыты от публичного каталога. Не публикуйте и не распространяйте их без
            отдельно подтверждённого права.
          </p>
          <div className="person-source-list">
            {records.map((record) => (
              <article className="person-source-card" key={record.sourceId}>
                <div>
                  <small>{record.sourceId}</small>
                  <h3>{record.eventLabel}</h3>
                  <p>{record.date} · {record.place}</p>
                </div>
                <Link href={`/records/${encodeURIComponent(record.sourceId)}/backup`}>
                  Открыть копии записи →
                </Link>
              </article>
            ))}
          </div>
          {!records.length ? <p>У связанных записей пока нет локальных копий.</p> : null}
        </section>
      </article>
    </main>
  );
}
