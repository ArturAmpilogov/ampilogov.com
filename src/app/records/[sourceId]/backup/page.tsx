import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getArchiveBackupAssets, getArchiveRecord } from "@/lib/genealogy";

type RecordBackupPageProps = {
  params: Promise<{ sourceId: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Закрытая архивная копия",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function RecordBackupPage({ params }: RecordBackupPageProps) {
  const { sourceId } = await params;
  const record = getArchiveRecord(decodeURIComponent(sourceId));
  if (!record) notFound();

  const assets = getArchiveBackupAssets(record.sourceId);

  return (
    <main className="record-page">
      <SiteHeader />
      <article className="record-document section-shell">
        <Link className="record-back" href={`/records/${encodeURIComponent(record.sourceId)}`}>
          ← Открытая карточка
        </Link>
        <header className="record-heading">
          <div>
            <span className="eyebrow">Закрытая исследовательская копия · {record.sourceId}</span>
            <h1>{record.primaryPerson?.name ?? record.eventLabel}</h1>
            <p>{record.date} · {record.place}</p>
          </div>
        </header>

        <section className="record-source has-image" aria-labelledby="backup-title">
          <div className="record-evidence-stack">
            {assets.map((asset) => (
              <figure className="record-scan" key={`${asset.index}:${asset.fileName}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/records/${encodeURIComponent(record.sourceId)}/backup/assets/${asset.index}`}
                  alt={`${asset.label}: ${record.eventLabel}, ${record.date}`}
                />
                <figcaption>{asset.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="record-source-meta">
            <span className="section-label">Внутренняя проверка</span>
            <h2 id="backup-title">Архивная копия</h2>
            <p className="record-rights-note">
              Закрытый исследовательский материал. Не публикуйте и не распространяйте файл без
              отдельно подтверждённой лицензии или письменного разрешения правообладателя.
            </p>
            {record.originalUrl ? (
              <a className="record-source-primary" href={record.originalUrl} target="_blank" rel="noreferrer">
                <span>{record.originalLabel}</span><b aria-hidden="true">↗</b>
              </a>
            ) : null}
            {!assets.length ? <p>Локальная копия для этой записи пока не сохранена.</p> : null}
          </div>
        </section>
      </article>
    </main>
  );
}
