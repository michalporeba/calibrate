import { useState } from "react";
import { Link } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";
import { useStorage } from "../components/StorageProvider";

function formatSyncTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StoragePage() {
  const storage = useStorage();
  const [issuer, setIssuer] = useState(storage.issuer);
  const [error, setError] = useState<string | null>(null);
  const lastSyncTime = formatSyncTime(storage.lastSyncAt);

  async function handleLocalOnly() {
    setError(null);

    try {
      await storage.useLocalOnly();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to switch to local-only storage.",
      );
    }
  }

  async function handleConnect() {
    setError(null);

    try {
      await storage.connectToSolidPod(issuer);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to start the Solid login flow.",
      );
    }
  }

  async function handleDisconnect() {
    setError(null);

    try {
      await storage.disconnectFromSolidPod();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to disconnect from the Solid Pod.",
      );
    }
  }

  async function handleSync() {
    setError(null);

    try {
      await storage.syncNow();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to sync with the Solid Pod.",
      );
    }
  }

  return (
    <PageFrame
      title="Storage"
      intro="Choose whether to keep your information only in this browser or connect a Solid Pod for automatic synchronisation."
      homeLabel="Back to Calibrate"
      actions={
        <Link className="text-link" to="/events">
          Back to events
        </Link>
      }
    >
      <section className="content-block">
        <h2>Current mode</h2>
        <p>
          {storage.mode === "local-only"
            ? "This browser is currently using local-only storage."
            : "This browser is configured to use Solid Pod sync."}
        </p>
        {storage.mode === "local-only" ? (
          <p>
            Saved information stays only in this browser unless you connect a
            Solid Pod.
          </p>
        ) : null}
        {storage.isLoggedIn && storage.webId ? <p>Signed in as {storage.webId}.</p> : null}
        {storage.podUrl ? <p>Pod root: <code>{storage.podUrl}</code></p> : null}
        {storage.eventsContainerUrl ? (
          <p>
            Events container: <code>{storage.eventsContainerUrl}</code>
          </p>
        ) : null}
        {lastSyncTime ? <p>Last synced: {lastSyncTime}.</p> : null}
        {storage.syncError ? (
          <p className="form-error" role="alert">
            {storage.syncError}
          </p>
        ) : null}
      </section>

      <section className="content-block">
        <h2>Use local storage only</h2>
        <p>
          Keep using Calibrate without connecting to a pod. Your saved events
          remain on this device only.
        </p>
        <div className="flow-actions">
          <button className="button-primary" type="button" onClick={handleLocalOnly}>
            Use local-only storage
          </button>
        </div>
      </section>

      <section className="content-block">
        <h2>Connect to a Solid Pod</h2>
        <p>
          Connect a Solid Pod if you want your events to sync to
          <code> /calibrate/events</code> in the pod.
        </p>
        <p>
          Once connected, new events sync automatically and Calibrate also
          checks the pod for newer changes while you are using it.
        </p>
        <div className="event-form">
          <div className="event-form__field">
            <label className="event-form__label" htmlFor="solid-issuer">
              Identity provider
            </label>
            <input
              className="event-form__control"
              id="solid-issuer"
              type="url"
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
            />
            <p className="event-form__hint">
              For local development with the included Community Solid Server, use
              <code> http://localhost:3000</code>.
            </p>
          </div>
          <div className="flow-actions">
            <button className="button-primary" type="button" onClick={handleConnect}>
              Connect to Solid Pod
            </button>
            {storage.isLoggedIn ? (
              <>
                <button
                  className="button-secondary"
                  type="button"
                  disabled={storage.isSyncing}
                  onClick={handleSync}
                >
                  {storage.isSyncing ? "Syncing…" : "Sync now"}
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </>
            ) : null}
          </div>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </PageFrame>
  );
}
