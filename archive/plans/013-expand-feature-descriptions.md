# Expand Feature Descriptions

## Summary

Strengthen the new `features/*.md` files so they remain concise but preserve
enough behavioural detail to serve as the main reference for implemented system
behaviour and regression checks.

## Decisions

- Keep the existing generic feature grouping.
- Retain GPS, short stories, and Gherkin assertions.
- Add a concise `Current behaviour` section to each feature file.
- Capture important current decisions, limits, and expectations without
  reintroducing implementation-step detail.

## Deliverables

- expand the five current feature files with missing behavioural context
- preserve concision while making them reliable for regression understanding

## Acceptance Criteria

- the feature files remain concise
- key current behaviour and important limits are documented
- future agents can rely on `features/*.md` without reading archived plans for
  ordinary regression understanding
