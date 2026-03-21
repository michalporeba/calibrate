# First User Flow

## Summary

Define the first end-to-end user flow for Calibrate around a shared public entry point, a taker-centred calibration flow, and lightweight author support tools.

This feature plan covers:

- the public landing and explainer experience
- choosing a template or resuming in-progress work
- configuring context and creating a calibration
- the baseline calibration workflow and resumability
- the minimum author support tools needed to inspect and validate text-authored templates

Reviewer workflows, richer history, and user flow for adding extra templates are intentionally out of scope for this plan.

## Product Model

Use these terms consistently in implementation and UX copy where generic language is needed:

- `template`: reusable definition object, including inherited templates
- `context`: narrowing and prefilling information used when starting from a template
- `calibration`: user-owned record created from a template and completed over time
- `dimension`: selectable axis inside context, such as role family, role, or level
- `item`: response unit within a calibration
- `author`: person who creates or extends templates

Templates support inheritance with overrides. A derived template may narrow or extend an upstream template. The implementation may support multiple inheritance levels later, but this plan assumes a simple parent-child chain is sufficient for the first version.

## User Flows

### 1. Shared landing page

The public root page should be sparse and calm.

It must contain:

- a short dictionary-like explanation of what Calibrate is
- a primary CTA: `Let's calibrate!`
- a secondary CTA for learning more
- subtle links to author support tools near the bottom of the page

The landing page is shared by takers and authors. Takers are the primary audience. Support-tool access must remain visible but secondary.

### 2. Explainer page

The secondary CTA opens a separate explainer page.

The explainer should describe:

- what Calibrate is
- who it is for
- the relationship between templates and calibrations
- the difference between taking a calibration and using support tools

The explainer is informational only. It does not contain detailed technical documentation.

### 3. Choose-a-template page

Selecting `Let's calibrate!` opens the main start page.

This page must show:

- in-progress calibrations at the top, prominently
- curated template cards below

For this first iteration:

- only in-progress calibrations appear above the cards
- recent and historic calibrations are deferred to a later dedicated page
- template cards show title, plain summary, and a primary start action only

The same page may later accommodate more template sources, but the user flow for adding additional templates is explicitly deferred.

### 4. Starting from a template

A taker may start from:

- a template chosen from the catalogue
- a direct link pointing to a specific template with optional prefilled context

Both entry paths must converge into the same setup flow.

If the link provides prefilled context:

- those values appear in setup
- the user may still change them before creating the calibration

### 5. Context setup

Before a calibration is created, the user must explicitly configure context.

The generic model is template-defined dimensions. The first GDaD template uses visible labels such as:

- role family
- role
- level

The default GDaD setup sequence is:

1. choose role family
2. choose role
3. choose level
4. confirm

The setup screen must clearly separate:

- template guidance
- organisation-specific guidance, if present
- selected context values
- user-editable choices

### 6. Confirmation and materialisation

Creating a calibration requires a dedicated confirmation step.

On confirmation:

- template inheritance and selected context are resolved into the exact working shape
- that resolved template is frozen for the new calibration
- the calibration record is created from that frozen shape

The implementation may internally deduplicate identical resolved templates, but the user-facing behaviour remains “frozen at start”.

### 7. Calibration workflow

Once a calibration has been created:

- selected context remains visible lightly in the page header
- the user works through items
- the user can leave and re-enter later

The workflow should optimise for:

- low cognitive load
- clear progress
- readable guidance
- comfortable long-form input

This plan does not define detailed per-item interaction patterns yet. It defines only the top-level workflow and navigation expectations.

### 8. Resuming work

In-progress calibrations must be easy to re-enter.

For this first iteration:

- in-progress calibrations are surfaced on the choose-a-template page
- selecting one re-enters the calibration directly

Separate history and archive views are later work.

### 9. Author support tools

The initial support-tool surface is read-only and aimed at text-authored templates.

The minimum tool set is:

- template explorer
- template validator

The explorer should allow an author to inspect template structure, inheritance, and resolved output.

The validator should:

- load a template definition
- report errors and warnings
- display the resolved structure after inheritance and overrides

The support tools do not provide in-browser editing in this phase.

## Deliverables

The implementation based on this plan should produce:

- shared landing page
- explainer page
- choose-a-template page with in-progress section
- start flow converging catalogue and direct-link entry
- context setup and confirmation flow
- calibration creation and resumability baseline
- read-only explorer and validator support tools
- at least one stub GDaD template to exercise the flow

## Acceptance Criteria

- A first-time visitor can understand the landing page and start the main flow from `Let's calibrate!`
- A visitor can reach a simple explainer page from the secondary CTA
- An author can reach support tools from quiet links on the shared landing page
- A taker can choose a template from a curated-card list
- A taker entering from a direct link and a taker entering from the catalogue both reach the same context-setup flow
- A GDaD taker can choose role family, role, and level, then confirm creation
- Creating a calibration freezes the resolved template used for that calibration
- An in-progress calibration appears prominently on the choose-a-template page and can be resumed
- The author-facing validator shows both validation results and resolved structure

## Assumptions

- Takers are the primary UX audience
- Authors and customisers are one conceptual role: `author`
- Templates are authored externally and consumed through support tooling
- User flow for adding extra templates is deferred
- Reviewer workflow is deferred beyond possible later read-only viewing
