import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ампилоговы — документальная история имени и рода",
    template: "%s — Ампилоговы",
  },
  description:
    "Генеалогическая книга об истории имени и разных родов Ампилоговых, Анпилоговых и Анпиловых.",
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
