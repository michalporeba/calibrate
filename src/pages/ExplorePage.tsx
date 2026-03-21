import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import {
  inspectTemplate,
  loadCatalogue,
  type CatalogueManifest,
  type CatalogueTemplateEntry,
  type TemplateInspection,
} from "../lib/templateCatalogue";

export function ExplorePage() {
  const [catalogue, setCatalogue] = useState<CatalogueManifest | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<TemplateInspection | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState(true);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingCatalogue(true);
    setCatalogueError(null);

    loadCatalogue()
      .then((nextCatalogue) => {
        if (isCancelled) {
          return;
        }

        setCatalogue(nextCatalogue);
        setSelectedTemplateId(
          (currentId) =>
            currentId ?? nextCatalogue.templates.find((entry) => entry.enabled)?.id ?? nextCatalogue.templates[0]?.id ?? null,
        );
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setCatalogueError(
          error instanceof Error ? error.message : "Unable to load the template catalogue.",
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingCatalogue(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedTemplate = useMemo(() => {
    return catalogue?.templates.find((entry) => entry.id === selectedTemplateId) ?? null;
  }, [catalogue, selectedTemplateId]);

  useEffect(() => {
    if (!catalogue || !selectedTemplate) {
      setSelectedInspection(null);
      setInspectionError(null);
      return;
    }

    let isCancelled = false;

    setIsLoadingInspection(true);
    setInspectionError(null);

    inspectTemplate(selectedTemplate, catalogue)
      .then((inspection) => {
        if (!isCancelled) {
          setSelectedInspection(inspection);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setInspectionError(
            error instanceof Error ? error.message : "Unable to inspect the selected template.",
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingInspection(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [catalogue, selectedTemplate]);

  const templates = catalogue?.templates ?? [];

  return (
    <PageFrame
      title="Explore templates"
      intro="Inspect the local template catalogue, see what each hosted profile publishes, and validate template structure."
    >
      {isLoadingCatalogue ? <p>Loading the local template catalogue…</p> : null}

      {catalogueError ? (
        <section className="content-block">
          <h2>Catalogue error</h2>
          <p>{catalogueError}</p>
        </section>
      ) : null}

      {!isLoadingCatalogue && !catalogueError ? (
        <div className="explorer-layout">
          <section className="explorer-panel" aria-labelledby="catalogue-heading">
            <div className="explorer-panel__header">
              <h2 id="catalogue-heading">Configured templates</h2>
              <p>
                Profile: <strong>{catalogue?.profile ?? __APP_THEME__}</strong>. Enabled and disabled
                templates are shown together so authors can see what this
                profile publishes and what it hides.
              </p>
            </div>
            <ul className="explorer-list">
              {templates.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`explorer-template ${
                      entry.id === selectedTemplateId ? "explorer-template--active" : ""
                    }`}
                    onClick={() => setSelectedTemplateId(entry.id)}
                  >
                    <span className="explorer-template__top">
                      <span className="explorer-template__name">{entry.metadata.name}</span>
                      <span
                        className={`status-pill ${
                          entry.enabled ? "status-pill--enabled" : "status-pill--disabled"
                        }`}
                      >
                        {entry.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </span>
                    <span className="explorer-template__meta">{entry.metadata.kind}</span>
                    <span className="explorer-template__summary">{entry.metadata.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="explorer-panel" aria-labelledby="details-heading">
            <div className="explorer-panel__header">
              <h2 id="details-heading">Template details</h2>
              <p>
                Metadata, inheritance, validation, and the resolved working
                shape all appear here for the selected template.
              </p>
            </div>

            {selectedTemplate ? (
              <TemplateDetails
                entry={selectedTemplate}
                inspection={selectedInspection}
                inspectionError={inspectionError}
                isLoading={isLoadingInspection}
              />
            ) : (
              <p>Select a template to inspect it.</p>
            )}
          </section>
        </div>
      ) : null}
    </PageFrame>
  );
}

function TemplateDetails({
  entry,
  inspection,
  inspectionError,
  isLoading,
}: {
  entry: CatalogueTemplateEntry;
  inspection: TemplateInspection | null;
  inspectionError: string | null;
  isLoading: boolean;
}) {
  const resolved = inspection?.resolvedSummary;
  const issues = inspection?.issues ?? [];

  return (
    <div className="explorer-details">
      <section className="content-block">
        <h3>{entry.metadata.name}</h3>
        <dl className="explorer-definition-list">
          <div>
            <dt>Status</dt>
            <dd>{entry.enabled ? "Enabled for this profile" : "Disabled for this profile"}</dd>
          </div>
          <div>
            <dt>Kind</dt>
            <dd>{entry.metadata.kind}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{entry.source}</dd>
          </div>
          <div>
            <dt>Entry file</dt>
            <dd>{entry.entry}</dd>
          </div>
        </dl>
        <p>{entry.metadata.summary}</p>
      </section>

      <section className="content-block">
        <h3>Inheritance</h3>
        <p>
          {inspection?.inheritanceChain.length
            ? inspection.inheritanceChain.join(" -> ")
            : "This template currently stands alone."}
        </p>
      </section>

      <section className="content-block">
        <h3>Validation</h3>
        {isLoading ? <p>Inspecting template source…</p> : null}
        {inspectionError ? <p>{inspectionError}</p> : null}
        {!isLoading && !inspectionError && issues.length === 0 ? (
          <p>No validation issues were found.</p>
        ) : null}
        {issues.length > 0 ? (
          <ul className="issue-list">
            {issues.map((issue, index) => (
              <li
                key={`${issue.level}-${index}`}
                className={`issue-list__item issue-list__item--${issue.level}`}
              >
                <strong>{issue.level === "error" ? "Error" : "Warning"}:</strong>{" "}
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="content-block">
        <h3>Resolved summary</h3>
        {resolved ? (
          <>
            <p>{resolved.summary}</p>
            <div className="resolved-grid">
              <article className="resolved-card">
                <h4>Dimensions</h4>
                {resolved.dimensions.length > 0 ? (
                  <ul className="resolved-list">
                    {resolved.dimensions.map((dimension) => (
                      <li key={dimension.id}>
                        {dimension.label} ({dimension.optionCount})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No dimensions defined.</p>
                )}
              </article>
              <article className="resolved-card">
                <h4>Items</h4>
                {resolved.items.length > 0 ? (
                  <ul className="resolved-list">
                    {resolved.items.map((item) => (
                      <li key={item.id}>{item.label}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No items defined.</p>
                )}
              </article>
            </div>
          </>
        ) : (
          <p>The resolved output is not available yet for this template.</p>
        )}
      </section>
    </div>
  );
}
