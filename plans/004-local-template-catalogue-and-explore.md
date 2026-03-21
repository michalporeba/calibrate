# Local Template Catalogue and Explore Tool

## Summary

Establish the first real author-side workflow for Calibrate by replacing the placeholder `Explore` page with a working local template catalogue, validation surface, and resolved-template inspector.

The first implementation should use checked-in local YAML template packages and a checked-in YAML catalogue config so the app remains usable without external template hosting.

## Decisions

- Template sources live locally under `templates/<name>/`.
- The first template set contains three stubs:
  - `gdad`
  - `gibbs`
  - `era`
- Template catalogue configuration is stored in `config.yml`.
- Build profiles are named manually and match the current app variants:
  - `me`
  - `gds`
- Initial profile enablement is:
  - `me`: `gibbs`, `era`
  - `gds`: `gdad`, `era`
- The app loads templates from served static assets, not directly from the repo filesystem.
- Development should auto-sync local template/config changes without requiring a dev-server restart.

## Deliverables

### 1. Local source and config model

Add:

- `config.yml`
- `templates/gdad/`
- `templates/gibbs/`
- `templates/era/`

Each template directory should contain YAML source suitable for browser-side loading, inspection, and validation.

### 2. Static catalogue sync

Add a sync step that:

- reads `config.yml`
- copies local template assets into served static files
- generates per-profile catalogue manifests for the frontend
- refreshes automatically during development when config or template files change

### 3. Explore page

Replace the `/explore` placeholder with a read-only author tool that shows:

- current profile
- enabled and disabled templates
- template metadata
- source location
- inheritance chain
- validation results
- resolved output summary

### 4. Validation and resolution baseline

Implement lightweight browser-side parsing, validation, and simple inheritance resolution sufficient for the three stub templates and future parent-child extension.

## Acceptance Criteria

- `/explore` shows all configured templates for the active profile, with enabled and disabled status clearly marked.
- The `me` profile exposes `gibbs` and `era` as enabled.
- The `gds` profile exposes `gdad` and `era` as enabled.
- Template metadata is loaded from YAML source and shown in the explorer.
- Invalid or malformed template YAML surfaces readable errors in the explorer without crashing the app.
- Local template or config edits during development trigger updated explorer output without requiring a restart.
- `npm run build` still succeeds.
- `npm run build:pages` still succeeds for both hosted theme variants.
