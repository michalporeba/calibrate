import { PageFrame } from "../components/PageFrame";

export function StartPage() {
  return (
    <PageFrame
      title="Choose a template"
      intro="This route will become the main place to resume in-progress calibrations and start a new one from a curated set of templates."
    >
      <section className="content-block">
        <h2>Planned first behaviour</h2>
        <p>
          In-progress calibrations will appear prominently at the top, followed
          by template cards for new work.
        </p>
      </section>

      <section className="content-block">
        <h2>Next step in the flow</h2>
        <p>
          After a template is chosen, the user will configure context, confirm
          what will be created, and then begin their calibration.
        </p>
      </section>
    </PageFrame>
  );
}
