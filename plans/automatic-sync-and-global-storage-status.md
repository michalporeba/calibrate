# Automatic Sync And Global Storage Status

## Summary

Make Pod sync feel automatic once a Solid Pod is connected, and move storage
state out of page-local notices into a shared shell status bar.

This slice should:

- sync automatically after local changes
- poll for remote changes while connected
- surface connection, identity, and sync state in a shared footer or header
- remove storage status duplication from individual content pages

## Key Changes

### Automatic sync

- Keep local-first IndexedDB as the working store.
- When Solid sync is enabled, trigger sync automatically after new local data is
  saved.
- While connected, poll the pod periodically for remote changes and merge them
  into local storage.
- Avoid overlapping sync runs.

### Shared storage status UI

- Add a shared status bar in the page shell rather than repeating notices in
  `/record` and `/events`.
- Show:
  - storage mode
  - connection state
  - current identity
  - last sync time or sync-in-progress state
  - link to `/storage`

### Page cleanup

- Remove page-local storage notices from the event pages.
- Keep detailed controls such as connect, disconnect, and manual sync on
  `/storage`.

## Test Plan

- Saving an event while connected triggers sync automatically.
- Remote changes appearing in the pod are pulled in by the automatic sync loop.
- The shared status bar updates when the app is local-only, connected, syncing,
  or in error.
- `/record` and `/events` no longer carry duplicate storage-status panels.
- `npm run build` and `npm run build:pages` continue to pass.

## Assumptions

- Footer placement is acceptable for the shared status surface.
- Periodic polling is the first remote-change strategy; push-based updates are
  out of scope.
- Manual sync remains available on `/storage` even after auto sync is added.
