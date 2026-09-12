"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import type { FamilyTreeDirectory, FamilyTreePerson } from "@/lib/genealogy";

type PositionedPerson = FamilyTreePerson & { x: number; y: number };
type Transform = { x: number; y: number; scale: number };
const NODE_W = 174;
const NODE_H = 54;
const YEAR_HEIGHT = 3.7;

function yearOf(person: FamilyTreePerson, fallback: number) {
  return person.timelineYear ?? fallback;
}

function centuryLabel(year: number) {
  const century = Math.floor(year / 100) + 1;
  return `${century} век`;
}

function layoutPeople(directory: FamilyTreeDirectory) {
  const byId = new Map(directory.people.map((person) => [person.personId, person]));
  const children = new Map<string, string[]>();
  for (const person of directory.people) for (const parentId of person.parentIds) {
    const bucket = children.get(parentId) ?? [];
    bucket.push(person.personId); children.set(parentId, bucket);
  }
  const roots = directory.people.filter((person) => !person.parentIds.some((id) => byId.has(id)));
  const rank = new Map<string, number>();
  const visit = (id: string, level: number, seen = new Set<string>()) => {
    if (seen.has(id)) return;
    seen.add(id); rank.set(id, Math.max(rank.get(id) ?? 0, level));
    for (const childId of children.get(id) ?? []) visit(childId, level + 1, new Set(seen));
  };
  roots.forEach((person) => visit(person.personId, 0));
  directory.people.forEach((person) => { if (!rank.has(person.personId)) visit(person.personId, 0); });
  const groups = new Map<number, FamilyTreePerson[]>();
  for (const person of directory.people) {
    const group = groups.get(rank.get(person.personId) ?? 0) ?? [];
    group.push(person); groups.set(rank.get(person.personId) ?? 0, group);
  }
  const positioned: PositionedPerson[] = [];
  for (const [level, group] of groups) {
    group.sort((a, b) => yearOf(a, directory.range.minYear) - yearOf(b, directory.range.minYear) || a.displayName.localeCompare(b.displayName, "ru"));
    group.forEach((person, index) => positioned.push({
      ...person,
      x: 80 + level * 246 + (index % 2) * 16,
      y: 64 + (yearOf(person, directory.range.minYear) - directory.range.minYear) * YEAR_HEIGHT + Math.floor(index / 2) * 66,
    }));
  }
  const maxX = Math.max(...positioned.map((person) => person.x), 0) + NODE_W + 100;
  const maxY = Math.max(...positioned.map((person) => person.y), 0) + NODE_H + 80;
  return { people: positioned, width: maxX, height: maxY };
}

export function FamilyTree({ directory }: { directory: FamilyTreeDirectory }) {
  const scene = useMemo(() => layoutPeople(directory), [directory]);
  const [transform, setTransform] = useState<Transform>({ x: 34, y: 34, scale: 0.72 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const byId = useMemo(() => new Map(scene.people.map((person) => [person.personId, person])), [scene.people]);
  const centuries = useMemo(() => {
    const start = Math.floor(directory.range.minYear / 100) * 100;
    const end = Math.ceil(directory.range.maxYear / 100) * 100;
    return Array.from({ length: (end - start) / 100 + 1 }, (_, index) => start + index * 100);
  }, [directory.range]);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => setViewport({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // The source collection already contains several thousand people. Only the
  // current view plus a small margin becomes DOM; panning stays constant-time.
  const visiblePeople = useMemo(() => {
    const padding = 180 / transform.scale;
    const left = (-transform.x / transform.scale) - padding;
    const top = (-transform.y / transform.scale) - padding;
    const right = left + viewport.width / transform.scale + padding * 2;
    const bottom = top + viewport.height / transform.scale + padding * 2;
    return scene.people.filter((person) => person.x + NODE_W >= left && person.x <= right && person.y + NODE_H >= top && person.y <= bottom);
  }, [scene.people, transform, viewport]);
  const visibleIds = useMemo(() => new Set(visiblePeople.map((person) => person.personId)), [visiblePeople]);
  const reset = useCallback(() => setTransform({ x: 34, y: 34, scale: 0.72 }), []);
  const zoom = useCallback((amount: number) => setTransform((current) => ({ ...current, scale: Math.max(0.35, Math.min(1.8, current.scale + amount)) })), []);
  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("ru");
    if (term.length < 2) return [];
    return scene.people.filter((person) => person.displayName.toLocaleLowerCase("ru").includes(term)).slice(0, 7);
  }, [query, scene.people]);
  const focusPerson = useCallback((person: PositionedPerson) => {
    const scale = 0.94;
    setTransform({
      scale,
      x: viewport.width / 2 - (person.x + NODE_W / 2) * scale,
      y: viewport.height / 2 - (person.y + NODE_H / 2) * scale,
    });
    setActiveId(person.personId);
    setQuery("");
  }, [viewport.height, viewport.width]);
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const nextScale = Math.max(0.35, Math.min(1.8, transform.scale * (event.deltaY > 0 ? 0.9 : 1.1)));
    const pointerX = event.clientX - rect.left; const pointerY = event.clientY - rect.top;
    setTransform({ scale: nextScale, x: pointerX - (pointerX - transform.x) * (nextScale / transform.scale), y: pointerY - (pointerY - transform.y) * (nextScale / transform.scale) });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setTransform((current) => ({ ...current, x: drag.current!.tx + event.clientX - drag.current!.x, y: drag.current!.ty + event.clientY - drag.current!.y }));
  };
  const onPointerUp = () => { drag.current = null; };
  const active = activeId ? byId.get(activeId) : null;
  const related = new Set(active ? [active.personId, ...active.parentIds, ...scene.people.filter((person) => person.parentIds.includes(active.personId)).map((person) => person.personId)] : []);

  return <section className="tree-workspace" aria-label="Интерактивное генеалогическое дерево">
    <div className="tree-tools" aria-label="Управление деревом">
      <div className="tree-tools__left">
        <span>{directory.people.length} человек · {directory.range.minYear}–{directory.range.maxYear}</span>
        <label className="tree-search">
          <span className="sr-only">Найти человека в дереве</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти человека" />
          {searchResults.length ? <div className="tree-search__results">
            {searchResults.map((person) => <button type="button" key={person.personId} onClick={() => focusPerson(person)}><strong>{person.displayName}</strong><small>{person.life.birth !== "?" ? person.life.birth : "дата не установлена"}</small></button>)}
          </div> : null}
        </label>
      </div>
      <div className="tree-tools__zoom"><button type="button" onClick={() => zoom(-0.16)} aria-label="Уменьшить">−</button><button type="button" onClick={() => zoom(0.16)} aria-label="Увеличить">+</button><button type="button" onClick={reset}>Обзор</button></div>
    </div>
    <div ref={viewportRef} className="tree-viewport" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="tree-canvas" style={{ width: scene.width, height: scene.height, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {centuries.map((year) => <div className="tree-century" key={year} style={{ top: 64 + (year - directory.range.minYear) * YEAR_HEIGHT, height: 100 * YEAR_HEIGHT }}><span>{centuryLabel(year)}</span></div>)}
        <svg className="tree-links" width={scene.width} height={scene.height} aria-hidden="true">
          {visiblePeople.flatMap((child) => child.parentIds.map((parentId) => {
            const parent = byId.get(parentId); if (!parent) return null;
            if (!visibleIds.has(parentId)) return null;
            const selected = related.has(child.personId) && related.has(parentId);
            const x1 = parent.x + NODE_W; const y1 = parent.y + NODE_H / 2; const x2 = child.x; const y2 = child.y + NODE_H / 2;
            return <path key={`${parentId}-${child.personId}`} className={`${selected ? "is-active" : ""} ${child.needsReview ? "is-uncertain" : ""}`} d={`M${x1} ${y1} C${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`} />;
          }))}
        </svg>
        {visiblePeople.map((person) => <Link href={`/people/${encodeURIComponent(person.personId)}`} key={person.personId} className={`tree-person ${person.sex === "female" ? "is-female" : ""} ${activeId === person.personId ? "is-active" : ""} ${activeId && !related.has(person.personId) ? "is-muted" : ""}`} style={{ left: person.x, top: person.y }} onPointerEnter={() => setActiveId(person.personId)} onPointerLeave={() => setActiveId(null)}>
          <strong>{person.displayName}</strong><small>{person.life.birth !== "?" ? person.life.birth : "дата не установлена"}{person.life.death !== "?" ? ` — ${person.life.death}` : ""}</small>{person.needsReview ? <i title="Связь или сведения требуют проверки" /> : null}
        </Link>)}
      </div>
    </div>
  </section>;
}
