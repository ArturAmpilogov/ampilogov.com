import type { ChapterMeta } from "@/lib/chapter-meta";

type ChapterPeriodProps = {
  meta: ChapterMeta;
  position: number;
  total: number;
};

const ERA_BREAK = 18;

function PeriodDate({ value, era }: { value: string; era?: string }) {
  return (
    <span className="chapter-period-date">
      <strong>{value}</strong>
      {era ? <small>{era}</small> : null}
    </span>
  );
}

export function ChapterPeriod({ meta, position, total }: ChapterPeriodProps) {
  if (!meta.period) return null;

  const { period } = meta;
  const sequenceLabel = meta.group === "migration" ? "Маршрут" : "Глава";
  const activeSpan = period.axis.end - period.axis.start;
  const spokenRange = `${period.from}${period.fromEra ? ` ${period.fromEra}` : ""}${period.to ? ` — ${period.to}${period.toEra ? ` ${period.toEra}` : ""}` : ""}`;

  return (
    <section className="chapter-period" aria-label={`Временной период: ${spokenRange}`}>
      <div className="chapter-period-topline">
        <span>{period.label}</span>
        <span>{sequenceLabel} {position} из {total}</span>
      </div>

      <div className="chapter-period-summary">
        <div className={`chapter-period-range${period.to ? "" : " is-single"}`}>
          <PeriodDate value={period.from} era={period.fromEra} />
          {period.to ? (
            <>
              <i aria-hidden="true">—</i>
              <PeriodDate value={period.to} era={period.toEra} />
            </>
          ) : null}
        </div>
        <p>{period.note}</p>
      </div>

      <div
        className="chapter-time-axis"
        role="img"
        aria-label={`Нелинейная шкала времени. Активный отрезок: ${spokenRange}. Нулевая отметка обозначает рубеж эр.`}
      >
        <div className="chapter-time-track" aria-hidden="true">
          <i className="chapter-time-line" />
          <i
            className="chapter-time-active"
            style={{
              left: `${period.axis.start}%`,
              width: `max(${activeSpan}%, 12px)`,
            }}
          />

          <i className="chapter-time-current" style={{ left: `${period.axis.start}%` }} />
          {activeSpan > 0 ? <i className="chapter-time-current" style={{ left: `${period.axis.end}%` }} /> : null}

          <i className="chapter-time-zero" style={{ left: `${ERA_BREAK}%` }}>
            <b>0</b>
            <small className="is-before">до н. э.</small>
            <small className="is-after">н. э.</small>
          </i>
        </div>
      </div>
    </section>
  );
}
