import { PageFrame } from "../components/PageFrame";

export function LearnPage() {
  return (
    <PageFrame
      title="What Calibrate is for"
      intro="Calibrate helps people keep reflective and assessment work in a form they can return to, understand, and carry with them."
    >
      <section className="content-block" id="simple">
        <h2>Simple</h2>
        <p>
          Calibrate should feel calm and direct. It should help people get into
          the work quickly, without turning reflection or self-assessment into a
          complicated process.
        </p>
        <p>
          That means clear templates, clear choices, and a flow that stays out
          of the way.
        </p>
      </section>

      <section className="content-block" id="personal">
        <h2>Personal</h2>
        <p>
          The record belongs first to the person doing the work. Calibrate is
          designed so reflection, evidence, and judgement are not trapped inside
          a single organisation or process.
        </p>
        <p>
          If you choose to save your work beyond the browser, the intended model
          is that you save it into your own{" "}
          <a
            href="https://solidproject.org/"
            rel="noreferrer"
            target="_blank"
          >
            SOLID Pod
          </a>{" "}
          or other personal storage that you control, and you decide who gets
          access to it.
        </p>
      </section>

      <section className="content-block" id="local-first">
        <h2>Local-first</h2>
        <p>
          Calibrate starts from the assumption that your work should stay under
          your control. Reflection and assessment happen in the browser and, by
          default, are not saved anywhere else.
        </p>
        <p>
          The data is not collected or processed by large platform providers by
          default. It stays on your device unless you deliberately choose to
          save or share it somewhere you control.
        </p>
      </section>

      <section className="content-block" id="self-reflection">
        <h2>Self-reflection</h2>
        <p>
          Some work is exploratory. You may be trying to understand an
          experience, keep a reflective log, or build a better sense of how you
          are developing over time.
        </p>
        <p>
          Calibrate should support that kind of thoughtful record without
          forcing everything into a rigid assessment pattern.
        </p>
      </section>

      <section className="content-block" id="self-assessment">
        <h2>Self-assessment</h2>
        <p>
          Other work is more structured. You may be assessing yourself against a
          capability framework, a role expectation, or another defined template.
        </p>
        <p>
          Calibrate should help you do that honestly and clearly, while keeping
          the resulting record useful long after the immediate process is over.
        </p>
      </section>
    </PageFrame>
  );
}
