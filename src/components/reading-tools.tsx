"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? window.scrollY / available : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function KeepCurrentChapterVisible() {
  useLayoutEffect(() => {
    const rail = document.querySelector<HTMLElement>(".book-rail");
    const current = rail?.querySelector<HTMLElement>("a[aria-current='page']");
    if (!rail || !current) return;

    const top = current.offsetTop;
    const bottom = top + current.offsetHeight;
    const visibleTop = rail.scrollTop;
    const visibleBottom = visibleTop + rail.clientHeight;

    if (top < visibleTop + 24 || bottom > visibleBottom - 24) {
      rail.scrollTop = Math.max(0, top - rail.clientHeight * 0.34);
    }
  }, []);

  return null;
}
