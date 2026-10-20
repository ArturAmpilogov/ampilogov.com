import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "../globals.css";
import { locales, localeTags } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { setRequestLocale } from "@/i18n/server";

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  const { site } = messages[locale];
  return {
    title: { default: site.defaultTitle, template: site.titleTemplate },
    description: site.description,
  };
}

export const viewport: Viewport = {
  themeColor: "#eee9de",
  colorScheme: "light",
};

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = setRequestLocale((await params).locale);
  return (
    <html lang={localeTags[locale]} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
