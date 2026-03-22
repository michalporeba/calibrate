import { Link } from "react-router-dom";
import type { PropsWithChildren, ReactNode } from "react";

type PageFrameProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  actions?: ReactNode;
  homeLabel?: string;
}>;

export function PageFrame({
  eyebrow,
  title,
  intro,
  actions,
  homeLabel = "Back to Calibrate",
  children,
}: PageFrameProps) {
  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="page-frame" id="main-content">
        <header className="page-frame__lead">
          <Link className="page-frame__home" to="/">
            {homeLabel}
          </Link>
          {eyebrow ? <p className="page-frame__eyebrow">{eyebrow}</p> : null}
          <h1 className="page-frame__title">{title}</h1>
          <p className="page-frame__intro">{intro}</p>
          {actions ? <div className="page-frame__actions">{actions}</div> : null}
        </header>
        <div className="page-frame__body">{children}</div>
      </main>
    </div>
  );
}
