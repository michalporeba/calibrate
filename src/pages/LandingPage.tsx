import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="page-shell page-shell--home">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="landing" id="main-content">
        <section
          aria-labelledby="landing-title"
          className="landing__hero"
        >
          <h1 className="landing__title" id="landing-title">
            calibrate
          </h1>
          <p className="landing__definition">
            action. To reflect with intention, record what matters, and carry it
            forward.
          </p>
          <p className="landing__definition landing__definition--supporting">
            A{" "}
            <Link className="landing__term-link" to="/learn#simple">
              simple
            </Link>
            ,{" "}
            <Link className="landing__term-link" to="/learn#personal">
              personal
            </Link>
            ,{" "}
            <Link className="landing__term-link" to="/learn#local-first">
              local-first
            </Link>{" "}
            place for your continuous professional development (CPD). Here you
            can{" "}
            <Link className="landing__term-link" to="/record">
              record
            </Link>
            {" "}or{" "}
            <Link className="landing__term-link" to="/events">
              browse events
            </Link>
            , or{" "}
            <Link className="landing__term-link" to="/start">
              reflect on your performance
            </Link>
            .
          </p>
          <nav aria-label="Primary actions" className="landing__actions">
            <Link className="button-primary" to="/start">
              Let&apos;s calibrate!
            </Link>
            <Link className="text-link" to="/learn">
              or learn more about it
            </Link>
          </nav>
        </section>

        <footer className="landing__footer">
          <nav aria-label="Support tools">
            <Link className="quiet-link" to="/explore">
              Explore templates
            </Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
