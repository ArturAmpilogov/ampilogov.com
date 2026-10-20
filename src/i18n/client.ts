"use client";

import { useParams } from "next/navigation";
import { toLocale } from "@/i18n/config";

/** The page locale for client components; every page sits under app/[locale]. */
export function useLocale() {
  return toLocale(useParams<{ locale?: string }>()?.locale);
}
