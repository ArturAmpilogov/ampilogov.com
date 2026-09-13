import type { Metadata } from "next";
import { FamilyTree } from "@/components/family-tree";
import { SiteHeader } from "@/components/site-header";
import { getFamilyTreeDirectory } from "@/lib/genealogy";

export const metadata: Metadata = {
  title: "Дерево",
  description: "Интерактивное документальное дерево носителей фамильного ряда Ампилоговых по 1950 год.",
};

export default function TreePage() {
  const directory = getFamilyTreeDirectory();
  return (
    <main className="tree-page">
      <SiteHeader />
      <header className="tree-masthead section-shell">
        <div>
          <span className="eyebrow">Родословная схема</span>
          <h1>Дерево</h1>
        </div>
        <p>Связи, известные по документам. Пунктир означает, что связь требует дальнейшей проверки.</p>
      </header>
      <FamilyTree directory={directory} />
    </main>
  );
}
