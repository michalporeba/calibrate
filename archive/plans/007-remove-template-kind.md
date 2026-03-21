# Remove Template Kind

## Summary

Remove the `kind` property from the template model now that it has proven unnecessary for the current catalogue, explorer, and validation flow.

## Decisions

- `kind` is removed from template YAML.
- Generated catalogue metadata no longer includes `kind`.
- Runtime parsing, validation, and resolved summaries no longer depend on `kind`.
- The explorer no longer displays `kind`.

## Deliverables

- update the template schema and the three current templates
- remove `kind` from generated metadata and runtime types
- remove `kind` validation and explorer rendering

## Acceptance Criteria

- `gdad`, `gibbs`, and `era` validate without a `kind` field
- `/explore` works without showing or expecting `kind`
- `npm run build` succeeds
- `npm run build:pages` succeeds
