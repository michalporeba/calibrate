# Solid Pod Sync And Storage Choice

## Summary

Add a user-visible storage workflow that allows Calibrate to be used in local
 storage only or connected to a Solid Pod for event synchronisation.

This slice should:

- add a storage settings route and connection workflow
- keep local-only use as a supported default with a visible warning
- integrate browser-based Solid login against a Community Solid Server
- sync event entries to and from `/calibrate/events/` in the user pod
- provide a local Docker-based Community Solid Server for development
- add automated integration coverage for the browser connection and sync flow

## Key Changes

### Storage choice and status

- Add a small storage/session layer that tracks:
  - local-only mode
  - chosen issuer
  - login state
  - pod URL
  - sync status
- Add a `/storage` route where the user can:
  - continue with local-only storage
  - connect to a Solid Pod
  - disconnect
  - trigger sync
- Show a visible warning on event pages when data is only stored locally.

### Solid connection and sync

- Use browser-based Solid authentication.
- Persist enough local preference state to restore the chosen mode.
- Sync entries to and from `/calibrate/events/` in the connected pod.
- Keep entries local-first: failed sync must not lose local data.
- Store each event as an RDF-backed Solid resource.

### Local development and tests

- Add a Docker Compose setup for `solidproject/community-server`.
- Seed a test account and pod for repeatable local use.
- Add automated integration tests that cover:
  - connecting to the local pod
  - saving an event
  - syncing it to the pod
  - seeing connected state in the app

## Test Plan

- A person can keep using the app in local-only mode.
- Local-only mode shows a warning that saved information stays only in this
  browser.
- A person can connect to the local Community Solid Server from the app.
- A connected person can sync events to `/calibrate/events/` in their pod.
- A sync failure does not remove local entries.
- The app still builds in both normal and Pages modes.
- The automated integration suite exercises the local pod connection flow.

## Assumptions

- Events remain the only synced entity in this slice.
- Solid sync is added on top of the existing IndexedDB store rather than
  replacing it.
- The local docker server is for development and automated testing, not yet a
  production deployment model.
