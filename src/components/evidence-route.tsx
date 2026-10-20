import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

type RouteStop = {
  title: string;
  detail: string;
  state?: "known" | "gap" | "open";
  connection?: "known" | "gap" | "open";
};

type Route = { eyebrow: string; title: string; stops: RouteStop[]; note: string };

const routes = defineCopy<Record<string, Route>>(
  {
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
  },
  {
    en: {
      overview: {
        eyebrow: "Three parts of the book",
        title: "Name → families → the wider map",
        stops: [
          { title: "How a name became a surname", detail: "Greek legends, the church calendar and the first lay records" },
          { title: "Land, service and family", detail: "Oryol households, Sergey in Oboyan, Akim’s account and the noble branch" },
          { title: "The surname on the map", detail: "Village names, southern roads, new towns and parishes" },
        ],
        note: "The line sets the reading order. Kinship and migrations are worked out from the documents inside each story.",
      },
      bazdyrevo: {
        eyebrow: "A route in a 1700 document",
        title: "Bazdyrevo → Shchigry in Livny district",
        stops: [
          { title: "Bazdyrevo", detail: "Akim lost his Oryol estate" },
          { title: "resettlement", detail: "Akim himself described the change of district", state: "known" },
          { title: "Shchigry", detail: "the estate of his grandson Tit" },
        ],
        note: "Here the line is solid: both ends of the route and the grandfather–grandson kinship are named in a single source.",
      },
      taurida: {
        eyebrow: "19th century",
        title: "Early Taurida families: place of origin not established",
        stops: [
          { title: "Black Earth region", detail: "the old cores of the surname", state: "open" },
          { title: "unknown family", detail: "no direct record of the move has been found", state: "gap" },
          { title: "Troitskoye · Timoshevka", detail: "two separate family groups of the 19th century" },
        ],
        note: "The dashed line marks the direction of the search for documents linking the northern and Taurida family groups.",
      },
    },
    uk: {
      overview: {
        eyebrow: "Три частини книги",
        title: "Ім’я → родини → велика мапа",
        stops: [
          { title: "Як ім’я стало прізвищем", detail: "Грецькі перекази, церковний календар і перші мирські записи" },
          { title: "Земля, служба й родина", detail: "Орловські двори, Сергій в Обояні, розповідь Акима і дворянська гілка" },
          { title: "Прізвище на мапі", detail: "Назви сіл, південні шляхи, нові міста й парафії" },
        ],
        note: "Лінія задає порядок читання. Родинні зв’язки й переселення розглянуто за документами всередині кожної історії.",
      },
      bazdyrevo: {
        eyebrow: "Маршрут у документі 1700 року",
        title: "Баздирево → лівенські Щигри",
        stops: [
          { title: "Баздирево", detail: "Аким утратив орловський маєток" },
          { title: "переселення", detail: "сам Аким розповів про зміну повіту", state: "known" },
          { title: "Щигри", detail: "маєток його онука Тита" },
        ],
        note: "Тут лінія суцільна: обидва кінці шляху і спорідненість діда з онуком названо в одному джерелі.",
      },
      taurida: {
        eyebrow: "XIX століття",
        title: "Ранні таврійські родини — без установленого місця виходу",
        stops: [
          { title: "Чорнозем’я", detail: "давні осередки прізвища", state: "open" },
          { title: "невідома родина", detail: "прямого запису про переселення не знайдено", state: "gap" },
          { title: "Троїцьке · Тимошівка", detail: "дві окремі родинні групи XIX століття" },
        ],
        note: "Пунктиром позначено напрям пошуку документів, що пов’язують північні й таврійські родинні групи.",
      },
    },
    be: {
      overview: {
        eyebrow: "Тры часткі кнігі",
        title: "Імя → сем’і → вялікая карта",
        stops: [
          { title: "Як імя стала прозвішчам", detail: "Грэчаскія паданні, царкоўны каляндар і першыя свецкія запісы" },
          { title: "Зямля, служба і сям’я", detail: "Арлоўскія двары, Сяргей у Абаяні, аповед Акіма і дваранская галіна" },
          { title: "Прозвішча на карце", detail: "Назвы вёсак, паўднёвыя дарогі, новыя гарады і парафіі" },
        ],
        note: "Лінія задае парадак чытання. Сваяцкія сувязі і перасяленні разабраны паводле дакументаў унутры кожнай гісторыі.",
      },
      bazdyrevo: {
        eyebrow: "Маршрут у дакуменце 1700 года",
        title: "Баздырава → лівенскія Шчыгры",
        stops: [
          { title: "Баздырава", detail: "Акім страціў арлоўскі маёнтак" },
          { title: "перасяленне", detail: "сам Акім расказаў пра змену павета", state: "known" },
          { title: "Шчыгры", detail: "маёнтак яго ўнука Ціта" },
        ],
        note: "Тут лінія суцэльная: абодва канцы шляху і сваяцтва дзеда з унукам названыя адной крыніцай.",
      },
      taurida: {
        eyebrow: "XIX стагоддзе",
        title: "Раннія таўрычаскія сем’і — без устаноўленага месца выхаду",
        stops: [
          { title: "Чарназём’е", detail: "старыя ядры прозвішча", state: "open" },
          { title: "невядомая сям’я", detail: "прамы запіс пра перасяленне не знойдзены", state: "gap" },
          { title: "Троіцкае · Цімашэўка", detail: "дзве асобныя сямейныя групы XIX стагоддзя" },
        ],
        note: "Пункцірам пазначаны кірунак пошуку дакументаў, якія звязваюць паўночныя і таўрычаскія сямейныя групы.",
      },
    },
  },
);

export function EvidenceRoute({ id }: { id: string }) {
  const route = routes[getLocale()][id];
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
