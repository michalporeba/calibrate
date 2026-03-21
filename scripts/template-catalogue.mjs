import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = resolve(repoRoot, "config.yml");
const templatesRoot = resolve(repoRoot, "templates");
const generatedRoot = resolve(repoRoot, "public", "generated");
const generatedCatalogueRoot = resolve(generatedRoot, "catalogues");
const generatedTemplateRoot = resolve(generatedRoot, "templates");
const lockPath = resolve(generatedRoot, ".sync-lock");

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function withSyncLock(run) {
  mkdirSync(generatedRoot, { recursive: true });

  let acquired = false;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      mkdirSync(lockPath);
      acquired = true;
      break;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") {
        throw error;
      }

      sleep(50);
    }
  }

  if (!acquired) {
    throw new Error("Unable to acquire the template sync lock.");
  }

  try {
    return run();
  } finally {
    rmSync(lockPath, { force: true, recursive: true });
  }
}

function readYamlFile(path) {
  return YAML.parse(readFileSync(path, "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function countEntries(value) {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length;
  }

  return 0;
}

function readTemplateMetadata(templateFilePath, fallbackId) {
  try {
    const sourceText = readFileSync(templateFilePath, "utf8");
    const template = YAML.parse(sourceText);

    return {
      parseError: null,
      sourceText,
      metadata: {
        id: isNonEmptyString(template?.id) ? template.id : fallbackId,
        name: isNonEmptyString(template?.name) ? template.name : fallbackId,
        summary: isNonEmptyString(template?.summary) ? template.summary : "",
        extends: isNonEmptyString(template?.extends) ? template.extends : null,
        dimensions: countEntries(template?.dimensions),
        items: countEntries(template?.items),
      },
    };
  } catch (error) {
    return {
      parseError: error instanceof Error ? error.message : "Unable to parse YAML.",
      sourceText: null,
      metadata: {
        id: fallbackId,
        name: fallbackId,
        summary: "",
        extends: null,
        dimensions: 0,
        items: 0,
      },
    };
  }
}

function validateConfig(config) {
  if (typeof config !== "object" || config === null) {
    throw new Error("config.yml must contain an object at the root.");
  }

  if (!Array.isArray(config.templates)) {
    throw new Error("config.yml must define a templates array.");
  }

  if (typeof config.profiles !== "object" || config.profiles === null) {
    throw new Error("config.yml must define profiles.");
  }
}

export function getTemplateSyncPaths() {
  return [configPath, templatesRoot];
}

export function syncTemplateCatalogue() {
  return withSyncLock(() => {
    const config = readYamlFile(configPath);
    validateConfig(config);

    rmSync(generatedRoot, { force: true, recursive: true });
    mkdirSync(generatedCatalogueRoot, { recursive: true });
    mkdirSync(generatedTemplateRoot, { recursive: true });

    const templates = config.templates.map((entry) => {
      const templateId = entry?.id;
      const source = entry?.source;
      const sourceDir = resolve(repoRoot, source ?? "");
      const entryFile = isNonEmptyString(entry?.entry) ? entry.entry : "template.yml";
      const templateFilePath = resolve(sourceDir, entryFile);
      const sourceExists = isNonEmptyString(source) && existsSync(sourceDir);
      const templateFileExists = sourceExists && existsSync(templateFilePath);
      const copiedDir = resolve(generatedTemplateRoot, templateId ?? "unknown");
      let syncError = null;

      if (!isNonEmptyString(templateId)) {
        syncError = "Template entry is missing an id.";
      } else if (!isNonEmptyString(source)) {
        syncError = `Template ${templateId} is missing a source directory.`;
      } else if (!sourceExists) {
        syncError = `Template source directory not found: ${source}`;
      } else {
        cpSync(sourceDir, copiedDir, { recursive: true });
      }

      const { metadata, parseError, sourceText } = templateFileExists
        ? readTemplateMetadata(templateFilePath, templateId)
        : {
            metadata: {
              id: templateId,
              name: templateId,
              summary: "",
              extends: null,
              dimensions: 0,
              items: 0,
            },
            parseError: syncError ?? `Template entry file not found: ${entryFile}`,
            sourceText: null,
          };

      return {
        id: templateId,
        source,
        entry: entryFile,
        sourceExists,
        syncError,
        parseError,
        metadata,
        templatePath: `generated/templates/${templateId}/${entryFile}`,
        sourceText,
      };
    });

    for (const [profileName, profileConfig] of Object.entries(config.profiles)) {
      const enabledTemplates = new Set(ensureArray(profileConfig?.enabledTemplates));

      writeFileSync(
        resolve(generatedCatalogueRoot, `${profileName}.json`),
        JSON.stringify(
          {
            profile: profileName,
            templates: templates.map((template) => ({
              id: template.id,
              source: template.source,
              entry: template.entry,
              enabled: enabledTemplates.has(template.id),
              templatePath: template.templatePath,
              metadata: template.metadata,
              parseError: template.parseError,
              syncError: template.syncError,
              sourceText: template.sourceText,
            })),
          },
          null,
          2,
        ),
      );
    }
  });
}
