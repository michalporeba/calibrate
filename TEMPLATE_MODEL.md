# Template Model

This document describes Calibrate's current template model. It is the
maintained reference for template structure and meaning.

`README.md` explains why the project exists. `ADR.md` records decisions and
constraints. This document explains how the template model is currently
expressed and interpreted.

## Purpose

Templates exist so calibration content can change independently of application
code.

The model needs to support:

- simple reflection templates
- more structured assessment templates
- local, file-based authoring
- later inheritance and reuse
- stable resolved snapshots when a calibration starts

The model is generic. It should not contain features that only make sense for
one template family.

## Core Concepts

- `template`: a reusable definition package
- `context`: the user selections that narrow or configure a template before a
  calibration starts
- `calibration`: the user-owned record created from a template and completed
  over time
- `dimension`: a selectable axis in the setup context
- `item`: a unit the user responds to in a calibration
- `variant`: an optional alternative form of an item, selected by configuration
- `author`: a person who creates or extends templates

These are generic model terms. A template may use more specific visible labels
such as role family, role, role level, skill, or stage, but those labels are
configurations of the same shared model.

## Package Structure

A template package lives under `templates/<name>/`.

The package entry point is `template.yml`.

Small templates may keep everything in that one file. Larger templates may
split supporting data into additional files and directories. That split is a
packaging choice, not a different model.

Current examples in this repository:

- `templates/era/` uses a single-file reflection template
- `templates/gibbs/` uses a single-file reflection template
- `templates/gdad/` uses:
  - `template.yml` as the package entry point
  - `roles/` for role definitions
  - `skills/` for item definitions

## Catalogue Configuration

`config.yml` lists known template packages and controls which templates are
enabled for each build profile.

Today it has two jobs:

- declare the available template packages
- enable or disable templates per profile such as `me` and `gds`

The browser does not read repository files directly. The build and development
workflow copies configured template sources into generated static assets, and
the application loads those generated assets at runtime.

## YAML Shape

Current templates are YAML documents with an explicit top-level `id`.

Common top-level fields currently in use are:

- `id`
- `name`
- `summary`
- `description`
- `guidance`
- `extends`
- `dimensions`
- `items`

Nested structures use ordered YAML mappings rather than repeated nested `id`
fields. That applies to:

- `dimensions`
- `dimensions.<key>.options`
- `items`

YAML mapping order matters. It is currently used for display order and for
setup-step order in the taker flow.

## Dimensions

Dimensions describe the setup choices available before a calibration starts.

A dimension may be:

- inline, with its options defined directly in `template.yml`
- directory-backed, with options coming from external files
- dependent, where its available options come from an earlier selection

Current dimension fields include:

- `label`
- `prompt`
- `options`
- `source`

An option may currently include:

- `label`
- `summary`
- `description`
- `grade`
- `items`

If a dimension has a non-empty `prompt`, it is currently treated as a setup
step in the taker flow.

Dependent dimensions are a generic model capability. In the current repository,
the clearest example is a role-level dimension whose options are supplied by
the selected role. That is an example of the model, not a special model type.

## Items

Items are the units the user responds to inside a calibration.

An item may include:

- `label`
- `summary`
- `description`
- `prompt`
- `guidance`
- `indicators`
- `variants`

Reflection templates in this repository use direct inline items. Larger
templates may instead use directory-backed item catalogues, still using the
same generic item concept.

## Variants

An item may define a keyed `variants` map.

Variants are generic. They are not tied in the model to any one template family
or dimension name.

A variant is a partial override of the base item content. In practice, it may
override the same kinds of fields used on the base item, such as:

- `label`
- `summary`
- `description`
- `prompt`
- `guidance`
- `indicators`

The base item remains the shared definition. A variant refines that definition
for a particular configured use.

## Dimension-Contributed Items

Selected dimension options may contribute items.

The `items` field on an option has two current forms:

- list form: include the base items
- map form: include the items and choose a variant key for each one

Examples:

```yaml
items:
  - experience
  - reflection
```

```yaml
items:
  data-modelling: proficient
  data-pipelines: working
```

This is generic model behavior. It lets a template use setup choices to decide:

- which items are included
- which variant of an item should apply

## Inheritance

Templates may use `extends` to derive from another template.

The current inheritance direction is deliberately narrow. It is intended to
support content-oriented overrides rather than broad structural replacement.

Current intended use:

- override description-like content
- override guidance-like content
- keep inherited keyed structures in the same map shape

Not yet treated as a solved capability:

- broad structural replacement of item sets
- complex precedence across many inheritance layers
- advanced merge rules beyond the current narrow override model

The document describes the current model direction, not a fully formal schema.
Where implementation remains partial, authors should treat current templates and
the explorer as the practical reference.

## Resolution

At a high level, Calibrate currently works toward this shape:

1. a template package is selected from the configured catalogue
2. the template is loaded from generated static assets
3. inheritance is resolved
4. the user selects any required context dimensions
5. selected dimension options contribute the final item configuration
6. the resulting resolved shape is frozen when the calibration starts

That frozen resolved shape is what protects an in-progress or completed
calibration from later changes to the source template.

This document describes the meaning of the model, not the full runtime
algorithm.

## Current Examples

### Simple reflection template

ERA shows the smallest useful shape:

```yaml
id: era
name: ERA reflection cycle
items:
  experience:
    label: Experience
    prompt: What happened, and what stands out from the experience?
  reflection:
    label: Reflection
    prompt: What have you learned or noticed on reflection?
  action:
    label: Action
    prompt: What will you do differently, continue, or explore next?
```

This uses:

- top-level metadata
- inline keyed items
- no dimensions
- no variants

### Richer reflection template

Gibbs uses the same generic model with fuller item content:

```yaml
items:
  analysis:
    label: Analysis
    prompt: What sense do you make of the experience now, and why?
    guidance:
      - Look for patterns, causes, and contributing factors.
    indicators:
      - The reflection moves beyond description into interpretation.
```

This is still the same model:

- inline items
- no dimensions
- no special reflection-only schema

### Larger multi-file template

The current GDaD package demonstrates larger-scale configuration using generic
features:

```yaml
dimensions:
  role:
    label: Role
    prompt: Select the role you are in.
    source:
      type: directory
      path: roles

items:
  source:
    type: directory
    path: skills
```

A role file may then contribute dependent dimension options:

```yaml
dimensions:
  role-level:
    options:
      senior:
        label: Senior Data Engineer
        grade: seo
        items:
          data-modelling: proficient
          data-pipelines: proficient
```

And a skill file may define generic variants:

```yaml
id: data-modelling
label: Data modelling
variants:
  proficient:
    summary: Designs and improves data models in day-to-day delivery.
```

This is still the same model:

- dimensions
- dependent dimensions
- directory-backed sources
- items
- variants
- dimension-contributed item configuration

## Current Limits

This document describes the current model, but some areas remain intentionally
unfinished.

Still deferred or intentionally narrow:

- wider structural inheritance rules
- simplified or redesigned `config.yml`
- broader identity rules beyond `template.id`
- direct-link launch context
- storage, resume, and sharing behavior as part of the template model

When there is tension between aspiration and implementation, the current
repository templates and `/explore` behavior should be treated as the practical
reference for now.
