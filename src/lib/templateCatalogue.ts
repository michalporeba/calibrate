import YAML from "yaml";

export type CatalogueTemplateEntry = {
  id: string;
  source: string;
  entry: string;
  enabled: boolean;
  templatePath: string;
  sourceText?: string | null;
  files?: Record<string, string>;
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

export type TemplateDocument = {
  id?: string;
  name?: string;
  summary?: string;
  description?: string;
  guidance?: string | string[];
  extends?: string;
  dimensions?: OrderedMap<TemplateDimensionDocument>;
  items?: TemplateItemsDocument;
};

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
};

type ResolvedDimension = {
  id: string;
  label: string;
  prompt: string;
  optionCount: number;
  sourcePath: string | null;
};

type ResolvedItem = {
  id: string;
  label: string;
  prompt: string;
  guidance: string[];
  indicators: string[];
};

type ExternalRoleLevelSummary = {
  id: string;
  label: string;
  grade: string;
  itemCount: number;
  items: Array<{
    id: string;
    variant: string | null;
  }>;
};

type ExternalRoleSummary = {
  id: string;
  label: string;
  families: string[];
  roleLevels: ExternalRoleLevelSummary[];
};

type ExternalSkillSummary = {
  id: string;
  label: string;
  summary: string;
  variantCount: number;
  variants: string[];
};

type TemplateStructureSummary = {
  rolesPath: string | null;
  roles: ExternalRoleSummary[];
  skillsPath: string | null;
  skills: ExternalSkillSummary[];
};

export type TemplateInspection = {
  entry: CatalogueTemplateEntry;
  document: TemplateDocument | null;
  issues: ValidationIssue[];
  inheritanceChain: string[];
  structureSummary: TemplateStructureSummary;
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

function normalizeIdList(value: unknown) {
  return normalizeStringList(value);
}

function isStringList(value: unknown) {
  return (
    value === undefined ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every((entry) => typeof entry === "string"))
  );
}

function isStringMap(value: unknown): value is OrderedMap<string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function isItemCollectionList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isItemCollectionMap(value: unknown): value is OrderedMap<string> {
  return isStringMap(value);
}

function getOptionItems(option: TemplateDimensionOptionDocument | undefined) {
  return option?.items;
}

function countOptionItems(option: TemplateDimensionOptionDocument | undefined) {
  const items = getOptionItems(option);

  if (isItemCollectionList(items)) {
    return items.length;
  }

  if (isItemCollectionMap(items)) {
    return Object.keys(items).length;
  }

  return 0;
}

function parseYamlDocument<T>(text: string) {
  return YAML.parse(text) as T;
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

function getInlineItems(document: TemplateDocument) {
  if (!isRecord(document.items)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(document.items).filter(([key]) => key !== "source"),
  ) as OrderedMap<TemplateItemDocument>;
}

function getItemSource(document: TemplateDocument) {
  return getDirectorySource(document.items);
}

function getRoleLevelOptions(role: RoleDocument) {
  return role.dimensions?.["role-level"]?.options;
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
    .map(([relativePath, sourceText]) => ({
      path: relativePath,
      sourceText,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function countRoleLevelOptions(structureSummary: TemplateStructureSummary) {
  return structureSummary.roles.reduce((count, role) => count + role.roleLevels.length, 0);
}

function resolveDimensions(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
  structureSummary: TemplateStructureSummary,
) {
  const ownDimensions = orderedEntries(document.dimensions);

  if (ownDimensions.length === 0) {
    return parent?.dimensions ?? [];
  }

  return ownDimensions.map(([dimensionId, dimension]) => {
    const source = getDirectorySource(dimension);
    const optionCount =
      source?.path && dimensionId === "role"
        ? structureSummary.roles.length
        : dimensionId === "role-level"
          ? countRoleLevelOptions(structureSummary)
        : orderedEntries(dimension?.options).length;

    return {
      id: dimensionId,
      label: isNonEmptyString(dimension?.label) ? dimension.label : "Unnamed dimension",
      prompt: isNonEmptyString(dimension?.prompt) ? dimension.prompt : "",
      optionCount,
      sourcePath: source?.path ?? null,
    };
  });
}

function resolveItems(
  document: TemplateDocument,
  parent: TemplateInspection["resolvedSummary"],
) {
  const inlineItems = orderedEntries(getInlineItems(document));
  const parentItems = new Map((parent?.items ?? []).map((item) => [item.id, item]));

  if (parentItems.size > 0) {
    return Array.from(parentItems.values()).map((parentItem) => {
      const override = getInlineItems(document)?.[parentItem.id];

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

  return inlineItems.map(([itemId, item]) => ({
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
  structureSummary: TemplateStructureSummary,
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
    dimensions: resolveDimensions(document, parent, structureSummary),
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

    if (dimension.prompt !== undefined && !isNonEmptyString(dimension.prompt)) {
      issues.push({
        level: "warning",
        message: `Dimension ${dimensionId} prompt is empty.`,
      });
    }

    const source = getDirectorySource(dimension);

    if (source && source.type !== "directory") {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} source type must be directory.`,
      });
    }

    if (source && !source.path) {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} source is missing a path.`,
      });
    }

    if (dimension.options !== undefined && !isRecord(dimension.options)) {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} options must be a keyed map.`,
      });
      continue;
    }

    if (source && orderedEntries(dimension.options).length > 0) {
      issues.push({
        level: "error",
        message: `Dimension ${dimensionId} may not define inline options and a source at the same time.`,
      });
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

      const items = getOptionItems(option);

      if (
        items !== undefined &&
        !isItemCollectionList(items) &&
        !isItemCollectionMap(items)
      ) {
        issues.push({
          level: "error",
          message: `Option ${dimensionId}.${optionId} items must be a list of item ids or a keyed map of item ids to variant ids.`,
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
  const source = getItemSource(document);
  const inlineItems = getInlineItems(document);

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

  if (source && source.type !== "directory") {
    issues.push({
      level: "error",
      message: "Item source type must be directory.",
    });
  }

  if (source && !source.path) {
    issues.push({
      level: "error",
      message: "Item source is missing a path.",
    });
  }

  if (source && orderedEntries(inlineItems).length > 0) {
    issues.push({
      level: "error",
      message: "Items may not define inline entries and a source at the same time.",
    });
  }

  for (const [itemId, item] of orderedEntries(inlineItems)) {
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

    if (item.variants !== undefined && !isRecord(item.variants)) {
      issues.push({
        level: "error",
        message: `Item ${itemId} variants must be a keyed map.`,
      });
      continue;
    }

    for (const [variantId, variant] of orderedEntries(item.variants)) {
      if (!isRecord(variant)) {
        issues.push({
          level: "error",
          message: `Item ${itemId} variant ${variantId} must be an object.`,
        });
        continue;
      }

      if (
        variant.guidance !== undefined &&
        !isStringList(variant.guidance)
      ) {
        issues.push({
          level: "error",
          message: `Item ${itemId} variant ${variantId} guidance must be a string or a list of strings.`,
        });
      }

      if (
        variant.indicators !== undefined &&
        !isStringList(variant.indicators)
      ) {
        issues.push({
          level: "error",
          message: `Item ${itemId} variant ${variantId} indicators must be a string or a list of strings.`,
        });
      }
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

function validateRoleDocument(role: RoleDocument, document: TemplateDocument) {
  const issues: ValidationIssue[] = [];
  const familyIds = new Set(
    orderedEntries(document.dimensions?.["role-family"]?.options).map(([familyId]) => familyId),
  );
  const gradeIds = new Set(orderedEntries(document.dimensions?.grade?.options).map(([id]) => id));

  if (!isNonEmptyString(role.id)) {
    issues.push({ level: "error", message: "Role file is missing an id." });
  }

  if (!isNonEmptyString(role.label)) {
    issues.push({
      level: "warning",
      message: `Role ${role.id ?? "unknown"} is missing a label.`,
    });
  }

  const families = normalizeIdList(role.families);

  if (families.length === 0) {
    issues.push({
      level: "error",
      message: `Role ${role.id ?? "unknown"} must define at least one family.`,
    });
  }

  for (const familyId of families) {
    if (!familyIds.has(familyId)) {
      issues.push({
        level: "error",
        message: `Role ${role.id ?? "unknown"} references an unknown role family: ${familyId}.`,
      });
    }
  }

  const roleLevelOptions = getRoleLevelOptions(role);

  if (!isRecord(roleLevelOptions)) {
    issues.push({
      level: "error",
      message: `Role ${role.id ?? "unknown"} must define dimensions.role-level.options.`,
    });
    return issues;
  }

  for (const [roleLevelId, roleLevel] of orderedEntries(roleLevelOptions)) {
    if (!isRecord(roleLevel)) {
      issues.push({
        level: "error",
        message: `Role-level ${role.id ?? "unknown"}.${roleLevelId} must be an object.`,
      });
      continue;
    }

    if (!isNonEmptyString(roleLevel.label)) {
      issues.push({
        level: "warning",
        message: `Role-level ${role.id ?? "unknown"}.${roleLevelId} is missing a label.`,
      });
    }

    if (!isNonEmptyString(roleLevel.grade)) {
      issues.push({
        level: "error",
        message: `Role-level ${role.id ?? "unknown"}.${roleLevelId} is missing a grade.`,
      });
    } else if (!gradeIds.has(roleLevel.grade)) {
      issues.push({
        level: "error",
        message: `Role-level ${role.id ?? "unknown"}.${roleLevelId} references an unknown grade: ${roleLevel.grade}.`,
      });
    }

    const items = getOptionItems(roleLevel);

    if (
      items === undefined ||
      (!isItemCollectionList(items) && !isItemCollectionMap(items)) ||
      countOptionItems(roleLevel) === 0
    ) {
      issues.push({
        level: "error",
        message: `Role-level ${role.id ?? "unknown"}.${roleLevelId} must define items.`,
      });
    }
  }

  return issues;
}

function validateSkillDocument(skill: SkillDocument, document: TemplateDocument) {
  const issues: ValidationIssue[] = [];

  if (!isNonEmptyString(skill.id)) {
    issues.push({ level: "error", message: "Skill file is missing an id." });
  }

  if (!isNonEmptyString(skill.label)) {
    issues.push({
      level: "warning",
      message: `Skill ${skill.id ?? "unknown"} is missing a label.`,
    });
  }

  if (!isStringList(skill.guidance)) {
    issues.push({
      level: "error",
      message: `Skill ${skill.id ?? "unknown"} guidance must be a string or a list of strings.`,
    });
  }

  if (!isStringList(skill.indicators)) {
    issues.push({
      level: "error",
      message: `Skill ${skill.id ?? "unknown"} indicators must be a string or a list of strings.`,
    });
  }

  if (!isRecord(skill.variants)) {
    issues.push({
      level: "error",
      message: `Skill ${skill.id ?? "unknown"} must define variants.`,
    });
    return issues;
  }

  for (const [variantId, variant] of orderedEntries(skill.variants)) {
    if (!isRecord(variant)) {
      issues.push({
        level: "error",
        message: `Skill ${skill.id ?? "unknown"} variant ${variantId} must be an object.`,
      });
      continue;
    }

    if (!isStringList(variant.guidance)) {
      issues.push({
        level: "error",
        message: `Skill ${skill.id ?? "unknown"} variant ${variantId} guidance must be a string or a list of strings.`,
      });
    }

    if (!isStringList(variant.indicators)) {
      issues.push({
        level: "error",
        message: `Skill ${skill.id ?? "unknown"} variant ${variantId} indicators must be a string or a list of strings.`,
      });
    }
  }

  return issues;
}

function summarizeRole(role: RoleDocument): ExternalRoleSummary {
  const roleLevelOptions = getRoleLevelOptions(role);

  return {
    id: isNonEmptyString(role.id) ? role.id : "unknown-role",
    label: isNonEmptyString(role.label) ? role.label : "Unnamed role",
    families: normalizeIdList(role.families),
    roleLevels: orderedEntries(roleLevelOptions).map(([roleLevelId, roleLevel]) => ({
      id: roleLevelId,
      label: isNonEmptyString(roleLevel?.label) ? roleLevel.label : "Unnamed role-level",
      grade: isNonEmptyString(roleLevel?.grade) ? roleLevel.grade : "unknown",
      itemCount: countOptionItems(roleLevel),
      items: isItemCollectionList(roleLevel?.items)
        ? roleLevel.items.map((itemId) => ({ id: itemId, variant: null }))
        : orderedEntries(roleLevel?.items).map(([itemId, variantId]) => ({
            id: itemId,
            variant: isNonEmptyString(variantId) ? variantId : null,
          })),
    })),
  };
}

function summarizeSkill(skill: SkillDocument): ExternalSkillSummary {
  return {
    id: isNonEmptyString(skill.id) ? skill.id : "unknown-skill",
    label: isNonEmptyString(skill.label) ? skill.label : "Unnamed skill",
    summary: isNonEmptyString(skill.summary) ? skill.summary : skill.description ?? "",
    variantCount: orderedEntries(skill.variants).length,
    variants: orderedEntries(skill.variants).map(([variantId]) => variantId),
  };
}

function buildStructureSummary(
  entry: CatalogueTemplateEntry,
  document: TemplateDocument,
  issues: ValidationIssue[],
) {
  const roleSource = getDirectorySource(document.dimensions?.role);
  const itemSource = getItemSource(document);
  const roleDocuments = collectRelatedDocuments(entry, roleSource?.path ?? null);
  const skillDocuments = collectRelatedDocuments(entry, itemSource?.path ?? null);

  const roles = roleDocuments.map((related) => {
    try {
      return parseYamlDocument<RoleDocument>(related.sourceText);
    } catch (error) {
      issues.push({
        level: "error",
        message:
          error instanceof Error
            ? `Unable to parse role file ${related.path}: ${error.message}`
            : `Unable to parse role file ${related.path}.`,
      });
      return null;
    }
  });

  const skills = skillDocuments.map((related) => {
    try {
      return parseYamlDocument<SkillDocument>(related.sourceText);
    } catch (error) {
      issues.push({
        level: "error",
        message:
          error instanceof Error
            ? `Unable to parse skill file ${related.path}: ${error.message}`
            : `Unable to parse skill file ${related.path}.`,
      });
      return null;
    }
  });

  const validRoles = roles.filter((role): role is RoleDocument => role !== null);
  const validSkills = skills.filter((skill): skill is SkillDocument => skill !== null);

  const skillIds = new Set<string>();

  for (const skill of validSkills) {
    issues.push(...validateSkillDocument(skill, document));

    if (isNonEmptyString(skill.id)) {
      if (skillIds.has(skill.id)) {
        issues.push({
          level: "error",
          message: `Duplicate skill id found in external skill catalogue: ${skill.id}.`,
        });
      }

      skillIds.add(skill.id);
    }
  }

  const skillById = new Map(
    validSkills
      .filter((skill) => isNonEmptyString(skill.id))
      .map((skill) => [skill.id, skill]),
  );
  const roleIds = new Set<string>();

  for (const role of validRoles) {
    issues.push(...validateRoleDocument(role, document));

    if (isNonEmptyString(role.id)) {
      if (roleIds.has(role.id)) {
        issues.push({
          level: "error",
          message: `Duplicate role id found in external role catalogue: ${role.id}.`,
        });
      }

      roleIds.add(role.id);
    }

    for (const [roleLevelId, roleLevel] of orderedEntries(getRoleLevelOptions(role))) {
      const items = getOptionItems(roleLevel);

      const mappedItems = isItemCollectionList(items)
        ? items.map((itemId) => [itemId, null] as const)
        : orderedEntries(items);

      for (const [skillId, variantId] of mappedItems) {
        if (!skillById.has(skillId)) {
          issues.push({
            level: "error",
            message: `Role ${role.id ?? "unknown"}.${roleLevelId} references an unknown skill: ${skillId}.`,
          });
          continue;
        }

        const skill = skillById.get(skillId);

        if (variantId === null) {
          continue;
        }

        if (!isNonEmptyString(variantId)) {
          issues.push({
            level: "error",
            message: `Role ${role.id ?? "unknown"}.${roleLevelId} assigns an empty variant for ${skillId}.`,
          });
          continue;
        }

        if (!skill?.variants || !(variantId in skill.variants)) {
          issues.push({
            level: "error",
            message: `Skill ${skillId} does not define the required variant ${variantId}.`,
          });
        }
      }
    }
  }

  return {
    rolesPath: roleSource?.path ?? null,
    roles: validRoles.map(summarizeRole),
    skillsPath: itemSource?.path ?? null,
    skills: validSkills.map(summarizeSkill),
  };
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
        structureSummary: {
          rolesPath: null,
          roles: [],
          skillsPath: null,
          skills: [],
        },
        resolvedSummary: null,
      };
    }

    seen.add(current.id);

    let document: TemplateDocument | null = null;
    let parentInspection: TemplateInspection | null = null;

    if (!current.parseError && !current.syncError) {
      try {
        document = parseYamlDocument<TemplateDocument>(
          await loadTemplateText(current.templatePath, current.sourceText),
        );
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

    const structureSummary = document
      ? buildStructureSummary(current, document, issues)
      : {
          rolesPath: null,
          roles: [],
          skillsPath: null,
          skills: [],
        };

    return {
      entry: current,
      document,
      issues: [...(parentInspection?.issues ?? []), ...issues],
      inheritanceChain: [...(parentInspection?.inheritanceChain ?? []), current.id],
      structureSummary,
      resolvedSummary:
        document === null
          ? parentInspection?.resolvedSummary ?? null
          : shallowResolveTemplate(document, parentInspection?.resolvedSummary ?? null, structureSummary),
    };
  };

  return visit(entry);
}
