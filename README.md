# Calibrate

Calibrate is a local-first web application for structured assessments. It is designed to help people create, keep, and reuse portable assessment records while still being able to share them into formal organisational review processes.

The first concrete use case is the UK Government Digital and Data Capability Framework self-assessment. The broader aim is to support similar structured self-assessments and reflective records where the same core pattern applies: a framework defines expectations, a person evaluates themselves against them, and that assessment may later be reviewed, moderated, or discussed with others.

## Why It Exists

Many self-assessments in public service follow the same shape:

- a framework defines criteria and guidance
- a person records a score, judgement, or level against those criteria
- supporting narrative or evidence is added
- the result may be reviewed by another person or reconciled across multiple assessors

These processes are often repetitive, organisation-bound, and awkward to carry across roles or employers. For personal capability assessments, that is a poor fit. People should be able to keep a record of their own development over time without losing it when they move between organisations.

Calibrate exists to provide a better default:

- personal assessment records that belong to the individual
- local-first data handling for privacy, resilience, and control
- interoperability with organisational review and moderation workflows
- configurable assessment templates that are separate from the application itself

## Who It Is For

Calibrate is aimed first at individual practitioners who need a structured, portable record of self-assessment, reflection, and professional development.

It also needs to work in environments where those personal records are submitted into wider organisational processes such as review, moderation, or capability conversations. Calibrate therefore serves both the individual and the institution, but it starts from the individual’s ownership of their own assessment data.

## Initial Scope

The first priority is GDaD capability self-assessment.

Beyond that, Calibrate may support other structured self-assessments and self-reflection processes where the model is still coherent: defined criteria, optional guidance, recorded judgements, narrative evidence, and possible later review.

Calibrate is not intended to become a generic workflow engine, a catch-all form builder, or a broad assessment platform for every evaluation process. The focus is on structured personal assessment and reflection that can still participate in formal review workflows.

## Product Outcomes

Calibrate should help users and organisations achieve a small number of clear outcomes:

- preserve a reusable personal record of assessment and development over time
- reduce duplicated effort when the same kinds of assessments recur
- support clearer, more consistent evidence-based reflection
- make it easier to move between personal ownership and organisational review
- allow assessment templates to evolve without invalidating existing assessment records

## Product Principles

The project should be guided by the following principles:

- Local-first by default. The product should work with personal data under the user’s control first, not treat remote systems as the starting assumption.
- Personal ownership of assessment data. Users should be able to keep and carry their own records across organisational boundaries.
- Interoperability over lock-in. Personal assessments must still be shareable into formal review and moderation workflows.
- Configurable assessment model. The application should support externally defined assessment templates rather than embedding specific frameworks in code.
- Privacy-aware by design. Personal records should avoid unnecessary identifying or bias-inducing information where possible.
- Stable records over time. Once an assessment begins, the effective template content should be captured with it so later template changes do not corrupt meaning.
- User-centred experience. The product should reduce friction for long-form reflective work and keep the focus on clarity, evidence, and progress.
- Accessibility and responsiveness by default. These are baseline requirements, not polish work.

## Experience Vision

Calibrate should feel clean, light, modern, and calm. The default presentation should be minimally branded and easy to adapt to different contexts.

The interaction design should favour:

- simple navigation
- low cognitive load
- clear progress through long assessments
- readable layouts for guidance, scoring, and written evidence
- strong accessibility on desktop and mobile

The project must also support workflows and presentation patterns that fit naturally with the GOV.UK Design System. That is a compatibility requirement, not the default visual identity. A deployment should be able to adopt a GDS-aligned theme when needed without changing the underlying product model.

## Architecture Direction

Calibrate is intended to be local-first and interoperable.

Personal data storage should be built around SOLID Pods as a core architectural direction, allowing individuals to keep their own assessment records in a standards-based personal data store. At the same time, the product must be able to participate in organisational workflows where assessments are reviewed, moderated, or submitted into shared systems.

The precise organisational backend model is not fixed yet. What is fixed is the requirement that Calibrate must bridge personal ownership and institutional process rather than choose one at the expense of the other.

## AI and AICA

AICA is part of how this project is developed. The README serves as a north star for future AICA-assisted design and implementation work by making the project intent, scope, and principles explicit.

AI may later become part of the product itself, for example by helping users judge whether their evidence matches a target proficiency level or by providing consistency-oriented feedback against the criteria of an assessment. That is a future capability, not a core v1 promise.

## Project Documents

The maintained project documents have distinct roles:

- `README.md`: project manifest, intent, scope, and product north star
- `ADR.md`: accepted architectural decisions, technical constraints, and UX/system-level constraints
- `PLANS.md`: ordered high-level roadmap
- `plans/*.md`: implementation-ready feature plans
- `WIP.md`: temporary session state during active work

`ORIGIN.md` is seed material only. It informed the initial project definition, but it is not intended to remain the maintained source of truth.
