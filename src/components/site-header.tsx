"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

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
      <Link className="wordmark" href="/" aria-label="Ампилоговы — на главную">
        АМПИЛОГОВЫ
      </Link>
      <button
        ref={toggleRef}
        className="site-menu-toggle"
        type="button"
        aria-controls={navId}
        aria-expanded={menuOpen}
        aria-label="Меню"
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
        aria-label="Основная навигация"
        onClick={(event) => {
          // A link to the current page doesn't change the pathname; new-tab clicks keep the menu.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if ((event.target as Element).closest("a")) setOpenOnPath(null);
        }}
      >
        <Link href="/read/book/01-surname-by-ear">История</Link>
        <Link href="/records">Записи</Link>
        <Link href="/map">Карта</Link>
        <Link href="/people">Люди</Link>
        <Link href="/tree">Дерево</Link>
        <Link href="/read/research/sources">Источники</Link>
        <Link href="/contact">Связаться</Link>
      </nav>
    </header>
  );
}
