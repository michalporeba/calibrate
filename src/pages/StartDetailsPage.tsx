import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import { loadStartTemplate, type StartTemplateData } from "../lib/startFlow";

export function StartDetailsPage() {
  const { templateId } = useParams();
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

  if (!templateId) {
    return <Navigate to="/start" replace />;
  }

  const firstStep = template?.setupDimensions[0]?.id;
  const nextHref =
    template && template.setupDimensions.length > 0
      ? `/start/${templateId}/configure/${firstStep}`
      : `/calibrations/new/${templateId}`;
  const nextLabel =
    template && template.setupDimensions.length > 0 ? "Configure" : "Start";

  return (
    <PageFrame
      title={template?.name ?? "Calibration details"}
      intro="Review the selected calibration and then continue to setup or start it directly."
      homeLabel="Back to calibrations"
    >
      {isLoading ? <p>Loading calibration details…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load calibration</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {template ? (
        <>
          <section className="content-block">
            <h2>You are about to start</h2>
            <p>{template.summary}</p>
            {template.description ? <p>{template.description}</p> : null}
          </section>

          {template.guidance.length > 0 ? (
            <section className="content-block">
              <h2>Guidance</h2>
              <ul className="content-list">
                {template.guidance.map((guidance, index) => (
                  <li key={`${template.entry.id}-guidance-${index}`}>{guidance}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {template.setupDimensions.length > 0 ? (
            <section className="content-block">
              <h2>Configuration needed</h2>
              <p>
                This calibration needs some setup before it can start. You will choose:
              </p>
              <ol className="content-list">
                {template.setupDimensions.map((dimension) => (
                  <li key={dimension.id}>{dimension.label}</li>
                ))}
              </ol>
            </section>
          ) : (
            <section className="content-block">
              <h2>Ready to start</h2>
              <p>This calibration does not need any context setup before it starts.</p>
            </section>
          )}

          <div className="flow-actions flow-actions--end">
            <Link className="button-primary" to={nextHref}>
              {nextLabel}
            </Link>
          </div>
        </>
      ) : null}
    </PageFrame>
  );
}
