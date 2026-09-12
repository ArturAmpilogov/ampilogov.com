"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import type { FamilyTreeDirectory, FamilyTreePerson } from "@/lib/genealogy";

type PositionedPerson = FamilyTreePerson & { x: number; y: number; isolated: boolean };
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
  const neighbours = new Map<string, Set<string>>();
  for (const person of directory.people) neighbours.set(person.personId, new Set());
  for (const person of directory.people) {
    for (const parentId of person.parentIds) {
      if (!byId.has(parentId)) continue;
      const bucket = children.get(parentId) ?? [];
      bucket.push(person.personId); children.set(parentId, bucket);
      neighbours.get(person.personId)!.add(parentId);
      neighbours.get(parentId)!.add(person.personId);
    }
  }

  const yearById = new Map(directory.people.map((person) => [person.personId, person.timelineYear]));
  // A placement estimate is only visual: the card still says when the date is
  // unknown. It keeps child branches below their documented parents.
  for (let pass = 0; pass < 5; pass += 1) for (const person of directory.people) {
    if (yearById.get(person.personId)) continue;
    const parentYears = person.parentIds.map((id) => yearById.get(id)).filter((year): year is number => typeof year === "number");
    const childYears = (children.get(person.personId) ?? []).map((id) => yearById.get(id)).filter((year): year is number => typeof year === "number");
    if (parentYears.length) yearById.set(person.personId, Math.min(1950, Math.max(...parentYears) + 27));
    else if (childYears.length) yearById.set(person.personId, Math.max(1400, Math.min(...childYears) - 27));
  }

  const components: string[][] = [];
  const visited = new Set<string>();
  for (const person of directory.people) {
    if (visited.has(person.personId)) continue;
    const component: string[] = [];
    const queue = [person.personId]; visited.add(person.personId);
    while (queue.length) {
      const id = queue.shift()!; component.push(id);
      for (const neighbour of neighbours.get(id) ?? []) if (!visited.has(neighbour)) { visited.add(neighbour); queue.push(neighbour); }
    }
    components.push(component);
  }

  const connected = components.filter((component) => component.length > 1);
  const isolated = components.filter((component) => component.length === 1).flat();
  const unknownStart = 70 + (directory.range.maxYear - directory.range.minYear + 48) * YEAR_HEIGHT;
  const positioned: PositionedPerson[] = [];
  let offsetX = 80;
  let primaryAnchor: { x: number; y: number } | null = null;
  for (const component of connected.sort((left, right) => right.length - left.length)) {
    const memberIds = new Set(component);
    const roots = component.filter((id) => !byId.get(id)!.parentIds.some((parentId) => memberIds.has(parentId)));
    let leafCursor = 0;
    const localX = new Map<string, number>();
    const visiting = new Set<string>();
    const placeBranch = (id: string): number => {
      if (localX.has(id)) return localX.get(id)!;
      if (visiting.has(id)) return leafCursor++ * 220;
      visiting.add(id);
      const descendants = (children.get(id) ?? []).filter((childId) => memberIds.has(childId));
      const childXs = descendants.map(placeBranch);
      const x = childXs.length ? childXs.reduce((sum, value) => sum + value, 0) / childXs.length : leafCursor++ * 220;
      visiting.delete(id); localX.set(id, x); return x;
    };
    (roots.length ? roots : component).forEach(placeBranch);
    component.forEach(placeBranch);
    const componentWidth = Math.max(...localX.values(), 0) + NODE_W;
    const yById = new Map<string, number>();
    for (const id of component) {
      const year = yearById.get(id);
      yById.set(id, year
        ? 70 + (year - directory.range.minYear) * YEAR_HEIGHT
        : unknownStart);
    }
    // Some old records contain conflicting or approximate years. Preserve the
    // documented year as a starting point, then guarantee the genealogical
    // reading direction: parent above, descendant below.
    for (let pass = 0; pass < Math.min(component.length, 24); pass += 1) {
      let changed = false;
      for (const id of component) {
        const parentBottom = byId.get(id)!.parentIds.filter((parentId) => memberIds.has(parentId))
          .map((parentId) => (yById.get(parentId) ?? 0) + NODE_H + 32);
        const nextY = Math.max(yById.get(id) ?? 0, ...parentBottom);
        if (nextY > (yById.get(id) ?? 0)) { yById.set(id, nextY); changed = true; }
      }
      if (!changed) break;
    }
    for (const id of component) positioned.push({ ...byId.get(id)!, x: offsetX + localX.get(id)!, y: yById.get(id)!, isolated: false });
    if (!primaryAnchor) primaryAnchor = {
      x: offsetX + componentWidth / 2,
      y: Math.min(...component.map((id) => yById.get(id) ?? 0)),
    };
    offsetX += componentWidth + 156;
  }

  const isolatedStartX = offsetX + 80;
  const isolatedColumns = 7;
  const nextY = Array.from({ length: isolatedColumns }, () => 70);
  for (const [index, id] of isolated
    .sort((left, right) => (yearById.get(left) ?? 9999) - (yearById.get(right) ?? 9999))
    .entries()) {
    const column = index % isolatedColumns;
    const naturalY = yearById.get(id) ? 70 + (yearById.get(id)! - directory.range.minYear) * YEAR_HEIGHT : unknownStart;
    const y = Math.max(naturalY, nextY[column]);
    nextY[column] = y + NODE_H + 16;
    positioned.push({ ...byId.get(id)!, x: isolatedStartX + column * (NODE_W + 18), y, isolated: true });
  }
  const maxX = Math.max(...positioned.map((person) => person.x), 0) + NODE_W + 100;
  const maxY = Math.max(...positioned.map((person) => person.y), 0) + NODE_H + 80;
  return { people: positioned, width: maxX, height: maxY, isolatedStartX, isolatedCount: isolated.length, primaryAnchor };
}

function treeStart(scene: ReturnType<typeof layoutPeople>): Transform {
  const scale = 0.72;
  return scene.primaryAnchor
    ? { scale, x: 76 - scene.primaryAnchor.x * scale, y: 78 - scene.primaryAnchor.y * scale }
    : { scale, x: 34, y: 34 };
}

export function FamilyTree({ directory }: { directory: FamilyTreeDirectory }) {
  const scene = useMemo(() => layoutPeople(directory), [directory]);
  const [transform, setTransform] = useState<Transform>(() => treeStart(scene));
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
  const visibleCenturyRuler = useMemo(() => centuries.map((year) => ({
    year,
    y: transform.y + (64 + (year - directory.range.minYear) * YEAR_HEIGHT) * transform.scale,
  })).filter(({ y }) => y > 38 && y < viewport.height - 24), [centuries, directory.range.minYear, transform, viewport.height]);
  const reset = useCallback(() => setTransform(treeStart(scene)), [scene]);
  const zoom = useCallback((amount: number) => setTransform((current) => {
    const scale = Math.max(0.35, Math.min(1.8, current.scale + amount));
    const x = viewport.width / 2;
    const y = viewport.height / 2;
    return { scale, x: x - (x - current.x) * scale / current.scale, y: y - (y - current.y) * scale / current.scale };
  }), [viewport.height, viewport.width]);
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
  const focusSingletons = useCallback(() => {
    const scale = 0.68;
    setTransform({ scale, x: viewport.width / 2 - (scene.isolatedStartX + NODE_W * 3.5) * scale, y: 38 });
    setActiveId(null);
  }, [scene.isolatedStartX, viewport.width]);
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
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("input")) return;
    const step = event.shiftKey ? 180 : 86;
    if (event.key === "ArrowLeft") setTransform((current) => ({ ...current, x: current.x + step }));
    else if (event.key === "ArrowRight") setTransform((current) => ({ ...current, x: current.x - step }));
    else if (event.key === "ArrowUp") setTransform((current) => ({ ...current, y: current.y + step }));
    else if (event.key === "ArrowDown") setTransform((current) => ({ ...current, y: current.y - step }));
    else if (event.key === "+" || event.key === "=") zoom(.16);
    else if (event.key === "-") zoom(-.16);
    else if (event.key === "0" || event.key === "Home") reset();
    else if (event.key.toLocaleLowerCase("ru") === "о") focusSingletons();
    else return;
    event.preventDefault();
  };
  const active = activeId ? byId.get(activeId) : null;
  const related = new Set(active ? [active.personId, ...active.parentIds, ...scene.people.filter((person) => person.parentIds.includes(active.personId)).map((person) => person.personId)] : []);

  return <section className="tree-workspace" aria-label="Интерактивное генеалогическое дерево">
    <div className="tree-tools" aria-label="Управление деревом">
      <div className="tree-tools__left">
        <span>Все {directory.people.length} профилей · {directory.range.minYear}–{directory.range.maxYear}</span>
        <small>Связанные {directory.people.length - scene.isolatedCount} · одиночные {scene.isolatedCount}</small>
        <label className="tree-search">
          <span className="sr-only">Найти человека в дереве</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти человека" />
          {searchResults.length ? <div className="tree-search__results">
            {searchResults.map((person) => <button type="button" key={person.personId} onClick={() => focusPerson(person)}><strong>{person.displayName}</strong><small>{person.life.birth !== "?" ? person.life.birth : "дата не установлена"}</small></button>)}
          </div> : null}
        </label>
      </div>
      <div className="tree-tools__zoom"><button type="button" onClick={reset}>Ветви</button><button className="tree-singletons-button" type="button" onClick={focusSingletons}>Одиночные · {scene.isolatedCount}</button><button type="button" onClick={() => zoom(-0.16)} aria-label="Уменьшить">−</button><button type="button" onClick={() => zoom(0.16)} aria-label="Увеличить">+</button></div>
    </div>
    <div ref={viewportRef} className="tree-viewport" tabIndex={0} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0" onKeyDown={onKeyDown} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="tree-canvas" style={{ width: scene.width, height: scene.height, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {centuries.map((year) => <div className="tree-century" key={year} style={{ top: 64 + (year - directory.range.minYear) * YEAR_HEIGHT, height: 100 * YEAR_HEIGHT }}><span style={{ left: scene.primaryAnchor?.x ?? 14 }}>{centuryLabel(year)}</span></div>)}
        <div className="tree-singletons-heading" style={{ left: scene.isolatedStartX, top: 30 }}>Одиночные карточки <small>{scene.isolatedCount} профилей без установленной родственной связи</small></div>
        <svg className="tree-links" width={scene.width} height={scene.height} aria-hidden="true">
          {visiblePeople.flatMap((child) => child.parentIds.map((parentId) => {
            const parent = byId.get(parentId); if (!parent) return null;
            if (!visibleIds.has(parentId)) return null;
            const selected = related.has(child.personId) && related.has(parentId);
            const x1 = parent.x + NODE_W / 2; const y1 = parent.y + NODE_H; const x2 = child.x + NODE_W / 2; const y2 = child.y;
            const bend = Math.max(28, (y2 - y1) * .46);
            return <path key={`${parentId}-${child.personId}`} className={`${selected ? "is-active" : ""} ${child.needsReview ? "is-uncertain" : ""}`} d={`M${x1} ${y1} C${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`} />;
          }))}
        </svg>
        {visiblePeople.map((person) => <Link href={`/people/${encodeURIComponent(person.personId)}`} key={person.personId} className={`tree-person ${person.isolated ? "is-isolated" : ""} ${person.sex === "female" ? "is-female" : ""} ${activeId === person.personId ? "is-active" : ""} ${activeId && !related.has(person.personId) ? "is-muted" : ""}`} style={{ left: person.x, top: person.y }} onPointerEnter={() => setActiveId(person.personId)} onPointerLeave={() => setActiveId(null)}>
          <strong>{person.displayName}</strong><small>{person.life.birth !== "?" ? person.life.birth : "дата не установлена"}{person.life.death !== "?" ? ` — ${person.life.death}` : ""}</small>{person.needsReview ? <i title="Связь или сведения требуют проверки" /> : null}
        </Link>)}
      </div>
      <div className="tree-century-ruler" aria-hidden="true">
        {visibleCenturyRuler.map(({ year, y }) => <span key={year} style={{ top: y }}>{centuryLabel(year)}</span>)}
      </div>
      <p className="tree-hint">Колесо — масштаб · перетаскивание — перемещение · стрелки — навигация</p>
    </div>
  </section>;
}
