import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { EVENTS } from "@inrupt/solid-client-authn-core";
import {
  events,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { listEntries, upsertEntries } from "../lib/entries";
import { resolvePodUrl, syncEntriesWithPod } from "../lib/solidEntries";

type StorageMode = "local-only" | "solid-sync";

type StoragePreference = {
  mode: StorageMode;
  issuer: string;
};

type StorageContextValue = {
  mode: StorageMode;
  issuer: string;
  isReady: boolean;
  isLoggedIn: boolean;
  webId: string | null;
  podUrl: string | null;
  eventsContainerUrl: string | null;
  lastSyncAt: string | null;
  syncError: string | null;
  isSyncing: boolean;
  dataVersion: number;
  useLocalOnly: () => Promise<void>;
  connectToSolidPod: (issuer: string) => Promise<void>;
  disconnectFromSolidPod: () => Promise<void>;
  syncNow: () => Promise<void>;
  notifyLocalChange: () => void;
};

const STORAGE_PREFERENCE_KEY = "calibrate.storage.preference";
const DEFAULT_ISSUER = "http://localhost:3000";
const AUTO_SYNC_INTERVAL_MS = 30_000;

const StorageContext = createContext<StorageContextValue | null>(null);

function hasOidcCallbackParams() {
  return /[?&](code|state|iss)=/.test(window.location.search);
}

function readStoragePreference(): StoragePreference {
  if (typeof window === "undefined") {
    return { mode: "local-only", issuer: DEFAULT_ISSUER };
  }

  const value = window.localStorage.getItem(STORAGE_PREFERENCE_KEY);

  if (!value) {
    return { mode: "local-only", issuer: DEFAULT_ISSUER };
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoragePreference>;
    return {
      mode: parsed.mode === "solid-sync" ? "solid-sync" : "local-only",
      issuer:
        typeof parsed.issuer === "string" && parsed.issuer.trim().length > 0
          ? parsed.issuer
          : DEFAULT_ISSUER,
    };
  } catch {
    return { mode: "local-only", issuer: DEFAULT_ISSUER };
  }
}

function writeStoragePreference(preference: StoragePreference) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_PREFERENCE_KEY, JSON.stringify(preference));
}

function storageRedirectUrl() {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  return new URL("storage", baseUrl).toString();
}

export function StorageProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<StoragePreference>(() =>
    readStoragePreference(),
  );
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [webId, setWebId] = useState<string | null>(null);
  const [podUrl, setPodUrl] = useState<string | null>(null);
  const [eventsContainerUrl, setEventsContainerUrl] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [pendingLocalChanges, setPendingLocalChanges] = useState(0);
  const syncPromiseRef = useRef<Promise<void> | null>(null);

  async function syncStateFromSession() {
    const session = getDefaultSession();
    const loggedIn = session.info.isLoggedIn;
    const nextWebId = session.info.webId ?? null;

    setIsLoggedIn(loggedIn);
    setWebId(nextWebId);

    if (loggedIn && nextWebId) {
      const nextPodUrl = await resolvePodUrl(nextWebId, session.fetch);
      setPodUrl(nextPodUrl);
      setEventsContainerUrl(new URL("calibrate/events/", nextPodUrl).toString());
    } else {
      setPodUrl(null);
      setEventsContainerUrl(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const sessionEvents = events();

    async function refreshSessionState() {
      try {
        await syncStateFromSession();
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Unable to restore the Solid session.",
          );
        }
      }
    }

    function handleSessionChange() {
      refreshSessionState().catch(() => undefined);
    }

    sessionEvents.on(EVENTS.LOGIN, handleSessionChange);
    sessionEvents.on(EVENTS.SESSION_RESTORED, handleSessionChange);
    sessionEvents.on(EVENTS.LOGOUT, handleSessionChange);

    async function restoreSession() {
      try {
        const processingCallback = hasOidcCallbackParams();
        await handleIncomingRedirect({
          restorePreviousSession: !processingCallback,
          url: window.location.href,
        });

        if (
          window.location.pathname.endsWith("/storage") &&
          /[?&](code|state|iss)=/.test(window.location.search)
        ) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (cancelled) {
          return;
        }

        await syncStateFromSession();
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Unable to restore the Solid session.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
      sessionEvents.off(EVENTS.LOGIN, handleSessionChange);
      sessionEvents.off(EVENTS.SESSION_RESTORED, handleSessionChange);
      sessionEvents.off(EVENTS.LOGOUT, handleSessionChange);
    };
  }, []);

  async function useLocalOnly() {
    const nextPreference: StoragePreference = {
      mode: "local-only",
      issuer: preference.issuer,
    };

    writeStoragePreference(nextPreference);
    setPreference(nextPreference);
    setSyncError(null);
    setLastSyncAt(null);
    setPendingLocalChanges(0);

    if (getDefaultSession().info.isLoggedIn) {
      await logout();
      setIsLoggedIn(false);
      setWebId(null);
      setPodUrl(null);
      setEventsContainerUrl(null);
    }
  }

  async function connectToSolidPod(issuer: string) {
    const nextPreference: StoragePreference = {
      mode: "solid-sync",
      issuer: issuer.trim(),
    };

    writeStoragePreference(nextPreference);
    setPreference(nextPreference);
    await login({
      oidcIssuer: nextPreference.issuer,
      redirectUrl: storageRedirectUrl(),
      clientName: "Calibrate",
    });
  }

  async function disconnectFromSolidPod() {
    await logout();
    const nextPreference: StoragePreference = {
      mode: "local-only",
      issuer: preference.issuer,
    };
    writeStoragePreference(nextPreference);
    setPreference(nextPreference);
    setIsLoggedIn(false);
    setWebId(null);
    setPodUrl(null);
    setEventsContainerUrl(null);
    setLastSyncAt(null);
    setPendingLocalChanges(0);
  }

  function noteDataChanged() {
    setDataVersion((current) => current + 1);
  }

  async function runSyncNow() {
    if (!getDefaultSession().info.isLoggedIn || !podUrl) {
      throw new Error("Connect to a Solid Pod before trying to sync.");
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const localEntries = await listEntries();
      const result = await syncEntriesWithPod(
        localEntries,
        podUrl,
        getDefaultSession().fetch,
      );

      await upsertEntries(result.entries);
      setEventsContainerUrl(result.containerUrl);
      setLastSyncAt(result.syncedAt);
      setPendingLocalChanges(0);
      noteDataChanged();
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Unable to sync with the Solid Pod.",
      );
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }

  async function syncNow() {
    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    const nextPromise = runSyncNow().finally(() => {
      syncPromiseRef.current = null;
    });

    syncPromiseRef.current = nextPromise;
    return nextPromise;
  }

  function notifyLocalChange() {
    noteDataChanged();
    setPendingLocalChanges((current) => current + 1);
  }

  useEffect(() => {
    if (
      preference.mode !== "solid-sync" ||
      !isReady ||
      !isLoggedIn ||
      !podUrl ||
      pendingLocalChanges === 0
    ) {
      return;
    }

    syncNow().catch(() => undefined);
  }, [isLoggedIn, isReady, pendingLocalChanges, podUrl, preference.mode]);

  useEffect(() => {
    if (preference.mode !== "solid-sync" || !isReady || !isLoggedIn || !podUrl) {
      return;
    }

    const intervalId = window.setInterval(() => {
      syncNow().catch(() => undefined);
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, isReady, podUrl, preference.mode]);

  return (
    <StorageContext.Provider
      value={{
        mode: preference.mode,
        issuer: preference.issuer,
        isReady,
        isLoggedIn,
        webId,
        podUrl,
        eventsContainerUrl,
        lastSyncAt,
        syncError,
        isSyncing,
        dataVersion,
        useLocalOnly,
        connectToSolidPod,
        disconnectFromSolidPod,
        syncNow,
        notifyLocalChange,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider.");
  }

  return context;
}
