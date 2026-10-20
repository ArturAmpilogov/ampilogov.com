import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  owners: [
    "Беляй Васильевич Онфилогов",
    "Осип Васильевич Анфилогов",
    "Василий, Тимофей и Карп Микулины",
    "Иван Першин Анфилогов",
    "Софон Тимофеев Анфилогов",
    "Ермак Пахомов Анпилогов",
    "Иван Нечаев Анпилогов",
  ],
  places: [
    "Баздырево",
    "Баздырево",
    "Баздырево · сообща",
    "Белая",
    "Софоново",
    "Малцовская",
    "займище на Радомле",
  ],
  kicker: "Семь владений · 1594/95 год",
  title: "35 четвертей пашни против 220 четвертей ещё не поднятой земли",
  owner: "Владелец",
  place: "Место",
  ploughed: "Пашня, четвертей",
  wild: "Дикое поле, четвертей",
  hay: "Сено, копен",
  note: "Пашня и дикое поле указаны «в одном поле» трёхпольного цикла.",
}, {
  en: {
    owners: [
      "Belyai Vasilyevich Onfilogov",
      "Osip Vasilyevich Anfilogov",
      "Vasily, Timofei and Karp Mikulin",
      "Ivan Pershin Anfilogov",
      "Sofon Timofeyev Anfilogov",
      "Yermak Pakhomov Anpilogov",
      "Ivan Nechayev Anpilogov",
    ],
    places: [
      "Bazdyrevo",
      "Bazdyrevo",
      "Bazdyrevo · held jointly",
      "Belaya",
      "Sofonovo",
      "Maltsovskaya",
      "clearing on the Radomlya",
    ],
    kicker: "Seven holdings · 1594/95",
    title: "35 chetverti of ploughland against 220 chetverti of land not yet broken",
    owner: "Holder",
    place: "Place",
    ploughed: "Ploughland, chetverti",
    wild: "Wild field, chetverti",
    hay: "Hay, stacks (kopny)",
    note: "Ploughland and wild field are given «в одном поле» [“in one field”] of the three-field rotation.",
  },
  uk: {
    owners: [
      "Беляй Васильович Онфілогов",
      "Осип Васильович Анфілогов",
      "Василь, Тимофій і Карп Микуліни",
      "Іван Першин Анфілогов",
      "Софон Тимофєєв Анфілогов",
      "Єрмак Пахомов Анпілогов",
      "Іван Нечаєв Анпілогов",
    ],
    places: [
      "Баздирево",
      "Баздирево",
      "Баздирево · спільно",
      "Бєлая",
      "Софоново",
      "Малцовська",
      "займище на Радомлі",
    ],
    kicker: "Сім володінь · 1594/95 рік",
    title: "35 четвертей ріллі проти 220 четвертей ще не піднятої землі",
    owner: "Власник",
    place: "Місце",
    ploughed: "Рілля, четвертей",
    wild: "Дике поле, четвертей",
    hay: "Сіно, копиць",
    note: "Ріллю й дике поле вказано «в одном поле» трипільної сівозміни.",
  },
  be: {
    owners: [
      "Беляй Васільевіч Онфілогаў",
      "Восіп Васільевіч Анфілогаў",
      "Васілій, Цімафей і Карп Мікуліны",
      "Іван Першын Анфілогаў",
      "Сафон Цімафееў Анфілогаў",
      "Ермак Пахомаў Анпілогаў",
      "Іван Нячаеў Анпілогаў",
    ],
    places: [
      "Баздырава",
      "Баздырава",
      "Баздырава · супольна",
      "Белая",
      "Сафонава",
      "Малцоўская",
      "займішча на Радомлі",
    ],
    kicker: "Сем уладанняў · 1594/95 год",
    title: "35 чвэрцяў ворнай зямлі супраць 220 чвэрцяў яшчэ не ўзнятай зямлі",
    owner: "Уладальнік",
    place: "Месца",
    ploughed: "Ворыва, чвэрцяў",
    wild: "Дзікае поле, чвэрцяў",
    hay: "Сена, коп",
    note: "Ворыва і дзікае поле паказаны «в одном поле» трохпольнага севазвароту.",
  },
});

const holdings = [
  {
    owner: "Беляй Васильевич Онфилогов",
    place: "Баздырево",
    ploughed: "9",
    wild: "51",
    hay: "115",
  },
  {
    owner: "Осип Васильевич Анфилогов",
    place: "Баздырево",
    ploughed: "5",
    wild: "19",
    hay: "70",
  },
  {
    owner: "Василий, Тимофей и Карп Микулины",
    place: "Баздырево · сообща",
    ploughed: "6",
    wild: "51",
    hay: "115",
  },
  {
    owner: "Иван Першин Анфилогов",
    place: "Белая",
    ploughed: "4",
    wild: "29",
    hay: "50",
  },
  {
    owner: "Софон Тимофеев Анфилогов",
    place: "Софоново",
    ploughed: "4",
    wild: "36",
    hay: "85",
  },
  {
    owner: "Ермак Пахомов Анпилогов",
    place: "Малцовская",
    ploughed: "7",
    wild: "19",
    hay: "40",
  },
  {
    owner: "Иван Нечаев Анпилогов",
    place: "займище на Радомле",
    ploughed: "0",
    wild: "15",
    hay: "80",
  },
] as const;

export function OrelEstateTable() {
  const text = copy[getLocale()];

  return (
    <figure className="orel-estate-table">
      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
      </figcaption>
      <div className="orel-estate-table-scroll" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">{text.owner}</th>
              <th scope="col">{text.place}</th>
              <th scope="col">{text.ploughed}</th>
              <th scope="col">{text.wild}</th>
              <th scope="col">{text.hay}</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => (
              <tr key={`${holding.owner}-${holding.place}`}>
                <th scope="row">{text.owners[index]}</th>
                <td>{text.places[index]}</td>
                <td>{holding.ploughed}</td>
                <td>{holding.wild}</td>
                <td>{holding.hay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{text.note}</p>
    </figure>
  );
}
