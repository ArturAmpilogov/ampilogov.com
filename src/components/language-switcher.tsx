"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { type Locale, localeNames, locales, stripLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/client";
import { messages } from "@/i18n/messages";
import { localizeHref } from "@/i18n/routing";

// Inline SVG instead of emoji: Windows renders flag emoji as two letters.
function Flag({ locale }: { locale: Locale }) {
  const common = { className: "language-flag", viewBox: "0 0 30 20", "aria-hidden": true } as const;
  if (locale === "ru") {
    return (
      <svg {...common}>
        <rect width="30" height="20" fill="#fff" />
        <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
        <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
      </svg>
    );
  }
  if (locale === "uk") {
    return (
      <svg {...common}>
        <rect width="30" height="10" fill="#0057b7" />
        <rect y="10" width="30" height="10" fill="#ffd700" />
      </svg>
    );
  }
  if (locale === "be") {
    return (
      <svg {...common}>
        <rect width="30" height="20" fill="#c8313e" />
        <rect y="13.33" width="30" height="6.67" fill="#4aa657" />
        <rect width="4.5" height="20" fill="#fff" />
        <path
          d="M2.25 1l1.4 2-1.4 2-1.4-2zM2.25 6l1.4 2-1.4 2-1.4-2zM2.25 11l1.4 2-1.4 2-1.4-2zM2.25 16l1.4 2-1.4 2-1.4-2z"
          fill="#c8313e"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <clipPath id="language-flag-gb">
        <rect width="30" height="20" />
      </clipPath>
      <g clipPath="url(#language-flag-gb)">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
        <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.4" />
      </g>
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const copy = messages[locale].language;

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [open]);

  // usePathname can report either the browser path or the internal /ru one.
  const query = searchParams.toString();
  const currentPath = `${stripLocale(pathname).path}${query ? `?${query}` : ""}`;

  return (
    <div
      ref={rootRef}
      className={`language-switcher${open ? " is-open" : ""}`}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (open && next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="language-switcher__button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${copy.choose}: ${localeNames[locale].native}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Flag locale={locale} />
        <span className="language-switcher__code">{locale.toUpperCase()}</span>
        <svg className="language-switcher__chevron" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <ul id={listId} className="language-switcher__list" aria-label={copy.label}>
          {locales.map((entry) => (
            <li key={entry}>
              <NextLink
                href={localizeHref(entry, currentPath)}
                hrefLang={entry}
                lang={entry}
                aria-current={entry === locale ? "true" : undefined}
                className={entry === locale ? "is-current" : undefined}
                onClick={() => {
                  setOpen(false);
                  try {
                    document.cookie = `NEXT_LOCALE=${entry}; path=/; max-age=31536000; samesite=lax`;
                  } catch {}
                }}
              >
                <Flag locale={entry} />
                <span>{localeNames[entry].native}</span>
                {entry === locale ? (
                  <svg className="language-switcher__check" viewBox="0 0 12 10" aria-hidden="true">
                    <path d="M1 5l3.5 3.5L11 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ) : null}
              </NextLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
