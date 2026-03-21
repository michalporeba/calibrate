import { PageFrame } from "../components/PageFrame";

export function ExplorePage() {
  return (
    <PageFrame
      title="Explore templates"
      intro="This combined support tool will let authors inspect template structure, understand inheritance, and validate resolved output in one place."
    >
      <section className="content-block">
        <h2>What this tool will cover</h2>
        <ul className="content-list">
          <li>browse template structure and metadata</li>
          <li>inspect inheritance and resolved output</li>
          <li>validate template definitions and surface errors or warnings</li>
        </ul>
      </section>

      <section className="content-block">
        <h2>Why it is separate from taking a calibration</h2>
        <p>
          The main product flow is centred on the taker. This tool stays quiet
          and secondary so authors can inspect and validate templates without
          turning the landing page into an admin surface.
        </p>
      </section>
    </PageFrame>
  );
}
