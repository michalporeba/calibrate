# Generic Item Variants

## Summary

Replace the GDaD-specific skill variant model with a generic item-variant model.

The generic rules are:

- item files may define a keyed `variants` map
- selected dimension options decide which items are included
- a dimension option may include items as:
  - a list of item ids
  - or a keyed map of `item-id -> variant-id`
- `role-level` is treated as a dependent dimension whose options are supplied by roles

## Decisions

- `variants` replaces `proficiencyVariants`.
- Variant content is a partial override of the base item.
- Variant choice is data-driven and not hard-coded to a specific dimension name.
- Any dimension option may contribute items.
- If `items` is a list, it means base item inclusion.
- If `items` is a map, it means item inclusion plus variant selection.
- For GDaD, `role-level` is a top-level dependent dimension and its options come from role files.
- More specific item contribution wins over broader contribution in later runtime resolution work.

## Deliverables

### 1. GDaD schema update

Rewrite:

- `templates/gdad/template.yml`
- `templates/gdad/roles/*.yml`
- `templates/gdad/skills/*.yml`

so the data shape uses generic item variants and role-supplied `role-level` options.

### 2. Parser and validation updates

Extend the template loader and validator so they understand:

- option-level `items`
- generic item `variants`
- role-supplied dependent dimension options

### 3. Explorer updates

Update `/explore` so it shows:

- generic item variants
- role-supplied `role-level` options
- item contribution and selected variant ids on dimension options

## Acceptance Criteria

- GDaD skill files use `variants` instead of `proficiencyVariants`.
- GDaD role files no longer use `roleLevels`; they supply `dimensions.role-level.options`.
- Dimension options may use list or map forms of `items`.
- Validation catches malformed item contribution and unknown variant ids.
- `/explore` shows generic variants and dependent `role-level` options clearly.
- `npm run build` succeeds.
- `npm run build:pages` succeeds.
