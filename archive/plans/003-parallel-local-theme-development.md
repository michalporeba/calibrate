# Parallel Local Theme Development

## Summary

Add a local development workflow that runs the personal and GDS-aligned themes side by side on separate dev servers, while keeping the production architecture as one app with build-time theme selection.

Also document the development and build workflow in `README.md`, including the static GitHub Pages root chooser at `/calibrate/`.

## Scope

This feature covers:

- fixed local dev ports for the two theme variants
- a single convenience command to run both local dev servers together
- concise developer-facing documentation in `README.md`

This feature does not change:

- the route structure inside either themed app
- the build-time theme model
- the GitHub Pages multi-build output layout already established for `/calibrate/`, `/calibrate/me/`, and `/calibrate/gds/`

## Decisions

- `npm run dev` remains the default local workflow for the personal theme.
- `npm run dev:gds` runs the GDS-aligned theme on a separate fixed port.
- `npm run dev:all` runs both local servers in parallel for side-by-side comparison.
- Theme choice remains a build-time concern, not an in-app runtime setting.
- The root GitHub Pages URL remains a static chooser page linking to the two themed builds.

## Deliverables

### 1. Stable local dev commands

The project should provide:

- `npm run dev` for the personal theme on `http://localhost:5173/`
- `npm run dev:gds` for the GDS-aligned theme on `http://localhost:5174/`
- `npm run dev:all` to run both together

### 2. Parallel runner

Use a lightweight cross-platform helper so `dev:all` can run both dev servers with readable output and clean shutdown behaviour.

### 3. README developer workflow

`README.md` should explain:

- dependency installation
- local development commands and URLs
- single-theme local build
- multi-theme GitHub Pages build
- the Pages output structure:
  - `/calibrate/`
  - `/calibrate/me/`
  - `/calibrate/gds/`

## Acceptance Criteria

- `npm run dev` starts the personal theme on port `5173`.
- `npm run dev:gds` starts the GDS-aligned theme on port `5174`.
- `npm run dev:all` starts both without port collisions.
- `npm run build` still succeeds.
- `npm run build:pages` still succeeds and preserves the static root chooser plus the two themed builds.
- `README.md` accurately reflects the implemented commands and URLs.
