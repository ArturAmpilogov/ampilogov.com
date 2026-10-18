type RouteStop = {
  title: string;
  detail: string;
  state?: "known" | "gap" | "open";
  connection?: "known" | "gap" | "open";
};

const routes: Record<string, { eyebrow: string; title: string; stops: RouteStop[]; note: string }> = {
  overview: {
    eyebrow: "Три части книги",
    title: "Имя → семьи → большая карта",
    stops: [
      { title: "Как имя стало фамилией", detail: "Греческие предания, церковный календарь и первые мирские записи" },
      { title: "Земля, служба и семья", detail: "Орловские дворы, Сергей в Обояни, рассказ Акима и дворянская ветвь" },
      { title: "Фамилия на карте", detail: "Названия деревень, южные дороги, новые города и приходы" },
    ],
    note: "Линия задаёт порядок чтения. Родственные связи и переселения разбираются по документам внутри каждой истории.",
  },
  bazdyrevo: {
    eyebrow: "Маршрут в документе 1700 года",
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
    title: "Ранние таврические семьи — без установленного места исхода",
    stops: [
      { title: "Черноземье", detail: "старые ядра фамилии", state: "open" },
      { title: "неизвестная семья", detail: "прямая запись о переселении не найдена", state: "gap" },
      { title: "Троицкое · Тимошевка", detail: "две отдельные семейные группы XIX века" },
    ],
    note: "Пунктиром отмечено направление поиска документов, связывающих северные и таврические семейные группы.",
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
          <li
            className={`is-${stop.state ?? "known"} connection-${stop.connection ?? stop.state ?? "known"}`}
            key={`${stop.title}-${stop.detail}`}
            tabIndex={0}
          >
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
