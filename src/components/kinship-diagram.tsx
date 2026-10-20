import { kinshipCopy } from "@/components/kinship-diagram.copy";
import { getLocale } from "@/i18n/server";

function AmphilochosFamilyTree() {
  const text = kinshipCopy[getLocale()].amphilochos;

  return (
    <figure className="kinship-diagram kinship-diagram--family-tree">
      <figcaption>
        <span>{text.eyebrow}</span>
        <strong>{text.title}</strong>
      </figcaption>

      <div
        className="kinship-family-tree"
        aria-label={text.groupLabel}
        role="group"
      >
        <svg aria-hidden="true" className="kinship-family-tree-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="kinship-family-tree-line" d="M24 19 H76" />
          <path className="kinship-family-tree-line" d="M50 19 V57 H24 V82" />
          <path className="kinship-family-tree-line" d="M50 57 H76 V82" />
          <circle className="kinship-family-tree-joint" cx="50" cy="19" r="1.35" />
          <circle className="kinship-family-tree-end" cx="24" cy="82" r="1.1" />
          <circle className="kinship-family-tree-end" cx="76" cy="82" r="1.1" />
        </svg>

        <section aria-label={text.parentsLabel} className="kinship-family-tier kinship-family-tier--parents">
          <small>{text.parentsHeading}</small>
          <div>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>{text.amphiaraus.name}</strong>
              <em>{text.amphiaraus.note}</em>
            </span>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>{text.eriphyle.name}</strong>
              <em>{text.eriphyle.note}</em>
            </span>
          </div>
        </section>

        <section aria-label={text.childrenLabel} className="kinship-family-tier kinship-family-tier--children">
          <small>{text.childrenHeading}</small>
          <div>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>{text.alcmaeon.name}</strong>
              <em>{text.alcmaeon.note}</em>
            </span>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>{text.amphilochus.name}</strong>
              <em>{text.amphilochus.note}</em>
            </span>
          </div>
        </section>
      </div>
    </figure>
  );
}

function Orel1594FamilyTree() {
  const text = kinshipCopy[getLocale()].orel1594;

  return (
    <figure className="kinship-diagram kinship-diagram--orel-tree">
      <figcaption>
        <span>{text.eyebrow}</span>
        <strong>{text.title}</strong>
      </figcaption>

      <div
        className="orel-kinship-trees"
        aria-label={text.groupLabel}
        role="group"
      >
        {text.branches.map((branch) => {
          const childCount = branch.children.length;
          const childPositions = childCount === 3 ? [16.67, 50, 83.33] : [25, 75];
          const left = childPositions[0];
          const right = childPositions[childPositions.length - 1];

          return (
            <section
              className={`orel-kinship-branch is-${branch.certainty}`}
              key={branch.label}
            >
              <header>
                <strong>{branch.label}</strong>
                <p>{branch.explanation}</p>
              </header>

              <div className="orel-family-tree">
                <span className="orel-family-person is-parent">
                  <strong>{branch.parent.name}</strong>
                  <em>{branch.parent.note}</em>
                </span>

                <svg
                  aria-hidden="true"
                  className="orel-family-connectors"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 60"
                >
                  <path d={`M50 0 V28 M${left} 28 H${right}`} />
                  {childPositions.map((position) => (
                    <path d={`M${position} 28 V60`} key={position} />
                  ))}
                  <circle cx="50" cy="28" r="1.35" />
                </svg>

                <div className={`orel-family-children has-${childCount}-children`}>
                  {branch.children.map((child) => (
                    <span className="orel-family-person is-child" key={child.name}>
                      <strong>{child.name}</strong>
                      <em>{child.note}</em>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <p>{text.note}</p>
    </figure>
  );
}

export function KinshipDiagram({ id }: { id: string }) {
  if (id === "amphilochos") return <AmphilochosFamilyTree />;
  if (id === "orel-1594") return <Orel1594FamilyTree />;

  const text = kinshipCopy[getLocale()];
  const diagram = text.diagrams[id];
  if (!diagram) return null;

  return (
    <figure className="kinship-diagram">
      <figcaption>
        <span>{diagram.eyebrow}</span>
        <strong>{diagram.title}</strong>
      </figcaption>

      <div className="kinship-diagram-paths">
        {diagram.paths.map((path) => (
          <section
            className={`kinship-path${path.certainty === "probable" ? " is-probable" : ""}`}
            key={path.label}
          >
            <h3>{path.label}</h3>
            <ol aria-label={path.label}>
              {path.generations.map((generation, generationIndex) => (
                <li key={`${path.label}-${generationIndex}`}>
                  <small>{text.generation(generationIndex + 1)}</small>
                  <div>
                    {generation.map((person) => (
                      <span className="kinship-person" key={`${person.name}-${person.note ?? ""}`} tabIndex={0}>
                        <strong>{person.name}</strong>
                        {person.note ? <em>{person.note}</em> : null}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {diagram.note ? <p>{diagram.note}</p> : null}
    </figure>
  );
}
