import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import {
  getDimensionOptions,
  getStepIndex,
  loadStartTemplate,
  readSelections,
  serializeSelections,
  type StartFlowOption,
  type StartTemplateData,
} from "../lib/startFlow";

export function StartConfigurePage() {
  const { templateId, step } = useParams();
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
  const stepIndex = template && step ? getStepIndex(template, step) : -1;
  const dimension = template && stepIndex >= 0 ? template.setupDimensions[stepIndex] : null;
  const options = useMemo<StartFlowOption[]>(
    () => (template && dimension ? getDimensionOptions(template, dimension.id, selections) : []),
    [template, dimension, selections],
  );

  if (!templateId) {
    return <Navigate to="/start" replace />;
  }

  if (!isLoading && !error && template && template.setupDimensions.length === 0) {
    return <Navigate to={`/start/${templateId}/confirm`} replace />;
  }

  if (!isLoading && !error && template && (!step || stepIndex < 0)) {
    return (
      <Navigate to={`/start/${templateId}/configure/${template.setupDimensions[0]?.id}`} replace />
    );
  }

  function handleSelect(optionId: string) {
    if (!template || !dimension) {
      return;
    }

    const nextSelections = { ...selections, [dimension.id]: optionId };

    for (const laterDimension of template.setupDimensions.slice(stepIndex + 1)) {
      delete nextSelections[laterDimension.id];
    }

    const nextSearch = serializeSelections(nextSelections).toString();
    const nextDimension = template.setupDimensions[stepIndex + 1];

    navigate(
      nextDimension
        ? `/start/${templateId}/configure/${nextDimension.id}?${nextSearch}`
        : `/start/${templateId}/confirm?${nextSearch}`,
    );
  }

  return (
    <PageFrame
      title={dimension?.label ?? "Configure calibration"}
      intro={dimension?.prompt ?? "Choose the next part of the calibration context."}
      homeLabel="Back to calibrations"
    >
      {isLoading ? <p>Loading setup options…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load setup</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {dimension ? (
        <section className="start-grid" aria-label={`${dimension.label} options`}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="start-card start-card--button"
              onClick={() => handleSelect(option.id)}
            >
              <span className="start-card__body">
                <h2 className="start-card__title">{option.label}</h2>
                {option.summary ? (
                  <p className="start-card__summary">{option.summary}</p>
                ) : null}
                {option.description ? (
                  <p className="start-card__summary">{option.description}</p>
                ) : null}
              </span>
            </button>
          ))}
        </section>
      ) : null}
    </PageFrame>
  );
}
