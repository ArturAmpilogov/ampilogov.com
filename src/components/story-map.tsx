import { StoryOpenStreetMap } from "@/components/story-open-street-map";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";
import { getStoryMap } from "@/lib/story-maps";

const copy = defineCopy(
  { interactionHint: "Карту можно двигать и увеличивать" },
  {
    en: { interactionHint: "The map can be panned and zoomed" },
    uk: { interactionHint: "Мапу можна рухати й збільшувати" },
    be: { interactionHint: "Карту можна рухаць і павялічваць" },
  },
);

export function StoryMap({ id }: { id: string }) {
  const locale = getLocale();
  const config = getStoryMap(id, locale);
  if (!config) return null;

  return (
    <figure className="amphilochia-map story-map">
      <StoryOpenStreetMap config={config} />

      <figcaption>
        {config.legend.map((item, index) => (
          <span key={item}>
            {index < 2 ? (
              <i className={`amphilochia-map-key ${index === 0 ? "is-modern" : "is-ancient"}`} />
            ) : (
              <i className="story-map-key-dashed" />
            )}
            {item}
          </span>
        ))}
        <span>{copy[locale].interactionHint}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        {config.places.map((place) => (
          <div className="amphilochia-map-place story-map-place" key={place.id}>
            <div>
              <strong>{place.name}</strong>
              <small>{place.detail}</small>
            </div>
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note">{config.note}</p>
    </figure>
  );
}
