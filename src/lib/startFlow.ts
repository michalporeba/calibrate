import YAML from "yaml";
import {
  loadCatalogue,
  type CatalogueManifest,
  type CatalogueTemplateEntry,
} from "./templateCatalogue";

type OrderedMap<T> = Record<string, T>;

type SourceDirectoryDocument = {
  type?: string;
  path?: string;
};

type TemplateDimensionOptionDocument = {
  label?: string;
  summary?: string;
  description?: string;
  grade?: string;
  items?: string[] | OrderedMap<string>;
};

type TemplateDimensionDocument = {
  label?: string;
  prompt?: string;
  options?: OrderedMap<TemplateDimensionOptionDocument>;
  source?: SourceDirectoryDocument;
};

type TemplateItemDocument = {
  label?: string;
  summary?: string;
  description?: string;
  prompt?: string;
  guidance?: string | string[];
  indicators?: string | string[];
  variants?: OrderedMap<Partial<Omit<TemplateItemDocument, "variants">>>;
};

type TemplateItemsDocument = OrderedMap<TemplateItemDocument> & {
  source?: SourceDirectoryDocument;
};

type RoleDocument = {
  id?: string;
  label?: string;
  families?: string | string[];
  summary?: string;
  description?: string;
  dimensions?: OrderedMap<TemplateDimensionDocument>;
};

type SkillDocument = {
  id?: string;
  label?: string;
  summary?: string;
  description?: string;
  guidance?: string | string[];
  prompt?: string;
  indicators?: string | string[];
  variants?: OrderedMap<Partial<Omit<TemplateItemDocument, "variants">>>;
};

type TemplateDocument = {
  id?: string;
  name?: string;
  summary?: string;
  description?: string;
  guidance?: string | string[];
  dimensions?: OrderedMap<TemplateDimensionDocument>;
  items?: TemplateItemsDocument;
};

export type StartTemplateCard = {
  id: string;
  name: string;
  summary: string;
  description: string;
  needsConfiguration: boolean;
};

export type StartFlowSelectionMap = Record<string, string>;

export type StartFlowDimension = {
  id: string;
  label: string;
  prompt: string;
};

export type StartFlowOption = {
  id: string;
  label: string;
  summary: string;
  description: string;
};

export type StartFlowPreviewItem = {
  id: string;
  label: string;
  variant: string | null;
};

export type StartFlowPreview = {
  itemCount: number;
  items: StartFlowPreviewItem[];
};

export type StartTemplateData = {
  entry: CatalogueTemplateEntry;
  document: TemplateDocument;
  name: string;
  summary: string;
  description: string;
  guidance: string[];
  setupDimensions: StartFlowDimension[];
};

function parseYamlDocument<T>(text: string) {
  return YAML.parse(text) as T;
}

function orderedEntries<T>(value: OrderedMap<T> | undefined): Array<[string, T]> {
  return value ? Object.entries(value) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

function normalizeIdList(value: unknown) {
  return normalizeStringList(value);
}

function isItemCollectionList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isItemCollectionMap(value: unknown): value is OrderedMap<string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function getDirectorySource(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const source = value.source;

  if (!isRecord(source)) {
    return null;
  }

  return {
    type: isNonEmptyString(source.type) ? source.type : "directory",
    path: isNonEmptyString(source.path) ? source.path : null,
  };
}

function collectRelatedDocuments(
  entry: CatalogueTemplateEntry,
  directoryPath: string | null,
) {
  if (!isNonEmptyString(directoryPath) || !entry.files) {
    return [];
  }

  const prefix = `${directoryPath.replace(/\/+$/, "")}/`;

  return Object.entries(entry.files)
    .filter(([relativePath]) => relativePath.startsWith(prefix) && /\.ya?ml$/i.test(relativePath))
    .map(([path, sourceText]) => ({ path, sourceText }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function parseTemplate(entry: CatalogueTemplateEntry) {
  if (!entry.sourceText) {
    throw new Error(`Template source is not available for ${entry.id}.`);
  }

  return parseYamlDocument<TemplateDocument>(entry.sourceText);
}

function parseRoles(entry: CatalogueTemplateEntry, document: TemplateDocument) {
  const source = getDirectorySource(document.dimensions?.role);
  const files = collectRelatedDocuments(entry, source?.path ?? null);
  const roles = files
    .map((file) => parseYamlDocument<RoleDocument>(file.sourceText))
    .filter((role) => isNonEmptyString(role.id));

  return new Map(roles.map((role) => [role.id!, role]));
}

function parseSkills(entry: CatalogueTemplateEntry, document: TemplateDocument) {
  const source = getDirectorySource(document.items);
  const files = collectRelatedDocuments(entry, source?.path ?? null);
  const skills = files
    .map((file) => parseYamlDocument<SkillDocument>(file.sourceText))
    .filter((skill) => isNonEmptyString(skill.id));

  return new Map(skills.map((skill) => [skill.id!, skill]));
}

function getSetupDimensions(document: TemplateDocument) {
  return orderedEntries(document.dimensions)
    .filter(([, dimension]) => isNonEmptyString(dimension.prompt))
    .map(([dimensionId, dimension]) => ({
      id: dimensionId,
      label: isNonEmptyString(dimension.label) ? dimension.label : dimensionId,
      prompt: dimension.prompt!.trim(),
    }));
}

function getRoleLevelOptions(role: RoleDocument | undefined) {
  return role?.dimensions?.["role-level"]?.options;
}

function getSelectedRole(
  roles: Map<string, RoleDocument>,
  selections: StartFlowSelectionMap,
) {
  const selectedRoleId = selections.role;
  return selectedRoleId ? roles.get(selectedRoleId) : undefined;
}

function getOptionSummary(option: TemplateDimensionOptionDocument | undefined) {
  return isNonEmptyString(option?.summary) ? option.summary : "";
}

function getOptionDescription(option: TemplateDimensionOptionDocument | undefined) {
  return isNonEmptyString(option?.description) ? option.description : "";
}

export async function loadStartTemplates() {
  const manifest = await loadCatalogue();

  return manifest.templates
    .filter((entry) => entry.enabled)
    .map((entry) => {
      const document = parseTemplate(entry);
      return {
        id: entry.id,
        name: isNonEmptyString(document.name) ? document.name : entry.metadata.name,
        summary: isNonEmptyString(document.summary) ? document.summary : entry.metadata.summary,
        description: isNonEmptyString(document.description) ? document.description : "",
        needsConfiguration: getSetupDimensions(document).length > 0,
      } satisfies StartTemplateCard;
    });
}

export async function loadStartTemplate(templateId: string) {
  const manifest = await loadCatalogue();
  const entry = manifest.templates.find((candidate) => candidate.id === templateId && candidate.enabled);

  if (!entry) {
    throw new Error(`Template not found: ${templateId}.`);
  }

  const document = parseTemplate(entry);

  return {
    entry,
    document,
    name: isNonEmptyString(document.name) ? document.name : entry.metadata.name,
    summary: isNonEmptyString(document.summary) ? document.summary : entry.metadata.summary,
    description: isNonEmptyString(document.description) ? document.description : "",
    guidance: normalizeStringList(document.guidance),
    setupDimensions: getSetupDimensions(document),
  } satisfies StartTemplateData;
}

export function getStepIndex(
  template: StartTemplateData,
  dimensionId: string,
) {
  return template.setupDimensions.findIndex((dimension) => dimension.id === dimensionId);
}

export function getFirstMissingDimension(
  template: StartTemplateData,
  selections: StartFlowSelectionMap,
) {
  return template.setupDimensions.find((dimension) => !selections[dimension.id]) ?? null;
}

export function getDimensionOptions(
  template: StartTemplateData,
  dimensionId: string,
  selections: StartFlowSelectionMap,
) {
  const roles = parseRoles(template.entry, template.document);
  const dimension = template.document.dimensions?.[dimensionId];

  if (!dimension) {
    return [] satisfies StartFlowOption[];
  }

  if (dimension.options) {
    return orderedEntries(dimension.options).map(([optionId, option]) => ({
      id: optionId,
      label: isNonEmptyString(option.label) ? option.label : optionId,
      summary: getOptionSummary(option),
      description: getOptionDescription(option),
    }));
  }

  const source = getDirectorySource(dimension);

  if (source?.path && dimensionId === "role") {
    const selectedFamily = selections["role-family"];

    return Array.from(roles.values())
      .filter((role) => {
        if (!selectedFamily) {
          return true;
        }

        return normalizeIdList(role.families).includes(selectedFamily);
      })
      .map((role) => ({
        id: role.id!,
        label: isNonEmptyString(role.label) ? role.label : role.id!,
        summary: isNonEmptyString(role.summary) ? role.summary : "",
        description: isNonEmptyString(role.description) ? role.description : "",
      }));
  }

  const selectedRole = getSelectedRole(roles, selections);
  const dependentOptions = getRoleLevelOptions(selectedRole);

  if (dependentOptions) {
    return orderedEntries(dependentOptions).map(([optionId, option]) => ({
      id: optionId,
      label: isNonEmptyString(option.label) ? option.label : optionId,
      summary: getOptionSummary(option),
      description: getOptionDescription(option),
    }));
  }

  return [] satisfies StartFlowOption[];
}

function collectSelectedItems(
  template: StartTemplateData,
  selections: StartFlowSelectionMap,
) {
  const roles = parseRoles(template.entry, template.document);
  const selectedItems = new Map<string, string | null>();

  for (const dimension of template.setupDimensions) {
    const selectedOptionId = selections[dimension.id];

    if (!selectedOptionId) {
      continue;
    }

    let option: TemplateDimensionOptionDocument | undefined;
    const dimensionDocument = template.document.dimensions?.[dimension.id];

    if (dimensionDocument?.options?.[selectedOptionId]) {
      option = dimensionDocument.options[selectedOptionId];
    } else if (dimension.id === "role-level") {
      option = getRoleLevelOptions(getSelectedRole(roles, selections))?.[selectedOptionId];
    }

    const items = option?.items;

    if (isItemCollectionList(items)) {
      for (const itemId of items) {
        if (!selectedItems.has(itemId)) {
          selectedItems.set(itemId, null);
        }
      }
    }

    if (isItemCollectionMap(items)) {
      for (const [itemId, variantId] of orderedEntries(items)) {
        selectedItems.set(itemId, variantId);
      }
    }
  }

  if (selectedItems.size === 0 && isRecord(template.document.items)) {
    for (const [itemId] of Object.entries(template.document.items).filter(([key]) => key !== "source")) {
      selectedItems.set(itemId, null);
    }
  }

  return selectedItems;
}

export function buildResolvedPreview(
  template: StartTemplateData,
  selections: StartFlowSelectionMap,
) {
  const skills = parseSkills(template.entry, template.document);
  const inlineItems = isRecord(template.document.items)
    ? Object.fromEntries(
        Object.entries(template.document.items).filter(([key]) => key !== "source"),
      ) as OrderedMap<TemplateItemDocument>
    : {};
  const selectedItems = collectSelectedItems(template, selections);

  const items = Array.from(selectedItems.entries()).map(([itemId, variantId]) => {
    const skill = skills.get(itemId);
    const inlineItem = inlineItems[itemId];
    const variant = variantId && skill?.variants?.[variantId] ? skill.variants[variantId] : null;
    const label =
      (variant && isNonEmptyString(variant.label) && variant.label) ||
      (skill && isNonEmptyString(skill.label) && skill.label) ||
      (inlineItem && isNonEmptyString(inlineItem.label) && inlineItem.label) ||
      itemId;

    return {
      id: itemId,
      label,
      variant: variantId,
    } satisfies StartFlowPreviewItem;
  });

  return {
    itemCount: items.length,
    items: items.slice(0, 5),
  } satisfies StartFlowPreview;
}

export function serializeSelections(selections: StartFlowSelectionMap) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(selections)) {
    if (value) {
      search.set(key, value);
    }
  }

  return search;
}

export function readSelections(search: URLSearchParams) {
  return Object.fromEntries(search.entries()) as StartFlowSelectionMap;
}
