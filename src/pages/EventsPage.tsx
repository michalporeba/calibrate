import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageFrame } from "../components/PageFrame";
import { useStorage } from "../components/StorageProvider";
import { formatOccurredAt, listEntries, summariseBody, type CpdEntry } from "../lib/entries";

export function EventsPage() {
  const storage = useStorage();
  const [entries, setEntries] = useState<CpdEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listEntries()
      .then((nextEntries) => {
        if (!cancelled) {
          setEntries(nextEntries);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the saved events.",
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
  }, [storage.dataVersion]);

  return (
    <PageFrame
      title="Events"
      intro="Browse the events you have recorded over time and return to the ones that matter."
      homeLabel="Back to Calibrate"
      actions={
        <div className="flow-actions">
          <Link className="button-primary" to="/record">
            Record an event
          </Link>
          <Link className="text-link" to="/storage">
            Storage settings
          </Link>
        </div>
      }
    >
      {isLoading ? <p>Loading your events…</p> : null}

      {error ? (
        <section className="content-block">
          <h2>Unable to load events</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {!isLoading && !error && entries.length === 0 ? (
        <section className="content-block">
          <h2>No events yet</h2>
          <p>
            Start by recording something that happened so you can return to it
            later, reflect on it, or use it in a template-driven flow.
          </p>
          <div className="flow-actions">
            <Link className="button-primary" to="/record">
              Record an event
            </Link>
            <Link className="text-link" to="/start">
              Start from a template
            </Link>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && entries.length > 0 ? (
        <section className="events-list" aria-label="Recorded events">
          {entries.map((entry) => (
            <article className="event-card" key={entry.id}>
              <p className="event-card__date">{formatOccurredAt(entry.occurredAt)}</p>
              <h2 className="event-card__title">{entry.title}</h2>
              <p className="event-card__body">{summariseBody(entry.body)}</p>
            </article>
          ))}
        </section>
      ) : null}
    </PageFrame>
  );
}
