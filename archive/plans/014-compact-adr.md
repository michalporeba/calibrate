# Compact ADR

## Summary

Refactor `ADR.md` into a denser, more readable decisions record without
dropping important knowledge or changing accepted direction.

## Decisions

- Keep `ADR.md` as the umbrella architecture and constraints record.
- Preserve current accepted direction and open questions.
- Replace the long numbered micro-decision format with grouped decision
  sections.
- Remove process-heavy stack-evaluation text and keep the actual drivers,
  recommendation, and follow-up spikes.
- Reduce duplication between accepted decisions, UX constraints, and technical
  constraints.

## Deliverables

- a shorter, grouped `ADR.md`
- preserved decisions on local-first, templates, UX shape, theming, storage,
  and stack direction
- a denser stack section focused on recommendation rather than decision method

## Acceptance Criteria

- No important accepted decision is lost.
- Internal consistency is preserved.
- The document is materially shorter and easier to scan.
- Open questions remain visible.
