import { KurskOboyanOpenStreetMap } from "@/components/kursk-oboyan-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  kursk: "Курск",
  kurskDetail: "Курская десятня · 1636 год",
  oboyan: "Обоянь",
  oboyanDetail: "Обоянская десятня · 1651 год",
  kurskKey: "Курск · 1636",
  oboyanKey: "Обоянь · 1651",
  lineKey: "Линия показывает направление, а не восстановленную дорогу",
  note: "В двух городах записан Сергей Григорьевич с вариантами фамилии. Вероятно, это один человек. Линия показывает сопоставление записей; документ о переводе и точный путь пока не найдены.",
}, {
  en: {
    kursk: "Kursk",
    kurskDetail: "Kursk muster roll (desyatnya) · 1636",
    oboyan: "Oboyan",
    oboyanDetail: "Oboyan muster roll (desyatnya) · 1651",
    kurskKey: "Kursk · 1636",
    oboyanKey: "Oboyan · 1651",
    lineKey: "The line shows the direction, not a reconstructed road",
    note: "In both towns a Sergei Grigoryevich is recorded with variants of the surname. He is probably the same man. The line shows how the records are matched; the transfer document and the exact route have not yet been found.",
  },
  uk: {
    kursk: "Курськ",
    kurskDetail: "Курська десятня · 1636 рік",
    oboyan: "Обоянь",
    oboyanDetail: "Обоянська десятня · 1651 рік",
    kurskKey: "Курськ · 1636",
    oboyanKey: "Обоянь · 1651",
    lineKey: "Лінія показує напрямок, а не відтворену дорогу",
    note: "У двох містах записано Сергія Григоровича з варіантами прізвища. Імовірно, це одна людина. Лінія показує зіставлення записів; документ про переведення і точний шлях поки не знайдено.",
  },
  be: {
    kursk: "Курск",
    kurskDetail: "Курская дзесятня · 1636 год",
    oboyan: "Абаянь",
    oboyanDetail: "Абаянская дзесятня · 1651 год",
    kurskKey: "Курск · 1636",
    oboyanKey: "Абаянь · 1651",
    lineKey: "Лінія паказвае кірунак, а не адноўленую дарогу",
    note: "У двух гарадах запісаны Сяргей Рыгоравіч з варыянтамі прозвішча. Верагодна, гэта адзін чалавек. Лінія паказвае супастаўленне запісаў; дакумент пра перавод і дакладны шлях пакуль не знойдзены.",
  },
});

const placeCoordinates = [
  {
    searchQuery: "Курск, Курская область, Россия",
    latitude: 51.7308,
    longitude: 36.193,
  },
  {
    searchQuery: "Обоянь, Курская область, Россия",
    latitude: 51.212,
    longitude: 36.2786,
  },
];

export function KurskOboyanMap() {
  const text = copy[getLocale()];
  const places = [
    { ...placeCoordinates[0], name: text.kursk, detail: text.kurskDetail },
    { ...placeCoordinates[1], name: text.oboyan, detail: text.oboyanDetail },
  ];

  return (
    <figure className="amphilochia-map kursk-oboyan-map">
      <KurskOboyanOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> {text.kurskKey}</span>
        <span><i className="amphilochia-map-key is-modern" /> {text.oboyanKey}</span>
        <span>{text.lineKey}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        {places.map((place) => (
          <div className="amphilochia-map-place" key={place.name}>
            <div>
              <strong>{place.name}</strong>
              <small>{place.detail}</small>
            </div>
            <PlaceMapLinks {...place} />
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note">
        {text.note}
      </p>
    </figure>
  );
}
