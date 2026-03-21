# Dual Theme Architecture

## Summary

Support two public visual variants of Calibrate from one codebase:

- a minimal personal theme
- a strongly GDS-aligned theme

The application should keep one route model, one semantic component structure,
and one interaction model. Theme choice should happen at build and deployment
level rather than as a runtime user preference.

The first hosted demo should expose both variants under separate GitHub Pages
subpaths:

- `/calibrate/me/`
- `/calibrate/gds/`

## Decisions

- Use one frontend application, not two separate apps.
- Keep the same page structure and route set across themes.
- Express theme differences primarily through design tokens and component
  skinning, not duplicated logic.
- Publish two builds from the same source tree rather than a runtime theme
  switcher.
- Keep the GDS-aligned variant recognisably GDS-inspired while avoiding
  restricted GOV.UK identity elements such as the crown logo and Transport
  typeface.

## Deliverables

- theme-aware app bootstrap with a fixed theme per build
- shared base styling plus two theme variants
- GitHub Pages build output for both `/me/` and `/gds/`
- a root Pages landing page that links to both theme variants
- a root-level SPA fallback that supports direct navigation for both variants

## Acceptance Criteria

- The same routes exist and work under both `/me/` and `/gds/`.
- The two variants are visually distinct while remaining semantically and
  behaviourally equivalent.
- Theme selection does not depend on user state or in-app toggles.
- GitHub Pages can host both variants from one deployment artifact.
- Direct loads and refreshes work for routes under both `/me/` and `/gds/`.
