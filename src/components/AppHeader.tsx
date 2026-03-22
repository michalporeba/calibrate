import { Link } from "react-router-dom";
import { useStorage } from "./StorageProvider";

function formatSyncTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AppHeader() {
  const storage = useStorage();
  const lastSyncTime = formatSyncTime(storage.lastSyncAt);

  return (
    <header className="app-header" aria-label="Application">
      <div className="app-header__content">
        <div className="app-header__leading">
          <Link className="app-header__brand" to="/">
            calibrate
          </Link>
          <nav aria-label="Application sections" className="app-header__nav">
            <Link className="app-header__link" to="/start">
              Templates
            </Link>
            <Link className="app-header__link" to="/record">
              Record
            </Link>
            <Link className="app-header__link" to="/events">
              Events
            </Link>
          </nav>
        </div>

        <div className="app-header__status">
          {!storage.isReady ? (
            <span className="app-header__status-item">Checking storage…</span>
          ) : storage.mode === "local-only" ? (
            <>
              <span className="app-header__status-item app-header__status-item--strong">
                Local only
              </span>
              <span className="app-header__status-item">
                Saved only in this browser
              </span>
            </>
          ) : !storage.isLoggedIn ? (
            <>
              <span className="app-header__status-item app-header__status-item--strong">
                Solid Pod sync
              </span>
              <span className="app-header__status-item">Not connected</span>
            </>
          ) : (
            <>
              <span className="app-header__status-item app-header__status-item--strong">
                Solid Pod sync
              </span>
              {storage.webId ? (
                <span className="app-header__status-item">{storage.webId}</span>
              ) : null}
              <span className="app-header__status-item">
                {storage.isSyncing
                  ? "Syncing…"
                  : lastSyncTime
                    ? `Last synced ${lastSyncTime}`
                    : "Connected"}
              </span>
            </>
          )}
          {storage.syncError ? (
            <span className="app-header__status-item app-header__status-item--error">
              {storage.syncError}
            </span>
          ) : null}
          <Link className="app-header__link" to="/storage">
            Storage
          </Link>
        </div>
      </div>
    </header>
  );
}
