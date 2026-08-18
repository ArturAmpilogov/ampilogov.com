import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ампилоговы — документальная история фамилии",
    template: "%s — Ампилоговы",
  },
  description:
    "История фамилий Ампилоговых, Анпилоговых, Анпиловых, Ампиловых и Анфилоговых: от древнегреческого имени до документальных судеб разных родов.",
};

export const viewport: Viewport = {
  themeColor: "#eee9de",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
