# PLANS

This document lists the high-level implementation order for Calibrate.

Detailed, implementation-ready work should be defined in `plans/*.md`. `PLANS.md` is the roadmap, not the feature specification.

## Roadmap

### 1. Project foundations and core domain model

Define the core concepts, vocabulary, and domain boundaries for assessments, templates, records, evidence, scoring, and review without locking the system to GDaD-specific terms.

### 2. Template model and template-loading workflow

Define how assessment templates are authored, versioned, loaded, and interpreted so framework content can evolve independently of application code.

### 3. UX foundations, design system strategy, accessibility baseline, and responsive shell

Establish the product’s core interaction model, layout system, accessibility baseline, responsive behaviour, and theming approach, including support for GDS-aligned presentation without making it the only visual style.

### 4. Local-first personal assessment creation and storage

Deliver the first end-to-end ability for a user to create, edit, and retain a personal assessment record under their own control.

### 5. SOLID authentication and Pod-backed persistence

Integrate SOLID-compatible authentication and persistence so personal records can be stored in user-controlled Pods as a first-class capability.

### 6. GDaD capability self-assessment as the first complete end-to-end template set

Provide the first fully realised assessment experience using the GDaD capability framework as the reference implementation and product proving ground.

### 7. Submission, sharing, and organisational review flow

Enable personal assessments to move into institutional workflows for review, moderation, or discussion without abandoning personal ownership and portability.

### 8. Internationalisation and theme maturity

Expand language support and mature the theming model so the product can support English and Welsh and adapt its presentation across deployment contexts, including GDS-compatible implementations.

### 9. AI-assisted feedback and calibration support

Explore assistive capabilities that help users assess whether their evidence and self-rating align with the framework criteria while keeping human judgement central.

### 10. Broader assessment-model extensions beyond GDaD

Test and extend the model against other structured self-assessments and, where appropriate, more complex maturity-style assessments that still fit the product’s core design.
