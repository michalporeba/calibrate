import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function EventsPage() {
  return (
    <PageFrame
      title="Events"
      intro="Browse the events you have recorded over time and return to the ones that matter."
      homeLabel="Back to Calibrate"
    >
      <section className="content-block">
        <h2>Recorded events</h2>
        <p>
          This page will become the place where recorded events can be reviewed
          and reused as starting points for reflection or assessment.
        </p>
        <p>For now, it marks the event list path in the product.</p>
      </section>

      <section className="content-block">
        <h2>Current related actions</h2>
        <ul className="content-list">
          <li>
            <Link className="text-link" to="/record">
              Record an event
            </Link>
          </li>
          <li>
            <Link className="text-link" to="/start">
              Start from a template
            </Link>
          </li>
        </ul>
      </section>
    </PageFrame>
  );
}
