# Calibrate

Calibrate is a local-first web application for structured assessments and reflective practice. It is designed to help people create, keep, and reuse portable personal records while still being able to share them into formal organisational review processes.

The first concrete use case is the UK Government Digital and Data Capability Framework self-assessment. The broader aim is to support similar structured self-assessments and reflective records where the same core pattern applies: a framework defines expectations, a person evaluates themselves against them, and that work may later be reviewed, moderated, or discussed with others.

## Why It Exists

Many self-assessments in public service follow the same shape:

- a framework defines criteria and guidance
- a person records a score, judgement, or level against those criteria
- supporting narrative or evidence is added
- the result may be reviewed by another person or reconciled across multiple assessors

These processes are often repetitive, organisation-bound, and awkward to carry across roles or employers. For personal capability assessments, that is a poor fit. People should be able to keep a record of their own development over time without losing it when they move between organisations.

Calibrate exists to provide a better default:

- personal records that belong to the individual
- local-first data handling for privacy, resilience, and control
- interoperability with organisational review and moderation workflows
- configurable templates that are separate from the application itself

## Who It Is For

Calibrate is aimed first at individual practitioners who need a structured, portable record of self-assessment, reflection, and professional development.

It also needs to work in environments where those personal records are submitted into wider organisational processes such as review, moderation, or capability conversations. Calibrate therefore serves both the individual and the institution, but it starts from the individual’s ownership of their own data.

The primary product experience is centred on the person taking a calibration. At the same time, Calibrate also supports authors who create, extend, inspect, and validate the templates that power those calibrations.

## Initial Scope

The first priority is GDaD capability self-assessment.

Beyond that, Calibrate may support other structured self-assessments and self-reflection processes where the model is still coherent: defined criteria, optional guidance, recorded judgements, narrative evidence, and possible later review.

Simple reflection templates should be able to work well without dimensions or scoring. Calibrate should not force every template into the same structure as a capability assessment.

Calibrate is not intended to become a generic workflow engine, a catch-all form builder, or a broad platform for every evaluation process. The focus is on structured personal assessment and reflection that can still participate in formal review workflows.

## Product Outcomes

Calibrate should help users and organisations achieve a small number of clear outcomes:

- preserve a reusable personal record of assessment and development over time
- reduce duplicated effort when the same kinds of assessments recur
- support clearer, more consistent evidence-based reflection
- make it easier to move between personal ownership and organisational review
- allow templates to evolve without invalidating existing records
- support resumable work so users can return to in-progress calibrations without losing context

## Product Principles

The project should be guided by the following principles:

- Local-first by default. The product should work with personal data under the user’s control first, not treat remote systems as the starting assumption.
- Personal ownership of data. Users should be able to keep and carry their own records across organisational boundaries.
- Interoperability over lock-in. Personal calibrations must still be shareable into formal review and moderation workflows.
- Configurable template model. The application should support externally defined templates rather than embedding specific frameworks in code.
- Template inheritance. Templates should be extendable through inheritance and overrides so organisations and communities can derive variants from upstream templates.
- Privacy-aware by design. Personal records should avoid unnecessary identifying or bias-inducing information where possible.
- Stable records over time. Once a calibration begins, the effective template content should be captured with it so later template changes do not corrupt meaning.
- User-centred experience. The product should reduce friction for long-form reflective work and keep the focus on clarity, evidence, and progress.
- Accessibility and responsiveness by default. These are baseline requirements, not polish work, and they include meaningful semantic HTML structure rather than purely visual markup.

## Core Concepts

Calibrate should use a small and stable set of core concepts:

- `template`: a reusable definition that can be inherited and overridden
- `context`: the narrowing and prefilling information used when starting from a template
- `calibration`: the user-owned record created from a template and completed over time
- `dimension`: a selectable axis in the context, such as role family, role, or level
- `item`: a unit the user responds to within a calibration
- `author`: a person who creates or extends templates

## Experience Vision

Calibrate should feel clean, light, modern, and calm. The default presentation should be minimally branded and easy to adapt to different contexts.

The hosted demo may present more than one predefined visual style. The default
personal style should stay light and minimal, while a separate GDS-aligned
variant should show how the same product can fit public-sector expectations
without changing its core behaviour.

The interaction design should favour:

- simple navigation
- low cognitive load
- clear progress through long calibrations
- readable layouts for guidance, selection, and written evidence
- strong accessibility on desktop and mobile

The public entry should remain intentionally simple:

- a minimal landing page with a primary `Let's calibrate!` action
- a secondary `learn more` route to a simple explainer page
- subtle links to author support tools, kept available but visually secondary

The main taker journey should be:

- land on the site
- choose a template or resume an in-progress calibration
- configure context
- confirm what will be created
- create the calibration
- work through items
- leave and resume as needed
- complete and hand over

The project must also support workflows and presentation patterns that fit naturally with the GOV.UK Design System. That is a compatibility requirement, not the default visual identity. A deployment should be able to adopt a GDS-aligned theme when needed without changing the underlying product model.

## Architecture Direction

Calibrate is intended to be local-first and interoperable.

Personal data storage should be built around SOLID Pods as a core architectural direction, allowing individuals to keep their own records in a standards-based personal data store. At the same time, the product must be able to participate in organisational workflows where calibrations are reviewed, moderated, or submitted into shared systems.

The precise organisational backend model is not fixed yet. What is fixed is the requirement that Calibrate must bridge personal ownership and institutional process rather than choose one at the expense of the other.

The first template-authoring path should stay local and offline-friendly. Template packages start as YAML files in local directories, with the application serving profile-specific template catalogues from those local sources.

For larger frameworks such as GDaD, those local template packages may be split
across multiple YAML files so the main template manifest stays readable. Small
shared vocabularies can remain inline while larger role and skill catalogues
live in dedicated subdirectories.

Items may also define generic variants, with selected dimension options
contributing which items are included and, where needed, which variant of an
item should be used.

## AI and AICA

AICA is part of how this project is developed. The README serves as a north star for future AICA-assisted design and implementation work by making the project intent, scope, and principles explicit.

AI may later become part of the product itself, for example by helping users judge whether their evidence matches a target proficiency level or by providing consistency-oriented feedback against the criteria of a calibration. That is a future capability, not a core v1 promise.

## Development and Build

Install dependencies with:

```bash
npm install
```

Run the personal theme locally on `http://localhost:5173/`:

```bash
npm run dev
```

Run the GDS-aligned theme locally on `http://localhost:5174/`:

```bash
npm run dev:gds
```

Run both local dev servers side by side:

```bash
npm run dev:all
```

Build the default single-theme app:

```bash
npm run build
```

Build the GitHub Pages demo artifact:

```bash
npm run build:pages
```

The Pages build publishes:

- `/calibrate/` as a simple static chooser page
- `/calibrate/me/` as the personal theme
- `/calibrate/gds/` as the GDS-aligned theme

Local template packages live in `templates/`, and `config.yml` controls which templates are enabled for each hosted profile. The build and dev workflow synchronises those local sources into served static assets for the app and the `/explore` tool.

## Project Documents

The maintained project documents have distinct roles:

- `README.md`: project manifest, intent, scope, and product north star
- `ADR.md`: accepted architectural decisions, technical constraints, and UX/system-level constraints
- `TEMPLATE_MODEL.md`: maintained reference for template structure, semantics, and current configuration patterns
- `features/*.md`: concise descriptions of current implemented behaviour and regression expectations
- `PLANS.md`: ordered high-level roadmap
- `plans/*.md`: implementation-ready feature plans
- `archive/plans/*.md`: historical implementation plans for already delivered work
- `WIP.md`: temporary session state during active work

`ORIGIN.md` is seed material only. It informed the initial project definition, but it is not intended to remain the maintained source of truth.
