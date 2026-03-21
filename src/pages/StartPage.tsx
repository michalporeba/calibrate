import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import { loadStartTemplates, type StartTemplateCard } from "../lib/startFlow";

export function StartPage() {
  const [templates, setTemplates] = useState<StartTemplateCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadStartTemplates()
      .then((nextTemplates) => {
        if (!cancelled) {
          setTemplates(nextTemplates);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the available calibrations.",
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
  }, []);

  return (
    <PageFrame
      title="Select a template"
      intro="Select a template to see more about it and begin the setup flow."
    >
      {isLoading ? <p>Loading available calibrations…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load calibrations</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {!isLoading && !error ? (
        <section className="start-grid" aria-label="Available calibrations">
          {templates.map((template) => (
            <Link key={template.id} className="start-card start-card--link" to={`/start/${template.id}`}>
              <span className="start-card__body">
                <h2 className="start-card__title">{template.name}</h2>
                <p className="start-card__summary">{template.summary}</p>
              </span>
            </Link>
          ))}
        </section>
      ) : null}
    </PageFrame>
  );
}
