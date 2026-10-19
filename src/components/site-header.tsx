"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function SiteHeader({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`site-header site-header--${tone}${menuOpen ? " is-menu-open" : ""}`}
    >
      <Link className="wordmark" href="/" aria-label="Ампилоговы — на главную">
        АМПИЛОГОВЫ
      </Link>
      <button
        className="site-menu-toggle"
        type="button"
        aria-controls="site-nav"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true" />
      </button>
      <nav
        id="site-nav"
        className="site-nav"
        aria-label="Основная навигация"
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setMenuOpen(false);
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
