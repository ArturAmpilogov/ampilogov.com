"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import type { FamilyTreeDirectory } from "@/lib/genealogy";

import { layoutPeople, NODE_W, NODE_H, YEAR_HEIGHT, centuryOf, centuryLabel, regionsOf, splitTreeName, type PositionedPerson } from "@/lib/family-tree-layout";
type Transform = { x: number; y: number; scale: number };

function treeStart(scene: ReturnType<typeof layoutPeople>): Transform {
  const scale = 1;
  return scene.primaryAnchor
    ? { scale, x: 320 - scene.primaryAnchor.x * scale, y: 100 - scene.primaryAnchor.y * scale }
    : { scale, x: 34, y: 34 };
}

export function FamilyTree({ directory }: { directory: FamilyTreeDirectory }) {
  const scene = useMemo(() => layoutPeople(directory), [directory]);
  const [transform, setTransform] = useState<Transform>(() => treeStart(scene));
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCentury, setSelectedCentury] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [browseIndex, setBrowseIndex] = useState(0);
  const regionsById = useMemo(() => new Map(scene.people.map((person) => [person.personId, regionsOf(person.places)])), [scene.people]);
  const regions = useMemo(() => [...new Set([...regionsById.values()].flat())].sort((a, b) => a.localeCompare(b, "ru")), [regionsById]);
  const matchingPeople = useMemo(() => scene.people.filter((person) =>
    (selectedCentury === null || (selectedCentury === 0 ? person.timelineYear === null : person.timelineYear !== null && centuryOf(person.timelineYear) === selectedCentury)) &&
    (!selectedRegion || regionsById.get(person.personId)!.includes(selectedRegion))
  ).sort((a, b) => (a.timelineYear ?? 9999) - (b.timelineYear ?? 9999) || a.displayName.localeCompare(b.displayName, "ru")), [scene.people, selectedCentury, selectedRegion, regionsById]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });
  const previousSize = useRef({ width: 640, height: 0 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const byId = useMemo(() => new Map(scene.people.map((person) => [person.personId, person])), [scene.people]);
  const centuries = useMemo(() => {
    const start = centuryOf(directory.range.minYear);
    const end = centuryOf(directory.range.maxYear);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [directory.range]);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => {
      setViewport({ width: element.clientWidth, height: element.clientHeight });
      const previous = previousSize.current;
      setTransform((current) => ({ ...current,
        x: current.x + (element.clientWidth - previous.width) / 2,
        y: previous.height ? current.y + (element.clientHeight - previous.height) / 2 : current.y,
      }));
      previousSize.current = { width: element.clientWidth, height: element.clientHeight };
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // The source collection already contains several thousand people. Only the
  // current view plus a small margin becomes DOM; panning keeps the rendered element count small.
  const visiblePeople = useMemo(() => {
    const padding = 180 / transform.scale;
    const left = (-transform.x / transform.scale) - padding;
    const top = (-transform.y / transform.scale) - padding;
    const right = left + viewport.width / transform.scale + padding * 2;
    const bottom = top + viewport.height / transform.scale + padding * 2;
    return scene.people.filter((person) => person.x + NODE_W >= left && person.x <= right && person.y + NODE_H >= top && person.y <= bottom);
  }, [scene.people, transform, viewport]);
  const visibleCenturyRuler = useMemo(() => centuries.map((century) => ({
    century,
    y: transform.y + (64 + ((century - 1) * 100 + 1 - directory.range.minYear) * YEAR_HEIGHT) * transform.scale,
  })).filter(({ y }) => y > 48 && y < viewport.height - 24), [centuries, directory.range.minYear, transform, viewport.height]);
  const onscreenPeople = useMemo(() => visiblePeople.filter((person) =>
    person.x * transform.scale + transform.x + NODE_W * transform.scale > 0 &&
    person.x * transform.scale + transform.x < viewport.width &&
    person.y * transform.scale + transform.y + NODE_H * transform.scale > 0 &&
    person.y * transform.scale + transform.y < viewport.height
  ), [visiblePeople, transform, viewport]);
  const visibleEras = [...new Set(onscreenPeople.map((person) => person.timelineYear ? centuryOf(person.timelineYear) : 0))]
    .sort((a, b) => a - b).map((century) => century ? centuryLabel(century) : "Без даты").join(" · ");
  const visibleRegions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const person of onscreenPeople) {
      for (const region of regionsById.get(person.personId)!) counts.set(region, (counts.get(region) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([region]) => region);
  }, [onscreenPeople, regionsById]);
  const reset = useCallback(() => {
    const start = treeStart(scene);
    setTransform({ ...start, x: viewport.width / 2 - (scene.primaryAnchor?.x ?? NODE_W / 2) });
    setSelectedCentury(null); setSelectedRegion(""); setActiveId(null); setFocusedId(null); setQuery("");
  }, [scene, viewport.width]);
  const zoom = useCallback((amount: number) => setTransform((current) => {
    const scale = Math.max(0.35, Math.min(1.8, current.scale + amount));
    const x = viewport.width / 2;
    const y = viewport.height / 2;
    return { scale, x: x - (x - current.x) * scale / current.scale, y: y - (y - current.y) * scale / current.scale };
  }), [viewport.height, viewport.width]);
  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("ru");
    if (term.length < 2) return [];
    return scene.people.filter((person) => [person.displayName, ...person.places, person.personId].join(" ").toLocaleLowerCase("ru").includes(term)).slice(0, 7);
  }, [query, scene.people]);
  const focusPerson = useCallback((person: PositionedPerson) => {
    const scale = 1;
    setTransform({
      scale,
      x: viewport.width / 2 - (person.x + NODE_W / 2) * scale,
      y: viewport.height / 2 - (person.y + NODE_H / 2) * scale,
    });
    setFocusedId(person.personId);
    setQuery("");
  }, [viewport.height, viewport.width]);
  const goToGroup = (century: number | null, region: string, index = 0) => {
    setSelectedCentury(century); setSelectedRegion(region); setBrowseIndex(index);
    const matches = scene.people.filter((person) =>
      (century === null || (century === 0 ? person.timelineYear === null : person.timelineYear !== null && centuryOf(person.timelineYear) === century)) &&
      (!region || regionsById.get(person.personId)!.includes(region))
    ).sort((a, b) => (a.timelineYear ?? 9999) - (b.timelineYear ?? 9999) || a.displayName.localeCompare(b.displayName, "ru"));
    if (matches[index]) focusPerson(matches[index]);
    else { setActiveId(null); setFocusedId(null); }
  };
  const focusSingletons = () => {
    const first = scene.people.filter((person) => person.isolated).sort((a, b) => (a.timelineYear ?? 9999) - (b.timelineYear ?? 9999))[0];
    if (first) { setSelectedCentury(null); setSelectedRegion(""); focusPerson(first); }
  };
  // React wheel listeners are passive; install a local non-passive listener so
  // zooming the canvas cannot also scroll the entire page.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const preventScroll = (event: globalThis.WheelEvent) => event.preventDefault();
    element.addEventListener("wheel", preventScroll, { passive: false });
    return () => element.removeEventListener("wheel", preventScroll);
  }, []);
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextScale = Math.max(0.35, Math.min(1.8, transform.scale * (event.deltaY > 0 ? 0.9 : 1.1)));
    const pointerX = event.clientX - rect.left; const pointerY = event.clientY - rect.top;
    setTransform({ scale: nextScale, x: pointerX - (pointerX - transform.x) * (nextScale / transform.scale), y: pointerY - (pointerY - transform.y) * (nextScale / transform.scale) });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input, select")) return;
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    // React may apply this update after pointerup has cleared the drag ref.
    // Capture the coordinates now, before queuing the state update.
    const x = start.tx + event.clientX - start.x;
    const y = start.ty + event.clientY - start.y;
    setTransform((current) => ({ ...current, x, y }));
  };
  const onPointerUp = () => { drag.current = null; };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("input, select, button, a")) return;
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
  const active = (activeId || focusedId) ? byId.get((activeId || focusedId)!) : null;
  const related = new Set(active ? [active.personId, ...active.parentIds, ...scene.people.filter((person) => person.parentIds.includes(active.personId)).map((person) => person.personId)] : []);

  const groupActive = selectedCentury !== null || Boolean(selectedRegion);
  return <section className="tree-workspace" aria-label="Интерактивное генеалогическое дерево">
    <div className="tree-tools" aria-label="Управление деревом">
      <div className="tree-tools__left">
        <span className="tree-total">{directory.people.length.toLocaleString("ru")} человек · {directory.range.minYear}–{directory.range.maxYear}</span>
        <div className="tree-search">
          <label className="sr-only" htmlFor="tree-search">Найти человека в дереве</label>
          <input id="tree-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} placeholder="Имя, фамилия или место" autoComplete="off" />
          {query.trim().length >= 2 ? <div className="tree-search__results">
            {searchResults.length ? searchResults.map((person) => <button type="button" key={person.personId} onClick={() => { setSelectedCentury(null); setSelectedRegion(""); focusPerson(person); }}><strong>{person.displayName}</strong><small>{person.timelineYear ?? "Дата не установлена"} · {regionsById.get(person.personId)!.join(" · ")}</small></button>) : <p role="status">Никого не найдено. Попробуйте часть имени.</p>}
          </div> : null}
        </div>
      </div>
      <div className="tree-tools__zoom">
        <button type="button" onClick={reset}>К началу</button>
        <button type="button" onClick={focusSingletons}>Без связей</button>
        <button type="button" onClick={() => zoom(-0.16)} aria-label="Уменьшить">−</button>
        <button type="button" onClick={() => zoom(1 - transform.scale)} title="Вернуть читаемый масштаб" aria-label="Масштаб 100 процентов">{Math.round(transform.scale * 100)}%</button>
        <button type="button" onClick={() => zoom(0.16)} aria-label="Увеличить">+</button>
      </div>
    </div>
    <nav className="tree-navigation" aria-label="Навигация по векам и регионам">
      <div className="tree-eras" aria-label="Века">
        <button type="button" aria-pressed={selectedCentury === null} onClick={() => goToGroup(null, selectedRegion)}>Все века</button>
        {centuries.map((century) => {
          const count = scene.people.filter((person) => person.timelineYear !== null && centuryOf(person.timelineYear) === century && (!selectedRegion || regionsById.get(person.personId)!.includes(selectedRegion))).length;
          return <button type="button" key={century} aria-pressed={selectedCentury === century} disabled={!count} onClick={() => goToGroup(century, selectedRegion)}>{centuryLabel(century)} <small>{count}</small></button>;
        })}
        <button type="button" aria-pressed={selectedCentury === 0} onClick={() => goToGroup(0, selectedRegion)}>Без даты</button>
      </div>
      <div className="tree-browse">
        <label>Регион <select aria-label="Регион" value={selectedRegion} onChange={(event) => goToGroup(selectedCentury, event.target.value)}><option value="">Все регионы</option>{regions.map((region) => <option key={region} value={region}>{region}</option>)}</select></label>
        {groupActive ? <div className="tree-browse__matches">
          <button type="button" aria-label="Предыдущий человек выбранного века и региона" disabled={browseIndex === 0 || !matchingPeople.length} onClick={() => goToGroup(selectedCentury, selectedRegion, browseIndex - 1)}>←</button>
          <span role="status">{matchingPeople.length ? `${browseIndex + 1} из ${matchingPeople.length}` : "Нет людей с такой датой и регионом"}</span>
          <button type="button" aria-label="Следующий человек выбранного века и региона" disabled={browseIndex >= matchingPeople.length - 1} onClick={() => goToGroup(selectedCentury, selectedRegion, browseIndex + 1)}>→</button>
        </div> : <span className="tree-browse__help">Выберите век, чтобы найти людей в любой ветви</span>}
      </div>
    </nav>
    <div ref={viewportRef} className="tree-viewport" tabIndex={0} aria-label="Полотно дерева. Стрелки перемещают, плюс и минус меняют масштаб" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0" onKeyDown={onKeyDown} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="tree-canvas" style={{ width: scene.width, height: scene.height, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
        {centuries.map((century) => <div className="tree-century" key={century} style={{ top: 64 + ((century - 1) * 100 + 1 - directory.range.minYear) * YEAR_HEIGHT, height: Math.min(100, directory.range.maxYear - (century - 1) * 100) * YEAR_HEIGHT }} />)}
        <div className="tree-singletons-heading" style={{ left: scene.isolatedStartX, top: 24 }}>Без установленных родственных связей</div>
        <svg className="tree-links" width={scene.width} height={scene.height} aria-hidden="true">
          {scene.people.flatMap((child) => child.parentIds.map((parentId) => {
            const parent = byId.get(parentId); if (!parent) return null;
            // Retain lines crossing the viewport even when an endpoint is offscreen.
            const left = -transform.x / transform.scale; const top = -transform.y / transform.scale;
            if (Math.max(parent.x, child.x) + NODE_W < left || Math.min(parent.x, child.x) > left + viewport.width / transform.scale || child.y < top || parent.y > top + viewport.height / transform.scale) return null;
            const selected = related.has(child.personId) && related.has(parentId);
            const x1 = parent.x + NODE_W / 2; const y1 = parent.y + NODE_H; const x2 = child.x + NODE_W / 2; const y2 = child.y;
            const bend = Math.max(28, (y2 - y1) * .46);
            return <path key={`${parentId}-${child.personId}`} className={`${selected ? "is-active" : ""} ${child.needsReview ? "is-uncertain" : ""}`} d={`M${x1} ${y1} C${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`} />;
          }))}
        </svg>
        {visiblePeople.map((person) => {
          const name = splitTreeName(person.displayName);
          const region = regionsById.get(person.personId)!.join(" · ");
          const birth = person.life.birth !== "?" ? person.life.birth : "Рождение: дата неизвестна";
          return <Link href={`/people/${encodeURIComponent(person.personId)}`} target="_blank" rel="noopener noreferrer" prefetch={false} key={person.personId} aria-label={`${person.displayName}. ${birth}. ${region}. Открыть профиль в новой вкладке`} title={`${person.displayName}\n${person.places.join("; ") || region}\nОткрыть профиль в новой вкладке`} className={`tree-person ${person.isolated ? "is-isolated" : ""} ${(activeId || focusedId) === person.personId ? "is-active" : ""}`} style={{ left: person.x, top: person.y, width: NODE_W, height: NODE_H }} onPointerEnter={() => setActiveId(person.personId)} onPointerLeave={() => setActiveId(null)} onFocus={() => setActiveId(person.personId)} onBlur={() => setActiveId(null)}>
            <span className="tree-person__meta">{person.timelineYear ? `${centuryLabel(centuryOf(person.timelineYear))} · ${person.timelineYear}` : "Век не установлен"}<span aria-hidden="true">↗</span></span>
            <strong className={`tree-person__name${name.givenName.length > 45 ? " tree-person__name--long" : ""}`}>{name.givenName || name.surname}</strong>
            {name.surname && name.givenName ? <span className="tree-person__surname">{name.surname}</span> : null}
            <small className="tree-person__dates">{birth}{person.life.death !== "?" ? ` — ${person.life.death}` : ""}</small>
            <span className="tree-person__region">{region}</span>
            {person.needsReview ? <i title="Связь или сведения требуют проверки" /> : null}
          </Link>;
        })}
      </div>
      <div className="tree-location" title={[visibleEras, ...visibleRegions].join(" · ")}><strong>{visibleEras}</strong>{visibleRegions.length ? ` · ${visibleRegions.join(" · ")}` : "Здесь нет карточек — выберите век или найдите человека"}</div>
      <div className="tree-century-ruler" aria-hidden="true">
        {visibleCenturyRuler.map(({ century, y }) => <span key={century} style={{ top: y }}>{centuryLabel(century)}</span>)}
      </div>
    </div>
    <div className="tree-footer"><span>Век — по рождению или первой известной дате. Положение ветвей приблизительное. Регионы — по указанным местам.</span><span>Колесо — масштаб · тяните для перемещения · профиль ↗ в новой вкладке</span></div>
  </section>;
}
