# Feature Documentation Reorganisation

## Summary

Convert the implemented step-oriented plans into concise, user-centric feature
descriptions stored in `features/*.md`.

The old numbered plan files should be archived as implementation history.
`PLANS.md` should remain a roadmap-only document, while `features/*.md` become
the maintained reference for current system behaviour.

## Decisions

- Use `features/*.md` for current implemented behaviour.
- Use concise GPS format:
  - Goal
  - Problem
  - Solution
- Add short user stories and Gherkin-style assertions to each feature file.
- Keep feature descriptions generic rather than template-specific.
- Archive implemented numbered plans under `archive/plans/`.
- Keep `PLANS.md` as a roadmap, not a feature index.

## Deliverables

- a new `features/` directory with generic feature descriptions
- updated general documentation pointing readers to `features/*.md`
- implemented numbered plans moved to `archive/plans/`
- `PLANS.md` simplified so it describes future direction only

## Acceptance Criteria

- Current product behaviour can be understood from `features/*.md` without
  reading archived plans.
- `PLANS.md` reads as a roadmap rather than a mixed roadmap/history document.
- Archived plans remain available as implementation history.
- Feature descriptions are concise, user-centric, and generic.
