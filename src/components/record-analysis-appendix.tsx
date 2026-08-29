"use client";

import Link from "next/link";
import { useState } from "react";
import type { ArchiveRecordPerson } from "@/lib/genealogy";

type AppendixPayload = {
  sourceId: string;
  people: ArchiveRecordPerson[];
};

export function RecordAnalysisAppendix({
  path,
  count,
}: {
  path: string;
  count: number;
}) {
  const [payload, setPayload] = useState<AppendixPayload | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const load = async () => {
    if (payload || state === "loading") return;
    setState("loading");
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Appendix request failed: ${response.status}`);
      setPayload(await response.json() as AppendixPayload);
      setState("idle");
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };

  return (
    <section className="record-analysis-appendix" aria-label="Полный разбор имён и доказательств">
      <header>
        <div>
          <span className="section-label">Исследовательское приложение</span>
          <h4>Полный разбор имён и доказательств</h4>
        </div>
        <strong>{count}</strong>
      </header>
      {!payload ? (
        <div className="record-analysis-appendix__prompt">
          <p>
            Основная карточка показывает людей, их роли и формы имени. Подробные аргументы,
            конкурирующие чтения и границы уверенности загружаются только по запросу.
          </p>
          <button type="button" onClick={load} disabled={state === "loading"}>
            {state === "loading" ? "Загружаем разбор…" : state === "error" ? "Повторить загрузку" : "Открыть полный разбор"}
          </button>
        </div>
      ) : (
        <ol className="record-analysis-appendix__people">
          {payload.people.filter((person) => person.nameAnalysis.length).map((person, personIndex) => (
            <li key={`${person.personId ?? person.name}:${personIndex}`}>
              <header>
                <span>{String(personIndex + 1).padStart(2, "0")}</span>
                <div>
                  {person.personId ? (
                    <Link href={`/people/${encodeURIComponent(person.personId)}`} target="_blank">
                      {person.name} <span aria-hidden="true">↗</span>
                    </Link>
                  ) : <strong>{person.name}</strong>}
                  <small>{person.eventRole ?? person.role}</small>
                </div>
              </header>
              <dl>
                {person.nameAnalysis.map((item, itemIndex) => (
                  <div key={`${item.label}:${itemIndex}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.text}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
