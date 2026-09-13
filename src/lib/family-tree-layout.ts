import type { FamilyTreeDirectory, FamilyTreePerson } from "./genealogy";

export type PositionedPerson = FamilyTreePerson & { x: number; y: number; isolated: boolean };
export const NODE_W = 300;
export const NODE_H = 166;
export const YEAR_HEIGHT = 8;

export function centuryOf(year: number) { return Math.ceil(year / 100); }
export function centuryLabel(century: number) { return `${century} век`; }

// Group only explicit place readings, without inferring a birthplace or migration.
const REGIONS: Array<[RegExp, string]> = [
  [/оренбург/iu, "Оренбургский регион"], [/уфим|(?<![а-яё])уфа/iu, "Уфимский регион"],
  [/самар/iu, "Самарский регион"], [/симбир/iu, "Симбирский регион"],
  [/казан/iu, "Казанский регион"], [/нижегород/iu, "Нижегородский регион"],
  [/костром/iu, "Костромской регион"], [/владимир/iu, "Владимирский регион"],
  [/екатеринослав/iu, "Екатеринославский регион"], [/херсон/iu, "Херсонский регион"],
  [/петербург|петроград|ленинград/iu, "Петербургский регион"], [/ставропол/iu, "Ставропольский регион"],
  [/кубан/iu, "Кубанский регион"], [/донск|область войска донского/iu, "Донской регион"],
  [/иркут/iu, "Иркутский регион"], [/енисей/iu, "Енисейский регион"],
  [/курск/iu, "Курский регион"], [/(?<![а-яё])(?:ор[её]л|орла|орле|орловск)/iu, "Орловский регион"],
  [/воронеж/iu, "Воронежский регион"], [/белгород/iu, "Белгородский регион"],
  [/рязан/iu, "Рязанский регион"], [/москов|москва/iu, "Московский регион"],
  [/тульск|тула/iu, "Тульский регион"], [/калуж|калуга/iu, "Калужский регион"],
  [/тамбов/iu, "Тамбовский регион"], [/пензе|пензен|пенза/iu, "Пензенский регион"],
  [/саратов/iu, "Саратовский регион"], [/смолен/iu, "Смоленский регион"],
  [/новгород/iu, "Новгородский регион"], [/псков/iu, "Псковский регион"],
  [/твер/iu, "Тверской регион"], [/ярослав/iu, "Ярославский регион"],
  [/волог/iu, "Вологодский регион"], [/архангельск|холмогор/iu, "Архангельский регион"],
  [/вятск|вятка/iu, "Вятский регион"], [/перм/iu, "Пермский регион"],
  [/тоболь/iu, "Тобольский регион"], [/томск/iu, "Томский регион"],
  [/полтав/iu, "Полтавский регион"], [/чернигов/iu, "Черниговский регион"],
  [/харьков/iu, "Харьковский регион"], [/киев/iu, "Киевский регион"],
  [/витеб/iu, "Витебский регион"], [/могил[её]в/iu, "Могилёвский регион"],
];
export function regionsOf(places: string[]) {
  const locations = places.map((place) => place.replace(/[а-яё-]+(?:ая|ой|ский|ского)\s+(?:церков[а-яё]*|церкв[а-яё]*|собор[а-яё]*|храм[а-яё]*)/giu, ""));
  const regions = REGIONS.filter(([pattern]) => locations.some((place) => pattern.test(place))).map(([, label]) => label);
  return regions.length ? regions : ["Регион не уточнён"];
}

export function splitTreeName(displayName: string) {
  // Keep the documented spelling, including feminine and historical variants.
  const words = displayName.split(/\s+/);
  if (/,\s*(?:отец|мать|сын|дочь|жена|муж)\s/iu.test(displayName)) return { surname: "", givenName: displayName };
  const index = words.findIndex((word) => /^(?:ампил|анпил|онпил|онфил|анфил|импил|амфил|антил|анпал|ампел|анпел|анпин|анпл|апил|аппил|аминл|аменл|анл|анкл|анлил|анинл|арепил|алепл|анчисл)[а-яё-]*(?:ов|ев|ин|ова|ева|ина)(?:[ъь])?$/iu.test(word.replace(/[()[\],?]/g, "")));
  return index < 0 ? { surname: "", givenName: displayName } : {
    surname: words[index], givenName: words.filter((_, i) => i !== index).join(" "),
  };
}

export function layoutPeople(directory: FamilyTreeDirectory) {
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
      if (visiting.has(id)) return leafCursor++ * (NODE_W + 48);
      visiting.add(id);
      const descendants = (children.get(id) ?? []).filter((childId) => memberIds.has(childId));
      const childXs = descendants.map(placeBranch);
      const x = childXs.length ? childXs.reduce((sum, value) => sum + value, 0) / childXs.length : leafCursor++ * (NODE_W + 48);
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
    // Reserve occupied rectangles, including cousins born close together.
    const placed: Array<{ x: number; y: number }> = [];
    for (const id of [...component].sort((a, b) => yById.get(a)! - yById.get(b)!)) {
      let y = Math.max(yById.get(id)!, ...byId.get(id)!.parentIds.filter((parentId) => memberIds.has(parentId)).map((parentId) => yById.get(parentId)! + NODE_H + 32));
      const x = localX.get(id)!;
      for (const other of placed.sort((a, b) => a.y - b.y)) {
        if (Math.abs(x - other.x) < NODE_W + 16 && y < other.y + NODE_H + 16 && y + NODE_H + 16 > other.y) y = other.y + NODE_H + 16;
      }
      yById.set(id, y); placed.push({ x, y });
    }
    for (const id of component) positioned.push({ ...byId.get(id)!, x: offsetX + localX.get(id)!, y: yById.get(id)!, isolated: false });
    if (!primaryAnchor) {
      const first = [...component].sort((a, b) => yById.get(a)! - yById.get(b)!)[0];
      primaryAnchor = { x: offsetX + localX.get(first)! + NODE_W / 2, y: yById.get(first)! };
    }
    offsetX += componentWidth + 156;
  }

  const isolatedStartX = offsetX + 80;
  const nextY: number[] = [];
  let undatedIndex = 0;
  for (const id of isolated.sort((left, right) => (yearById.get(left) ?? 9999) - (yearById.get(right) ?? 9999))) {
    const year = yearById.get(id);
    const y = year ? 70 + (year - directory.range.minYear) * YEAR_HEIGHT : unknownStart + Math.floor(undatedIndex / 12) * (NODE_H + 20);
    let column = year ? nextY.findIndex((bottom) => bottom <= y) : undatedIndex++ % 12;
    if (column < 0) column = nextY.length;
    nextY[column] = y + NODE_H + 20;
    positioned.push({ ...byId.get(id)!, x: isolatedStartX + column * (NODE_W + 24), y, isolated: true });
  }
  const maxX = Math.max(...positioned.map((person) => person.x), 0) + NODE_W + 100;
  const maxY = Math.max(...positioned.map((person) => person.y), 0) + NODE_H + 80;
  return { people: positioned, width: maxX, height: maxY, isolatedStartX, isolatedCount: isolated.length, primaryAnchor };
}
