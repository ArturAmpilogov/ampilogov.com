type RecordIconKind =
  | "birth"
  | "marriage"
  | "death"
  | "service"
  | "oath"
  | "land"
  | "household"
  | "trade"
  | "court"
  | "document";

const recordIconKinds: Record<string, RecordIconKind> = {
  birth: "birth",
  "birth-and-baptism": "birth",
  "birth-index-image-mismatch": "birth",
  baptism: "birth",
  "civil-birth": "birth",
  marriage: "marriage",
  "civil-marriage": "marriage",
  "marriage-duplicate-image": "marriage",
  death: "death",
  "death-and-burial": "death",
  "service-review": "service",
  "military-review-list": "service",
  "service-list": "service",
  "service-enrollment": "service",
  "military-roster": "service",
  "service-oath": "oath",
  "oath-of-allegiance": "oath",
  "land-survey": "land",
  "land-assessment-list": "land",
  "land-refusal-record": "land",
  "estate-listing": "land",
  "yard-and-garden-allocation": "land",
  "resettlement-and-land-allocation": "land",
  "census-household": "household",
  "permanent-settlement-list": "household",
  "horse-sale-registration": "trade",
  "witness-testimony": "court",
  interrogation: "court",
  confrontation: "court",
  "court-sentence": "court",
  "negative-finding": "document",
};

function IconDrawing({ kind }: { kind: RecordIconKind }) {
  switch (kind) {
    case "birth":
      return (
        <>
          <path d="M12 21V10" />
          <path d="M12 14c-4.4 0-7-2.7-7-6.8 4.4 0 7 2.4 7 6.8Z" />
          <path d="M12 11.8c4.4 0 7-2.5 7-6.8-4.4 0-7 2.6-7 6.8Z" />
        </>
      );
    case "marriage":
      return (
        <>
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </>
      );
    case "death":
      return (
        <>
          <path d="M6.5 21V10.5a5.5 5.5 0 0 1 11 0V21" />
          <path d="M4.5 21h15" />
          <path d="M12 8v7M9.5 10.5h5" />
        </>
      );
    case "service":
      return (
        <>
          <path d="M12 3 19 6v5.2c0 4.5-2.7 7.8-7 9.8-4.3-2-7-5.3-7-9.8V6l7-3Z" />
          <path d="m9 10 3 3 3-3" />
        </>
      );
    case "oath":
      return (
        <>
          <path d="M7 3.5h8l3 3V20.5H7Z" />
          <path d="M15 3.5v3h3M9.5 10.5h6M12.5 8v5" />
          <circle cx="12.5" cy="16.5" r="2" />
        </>
      );
    case "land":
      return (
        <>
          <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2Z" />
          <path d="M9 4v14M15 6v14" />
          <circle cx="12" cy="11" r="1.5" />
        </>
      );
    case "household":
      return (
        <>
          <path d="m4 11 8-7 8 7" />
          <path d="M6.5 9.5V20h11V9.5" />
          <circle cx="12" cy="12.5" r="2" />
          <path d="M8.8 19c.3-2.4 1.3-3.6 3.2-3.6s2.9 1.2 3.2 3.6" />
        </>
      );
    case "trade":
      return (
        <>
          <path d="M4 5h9l7 7-8 8-8-8Z" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m13 9 3 3-4 4" />
        </>
      );
    case "court":
      return (
        <>
          <path d="M12 4v16M7 20h10M6 7h12" />
          <path d="m6 7-3 6h6L6 7Zm12 0-3 6h6l-3-6Z" />
          <path d="M3 13c.5 1.5 1.5 2.2 3 2.2s2.5-.7 3-2.2M15 13c.5 1.5 1.5 2.2 3 2.2s2.5-.7 3-2.2" />
        </>
      );
    default:
      return (
        <>
          <path d="M6.5 3.5h8l3 3v14h-11Z" />
          <path d="M14.5 3.5v3h3M9 11h6M9 15h6" />
        </>
      );
  }
}

export function RecordTypeIcon({ eventType }: { eventType: string }) {
  const kind = recordIconKinds[eventType] ?? "document";

  return (
    <svg
      aria-hidden="true"
      className={`record-type-icon is-${kind}`}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <IconDrawing kind={kind} />
    </svg>
  );
}
