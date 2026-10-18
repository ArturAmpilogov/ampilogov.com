import { StoryOpenStreetMap } from "@/components/story-open-street-map";
import { storyMaps } from "@/lib/story-maps";

export function StoryMap({ id }: { id: string }) {
  const config = storyMaps[id];
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
        <span>Карту можно двигать и увеличивать</span>
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
