import YAML from "yaml";

export type CatalogueTemplateEntry = {
  id: string;
  source: string;
  entry: string;
  enabled: boolean;
  templatePath: string;
  metadata: {
    id: string;
    name: string;
    summary: string;
    kind: string;
    extends: string | null;
    dimensions: number;
    items: number;
  };
  parseError: string | null;
  syncError: string | null;
};

export type CatalogueManifest = {
  profile: string;
  templates: CatalogueTemplateEntry[];
};

export type TemplateDocument = {
  id?: string;
  name?: string;
  kind?: string;
  summary?: string;
  description?: string;
  extends?: string;
  dimensions?: Array<{
    id?: string;
    label?: string;
    options?: Array<{ id?: string; label?: string }>;
  }>;
  items?: Array<{
    id?: string;
    label?: string;
    prompt?: string;
  }>;
};

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
};

export type TemplateInspection = {
  entry: CatalogueTemplateEntry;
  document: TemplateDocument | null;
  issues: ValidationIssue[];
  inheritanceChain: string[];
  resolvedSummary: {
    id: string;
    name: string;
    kind: string;
    summary: string;
    dimensions: Array<{ id: string; label: string; optionCount: number }>;
    items: Array<{ id: string; label: string; prompt: string }>;
  } | null;
};

function assetPath(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseTemplate(text: string) {
  return YAML.parse(text) as TemplateDocument;
}

async function loadTemplateText(path: string) {
  const response = await fetch(assetPath(path));

  if (!response.ok) {
    throw new Error(`Unable to load template source (${response.status}).`);
  }

  return response.text();
}

export async function loadCatalogue(profile: "me" | "gds" = __APP_THEME__) {
  const requestPath = assetPath(`generated/catalogues/${profile}.json`);
  const response = await fetch(requestPath);

  if (!response.ok) {
    throw new Error(`Unable to load catalogue (${response.status}).`);
  }

  const text = await response.text();

  try {
    return JSON.parse(text) as CatalogueManifest;
  } catch {
    throw new Error(`Catalogue could not be parsed from ${requestPath}.`);
  }
}

function shallowResolveTemplate(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  return {
    id: isNonEmptyString(document.id) ? document.id : parent?.id ?? "unknown",
    name: isNonEmptyString(document.name) ? document.name : parent?.name ?? "Untitled template",
    kind: isNonEmptyString(document.kind) ? document.kind : parent?.kind ?? "unknown",
    summary: isNonEmptyString(document.summary) ? document.summary : parent?.summary ?? "",
    dimensions:
      Array.isArray(document.dimensions) && document.dimensions.length > 0
        ? document.dimensions.map((dimension) => ({
            id: isNonEmptyString(dimension?.id) ? dimension.id : "unknown-dimension",
            label: isNonEmptyString(dimension?.label) ? dimension.label : "Unnamed dimension",
            optionCount: Array.isArray(dimension?.options) ? dimension.options.length : 0,
          }))
        : parent?.dimensions ?? [],
    items:
      Array.isArray(document.items) && document.items.length > 0
        ? document.items.map((item) => ({
            id: isNonEmptyString(item?.id) ? item.id : "unknown-item",
            label: isNonEmptyString(item?.label) ? item.label : "Unnamed item",
            prompt: isNonEmptyString(item?.prompt) ? item.prompt : "",
          }))
        : parent?.items ?? [],
  };
}

function validateTemplateDocument(document: TemplateDocument) {
  const issues: ValidationIssue[] = [];

  if (!isNonEmptyString(document.id)) {
    issues.push({ level: "error", message: "Template id is missing." });
  }

  if (!isNonEmptyString(document.name)) {
    issues.push({ level: "error", message: "Template name is missing." });
  }

  if (!isNonEmptyString(document.kind)) {
    issues.push({ level: "warning", message: "Template kind is missing." });
  }

  if (!isNonEmptyString(document.summary)) {
    issues.push({ level: "warning", message: "Template summary is missing." });
  }

  if (Array.isArray(document.dimensions)) {
    const seenDimensionIds = new Set<string>();

    for (const dimension of document.dimensions) {
      if (!isNonEmptyString(dimension?.id)) {
        issues.push({ level: "error", message: "A dimension is missing an id." });
        continue;
      }

      if (seenDimensionIds.has(dimension.id)) {
        issues.push({
          level: "error",
          message: `Duplicate dimension id: ${dimension.id}.`,
        });
      }

      seenDimensionIds.add(dimension.id);

      if (!isNonEmptyString(dimension.label)) {
        issues.push({
          level: "warning",
          message: `Dimension ${dimension.id} is missing a label.`,
        });
      }
    }
  }

  if (Array.isArray(document.items)) {
    const seenItemIds = new Set<string>();

    for (const item of document.items) {
      if (!isNonEmptyString(item?.id)) {
        issues.push({ level: "error", message: "An item is missing an id." });
        continue;
      }

      if (seenItemIds.has(item.id)) {
        issues.push({
          level: "error",
          message: `Duplicate item id: ${item.id}.`,
        });
      }

      seenItemIds.add(item.id);

      if (!isNonEmptyString(item.label)) {
        issues.push({
          level: "warning",
          message: `Item ${item.id} is missing a label.`,
        });
      }

      if (!isNonEmptyString(item.prompt)) {
        issues.push({
          level: "warning",
          message: `Item ${item.id} is missing a prompt.`,
        });
      }
    }
  }

  return issues;
}

export async function inspectTemplate(
  entry: CatalogueTemplateEntry,
  manifest: CatalogueManifest,
) {
  const seen = new Set<string>();

  const visit = async (current: CatalogueTemplateEntry): Promise<TemplateInspection> => {
    const issues: ValidationIssue[] = [];

    if (current.syncError) {
      issues.push({ level: "error", message: current.syncError });
    }

    if (current.parseError) {
      issues.push({ level: "error", message: current.parseError });
    }

    if (seen.has(current.id)) {
      issues.push({
        level: "error",
        message: `Circular inheritance detected at ${current.id}.`,
      });

      return {
        entry: current,
        document: null,
        issues,
        inheritanceChain: [current.id],
        resolvedSummary: null,
      };
    }

    seen.add(current.id);

    let document: TemplateDocument | null = null;

    if (!current.parseError && !current.syncError) {
      try {
        document = parseTemplate(await loadTemplateText(current.templatePath));
        issues.push(...validateTemplateDocument(document));
      } catch (error) {
        issues.push({
          level: "error",
          message: error instanceof Error ? error.message : "Unable to parse template source.",
        });
      }
    }

    const parentId = isNonEmptyString(document?.extends) ? document.extends : null;
    let parentInspection: TemplateInspection | null = null;

    if (parentId) {
      const parentEntry = manifest.templates.find((candidate) => candidate.id === parentId);

      if (!parentEntry) {
        issues.push({
          level: "error",
          message: `Parent template not found: ${parentId}.`,
        });
      } else {
        parentInspection = await visit(parentEntry);
      }
    }

    return {
      entry: current,
      document,
      issues: [...(parentInspection?.issues ?? []), ...issues],
      inheritanceChain: [...(parentInspection?.inheritanceChain ?? []), current.id],
      resolvedSummary:
        document === null
          ? parentInspection?.resolvedSummary ?? null
          : shallowResolveTemplate(document, parentInspection?.resolvedSummary ?? null),
    };
  };

  return visit(entry);
}
