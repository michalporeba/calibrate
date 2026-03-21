# Template Model Reference

## Summary

Add a maintained top-level template-model reference document that explains the
generic template model, current repository conventions, and current example
usage in one place.

This documentation work should make the model understandable to both template
authors and engineers without turning `README.md` or `ADR.md` into schema
specifications.

## Decisions

- Add a new top-level maintained document: `TEMPLATE_MODEL.md`.
- The document is written for both authors and engineers.
- The document is generic first and example-backed second.
- Current templates, including GDaD, are described only as examples of the
  generic model.
- `README.md` and `ADR.md` should only gain lightweight cross-references.

## Deliverables

### 1. New maintained reference document

Create `TEMPLATE_MODEL.md` covering:

- purpose of the template model
- core concepts
- package and catalogue structure
- current YAML structure and ordering rules
- dimensions and dependent dimensions
- items and generic variants
- current inheritance model
- high-level resolution into a frozen calibration snapshot
- concise examples from current templates
- clearly marked current limits and deferred areas

### 2. Minimal cross-references

Update maintained docs so the new reference is discoverable:

- `README.md`
- `ADR.md`
- `PLANS.md`

### 3. Keep scope tight

The document should describe the current model and intent. It should not invent
new schema features, formal validation rules, or GDaD-specific model behavior.

## Acceptance Criteria

- A template author can read `TEMPLATE_MODEL.md` and understand how to create
  or extend a simple template.
- An engineer can read it and understand the current intended meaning of
  dimensions, items, variants, inheritance, and resolution.
- The document distinguishes generic model capability from current repository
  packaging convention.
- GDaD is presented as an example of the generic model, not as a special case.
- `README.md` and `ADR.md` point readers to the new reference without
  duplicating it.
