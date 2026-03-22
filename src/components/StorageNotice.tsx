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

export function StorageNotice() {
  const storage = useStorage();
  const lastSyncTime = formatSyncTime(storage.lastSyncAt);

  if (!storage.isReady) {
    return null;
  }

  if (storage.mode === "local-only") {
    return (
      <section className="storage-notice storage-notice--warning">
        <h2>Saved only in this browser</h2>
        <p>
          Your information is currently stored only in local browser storage on
          this device.
        </p>
        <p>
          <Link className="text-link" to="/storage">
            Connect to a Solid Pod
          </Link>{" "}
          if you want synchronisation.
        </p>
      </section>
    );
  }

  if (!storage.isLoggedIn) {
    return (
      <section className="storage-notice storage-notice--warning">
        <h2>Solid Pod not connected</h2>
        <p>
          Pod sync is selected for this browser, but you are not currently signed in.
        </p>
        <p>
          <Link className="text-link" to="/storage">
            Finish connecting to a Solid Pod
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="storage-notice storage-notice--connected">
      <h2>Solid Pod sync enabled</h2>
      <p>
        {storage.eventsContainerUrl ? (
          <>
            Events sync to <code>{storage.eventsContainerUrl}</code>.
          </>
        ) : (
          "Solid Pod sync is enabled for this browser."
        )}
      </p>
      {lastSyncTime ? <p>Last synced: {lastSyncTime}.</p> : null}
      {storage.syncError ? (
        <p className="form-error" role="alert">
          {storage.syncError}
        </p>
      ) : null}
      <p>
        <Link className="text-link" to="/storage">
          Review storage settings
        </Link>
      </p>
    </section>
  );
}
