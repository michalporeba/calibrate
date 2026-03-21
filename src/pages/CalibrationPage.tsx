import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import {
  buildResolvedPreview,
  loadStartTemplate,
  readSelections,
  type StartTemplateData,
} from "../lib/startFlow";

export function CalibrationPage() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
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
              : "Unable to load the started calibration.",
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
  const preview = template ? buildResolvedPreview(template, selections) : null;

  return (
    <PageFrame
      title={template ? `${template.name} started` : "Calibration started"}
      intro="This placeholder page marks the point where the created calibration will later become editable."
      homeLabel="Back to calibrations"
      actions={<Link className="text-link" to="/start">Start another calibration</Link>}
    >
      {isLoading ? <p>Loading calibration…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load calibration</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {template && preview ? (
        <>
          <section className="content-block">
            <h2>Calibration created</h2>
            <p>{template.summary}</p>
            {template.description ? <p>{template.description}</p> : null}
          </section>

          {Object.keys(selections).length > 0 ? (
            <section className="content-block">
              <h2>Selected context</h2>
              <dl className="explorer-definition-list">
                {Object.entries(selections).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="content-block">
            <h2>Included items</h2>
            <p>{preview.itemCount} items are included in this calibration.</p>
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
        </>
      ) : null}
    </PageFrame>
  );
}
