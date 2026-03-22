# PLANS

This document lists the high-level implementation order for Calibrate.

`PLANS.md` is the roadmap, not the feature specification and not the record of
current implemented behaviour.

Use:

- `features/*.md` for current system behaviour
- `plans/*.md` for future implementation-ready work
- `archive/plans/*.md` for historical implementation steps

## Roadmap

### 1. Project foundations and core domain model

Define the core concepts, vocabulary, and domain boundaries for `template`, `context`, `calibration`, `dimension`, `item`, and review without locking the system to GDaD-specific terms.

### 2. Template model, inheritance, and validation workflow

Define how templates are authored, versioned, inherited, loaded, resolved, and interpreted so content can evolve independently of application code. This phase also establishes read-only explorer and validator tooling for text-authored templates.

### 3. Shared entry, taker flow foundations, and responsive shell

Establish the landing page, explainer page, subtle author-tool entry, choose-a-template flow, in-progress surfacing, context setup, confirmation flow, accessibility baseline, responsive behaviour, and theming approach, including support for GDS-aligned presentation without making it the only visual style.

### 4. Local-first calibration creation and resumability

Deliver the first end-to-end ability for a user to create, edit, resume, and retain a personal calibration under their own control, including freeze-on-start materialisation from resolved templates.

### 5. SOLID authentication and Pod-backed persistence

Integrate SOLID-compatible authentication and persistence so personal template-catalogue state and calibration records can be stored in user-controlled Pods as a first-class capability.

### 6. GDaD capability template and first complete flow

Provide the first fully realised calibration experience using the GDaD capability framework as the reference implementation and product proving ground for dimensions, context selection, resolved templates, and completion.

### 7. Submission, sharing, and organisational review flow

Enable personal calibrations to move into institutional workflows for review, moderation, or discussion without abandoning personal ownership and portability.

### 8. Internationalisation and theme maturity

Expand language support and mature the theming model so the product can support English and Welsh and adapt its presentation across deployment contexts, including GDS-compatible implementations.

### 9. AI-assisted feedback and calibration support

Explore assistive capabilities that help users assess whether their evidence and self-rating align with the framework criteria while keeping human judgement central.

### 10. Broader assessment-model extensions beyond GDaD

Test and extend the model against other structured self-assessments and reflection-oriented templates that still fit the product’s core design.

## Later Options

- richer author support tools beyond explorer and validator
- user flow for adding extra templates to a personal catalogue
- separate history page for recent and historic calibrations
- simple read-only reviewer view
- additional reflection-oriented templates such as reflective log templates
- broader template families beyond GDaD

## Current Feature Reference

Current implemented behaviour is documented in `features/*.md`.

## Current Planned Features

- [Event recording and local storage](plans/event-recording-and-local-storage.md)
