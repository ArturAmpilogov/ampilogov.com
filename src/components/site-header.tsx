"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/i18n/client";
import Link from "@/i18n/link";
import { messages } from "@/i18n/messages";

// Keep in sync with the site menu media query at the end of globals.css.
const COMPACT_MENU_QUERY = "(max-width: 64em)";

export function SiteHeader({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navId = useId();
  const { site, nav } = messages[useLocale()];

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (headerRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
      setOpenOnPath(null);
    };
    const compactLayout = window.matchMedia(COMPACT_MENU_QUERY);
    const closeOnWideLayout = () => {
      if (!compactLayout.matches) setOpenOnPath(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    compactLayout.addEventListener("change", closeOnWideLayout);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      compactLayout.removeEventListener("change", closeOnWideLayout);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`site-header site-header--${tone}${menuOpen ? " is-menu-open" : ""}`}
      onBlur={(event) => {
        // Close once keyboard focus moves past the menu, so the panel never hides it.
        const next = event.relatedTarget;
        if (menuOpen && next instanceof Node && !event.currentTarget.contains(next)) {
          setOpenOnPath(null);
        }
      }}
    >
      <Link className="wordmark" href="/" aria-label={site.homeLabel}>
        {site.wordmark}
      </Link>
      <div className="site-header__tools">
      <button
        ref={toggleRef}
        className="site-menu-toggle"
        type="button"
        aria-controls={navId}
        aria-expanded={menuOpen}
        aria-label={nav.menu}
        onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
      >
        <span aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="site-menu-backdrop" aria-hidden="true" onClick={() => setOpenOnPath(null)} />
      )}
      <nav
        id={navId}
        className="site-nav"
        aria-label={nav.label}
        onClick={(event) => {
          // A link to the current page doesn't change the pathname; new-tab clicks keep the menu.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if ((event.target as Element).closest("a")) setOpenOnPath(null);
        }}
      >
        <Link href="/read/book/01-surname-by-ear">{nav.story}</Link>
        <Link href="/records">{nav.records}</Link>
        <Link href="/map">{nav.map}</Link>
        <Link href="/people">{nav.people}</Link>
        <Link href="/tree">{nav.tree}</Link>
        <Link href="/read/research/sources">{nav.sources}</Link>
        <Link href="/contact">{nav.contact}</Link>
      </nav>
      {/* useSearchParams in the switcher needs a Suspense boundary on static pages. */}
      <Suspense fallback={null}>
        <LanguageSwitcher />
      </Suspense>
      </div>
    </header>
  );
}
