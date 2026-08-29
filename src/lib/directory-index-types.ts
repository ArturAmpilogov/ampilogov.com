export type DirectoryIndexStats = {
  minYear: number;
  maxYear: number;
};

export type RecordDirectoryItem = {
  sourceId: string;
  eventType: string;
  eventLabel: string;
  date: string;
  year: number | null;
  place: string;
  primaryPerson: {
    name: string;
    alternateNames: string[];
  } | null;
  directoryFacts: Array<{ label: string; value: string }>;
  reviewState: "complete" | "human-review" | "source-needed";
  reviewLabel: string;
  reviewDescription: string;
  isComplete: boolean;
  searchText: string;
};

export type RecordDirectoryResult = Omit<RecordDirectoryItem, "searchText">;

export type RecordsDirectoryIndex = {
  schemaVersion: number;
  generatedAt: string;
  stats: DirectoryIndexStats & {
    records: number;
    complete: number;
    withImages: number;
  };
  records: RecordDirectoryItem[];
  appendices?: Record<string, {
    path: string;
    count: number;
    version: string;
  }>;
};

export type PeopleDirectoryRelation = {
  personId: string;
  name: string;
  relation: "parent" | "spouse" | "child" | "sibling" | "foster-parent" | "foster-child";
  sex: string;
};

export type PeopleDirectoryItem = {
  personId: string;
  displayName: string;
  sex: string;
  variants: string[];
  normalizedSurname: string;
  birthDate: string;
  birthYear: string;
  life: { birth: string; death: string; age: string };
  places: string[];
  needsReview: boolean;
  relations: PeopleDirectoryRelation[];
  sourceCount: number;
  sourceYears: number[];
  minYear: number | null;
  maxYear: number | null;
  searchText: string;
};

export type PeopleDirectoryResult = Omit<PeopleDirectoryItem, "searchText">;

export type PeopleDirectoryIndex = {
  schemaVersion: number;
  generatedAt: string;
  stats: DirectoryIndexStats & {
    people: number;
    families: number;
    sources: number;
    transcribedSources: number;
    places: number;
  };
  people: PeopleDirectoryItem[];
};

export type DirectoryPage<T> = {
  items: T[];
  total: number;
  nextCursor: string | null;
};
