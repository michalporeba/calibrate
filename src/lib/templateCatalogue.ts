import YAML from "yaml";

export type CatalogueTemplateEntry = {
  id: string;
  source: string;
  entry: string;
  enabled: boolean;
  templatePath: string;
  sourceText?: string | null;
  metadata: {
    id: string;
    name: string;
    summary: string;
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

type OrderedMap<T> = Record<string, T>;

type TemplateDimensionDocument = {
  label?: string;
  options?: OrderedMap<{ label?: string }>;
};

type TemplateItemDocument = {
  label?: string;
  prompt?: string;
  guidance?: string | string[];
  indicators?: string | string[];
};

export type TemplateDocument = {
  id?: string;
  name?: string;
  summary?: string;
  description?: string;
  guidance?: string | string[];
  extends?: string;
  dimensions?: OrderedMap<TemplateDimensionDocument>;
  items?: OrderedMap<TemplateItemDocument>;
};

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
};

type ResolvedDimension = {
  id: string;
  label: string;
  optionCount: number;
};

type ResolvedItem = {
  id: string;
  label: string;
  prompt: string;
  guidance: string[];
  indicators: string[];
};

export type TemplateInspection = {
  entry: CatalogueTemplateEntry;
  document: TemplateDocument | null;
  issues: ValidationIssue[];
  inheritanceChain: string[];
  resolvedSummary: {
    id: string;
    name: string;
    summary: string;
    description: string;
    guidance: string[];
    dimensions: ResolvedDimension[];
    items: ResolvedItem[];
  } | null;
};

function assetPath(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");
}

function assetCandidates(path: string) {
  const candidates = [
    assetPath(path),
    `/${path}`.replace(/\/+/g, "/"),
    new URL(path, window.location.href).pathname,
  ];

  return Array.from(new Set(candidates));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringList(value: unknown) {
  if (typeof value === "string") {
    return isNonEmptyString(value) ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).map((entry) => entry.trim());
  }

  return [];
}

function isStringList(value: unknown) {
  return (
    value === undefined ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every((entry) => typeof entry === "string"))
  );
}

function parseTemplate(text: string) {
  return YAML.parse(text) as TemplateDocument;
}

async function loadTemplateText(path: string, inlineSource?: string | null) {
  if (isNonEmptyString(inlineSource)) {
    return inlineSource;
  }

  let lastStatus: number | null = null;

  for (const candidate of assetCandidates(path)) {
    const response = await fetch(candidate, { cache: "no-store" });

    if (!response.ok) {
      lastStatus = response.status;
      continue;
    }

    const text = await response.text();

    if (text.trim().startsWith("<")) {
      continue;
    }

    return text;
  }

  throw new Error(
    `Unable to load template source${lastStatus ? ` (${lastStatus})` : ""}.`,
  );
}

export async function loadCatalogue(profile: "me" | "gds" = __APP_THEME__) {
  const path = `generated/catalogues/${profile}.json`;
  let lastStatus: number | null = null;

  for (const candidate of assetCandidates(path)) {
    const response = await fetch(candidate, { cache: "no-store" });

    if (!response.ok) {
      lastStatus = response.status;
      continue;
    }

    const text = await response.text();

    try {
      return JSON.parse(text) as CatalogueManifest;
    } catch {
      if (text.trim().startsWith("<")) {
        continue;
      }
    }
  }

  throw new Error(
    `Catalogue could not be parsed from any expected path${lastStatus ? ` (${lastStatus})` : ""}.`,
  );
}

function orderedEntries<T>(value: OrderedMap<T> | undefined): Array<[string, T]> {
  return value ? Object.entries(value) : [];
}

function resolveDimensions(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  const ownDimensions = orderedEntries(document.dimensions);

  if (ownDimensions.length === 0) {
    return parent?.dimensions ?? [];
  }

  return ownDimensions.map(([dimensionId, dimension]) => ({
    id: dimensionId,
    label: isNonEmptyString(dimension?.label) ? dimension.label : "Unnamed dimension",
    optionCount: orderedEntries(dimension?.options).length,
  }));
}

function resolveItems(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  const childItems = orderedEntries(document.items);
  const parentItems = new Map((parent?.items ?? []).map((item) => [item.id, item]));

  if (parentItems.size > 0) {
    return Array.from(parentItems.values()).map((parentItem) => {
      const override = document.items?.[parentItem.id];

      return {
        id: parentItem.id,
        label: parentItem.label,
        prompt: parentItem.prompt,
        guidance:
          override && override.guidance !== undefined
            ? normalizeStringList(override.guidance)
            : parentItem.guidance,
        indicators:
          override && override.indicators !== undefined
            ? normalizeStringList(override.indicators)
            : parentItem.indicators,
      };
    });
  }

  return childItems.map(([itemId, item]) => ({
    id: itemId,
    label: isNonEmptyString(item?.label) ? item.label : "Unnamed item",
    prompt: isNonEmptyString(item?.prompt) ? item.prompt : "",
    guidance: normalizeStringList(item?.guidance),
    indicators: normalizeStringList(item?.indicators),
  }));
}

function shallowResolveTemplate(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  return {
    id: isNonEmptyString(document.id) ? document.id : parent?.id ?? "unknown",
    name: isNonEmptyString(document.name) ? document.name : parent?.name ?? "Untitled template",
    summary: isNonEmptyString(document.summary) ? document.summary : parent?.summary ?? "",
    description:
      isNonEmptyString(document.description) ? document.description : parent?.description ?? "",
    guidance:
      document.guidance !== undefined
        ? normalizeStringList(document.guidance)
        : parent?.guidance ?? [],
    dimensions: resolveDimensions(document, parent),
    items: resolveItems(document, parent),
  };
}

function validateDimensions(document: TemplateDocument) {
  const issues: ValidationIssue[] = [];

  if (document.dimensions === undefined) {
    return issues;
  }

  if (!isRecord(document.dimensions)) {
    issues.push({
      level: "error",
      message: "Dimensions must be a keyed map.",
    });
    return issues;
  }

  for (const [dimensionId, dimension] of orderedEntries(document.dimensions)) {
    if (!isRecord(dimension)) {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} must be an object.`,
      });
      continue;
    }

    if (!isNonEmptyString(dimension.label)) {
      issues.push({
        level: "warning",
        message: `Dimension ${dimensionId} is missing a label.`,
      });
    }

    if (dimension.options !== undefined && !isRecord(dimension.options)) {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} options must be a keyed map.`,
      });
      continue;
    }

    for (const [optionId, option] of orderedEntries(dimension.options)) {
      if (!isRecord(option)) {
        issues.push({
          level: "error",
          message: `Option ${dimensionId}.${optionId} must be an object.`,
        });
        continue;
      }

      if (!isNonEmptyString(option.label)) {
        issues.push({
          level: "warning",
          message: `Option ${dimensionId}.${optionId} is missing a label.`,
        });
      }
    }
  }

  return issues;
}

function validateItems(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  const issues: ValidationIssue[] = [];
  const hasParent = parent !== null;
  const parentItemIds = new Set((parent?.items ?? []).map((item) => item.id));

  if (document.items === undefined) {
    return issues;
  }

  if (!isRecord(document.items)) {
    issues.push({
      level: "error",
      message: "Items must be a keyed map.",
    });
    return issues;
  }

  for (const [itemId, item] of orderedEntries(document.items)) {
    if (!isRecord(item)) {
      issues.push({
        level: "error",
        message: `Item ${itemId} must be an object.`,
      });
      continue;
    }

    if (hasParent) {
      if (!parentItemIds.has(itemId)) {
        issues.push({
          level: "error",
          message: `Inherited template item override does not match a parent item: ${itemId}.`,
        });
      }

      if (item.label !== undefined || item.prompt !== undefined) {
        issues.push({
          level: "error",
          message: `Inherited item override ${itemId} may not redefine label or prompt.`,
        });
      }
    } else {
      if (!isNonEmptyString(item.label)) {
        issues.push({
          level: "warning",
          message: `Item ${itemId} is missing a label.`,
        });
      }

      if (!isNonEmptyString(item.prompt)) {
        issues.push({
          level: "warning",
          message: `Item ${itemId} is missing a prompt.`,
        });
      }
    }

    if (!isStringList(item.guidance)) {
      issues.push({
        level: "error",
        message: `Item ${itemId} guidance must be a string or a list of strings.`,
      });
    }

    if (!isStringList(item.indicators)) {
      issues.push({
        level: "error",
        message: `Item ${itemId} indicators must be a string or a list of strings.`,
      });
    }
  }

  return issues;
}

function validateTemplateDocument(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  const issues: ValidationIssue[] = [];

  if (!isNonEmptyString(document.id)) {
    issues.push({ level: "error", message: "Template id is missing." });
  }

  if (!isNonEmptyString(document.name)) {
    issues.push({ level: "error", message: "Template name is missing." });
  }

  if (!isNonEmptyString(document.summary)) {
    issues.push({ level: "warning", message: "Template summary is missing." });
  }

  if (!isStringList(document.guidance)) {
    issues.push({
      level: "error",
      message: "Template guidance must be a string or a list of strings.",
    });
  }

  issues.push(...validateDimensions(document));
  issues.push(...validateItems(document, parent));

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
    let parentInspection: TemplateInspection | null = null;

    if (!current.parseError && !current.syncError) {
      try {
        document = parseTemplate(await loadTemplateText(current.templatePath, current.sourceText));
      } catch (error) {
        issues.push({
          level: "error",
          message: error instanceof Error ? error.message : "Unable to parse template source.",
        });
      }
    }

    const parentId = isNonEmptyString(document?.extends) ? document.extends : null;

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

    if (document) {
      issues.push(...validateTemplateDocument(document, parentInspection?.resolvedSummary ?? null));
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
