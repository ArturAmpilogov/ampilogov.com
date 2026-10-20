import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";
import type { ChapterMeta } from "@/lib/chapter-meta";

const copy = defineCopy(
  {
    periodLabel: (range: string) => `Временной период: ${range}`,
    chapterOf: (position: number, total: number) => `Глава ${position} из ${total}`,
    axisLabel: (range: string) =>
      `Нелинейная шкала времени. Активный отрезок: ${range}. Нулевая отметка обозначает рубеж эр.`,
    bce: "до н. э.",
    ce: "н. э.",
  },
  {
    en: {
      periodLabel: (range) => `Time period: ${range}`,
      chapterOf: (position, total) => `Chapter ${position} of ${total}`,
      axisLabel: (range) =>
        `Non-linear timeline. Active span: ${range}. The zero mark is the boundary between BCE and CE.`,
      bce: "BCE",
      ce: "CE",
    },
    uk: {
      periodLabel: (range) => `Часовий період: ${range}`,
      chapterOf: (position, total) => `Розділ ${position} з ${total}`,
      axisLabel: (range) =>
        `Нелінійна шкала часу. Активний відрізок: ${range}. Нульова позначка — межа ер.`,
      bce: "до н. е.",
      ce: "н. е.",
    },
    be: {
      periodLabel: (range) => `Часавы перыяд: ${range}`,
      chapterOf: (position, total) => `Раздзел ${position} з ${total}`,
      axisLabel: (range) =>
        `Нелінейная шкала часу. Актыўны адрэзак: ${range}. Нулявая адзнака абазначае мяжу эр.`,
      bce: "да н. э.",
      ce: "н. э.",
    },
  },
);

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

  const text = copy[getLocale()];
  const { period } = meta;
  const activeSpan = period.axis.end - period.axis.start;
  const spokenRange = `${period.from}${period.fromEra ? ` ${period.fromEra}` : ""}${period.to ? ` — ${period.to}${period.toEra ? ` ${period.toEra}` : ""}` : ""}`;

  return (
    <section className="chapter-period" aria-label={text.periodLabel(spokenRange)}>
      <div className="chapter-period-topline">
        <span>{period.label}</span>
        <span>{text.chapterOf(position, total)}</span>
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
        aria-label={text.axisLabel(spokenRange)}
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
            <small className="is-before">{text.bce}</small>
            <small className="is-after">{text.ce}</small>
          </i>
        </div>
      </div>
    </section>
  );
}
