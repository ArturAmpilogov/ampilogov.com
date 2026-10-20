import { KonyaOpenStreetMap } from "@/components/konya-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  name: "Кония",
  key: "Один город, два исторических имени",
  region: "Центральная Анатолия",
  pan: "Карту можно двигать и увеличивать",
  title: "Икония → Кония",
  detail: "позднеантичный и современный город на одном месте",
  note: "Круг показывает городской район, а не границу древнего поселения. Ссылка на карты открывает современную Конию как именованный город, без приблизительной координатной метки.",
}, {
  en: {
    name: "Konya",
    key: "One city, two historical names",
    region: "Central Anatolia",
    pan: "The map can be panned and zoomed",
    title: "Iconium → Konya",
    detail: "late antique and modern city on the same site",
    note: "The circle marks the urban area, not the boundary of the ancient settlement. The map links open modern Konya as a named city, without an approximate coordinate pin.",
  },
  uk: {
    name: "Конья",
    key: "Одне місто, дві історичні назви",
    region: "Центральна Анатолія",
    pan: "Мапу можна рухати й збільшувати",
    title: "Іконія → Конья",
    detail: "пізньоантичне й сучасне місто на одному місці",
    note: "Коло показує міський район, а не межу давнього поселення. Посилання на мапи відкриває сучасну Конью як іменоване місто, без приблизної координатної позначки.",
  },
  be: {
    name: "Конья",
    key: "Адзін горад, дзве гістарычныя назвы",
    region: "Цэнтральная Анатолія",
    pan: "Карту можна рухаць і павялічваць",
    title: "Іканія → Конья",
    detail: "познеантычны і сучасны горад на адным месцы",
    note: "Круг паказвае гарадскі раён, а не мяжу старажытнага паселішча. Спасылка на карты адкрывае сучасную Конью як названы горад, без прыблізнай каардынатнай меткі.",
  },
});

const konyaPlace = {
  searchQuery: "Konya, Türkiye",
  latitude: 37.87464,
  longitude: 32.49316,
};

export function KonyaMap() {
  const text = copy[getLocale()];
  const konya = { ...konyaPlace, name: text.name };

  return (
    <figure className="amphilochia-map konya-map">
      <KonyaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> {text.key}</span>
        <span>{text.region}</span>
        <span>{text.pan}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.title}</strong>
            <small>{text.detail}</small>
          </div>
          <PlaceMapLinks {...konya} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        {text.note}
      </p>
    </figure>
  );
}
