"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/i18n/client";
import { localizeHref } from "@/i18n/routing";

/** next/link that keeps the reader in the current language. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localized = typeof href === "string" ? localizeHref(locale, href) : href;
  return <NextLink href={localized} {...props} />;
}
