import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import {
  buildResolvedPreview,
  getDimensionOptions,
  getFirstMissingDimension,
  loadStartTemplate,
  readSelections,
  serializeSelections,
  type StartTemplateData,
} from "../lib/startFlow";

export function StartConfirmPage() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<StartTemplateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let cancelled = false;

    loadStartTemplate(templateId)
      .then((nextTemplate) => {
        if (!cancelled) {
          setTemplate(nextTemplate);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the selected calibration.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const selections = useMemo(() => readSelections(searchParams), [searchParams]);

  if (!templateId) {
    return <Navigate to="/start" replace />;
  }

  if (!isLoading && !error && template) {
    const missingDimension = getFirstMissingDimension(template, selections);

    if (missingDimension) {
      return (
        <Navigate
          to={`/start/${templateId}/configure/${missingDimension.id}?${serializeSelections(selections).toString()}`}
          replace
        />
      );
    }
  }

  const preview = template ? buildResolvedPreview(template, selections) : null;

  function handleStart() {
    if (!template) {
      return;
    }

    const search = serializeSelections(selections).toString();
    navigate(`/calibrations/new/${template.entry.id}?${search}`);
  }

  return (
    <PageFrame
      title="Confirm calibration"
      intro="Review the selected context and the resolved starting shape before creating the calibration."
      homeLabel="Back to calibrations"
      actions={
        template ? (
          <div className="flow-actions">
            <Link
              className="text-link"
              to={
                template.setupDimensions.length > 0
                  ? `/start/${templateId}/configure/${
                      template.setupDimensions[template.setupDimensions.length - 1]?.id
                    }?${serializeSelections(selections).toString()}`
                  : `/start/${templateId}`
              }
            >
              Back
            </Link>
            <button className="button-primary" type="button" onClick={handleStart}>
              Start calibration
            </button>
          </div>
        ) : null
      }
    >
      {isLoading ? <p>Loading confirmation…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load confirmation</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {template ? (
        <>
          <section className="content-block">
            <h2>You are about to start</h2>
            <p>{template.name}</p>
            <p>{template.summary}</p>
            {template.description ? <p>{template.description}</p> : null}
          </section>

          {template.setupDimensions.length > 0 ? (
            <section className="content-block">
              <h2>Selected context</h2>
              <dl className="explorer-definition-list">
                {template.setupDimensions.map((dimension) => {
                  const selectedValue = selections[dimension.id];
                  const selectedOption = getDimensionOptions(template, dimension.id, selections).find(
                    (option) => option.id === selectedValue,
                  );

                  return (
                    <div key={dimension.id}>
                      <dt>{dimension.label}</dt>
                      <dd>{selectedOption?.label ?? selectedValue ?? "Not selected"}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ) : null}

          {preview ? (
            <section className="content-block">
              <h2>Resolved preview</h2>
              <p>{preview.itemCount} items will be included in this calibration.</p>
              {preview.items.length > 0 ? (
                <ul className="content-list">
                  {preview.items.map((item) => (
                    <li key={item.id}>
                      {item.label}
                      {item.variant ? ` (${item.variant})` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </PageFrame>
  );
}
