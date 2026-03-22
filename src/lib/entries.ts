export type EntrySeason = "spring" | "summer" | "autumn" | "winter";

export type EntryOccurredAt =
  | {
      precision: "exact-date";
      date: string;
    }
  | {
      precision: "month";
      year: number;
      month: number;
    }
  | {
      precision: "season";
      year: number;
      season: EntrySeason;
    }
  | {
      precision: "year";
      year: number;
    };

export type CpdEntry = {
  id: string;
  title: string;
  body: string;
  occurredAt: EntryOccurredAt;
  createdAt: string;
  updatedAt: string;
};

export type CreateCpdEntryInput = {
  title: string;
  body: string;
  occurredAt: EntryOccurredAt;
};

const DATABASE_NAME = "calibrate";
const DATABASE_VERSION = 1;
const ENTRY_STORE = "entries";

let openDatabasePromise: Promise<IDBDatabase> | null = null;

function assertIndexedDbAvailable(): IDBFactory {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("This browser does not support local entry storage.");
  }

  return window.indexedDB;
}

function openDatabase(): Promise<IDBDatabase> {
  if (openDatabasePromise) {
    return openDatabasePromise;
  }

  openDatabasePromise = new Promise((resolve, reject) => {
    const indexedDb = assertIndexedDbAvailable();
    const request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(ENTRY_STORE)) {
        database.createObjectStore(ENTRY_STORE, { keyPath: "id" });
      }
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Unable to open the local entry store."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return openDatabasePromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return openDatabase().then((database) => {
    const transaction = database.transaction(ENTRY_STORE, mode);
    const store = transaction.objectStore(ENTRY_STORE);
    return run(store);
  });
}

function seasonSortMonth(season: EntrySeason): number {
  switch (season) {
    case "spring":
      return 5;
    case "summer":
      return 8;
    case "autumn":
      return 11;
    case "winter":
      return 12;
  }
}

function occurredAtSortTimestamp(occurredAt: EntryOccurredAt): number {
  switch (occurredAt.precision) {
    case "exact-date":
      return Date.parse(`${occurredAt.date}T00:00:00Z`);
    case "month":
      return Date.UTC(occurredAt.year, occurredAt.month, 0);
    case "season":
      return Date.UTC(occurredAt.year, seasonSortMonth(occurredAt.season), 0);
    case "year":
      return Date.UTC(occurredAt.year, 11, 31);
  }
}

function compareEntriesNewestFirst(left: CpdEntry, right: CpdEntry): number {
  const occurredDifference =
    occurredAtSortTimestamp(right.occurredAt) - occurredAtSortTimestamp(left.occurredAt);

  if (occurredDifference !== 0) {
    return occurredDifference;
  }

  return Date.parse(right.createdAt) - Date.parse(left.createdAt);
}

export function seasonLabel(season: EntrySeason): string {
  switch (season) {
    case "spring":
      return "Spring";
    case "summer":
      return "Summer";
    case "autumn":
      return "Autumn";
    case "winter":
      return "Winter";
  }
}

export function formatOccurredAt(occurredAt: EntryOccurredAt): string {
  switch (occurredAt.precision) {
    case "exact-date":
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${occurredAt.date}T00:00:00`));
    case "month":
      return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(new Date(Date.UTC(occurredAt.year, occurredAt.month - 1, 1)));
    case "season":
      return `${seasonLabel(occurredAt.season)} ${occurredAt.year}`;
    case "year":
      return String(occurredAt.year);
  }
}

export function describeOccurredAt(occurredAt: EntryOccurredAt): string {
  switch (occurredAt.precision) {
    case "exact-date":
      return `Recorded for ${formatOccurredAt(occurredAt)}`;
    case "month":
      return `Recorded for ${formatOccurredAt(occurredAt)}`;
    case "season":
      return `Recorded for ${formatOccurredAt(occurredAt)}`;
    case "year":
      return `Recorded for ${occurredAt.year}`;
  }
}

export function summariseBody(body: string, maxLength = 220): string {
  const singleLine = body.replace(/\s+/g, " ").trim();

  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function createEntry(input: CreateCpdEntryInput): Promise<CpdEntry> {
  const timestamp = new Date().toISOString();
  const entry: CpdEntry = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    body: input.body.trim(),
    occurredAt: input.occurredAt,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await withStore("readwrite", async (store) => {
    await requestToPromise(store.put(entry));
  });

  return entry;
}

export async function listEntries(): Promise<CpdEntry[]> {
  const entries = await withStore("readonly", async (store) => {
    return requestToPromise<CpdEntry[]>(store.getAll());
  });

  return entries.sort(compareEntriesNewestFirst);
}

export async function upsertEntries(entries: CpdEntry[]): Promise<void> {
  await withStore("readwrite", async (store) => {
    await Promise.all(entries.map((entry) => requestToPromise(store.put(entry))));
  });
}
