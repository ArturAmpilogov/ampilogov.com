"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import type { ArchiveRecordPerson } from "@/lib/genealogy";

const copy = defineCopy({
  eyebrow: "Исследовательское приложение",
  title: "Полный разбор имён и доказательств",
  intro: "Основная карточка показывает людей, их роли и формы имени. Подробные аргументы, конкурирующие чтения и границы уверенности загружаются только по запросу.",
  loading: "Загружаем разбор…",
  retry: "Повторить загрузку",
  open: "Открыть полный разбор",
}, {
  en: {
    eyebrow: "Research appendix",
    title: "Full analysis of names and evidence",
    intro: "The main card shows the people, their roles and the forms of their names. Detailed arguments, competing readings and the limits of certainty load only on request.",
    loading: "Loading the analysis…",
    retry: "Retry loading",
    open: "Open the full analysis",
  },
  uk: {
    eyebrow: "Дослідницький додаток",
    title: "Повний розбір імен і доказів",
    intro: "Основна картка показує людей, їхні ролі та форми імені. Докладні аргументи, конкурентні прочитання й межі впевненості завантажуються лише на запит.",
    loading: "Завантажуємо розбір…",
    retry: "Повторити завантаження",
    open: "Відкрити повний розбір",
  },
  be: {
    eyebrow: "Даследчы дадатак",
    title: "Поўны разбор імёнаў і доказаў",
    intro: "Асноўная картка паказвае людзей, іх ролі і формы імя. Падрабязныя аргументы, канкурэнтныя прачытанні і межы ўпэўненасці загружаюцца толькі па запыце.",
    loading: "Загружаем разбор…",
    retry: "Паўтарыць загрузку",
    open: "Адкрыць поўны разбор",
  },
});

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
  const text = copy[useLocale()];
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
    <section className="record-analysis-appendix" aria-label={text.title}>
      <header>
        <div>
          <span className="section-label">{text.eyebrow}</span>
          <h4>{text.title}</h4>
        </div>
        <strong>{count}</strong>
      </header>
      {!payload ? (
        <div className="record-analysis-appendix__prompt">
          <p>
            {text.intro}
          </p>
          <button type="button" onClick={load} disabled={state === "loading"}>
            {state === "loading" ? text.loading : state === "error" ? text.retry : text.open}
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
