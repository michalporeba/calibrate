import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function RecordPage() {
  return (
    <PageFrame
      title="Record an event"
      intro="Capture something that happened so you can return to it later, reflect on it, or use it as evidence in a structured template."
      homeLabel="Back to Calibrate"
    >
      <section className="content-block">
        <h2>First-class event recording</h2>
        <p>
          This route is the starting point for recording events as part of an
          ongoing professional record.
        </p>
        <p>
          The event model is the next piece of work. For now, this page marks
          the path where Calibrate will support capturing things that happened
          before turning them into reflection or assessment evidence.
        </p>
      </section>

      <section className="content-block">
        <h2>Current related actions</h2>
        <ul className="content-list">
          <li>
            <Link className="text-link" to="/start">
              Start from a template
            </Link>
          </li>
          <li>
            <Link className="text-link" to="/learn#recording-events">
              Learn how event recording fits into Calibrate
            </Link>
          </li>
        </ul>
      </section>
    </PageFrame>
  );
}
