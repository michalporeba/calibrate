# Reflective Template Model Expansion

## Summary

Deepen the template model for reflection-oriented templates before building more taker flow.

The goal is to make `gibbs` and `era` close to complete examples of the generic calibration model while keeping `gdad` as the later context-heavy stub.

## Decisions

- Reflection templates should support richer content without dimensions or scoring.
- The next model step adds:
  - template-level guidance
  - item-level guidance
  - optional item-level indicators
- Reflective templates do not use scoring in this phase.
- The first inheritance step stays narrow:
  - child templates may override description and guidance
  - child templates may not replace the structural item set
- `gdad` remains intentionally incomplete and context-heavy.

## Deliverables

### 1. Template model support

Extend the YAML model, frontend parser, resolver, and validation so templates can express:

- top-level guidance
- item guidance
- item indicators
- narrow inherited overrides for description and guidance

### 2. Richer reflection templates

Develop:

- `templates/gibbs/`
- `templates/era/`

into near-complete reflection templates with fuller framing, item guidance, and indicators.

### 3. Explorer support

Update `/explore` so authors can see:

- template-level guidance
- item-level guidance
- indicators
- resolved inherited content where applicable

## Acceptance Criteria

- `gibbs` and `era` express richer reflective content without dimensions.
- Reflective templates remain valid without scoring.
- The explorer shows template guidance, item guidance, and indicators.
- Validation catches malformed guidance or indicator structures.
- Narrow inherited description/guidance overrides resolve correctly.
- `gdad` still validates as a stub and remains usable as the later complex-flow template.
- `npm run build` still succeeds.
- `npm run build:pages` still succeeds.
