# Template Packages And Catalogue

## Goal

Make templates configurable, local-first, and reusable without hard-coding frameworks into the application.

## Problem

The product needs to support different kinds of templates, local editing, future inheritance, and profile-specific publication without coupling content changes to application releases.

## Solution

Calibrate uses local YAML template packages, a checked-in catalogue configuration, generic dimensions and items, optional item variants, and generated static assets for runtime loading.

## Current Behaviour

- Templates currently live in local package directories under `templates/<name>/`.
- `config.yml` declares available template packages and profile-specific enablement.
- The browser loads generated static assets, not repository files directly.
- Template structure uses ordered YAML mappings for dimensions, options, and items.
- The current generic model supports:
  - dimensions
  - dependent dimensions
  - items
  - generic item variants
  - dimension-contributed items
  - narrow inheritance through `extends`
- Larger templates may be split across multiple files, but that split is packaging, not a different model.

## Stories

- As an author, I can define a template as files in a package directory so I can evolve content independently of application code.
- As an author, I can use generic dimensions, items, and variants so different template families can use the same model.
- As a deployer, I can choose which templates are published in each hosted profile.

## Assertions

```gherkin
Scenario: Local template packages
  Given template sources exist in local package directories
  Then the application can publish and load them without external connectivity

Scenario: Profile-specific catalogue
  Given a hosted profile is selected
  Then only the templates enabled for that profile are published as enabled

Scenario: Generic template model
  Given a template uses dimensions, items, or variants
  Then those structures are interpreted as generic model features
  And not as framework-specific schema

Scenario: Meaningful YAML order
  Given a template defines dimensions, options, or items as keyed mappings
  Then that order is preserved as meaningful configuration order

Scenario: Stable runtime loading
  Given the browser loads template information
  Then it uses generated static assets rather than reading repository files directly
```
