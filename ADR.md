# ADR

## Status

Accepted as the initial umbrella architecture and constraints record for Calibrate.

## Purpose

This document captures the decisions and constraints that should guide implementation. Product intent and scope belong in `README.md`. Roadmap ordering belongs in `PLANS.md`.

## Accepted Decisions

### 1. Local-first architecture

Calibrate is a local-first application. Personal calibration work must be possible with the user retaining direct control over their data rather than depending on a central service as the default mode.

### 2. User-owned personal data

Calibration records created for self-assessment and self-reflection are owned by the individual user. The system should preserve portability across roles, teams, and organisations.

### 3. SOLID Pods as a foundational direction

SOLID Pods are a core architectural commitment for personal storage and identity. They are not just one possible integration among many. Alternative storage mechanisms may exist later, but the initial architecture should assume SOLID-compatible personal data handling.

### 4. Organisational review as a required interoperability target

Calibrate must support movement from personal calibration into organisational review, moderation, or submission workflows. The exact mechanism is not yet fixed, but support for institutional process is a core requirement.

### 5. External templates

Template definitions should live outside the application codebase. Templates must be versionable and authorable with simple tools so they can be maintained without tightly coupling content changes to application releases.

### 6. Calibration snapshot stability

Once a calibration starts, the effective template content used by that calibration must be captured with the record. Later changes to a source template must not silently redefine an existing calibration.

### 7. Template inheritance with overrides

Template customisation should be modelled as inheritance with overrides. Derived templates may narrow or extend upstream templates, and the model should allow multiple inheritance levels later if needed.

### 8. Generic core vocabulary

The shared domain vocabulary should use `template`, `context`, `calibration`, `dimension`, `item`, and `author`. Package-specific labels such as role family, role, level, grade, skill, or question should be treated as template-level specialisations of those generic concepts.

### 9. Shared entry with subtle author-tool access

One public landing page should serve both takers and authors. The taker route is primary. Author support tools remain available from the same entry surface, but visually secondary.

### 10. Taker-centred product shape

The person taking a calibration is the primary UX centre. Author workflows exist to support that experience and may live in separate support tools while still sharing the same domain model.

### 11. Context setup before calibration creation

Context selection is an explicit step before creating a calibration. For GDaD-style templates, the default setup sequence is role family, then role, then level, followed by explicit confirmation.

### 12. Freeze resolved template on start

When a user confirms context, Calibrate should resolve template inheritance and context into the exact shape used by the calibration, then freeze that resolved form for the life of the calibration.

### 13. Internal deduplication is allowed

If two calibrations would freeze to the same resolved template, the implementation may internally reuse a shared resolved representation. This does not change the user-facing rule that each calibration starts from a frozen resolved template.

### 14. Unbranded default presentation

The default visual presentation should be light, clean, minimal, and not strongly branded. The product should feel modern and calm by default.

### 15. Accessibility and responsiveness are baseline requirements

Responsive behaviour and accessibility are core quality requirements from the start. They are not optional later-stage enhancements.

### 16. User-centred interaction model

The interaction model should prioritise clarity, focus, and low cognitive load, especially for long-form reflective work that combines guidance, selection, scoring, and written evidence.

### 17. Resumability is a first-class behaviour

In-progress calibrations must be easy to re-enter and should be surfaced prominently in the main taker flow rather than hidden in a secondary area.

### 18. GDS compatibility without mandatory GDS branding

The product must support workflows and presentation patterns that fit naturally with the GOV.UK Design System. It must be possible to deliver a GDS-aligned theme, but the default product presentation does not need to inherit GOV.UK branding.

### 19. Multiple predefined themes may be hosted

The product may be published in more than one predefined visual variant from
the same codebase. Theme choice for the public demo should happen at build or
deployment level rather than as an in-app user preference.

### 20. GDS-aligned does not mean GOV.UK-branded

The GDS-aligned variant should follow GOV.UK Design System patterns where useful
but must not imply that the product is an official GOV.UK service. Restricted
identity elements such as the crown logo and the GDS Transport typeface should
not be used in the non-government hosted demo.

### 21. Internationalisation from the start

The application should be designed for internationalisation from the beginning, initially supporting English and Welsh.

### 22. Corporate/shared backends are secondary to personal capability

Shared organisational storage and review backends are important, but they should not drive the architecture at the expense of the local-first personal experience.

## UX and Design Constraints

- The UI should support long, reflective tasks without overwhelming the user.
- Information architecture should separate template guidance, user input, and progress status clearly.
- Mobile and desktop layouts should support the same core workflows.
- Themes should be able to change visual presentation without changing product behaviour or content structure.
- Accessibility expectations should include semantic structure, keyboard support, readable contrast, and screen-reader-friendly interaction patterns.
- Semantic HTML should be used where it expresses real document meaning, landmarks, or navigation structure.
- Generic wrappers should remain `div` or `span` when they exist only for layout or styling.
- Native HTML elements should be preferred over ARIA-decorated generic elements wherever the platform already provides the right semantics.
- The landing page should stay minimal, with a primary taker action, a secondary explainer route, and subtle author-tool links.
- The choose-a-template page should show in-progress calibrations prominently before curated template cards.
- Starting from a catalogue card or a direct link should converge into the same context-setup flow.
- Creating a calibration should require explicit confirmation before materialisation.
- Once a calibration starts, its selected context should remain visible lightly in the header.
- The minimum author-support surface is an explorer plus a read-only validator showing errors and resolved structure.

## Technical Constraints

- Templates must be loadable from external sources rather than embedded as hard-coded framework definitions.
- Template formats should remain simple enough to author and review with basic tooling.
- Calibration records must preserve the versioned context needed to interpret them later.
- The internal model should be compatible with personal RDF-based storage.
- Authentication and identity flows should align with SOLID infrastructure.

## Stack Selection Criteria

The initial technology stack should be evaluated against Calibrate's product and architectural constraints rather than against generic web-application preferences.

### Current assumptions

- The default implementation assumption is TypeScript-first.
- v1 should avoid a bespoke backend service unless later technical analysis proves one is necessary.
- SOLID Pods are the primary personal storage mechanism.
- Templates may initially be hosted as static external content, including Git repositories.

### Evaluation priorities

Candidate stacks should be assessed in this order of importance:

1. Local-first capability
2. SOLID and RDF fit
3. Frontend maintainability
4. Accessible responsive UI delivery
5. Template system fit
6. No-backend deployment simplicity
7. Future interoperability headroom
8. AI extension headroom

### Evaluation criteria

- **Local-first capability**: The stack should support browser-first data handling, local persistence, intermittent connectivity, and UX patterns that do not assume a permanent server round-trip.
- **SOLID and RDF fit**: The stack should have a practical path for SOLID authentication, Pod access, and RDF-compatible data handling in the browser.
- **Frontend maintainability**: The stack should be readable, testable, well-supported, and sustainable for long-term iteration.
- **Accessible responsive UI delivery**: The stack should make it practical to build a clean, responsive, accessible interface with flexible theming and GDS-compatible presentation.
- **Template system fit**: The stack should support loading, caching, versioning, and interpreting externally managed templates without introducing unnecessary backend complexity.
- **No-backend deployment simplicity**: The stack should support static or similarly simple deployment for early product iterations.
- **Future interoperability headroom**: The stack should allow later introduction of organisational review flows and optional shared services without forcing a frontend rewrite.
- **AI extension headroom**: The stack should not block later assistive features, while avoiding AI-specific complexity in v1.

### Shortlisted stack families

The first comparison round should focus on a small set of TypeScript-first, browser-oriented options:

- **React + TypeScript + Vite** as the pragmatic baseline
- **SvelteKit + TypeScript** in static or client-first mode as a lighter client-side alternative
- **Vue 3 + TypeScript + Vite** as an alternative SPA-oriented baseline

Server-heavy or backend-first options should not be the default starting point unless the shortlisted client-first options prove inadequate for SOLID or local-first requirements.

### Comparison method

Each shortlisted stack should be compared using a simple qualitative matrix:

- strong fit
- adequate fit
- weak fit
- unknown / needs spike

Each comparison should answer these concrete questions:

- Can v1 run as a browser-first application without a bespoke backend?
- How awkward is SOLID authentication and Pod access in this stack?
- How awkward is RDF handling in the browser in this stack?
- How well does it support local persistence and offline-friendly UX?
- How well does it support the intended unbranded, accessible, responsive UI with a GDS-compatible theme option?
- How easily can it fetch, cache, and version external templates from static sources?
- What is the likely long-term maintenance burden?

If two options are otherwise close, preference should go to the one with the cleaner SOLID and RDF path rather than the one with the larger general ecosystem.

### Expected decision output

The next architecture decision step should produce a concise comparison and recommendation covering:

- the preferred primary stack
- one fallback option
- any required technical spikes before final commitment
- whether v1 can remain fully backendless or needs a minimal companion service

## Initial Stack Comparison and Recommendation

This section records the first concrete comparison of candidate stacks against the criteria above.

### Comparison summary

#### React + TypeScript + Vite

- **Local-first capability**: Strong fit. A browser-first SPA suits the current no-backend assumption and works well with local persistence patterns.
- **SOLID and RDF fit**: Strong fit. It does not solve SOLID or RDF itself, but it does not get in the way, and it has the broadest ecosystem for integrating external identity, data, and offline tooling.
- **Frontend maintainability**: Strong fit. It has the deepest talent pool, the broadest documentation base, and the most predictable long-term maintainability.
- **Accessible responsive UI delivery**: Strong fit. It is straightforward to build a clean, accessible, responsive interface and preserve control over visual identity and theming.
- **Template system fit**: Strong fit. Fetching, caching, and interpreting static external template content is uncomplicated.
- **No-backend deployment simplicity**: Strong fit. Vite supports a simple static build and deployment model.
- **Future interoperability headroom**: Strong fit. It leaves room for later service integration without constraining the early product shape.
- **AI extension headroom**: Strong fit. It allows later assistive features without forcing architecture changes.

Overall assessment: best baseline choice.

#### Vue 3 + TypeScript + Vite

- **Local-first capability**: Strong fit.
- **SOLID and RDF fit**: Adequate fit. Similar to React at the browser level, but with a smaller ecosystem and fewer likely examples in the specific linked-data and local-first niche.
- **Frontend maintainability**: Adequate to strong fit. It is a mature framework with good TypeScript support, but it is a less obvious default for this project than React.
- **Accessible responsive UI delivery**: Strong fit.
- **Template system fit**: Strong fit.
- **No-backend deployment simplicity**: Strong fit.
- **Future interoperability headroom**: Strong fit.
- **AI extension headroom**: Strong fit.

Overall assessment: credible fallback if the team prefers Vue, but not the strongest default.

#### SvelteKit + TypeScript

- **Local-first capability**: Strong fit. A static or client-first deployment model can work well for a backendless app.
- **SOLID and RDF fit**: Adequate fit. The framework does not obstruct these requirements, but its ecosystem is smaller and more specialised integration paths are less proven.
- **Frontend maintainability**: Adequate fit. Developer experience is strong, but long-term staffing and ecosystem depth are less predictable than React.
- **Accessible responsive UI delivery**: Strong fit.
- **Template system fit**: Strong fit.
- **No-backend deployment simplicity**: Adequate to strong fit. It can be deployed statically, but it introduces more framework surface than is required for a browser-first application.
- **Future interoperability headroom**: Adequate fit. It can grow into richer deployment models later, but that is not a current requirement.
- **AI extension headroom**: Strong fit.

Overall assessment: technically viable, but more framework than Calibrate currently needs.

### NextGraph fit assessment

NextGraph should not be treated as a direct alternative to React, Vue, or SvelteKit. It is better understood as a possible local-first data and sync substrate that could sit underneath a browser UI stack.

Against Calibrate's needs, NextGraph has notable strengths:

- strong conceptual alignment with local-first design
- explicit support for RDF and linked-data-style modelling
- CRDT-based sync and browser-local data access
- TypeScript-oriented framework material, including ORM packages and framework hooks for React, Vue, and Svelte

It also has material fit risks right now:

- official Solid compatibility is described as something they will "soon offer", which means it does not yet satisfy Calibrate's current SOLID-first commitment as a settled dependency
- its web SDK documentation appears inconsistent: one page says the Web JS SDK for React and Svelte is not ready yet, while other framework documentation describes TS packages and frontend hooks
- adopting NextGraph early would add substantial architectural coupling to a younger and less-proven ecosystem before Calibrate has validated its simpler browser-first path

Decision: NextGraph is not the primary stack recommendation for v1. It is a promising candidate for a focused technical spike around local-first RDF storage and sync, especially if stronger Solid interoperability matures.

### Provisional recommendation

- **Primary recommendation**: React + TypeScript + Vite
- **Fallback recommendation**: Vue 3 + TypeScript + Vite
- **Do not select as primary for now**: SvelteKit, because it adds framework surface without solving a current problem better than React or Vue
- **Do not select as primary for now**: NextGraph, because it is not a direct UI-stack substitute and its current Solid and web-SDK maturity is not strong enough for Calibrate's core constraints

### Required follow-up spikes

- Validate the practical state of SOLID authentication and Pod access in a browser-only TypeScript application.
- Validate the browser-side RDF toolchain needed for Calibrate's core model and storage interactions.
- Perform a focused NextGraph spike only if there is interest in replacing part of the local storage and sync approach with a richer local-first substrate later.

## Open Questions

- What is the best mechanism for submitting or sharing a personal calibration into an organisational review workflow?
- How should template packages be distributed, discovered, and versioned in practice?
- How should users add additional templates to their personal catalogue?
- How tightly should GDS compatibility map to component implementation versus theme-level styling and layout conventions?
- What is the right boundary between local-first offline capability and connected collaboration or review features?
