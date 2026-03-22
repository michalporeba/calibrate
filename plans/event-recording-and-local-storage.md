# Event Recording And Local Storage

## Summary

Introduce the first real persisted user-owned record in Calibrate: a CPD entry
recorded from `/record` and listed at `/events`.

This slice should:

- replace the current placeholder event pages with a working create and list flow
- persist entries locally in IndexedDB using the app model rather than RDF
- define a small RDF mapping module for later Pod persistence
- keep the first entity standalone so it can later be linked from reflections
  and calibrations

## Key Changes

### Entry model and local persistence

- Add a first app entity for recorded events, modelled as a standalone CPD
  entry.
- Use the app-facing shape:
  - `id`
  - `title`
  - `body`
  - `occurredAt`
  - `createdAt`
  - `updatedAt`
- Model `occurredAt` with explicit precision:
  - exact date
  - month
  - season
  - year
- Persist entries in IndexedDB as app-shaped objects.

### Event routes

- Replace `/record` with a real entry form.
- Replace `/events` with a real list of saved entries.
- Saving from `/record` should return the user to `/events`.
- The first implementation is create + list only. No entry detail, editing, or
  deletion yet.

### RDF mapping foundation

- Add a small RDF mapping module for the entry entity.
- Treat the saved object as a journal-style CPD entry, not as a public event or
  evidence object.
- Reuse standard vocabularies where useful:
  - Dublin Core Terms for common metadata
  - OWL-Time for occurred-at precision
- Keep CPD-specific meaning in a small Calibrate namespace.
- Do not implement Pod sync or Solid authentication yet.

### Documentation

- Update the current behaviour docs to include recording and listing entries.
- Record the ontology and storage direction in the main technical documents
  without claiming that Pod sync is already implemented.

## Test Plan

- A person can create an entry with an exact date, title, and body.
- A person can create an entry using month, season, or year precision.
- Saving an entry routes to `/events`.
- `/events` shows entries in reverse chronological order using the best
  available occurred-at sort key.
- Entries persist across reloads.
- Empty-state behaviour is clear when there are no saved entries.
- The RDF mapping module can represent each occurred-at precision without
  losing meaning.
- `npm run build` continues to pass.

## Assumptions

- The first saved entity is a journal-style CPD entry.
- IndexedDB is the first local persistence layer.
- The app model remains the working representation; RDF is a boundary
  representation for later Pod work.
- Interoperability is currently “readable note-like resource” rather than
  full shared behaviour with other Solid apps.
