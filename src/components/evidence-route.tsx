type RouteStop = {
  title: string;
  detail: string;
  state?: "known" | "gap" | "open";
  connection?: "known" | "gap" | "open";
};

const routes: Record<string, { eyebrow: string; title: string; stops: RouteStop[]; note: string }> = {
  overview: {
    eyebrow: "VIII век до н. э. — начало XX века",
    title: "От древнего имени к географии фамилии",
    stops: [
      { title: "Малл · Аргос", detail: "герой, оракул и названия земель" },
      { title: "Икония · Русь", detail: "христианское имя в календаре и документах" },
      { title: "Верхняя Волга", detail: "Тонкой Онфилогов · деревня Онфилогово · 1536–1540" },
      {
        title: "Курско-Орловское ядро",
        detail: "Орёл, Курск, Обоянь, Щигры; Анпилогово и Анпиловка · XVI–XVIII века",
        connection: "gap",
      },
      { title: "Северная Таврия", detail: "Троицкое · Тимошевка · XIX–XX века", connection: "open" },
      { title: "Мир", detail: "поздние ветви; связи проверяются по документам", state: "open" },
    ],
    note: "Сплошная линия соединяет историю имени и документированные очаги фамилии. Пунктир не обозначает доказанное переселение: между курско-орловским ядром, Таврией и поздними ветвями пока остаются генеалогические разрывы.",
  },
  "amphilochius-name": {
    eyebrow: "Жизнь имени · IV–XIX века",
    title: "От Каппадокии до русских метрик",
    stops: [
      { title: "ок. 340", detail: "Каппадокия · сын получает имя отца" },
      { title: "373/374", detail: "Икония · Амфилохий становится епископом" },
      { title: "381", detail: "Константинополь · II Вселенский собор" },
      { title: "1097", detail: "Новгород · на пергамене записан Амфилогий" },
      { title: "1105", detail: "Владимир-Волынский · епископ Амфилохий" },
      { title: "XV век", detail: "Глушица · Амфилохий Глушицкий" },
      { title: "1803 · 1846", detail: "Киев · Самара · имя в приходских метриках" },
    ],
    note: "Между греческим Ἀμφιλόχιος и русским Амфилогием — семь веков. Переход к форме на «г» впервые виден на новгородском пергамене 1097 года.",
  },
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
