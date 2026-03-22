import {
  createSolidDataset,
  createThing,
  getContainedResourceUrlAll,
  getDatetime,
  getInteger,
  getPodUrlAll,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  saveSolidDatasetAt,
  setDatetime,
  setInteger,
  setStringNoLocale,
  setThing,
  setUrl,
  type SolidDataset,
} from "@inrupt/solid-client";
import type { EntryOccurredAt, EntrySeason, CpdEntry } from "./entries";
import {
  CALIBRATE_NAMESPACE,
  DCTERMS_NAMESPACE,
  OWL_TIME_NAMESPACE,
  RDF_NAMESPACE,
} from "./entryRdf";

const ENTRY_CLASS = `${CALIBRATE_NAMESPACE}Entry`;
const OCCURRED_AT = `${CALIBRATE_NAMESPACE}occurredAt`;
const OCCURRED_AT_PRECISION = `${CALIBRATE_NAMESPACE}occurredAtPrecision`;
const OCCURRED_AT_DATE = `${CALIBRATE_NAMESPACE}occurredAtDate`;
const OCCURRED_AT_SEASON = `${CALIBRATE_NAMESPACE}season`;
const EVENTS_CONTAINER_PATH = "calibrate/events/";
const THING_ENTRY = "#entry";
const THING_OCCURRED_AT = "#occurredAt";

type SyncResult = {
  entries: CpdEntry[];
  containerUrl: string;
  syncedAt: string;
};

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function eventsContainerUrl(podUrl: string): string {
  return new URL(EVENTS_CONTAINER_PATH, ensureTrailingSlash(podUrl)).toString();
}

function entryResourceUrl(containerUrl: string, entryId: string): string {
  return new URL(`${entryId}.ttl`, containerUrl).toString();
}

function entryThingUrl(resourceUrl: string): string {
  return `${resourceUrl}${THING_ENTRY}`;
}

function occurredAtThingUrl(resourceUrl: string): string {
  return `${resourceUrl}${THING_OCCURRED_AT}`;
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as {
    statusCode?: number;
    response?: { status?: number };
    message?: string;
  };

  return (
    candidate.statusCode === 404 ||
    candidate.response?.status === 404 ||
    candidate.message?.includes("[404]") === true
  );
}

function compareEntriesNewestFirst(left: CpdEntry, right: CpdEntry): number {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function mergeEntries(localEntries: CpdEntry[], remoteEntries: CpdEntry[]): {
  mergedLocal: CpdEntry[];
  toUpload: CpdEntry[];
} {
  const remoteById = new Map(remoteEntries.map((entry) => [entry.id, entry]));
  const merged = new Map<string, CpdEntry>();
  const toUpload: CpdEntry[] = [];

  for (const localEntry of localEntries) {
    const remoteEntry = remoteById.get(localEntry.id);

    if (!remoteEntry) {
      merged.set(localEntry.id, localEntry);
      toUpload.push(localEntry);
      continue;
    }

    if (Date.parse(localEntry.updatedAt) >= Date.parse(remoteEntry.updatedAt)) {
      merged.set(localEntry.id, localEntry);

      if (Date.parse(localEntry.updatedAt) > Date.parse(remoteEntry.updatedAt)) {
        toUpload.push(localEntry);
      }
    } else {
      merged.set(remoteEntry.id, remoteEntry);
    }
  }

  for (const remoteEntry of remoteEntries) {
    if (!merged.has(remoteEntry.id)) {
      merged.set(remoteEntry.id, remoteEntry);
    }
  }

  return {
    mergedLocal: Array.from(merged.values()).sort(compareEntriesNewestFirst),
    toUpload,
  };
}

function buildOccurredAtThing(
  resourceUrl: string,
  occurredAt: EntryOccurredAt,
) {
  let thing = createThing({ url: occurredAtThingUrl(resourceUrl) });

  switch (occurredAt.precision) {
    case "exact-date":
      thing = setUrl(thing, `${RDF_NAMESPACE}type`, `${OWL_TIME_NAMESPACE}Instant`);
      thing = setStringNoLocale(thing, OCCURRED_AT_PRECISION, occurredAt.precision);
      thing = setStringNoLocale(thing, OCCURRED_AT_DATE, occurredAt.date);
      return thing;
    case "month":
      thing = setUrl(
        thing,
        `${RDF_NAMESPACE}type`,
        `${OWL_TIME_NAMESPACE}DateTimeDescription`,
      );
      thing = setStringNoLocale(thing, OCCURRED_AT_PRECISION, occurredAt.precision);
      thing = setInteger(thing, `${OWL_TIME_NAMESPACE}year`, occurredAt.year);
      thing = setInteger(thing, `${OWL_TIME_NAMESPACE}month`, occurredAt.month);
      return thing;
    case "season":
      thing = setUrl(
        thing,
        `${RDF_NAMESPACE}type`,
        `${OWL_TIME_NAMESPACE}DateTimeDescription`,
      );
      thing = setStringNoLocale(thing, OCCURRED_AT_PRECISION, occurredAt.precision);
      thing = setInteger(thing, `${OWL_TIME_NAMESPACE}year`, occurredAt.year);
      thing = setStringNoLocale(thing, OCCURRED_AT_SEASON, occurredAt.season);
      return thing;
    case "year":
      thing = setUrl(
        thing,
        `${RDF_NAMESPACE}type`,
        `${OWL_TIME_NAMESPACE}DateTimeDescription`,
      );
      thing = setStringNoLocale(thing, OCCURRED_AT_PRECISION, occurredAt.precision);
      thing = setInteger(thing, `${OWL_TIME_NAMESPACE}year`, occurredAt.year);
      return thing;
  }
}

function entryToSolidDataset(entry: CpdEntry, resourceUrl: string): SolidDataset {
  const occurredAtThing = buildOccurredAtThing(resourceUrl, entry.occurredAt);
  let entryThing = createThing({ url: entryThingUrl(resourceUrl) });

  entryThing = setUrl(entryThing, `${RDF_NAMESPACE}type`, ENTRY_CLASS);
  entryThing = setStringNoLocale(entryThing, `${DCTERMS_NAMESPACE}title`, entry.title);
  entryThing = setStringNoLocale(
    entryThing,
    `${DCTERMS_NAMESPACE}description`,
    entry.body,
  );
  entryThing = setDatetime(
    entryThing,
    `${DCTERMS_NAMESPACE}created`,
    new Date(entry.createdAt),
  );
  entryThing = setDatetime(
    entryThing,
    `${DCTERMS_NAMESPACE}modified`,
    new Date(entry.updatedAt),
  );
  entryThing = setUrl(entryThing, OCCURRED_AT, occurredAtThingUrl(resourceUrl));

  return setThing(setThing(createSolidDataset(), occurredAtThing), entryThing);
}

function parseSeason(value: string | null): EntrySeason | null {
  if (
    value === "spring" ||
    value === "summer" ||
    value === "autumn" ||
    value === "winter"
  ) {
    return value;
  }

  return null;
}

function solidDatasetToEntry(dataset: SolidDataset, resourceUrl: string): CpdEntry {
  const entryThing = getThing(dataset, entryThingUrl(resourceUrl));

  if (!entryThing) {
    throw new Error("The Solid resource does not contain an entry thing.");
  }

  const title = getStringNoLocale(entryThing, `${DCTERMS_NAMESPACE}title`);
  const body = getStringNoLocale(entryThing, `${DCTERMS_NAMESPACE}description`);
  const createdAt = getDatetime(entryThing, `${DCTERMS_NAMESPACE}created`);
  const updatedAt = getDatetime(entryThing, `${DCTERMS_NAMESPACE}modified`);
  const occurredAtThing = getThing(dataset, occurredAtThingUrl(resourceUrl));

  if (!title || !body || !createdAt || !updatedAt || !occurredAtThing) {
    throw new Error("The Solid resource is missing required entry fields.");
  }

  const precision = getStringNoLocale(occurredAtThing, OCCURRED_AT_PRECISION);

  if (precision === "exact-date") {
    const date = getStringNoLocale(occurredAtThing, OCCURRED_AT_DATE);

    if (!date) {
      throw new Error("The Solid resource is missing an exact date value.");
    }

    return {
      id: resourceUrl.split("/").pop()?.replace(/\.ttl$/, "") ?? resourceUrl,
      title,
      body,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      occurredAt: {
        precision: "exact-date",
        date,
      },
    };
  }

  const year = getInteger(occurredAtThing, `${OWL_TIME_NAMESPACE}year`);

  if (!year) {
    throw new Error("The Solid resource is missing an occurred-at year.");
  }

  if (precision === "month") {
    const month = getInteger(occurredAtThing, `${OWL_TIME_NAMESPACE}month`);

    if (!month) {
      throw new Error("The Solid resource is missing an occurred-at month.");
    }

    return {
      id: resourceUrl.split("/").pop()?.replace(/\.ttl$/, "") ?? resourceUrl,
      title,
      body,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      occurredAt: {
        precision: "month",
        year,
        month,
      },
    };
  }

  if (precision === "season") {
    const season = parseSeason(getStringNoLocale(occurredAtThing, OCCURRED_AT_SEASON));

    if (!season) {
      throw new Error("The Solid resource is missing an occurred-at season.");
    }

    return {
      id: resourceUrl.split("/").pop()?.replace(/\.ttl$/, "") ?? resourceUrl,
      title,
      body,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      occurredAt: {
        precision: "season",
        year,
        season,
      },
    };
  }

  return {
    id: resourceUrl.split("/").pop()?.replace(/\.ttl$/, "") ?? resourceUrl,
    title,
    body,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    occurredAt: {
      precision: "year",
      year,
    },
  };
}

async function loadRemoteEntries(
  containerUrl: string,
  fetchWithAuth: typeof fetch,
): Promise<CpdEntry[]> {
  try {
    const containerDataset = await getSolidDataset(containerUrl, { fetch: fetchWithAuth });
    const resourceUrls = getContainedResourceUrlAll(containerDataset).filter((url) =>
      url.endsWith(".ttl"),
    );
    const datasets = await Promise.all(
      resourceUrls.map((url) => getSolidDataset(url, { fetch: fetchWithAuth })),
    );

    return datasets.map((dataset, index) =>
      solidDatasetToEntry(dataset, resourceUrls[index]),
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return [];
    }

    throw error;
  }
}

async function saveRemoteEntry(
  entry: CpdEntry,
  containerUrl: string,
  fetchWithAuth: typeof fetch,
) {
  const resourceUrl = entryResourceUrl(containerUrl, entry.id);
  const dataset = entryToSolidDataset(entry, resourceUrl);
  await saveSolidDatasetAt(resourceUrl, dataset, { fetch: fetchWithAuth });
}

export async function resolvePodUrl(webId: string, fetchWithAuth: typeof fetch) {
  const podUrls = await getPodUrlAll(webId, { fetch: fetchWithAuth });

  if (podUrls.length === 0) {
    const webIdUrl = new URL(webId);
    const match = webIdUrl.pathname.match(/^\/([^/]+)\/profile\/card$/);

    if (match?.[1]) {
      return new URL(`/${match[1]}/`, webIdUrl.origin).toString();
    }

    throw new Error("No Solid Pod storage URL could be found for this account.");
  }

  return podUrls[0];
}

export async function syncEntriesWithPod(
  localEntries: CpdEntry[],
  podUrl: string,
  fetchWithAuth: typeof fetch,
): Promise<SyncResult> {
  const containerUrl = eventsContainerUrl(podUrl);
  const remoteEntries = await loadRemoteEntries(containerUrl, fetchWithAuth);
  const { mergedLocal, toUpload } = mergeEntries(localEntries, remoteEntries);

  await Promise.all(
    toUpload.map((entry) => saveRemoteEntry(entry, containerUrl, fetchWithAuth)),
  );

  return {
    entries: mergedLocal,
    containerUrl,
    syncedAt: new Date().toISOString(),
  };
}
