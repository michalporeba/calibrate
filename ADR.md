# ADR

## Status

Accepted as the umbrella architecture and constraints record for Calibrate.

## Purpose

This document records the decisions and constraints that should guide
implementation. Product intent belongs in `README.md`. Current template-model
semantics belong in `TEMPLATE_MODEL.md`. Future feature sequencing belongs in
`PLANS.md`.

## Accepted Direction

### Product and ownership

- Calibrate is a local-first application.
- Calibration records created for self-assessment and self-reflection are owned
  by the individual user and should remain portable across organisational
  boundaries.
- SOLID Pods are the foundational direction for personal storage and identity.
- Calibrate must support movement from personal calibration into
  organisational review, moderation, or submission workflows.
- Shared organisational backends are important, but secondary to the
  local-first personal experience.

### Template model and resolution

- Templates live outside application code and must remain versionable and
  authorable with simple tools.
- Once a calibration starts, the effective template content used by that
  calibration must be captured with the record. Later source-template changes
  must not silently redefine an existing calibration.
- Template customisation is modelled as inheritance with overrides, with room
  for multiple inheritance levels later.
- The shared domain vocabulary is `template`, `context`, `calibration`,
  `dimension`, `item`, and `author`.
- Context selection is an explicit step before creating a calibration.
- When context is confirmed, Calibrate resolves inheritance and context into the
  exact shape used by the calibration and freezes that resolved form for the
  life of the calibration.
- If two calibrations resolve to the same frozen shape, the implementation may
  internally deduplicate that representation.

### Template distribution and current model capabilities

- The initial template distribution model is local and YAML-based.
- Template publication is controlled by a checked-in catalogue config with
  profile-specific enablement, using profile names such as `me` and `gds`.
- The browser loads template catalogues and template source from generated
  static assets, not directly from repository files.
- Reflection-oriented templates may be complete without dimensions or scoring.
- Early inheritance remains content-oriented; broad structural replacement is
  not yet the intended default.
- Large template packages may be split across multiple YAML files while
  remaining instances of the same generic model.
- Dependent dimensions are part of the generic model, including cases where a
  selected entity supplies the options for a later dimension.
- Items may define generic keyed `variants`, and dimension options may
  contribute items either as base inclusion or as `item -> variant` selection.
- The maintained explanation of current template-model semantics and
  configuration patterns belongs in `TEMPLATE_MODEL.md`.

### Product shape and UX

- One public landing page serves both people starting a calibration and authors
  using support tools.
- The person taking a calibration is the primary UX centre; author workflows
  exist to support that experience.
- The default interaction model prioritises clarity, focus, and low cognitive
  load, especially for longer reflective work.
- In-progress calibrations are intended to be easy to re-enter and visible in
  the main taker flow.
- For context-heavy templates, the default setup sequence is explicit and
  one-step-at-a-time. For GDaD-style templates, the current intended sequence is
  role family, then role, then level, followed by explicit confirmation.

### Presentation, accessibility, and theming

- The default presentation should be light, calm, minimal, and not strongly
  branded.
- Accessibility and responsiveness are baseline requirements from the start.
- Semantic HTML should be used where it adds real meaning; generic wrappers
  should remain generic when they exist only for layout or styling.
- Native HTML should be preferred over ARIA-decorated generic elements where
  the platform already provides the right semantics.
- The product must support workflows and presentation patterns that fit
  naturally with the GOV.UK Design System.
- Calibrate may be published in more than one predefined visual variant from
  the same codebase, with theme choice happening at build or deployment level
  rather than as an in-app preference.
- A GDS-aligned variant should follow GOV.UK Design System patterns where
  useful without implying that the product is an official GOV.UK service.
  Restricted identity elements such as the crown logo and the GDS Transport
  typeface should not be used in the non-government hosted demo.
- The application should be designed for internationalisation from the start,
  initially supporting English and Welsh.

## UX and Design Constraints

- The UI should support long reflective tasks without overwhelming the user.
- Information architecture should separate template guidance, user input, and
  progress status clearly.
- Mobile and desktop layouts should support the same core workflows.
- Themes may change presentation, but not behaviour or content structure.
- The landing page should remain minimal, with a primary taker action, a
  secondary explainer route, and subtle author-tool links.
- Starting from a catalogue card or a direct link should converge into the same
  context-setup flow.
- Once a calibration starts, selected context should remain visible lightly in
  the header.
- The minimum author-support surface is an explorer plus a read-only validation
  view showing errors and resolved structure.

## Technical Constraints

- Templates must remain loadable from external sources rather than embedded as
  hard-coded framework definitions.
- Template formats should remain simple enough to author and review with basic
  tooling.
- Calibration records must preserve the versioned context needed to interpret
  them later.
- The internal model should remain compatible with personal RDF-based storage.
- Authentication and identity flows should align with SOLID infrastructure.

## Stack Direction

### Decision drivers

The stack choice is driven by:

1. local-first capability
2. SOLID and RDF fit
3. frontend maintainability
4. accessible responsive UI delivery
5. template-system fit
6. simple no-backend deployment
7. future interoperability headroom
8. AI extension headroom

Working assumptions:

- the implementation is TypeScript-first
- v1 should avoid a bespoke backend unless proved necessary
- SOLID Pods are the primary personal storage mechanism
- templates may initially be distributed as static external content

### Recommendation

- **Primary stack**: React + TypeScript + Vite
- **Fallback**: Vue 3 + TypeScript + Vite
- **Not primary for now**: SvelteKit, because it adds framework surface without
  solving a current problem better than the SPA options
- **Not primary for now**: NextGraph, because it is better understood as a
  possible local-first data substrate than as a UI-stack alternative, and its
  Solid/web maturity is not strong enough to carry the current architecture

Why React + TypeScript + Vite:

- strong fit for browser-first local-first work
- strong fit for accessible responsive UI and theming
- strong fit for static deployment and external template loading
- strongest maintainability and ecosystem baseline
- does not obstruct later SOLID, RDF, or AI-assisted work

### Follow-up spikes

- validate SOLID authentication and Pod access in a browser-only TypeScript app
- validate the browser-side RDF toolchain needed for the core model
- revisit NextGraph only as a focused local-first storage/sync spike if later
  interest justifies it

## Open Questions

- What is the best mechanism for submitting or sharing a personal calibration
  into an organisational review workflow?
- How should template packages be distributed, discovered, and versioned in
  practice?
- How should users add additional templates to their personal catalogue?
- How tightly should GDS compatibility map to component implementation versus
  theme-level styling and layout conventions?
- What is the right boundary between local-first offline capability and
  connected collaboration or review features?
