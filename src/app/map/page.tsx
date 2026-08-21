import type { Metadata } from "next";
import { FamilySettlementMap } from "@/components/family-settlement-map";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMapDirectory } from "@/lib/genealogy";

export const metadata: Metadata = {
  title: "Карта расселения",
  description: "География семей Ампилоговых по архивным документам: места, поколения и документированные перемещения.",
};

export default function MapPage() {
  const directory = getFamilyMapDirectory();

  return (
    <main className="settlement-map-page">
      <SiteHeader />
      <header className="settlement-map-masthead section-shell">
        <div>
          <span className="eyebrow">География документов</span>
          <h1>Карта</h1>
        </div>
        <p>
          Семейные центры, длительность присутствия и смена места в документах
          одного человека. Приблизительные точки обозначены пунктиром.
        </p>
        <dl aria-label="Состав карты">
          <div><dt>Мест в индексе</dt><dd>{directory.stats.indexedPlaces}</dd></div>
          <div><dt>На карте</dt><dd>{directory.stats.mappedPlaces}</dd></div>
          <div><dt>Приблизительно</dt><dd>{directory.stats.approximatePlaces}</dd></div>
        </dl>
      </header>
      <FamilySettlementMap
        places={directory.places}
        migrations={directory.migrations}
        range={directory.range}
      />
    </main>
  );
}
