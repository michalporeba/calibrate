# YAML Map-Based Template Structure

## Summary

Convert the template YAML design from list-plus-`id` collections to ordered YAML mappings for nested structures, while keeping the current field set otherwise unchanged.

This step keeps `template.id` but removes repeated nested `id` fields from:

- `items`
- `dimensions`
- `dimensions.<key>.options`

## Decisions

- `template.id` remains the explicit template identity.
- Nested collection keys become the stable local identifiers used for validation, rendering, and inheritance matching.
- YAML mapping order is the ordering mechanism for now.
- `kind`, `summary`, and `description` remain unchanged in this step.
- Inherited overrides stay in the same map shape under `items` and `dimensions`.

## Deliverables

### 1. YAML schema migration

Change template YAML so:

- `items` are keyed maps
- `dimensions` are keyed maps
- dimension `options` are keyed maps

### 2. Parser and resolver updates

Update the frontend template parser, validation, and resolution logic to use map keys rather than nested `id` fields.

### 3. Template rewrites

Rewrite:

- `templates/gibbs/`
- `templates/era/`
- `templates/gdad/`

into the new map-based shape without changing their overall product role.

### 4. Explorer compatibility

Keep `/explore` behaviourally the same while sourcing item and dimension identity from keyed maps.

## Acceptance Criteria

- The three templates parse successfully in the new map-based shape.
- YAML key order is preserved in the resolved explorer output.
- The explorer no longer depends on nested `id` fields.
- Inherited keyed overrides still resolve for allowed fields.
- Invalid inherited keys are rejected.
- `npm run build` still succeeds.
- `npm run build:pages` still succeeds.
