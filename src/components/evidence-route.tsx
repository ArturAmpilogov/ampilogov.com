type RouteStop = {
  title: string;
  detail: string;
  state?: "known" | "gap" | "open";
};

const routes: Record<string, { eyebrow: string; title: string; stops: RouteStop[]; note: string }> = {
  bazdyrevo: {
    eyebrow: "Маршрут в документе 1697 года",
    title: "Баздырево → ливенские Щигры",
    stops: [
      { title: "Баздырево", detail: "Аким лишился орловского поместья" },
      { title: "переселение", detail: "сам Аким рассказал о смене уезда", state: "known" },
      { title: "Щигры", detail: "поместье его внука Тита" },
    ],
    note: "Здесь линия сплошная: оба конца пути и родство деда с внуком названы одним источником.",
  },
  taurida: {
    eyebrow: "XIX век",
    title: "Две таврические точки — без установленного места исхода",
    stops: [
      { title: "Черноземье", detail: "старые ядра фамилии", state: "open" },
      { title: "неизвестная семья", detail: "прямая запись о переселении не найдена", state: "gap" },
      { title: "Троицкое · Тимошевка", detail: "две отдельные семейные группы XIX века" },
    ],
    note: "Пунктир показывает не дорогу, а пробел между северными и таврическими документами.",
  },
  crimea: {
    eyebrow: "Таврическая губерния",
    title: "Материковые семьи видны; крымская ветвь ещё нет",
    stops: [
      { title: "Троицкое и Тимошевка", detail: "подтверждённые точки на материке" },
      { title: "Перекоп", detail: "географический проход, не семейный документ", state: "gap" },
      { title: "Крым", detail: "связанная запись пока не найдена", state: "open" },
    ],
    note: "Схема отделяет известную географию от пока не подтверждённой семейной связи.",
  },
};

export function EvidenceRoute({ id }: { id: string }) {
  const route = routes[id];
  if (!route) return null;

  return (
    <figure className="evidence-route">
      <figcaption>
        <span>{route.eyebrow}</span>
        <strong>{route.title}</strong>
      </figcaption>
      <ol>
        {route.stops.map((stop) => (
          <li className={`is-${stop.state ?? "known"}`} key={`${stop.title}-${stop.detail}`} tabIndex={0}>
            <i aria-hidden="true" />
            <strong>{stop.title}</strong>
            <small>{stop.detail}</small>
          </li>
        ))}
      </ol>
      <p>{route.note}</p>
    </figure>
  );
}
