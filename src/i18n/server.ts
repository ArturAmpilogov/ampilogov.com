import { cache } from "react";
import { defaultLocale, type Locale, toLocale } from "@/i18n/config";

// Server components deep inside a page (the chapter widgets, for example) have
// no access to the route params. Each page and layout stores its locale here
// for the current render, the same way next-intl's setRequestLocale does.
const requestLocale = cache(() => ({ current: defaultLocale as Locale }));

export function setRequestLocale(locale: string) {
  const resolved = toLocale(locale);
  requestLocale().current = resolved;
  return resolved;
}

export function getLocale(): Locale {
  return requestLocale().current;
}
