import type { Metadata } from "next";
import { Suspense } from "react";
import { FamilySettlementMap } from "@/components/family-settlement-map";
import { SiteHeader } from "@/components/site-header";
import { getMapDirectoryManifest } from "@/lib/map-directory-index";

export const metadata: Metadata = {
  title: "Карта расселения",
  description: "География семей Ампилоговых по архивным документам: места, поколения и документированные перемещения.",
};

export default function MapPage() {
  const directory = getMapDirectoryManifest();

  return (
    <main className="settlement-map-page">
      <SiteHeader />
      <header className="settlement-map-masthead section-shell">
        <div>
          <span className="eyebrow">География документов</span>
          <h1>Карта расселения</h1>
        </div>
      </header>
      <Suspense fallback={<div className="section-shell directory-loading">Загрузка карты…</div>}>
        <FamilySettlementMap
          range={directory.range}
          dataVersion={directory.version}
          directoryPath={directory.directoryPath}
        />
      </Suspense>
    </main>
  );
}
