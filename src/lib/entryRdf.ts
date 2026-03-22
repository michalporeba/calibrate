import type { CpdEntry } from "./entries";

export const CALIBRATE_NAMESPACE = "https://calibrate.example/ns#";
export const DCTERMS_NAMESPACE = "http://purl.org/dc/terms/";
export const OWL_TIME_NAMESPACE = "http://www.w3.org/2006/time#";
export const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#";

type RdfObject =
  | { type: "iri"; value: string }
  | { type: "literal"; value: string; datatype: string };

export type RdfTriple = {
  subject: string;
  predicate: string;
  object: RdfObject;
};

export type EntryRdfDocument = {
  subject: string;
  triples: RdfTriple[];
};

function iri(value: string): RdfObject {
  return { type: "iri", value };
}

function literal(value: string, datatype: string): RdfObject {
  return { type: "literal", value, datatype };
}

function entrySubject(entry: CpdEntry): string {
  return `urn:uuid:${entry.id}`;
}

function occurredAtNode(subject: string): string {
  return `${subject}#occurredAt`;
}

function addOccurredAtTriples(document: EntryRdfDocument, entry: CpdEntry) {
  const subject = document.subject;
  const node = occurredAtNode(subject);

  document.triples.push({
    subject,
    predicate: `${CALIBRATE_NAMESPACE}occurredAt`,
    object: iri(node),
  });

  switch (entry.occurredAt.precision) {
    case "exact-date":
      document.triples.push(
        {
          subject: node,
          predicate: `${RDF_NAMESPACE}type`,
          object: iri(`${OWL_TIME_NAMESPACE}Instant`),
        },
        {
          subject: node,
          predicate: `${OWL_TIME_NAMESPACE}inXSDDate`,
          object: literal(entry.occurredAt.date, `${XSD_NAMESPACE}date`),
        },
      );
      return;
    case "month":
      document.triples.push(
        {
          subject: node,
          predicate: `${RDF_NAMESPACE}type`,
          object: iri(`${OWL_TIME_NAMESPACE}DateTimeDescription`),
        },
        {
          subject: node,
          predicate: `${OWL_TIME_NAMESPACE}year`,
          object: literal(String(entry.occurredAt.year), `${XSD_NAMESPACE}gYear`),
        },
        {
          subject: node,
          predicate: `${OWL_TIME_NAMESPACE}month`,
          object: literal(`--${String(entry.occurredAt.month).padStart(2, "0")}`, `${XSD_NAMESPACE}gMonth`),
        },
      );
      return;
    case "season":
      document.triples.push(
        {
          subject: node,
          predicate: `${RDF_NAMESPACE}type`,
          object: iri(`${OWL_TIME_NAMESPACE}DateTimeDescription`),
        },
        {
          subject: node,
          predicate: `${OWL_TIME_NAMESPACE}year`,
          object: literal(String(entry.occurredAt.year), `${XSD_NAMESPACE}gYear`),
        },
        {
          subject: node,
          predicate: `${CALIBRATE_NAMESPACE}season`,
          object: literal(entry.occurredAt.season, `${XSD_NAMESPACE}string`),
        },
      );
      return;
    case "year":
      document.triples.push(
        {
          subject: node,
          predicate: `${RDF_NAMESPACE}type`,
          object: iri(`${OWL_TIME_NAMESPACE}DateTimeDescription`),
        },
        {
          subject: node,
          predicate: `${OWL_TIME_NAMESPACE}year`,
          object: literal(String(entry.occurredAt.year), `${XSD_NAMESPACE}gYear`),
        },
      );
  }
}

function literalValue(
  document: EntryRdfDocument,
  subject: string,
  predicate: string,
): string | null {
  const triple = document.triples.find(
    (candidate) =>
      candidate.subject === subject &&
      candidate.predicate === predicate &&
      candidate.object.type === "literal",
  );

  return triple?.object.value ?? null;
}

export function entryToRdfDocument(entry: CpdEntry): EntryRdfDocument {
  const subject = entrySubject(entry);
  const document: EntryRdfDocument = {
    subject,
    triples: [
      {
        subject,
        predicate: `${RDF_NAMESPACE}type`,
        object: iri(`${CALIBRATE_NAMESPACE}Entry`),
      },
      {
        subject,
        predicate: `${DCTERMS_NAMESPACE}title`,
        object: literal(entry.title, `${XSD_NAMESPACE}string`),
      },
      {
        subject,
        predicate: `${DCTERMS_NAMESPACE}description`,
        object: literal(entry.body, `${XSD_NAMESPACE}string`),
      },
      {
        subject,
        predicate: `${DCTERMS_NAMESPACE}created`,
        object: literal(entry.createdAt, `${XSD_NAMESPACE}dateTime`),
      },
      {
        subject,
        predicate: `${DCTERMS_NAMESPACE}modified`,
        object: literal(entry.updatedAt, `${XSD_NAMESPACE}dateTime`),
      },
    ],
  };

  addOccurredAtTriples(document, entry);
  return document;
}

export function rdfDocumentToEntry(document: EntryRdfDocument): CpdEntry {
  const subject = document.subject;
  const id = subject.startsWith("urn:uuid:") ? subject.slice("urn:uuid:".length) : subject;
  const title = literalValue(document, subject, `${DCTERMS_NAMESPACE}title`);
  const body = literalValue(document, subject, `${DCTERMS_NAMESPACE}description`);
  const createdAt = literalValue(document, subject, `${DCTERMS_NAMESPACE}created`);
  const updatedAt = literalValue(document, subject, `${DCTERMS_NAMESPACE}modified`);
  const occurredNode = occurredAtNode(subject);
  const exactDate = literalValue(document, occurredNode, `${OWL_TIME_NAMESPACE}inXSDDate`);
  const year = literalValue(document, occurredNode, `${OWL_TIME_NAMESPACE}year`);
  const month = literalValue(document, occurredNode, `${OWL_TIME_NAMESPACE}month`);
  const season = literalValue(document, occurredNode, `${CALIBRATE_NAMESPACE}season`);

  if (!title || !body || !createdAt || !updatedAt) {
    throw new Error("The RDF document does not contain the required entry fields.");
  }

  if (exactDate) {
    return {
      id,
      title,
      body,
      createdAt,
      updatedAt,
      occurredAt: {
        precision: "exact-date",
        date: exactDate,
      },
    };
  }

  if (!year) {
    throw new Error("The RDF document does not contain an occurred-at value.");
  }

  if (season) {
    if (season !== "spring" && season !== "summer" && season !== "autumn" && season !== "winter") {
      throw new Error("The RDF document contains an unknown entry season.");
    }

    return {
      id,
      title,
      body,
      createdAt,
      updatedAt,
      occurredAt: {
        precision: "season",
        year: Number(year),
        season,
      },
    };
  }

  if (month) {
    return {
      id,
      title,
      body,
      createdAt,
      updatedAt,
      occurredAt: {
        precision: "month",
        year: Number(year),
        month: Number(month.replace(/^--/, "")),
      },
    };
  }

  return {
    id,
    title,
    body,
    createdAt,
    updatedAt,
    occurredAt: {
      precision: "year",
      year: Number(year),
    },
  };
}
