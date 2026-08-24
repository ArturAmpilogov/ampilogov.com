"use client";

import type { CSSProperties } from "react";

type YearRangeFilterProps = {
  label?: string;
  minYear: number;
  maxYear: number;
  startYear: number;
  endYear: number;
  onChange: (range: { startYear: number; endYear: number }) => void;
};

export function YearRangeFilter({
  label = "Период",
  minYear,
  maxYear,
  startYear,
  endYear,
  onChange,
}: YearRangeFilterProps) {
  const span = Math.max(1, maxYear - minYear);
  const style = {
    "--range-start": `${((startYear - minYear) / span) * 100}%`,
    "--range-end": `${((endYear - minYear) / span) * 100}%`,
  } as CSSProperties;

  return (
    <div className="directory-year-range" style={style}>
      <div className="directory-year-range__heading">
        <span>{label}</span>
        <strong>{startYear}—{endYear}</strong>
      </div>
      <div className="directory-year-range__control">
        <span className="directory-year-range__track" aria-hidden="true" />
        <span className="directory-year-range__selection" aria-hidden="true" />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={startYear}
          aria-label="Начальный год"
          onChange={(event) => onChange({
            startYear: Math.min(Number(event.target.value), endYear),
            endYear,
          })}
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={endYear}
          aria-label="Конечный год"
          onChange={(event) => onChange({
            startYear,
            endYear: Math.max(Number(event.target.value), startYear),
          })}
        />
      </div>
      <div className="directory-year-range__bounds" aria-hidden="true">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
