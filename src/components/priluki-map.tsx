import { PlaceMapLinks } from "@/components/place-map-links";
import { PrilukiOpenStreetMap } from "@/components/priluki-open-street-map";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  prilukiName: "Прилуки",
  onfilogovoName: "Никольское (Свечино), центр владения с деревней Онфилогово",
  legendPriluki: "Прилуки · 1536/37",
  legendOnfilogovo: "Онфилогово · реконструированный центр владения",
  legendDistricts: "Прилуки — Угличский уезд; Онфилогово — Тверской",
  legendLine: "Линия показывает порядок записей, не путь",
  prilukiTitle: "Прилуки на Волге",
  prilukiDetail: "монастырское село; точное место двора Тонкого неизвестно",
  onfilogovoTitle: "Онфилогово при Никольском Свечине",
  onfilogovoDetail: "центр владения в научной ГИС; точка самой деревни пока не установлена",
  note: "Прилуки показаны по современному селу. Для Онфилогова отмечен центр владения — Никольское Свечино в волости Хорвач. Ни точный двор Тонкого, ни положение четырёх дворов деревни пока не установлены. Родство между носителями имени в этих местах неизвестно.",
}, {
  en: {
    prilukiName: "Priluki",
    onfilogovoName: "Nikolskoye (Svechino), centre of the holding that included the village of Onfilogovo",
    legendPriluki: "Priluki · 1536/37",
    legendOnfilogovo: "Onfilogovo · reconstructed centre of the holding",
    legendDistricts: "Priluki in Uglich district; Onfilogovo in Tver district",
    legendLine: "The line shows the order of the records, not a route",
    prilukiTitle: "Priluki on the Volga",
    prilukiDetail: "a monastery village; the exact site of Tonkoy's homestead is unknown",
    onfilogovoTitle: "Onfilogovo near Nikolskoye Svechino",
    onfilogovoDetail: "centre of the holding in a scholarly GIS; the point of the village itself is not yet identified",
    note: "Priluki is shown at the modern village. For Onfilogovo the centre of the holding is marked: Nikolskoye Svechino in Khorvach volost. Neither Tonkoy's exact homestead nor the position of the village's four homesteads has yet been identified. Any kinship between bearers of the name in these places is unknown.",
  },
  uk: {
    prilukiName: "Прилуки",
    onfilogovoName: "Нікольське (Свєчино), центр володіння з селом Онфілогово",
    legendPriluki: "Прилуки · 1536/37",
    legendOnfilogovo: "Онфілогово · реконструйований центр володіння",
    legendDistricts: "Прилуки — Углицький повіт; Онфілогово — Тверський",
    legendLine: "Лінія показує порядок записів, а не шлях",
    prilukiTitle: "Прилуки на Волзі",
    prilukiDetail: "монастирське село; точне місце двору Тонкого невідоме",
    onfilogovoTitle: "Онфілогово біля Нікольського Свєчина",
    onfilogovoDetail: "центр володіння в науковій ГІС; точку самого села поки не встановлено",
    note: "Прилуки показано за сучасним селом. Для Онфілогова позначено центр володіння — Нікольське Свєчино у волості Хорвач. Ні точний двір Тонкого, ні розташування чотирьох дворів села поки не встановлено. Спорідненість між носіями імені в цих місцях невідома.",
  },
  be: {
    prilukiName: "Прылукі",
    onfilogovoName: "Нікольскае (Свечына), цэнтр уладання з вёскай Онфілогава",
    legendPriluki: "Прылукі · 1536/37",
    legendOnfilogovo: "Онфілогава · рэканструяваны цэнтр уладання",
    legendDistricts: "Прылукі — Угліцкі павет; Онфілогава — Цвярскі",
    legendLine: "Лінія паказвае парадак запісаў, а не шлях",
    prilukiTitle: "Прылукі на Волзе",
    prilukiDetail: "манастырскае сяло; дакладнае месца двара Тонкага невядомае",
    onfilogovoTitle: "Онфілогава каля Нікольскага Свечына",
    onfilogovoDetail: "цэнтр уладання ў навуковай ГІС; пункт самой вёскі пакуль не ўстаноўлены",
    note: "Прылукі паказаны па сучасным сяле. Для Онфілогава адзначаны цэнтр уладання — Нікольскае Свечына ў воласці Хорвач. Ні дакладны двор Тонкага, ні размяшчэнне чатырох двароў вёскі пакуль не ўстаноўлены. Сваяцтва паміж носьбітамі імя ў гэтых месцах невядомае.",
  },
});

const priluki = {
  searchQuery: "село Прилуки, Угличский район, Ярославская область, Россия",
  latitude: 57.365108,
  longitude: 38.037449,
};

const onfilogovo = {
  latitude: 56.3225861843296,
  longitude: 35.2047323324939,
  coordinateOnly: true,
};

export function PrilukiMap() {
  const text = copy[getLocale()];

  return (
    <figure className="amphilochia-map priluki-map">
      <PrilukiOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> {text.legendPriluki}</span>
        <span><i className="amphilochia-map-key is-approximate" /> {text.legendOnfilogovo}</span>
        <span>{text.legendDistricts}</span>
        <span>{text.legendLine}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.prilukiTitle}</strong>
            <small>{text.prilukiDetail}</small>
          </div>
          <PlaceMapLinks {...priluki} name={text.prilukiName} />
        </div>
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.onfilogovoTitle}</strong>
            <small>{text.onfilogovoDetail}</small>
          </div>
          <PlaceMapLinks {...onfilogovo} name={text.onfilogovoName} />
        </div>
      </div>

      <p className="amphilochia-map-note">{text.note}</p>
    </figure>
  );
}
