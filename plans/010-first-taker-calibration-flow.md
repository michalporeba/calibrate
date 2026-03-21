# First Taker Calibration Flow

## Summary

Implement the first real taker flow for starting a calibration from the
catalogue.

The flow is:

- `/start` shows available calibration cards
- selecting a card opens a calibration details page
- if setup dimensions exist, the user moves through one dimension per page
- a confirmation page shows the chosen context and a short resolved preview
- confirming creates and starts a placeholder calibration view

This phase is for starting new calibrations only. Resume remains later work.

## Decisions

- Use dedicated routes rather than a single stateful page.
- Selecting a card opens a details page first.
- Resume behaviour is out of scope for this implementation.
- Setup dimensions are presented one at a time.
- YAML order defines setup order.
- Navigation is linear with Back and Continue.
- Simple templates with no setup dimensions show `Start calibration` on the details page.
- Confirmation shows template identity, selected context, and a short resolved preview.
- Changing an earlier selection clears all later selections.

## Deliverables

### 1. Route flow

Add routes for:

- catalogue
- template details
- per-dimension configuration
- confirmation
- created calibration placeholder

### 2. Generic setup resolver

Add a browser-side flow resolver that:

- loads enabled templates
- loads one selected template in detail
- derives setup dimensions from template YAML order
- loads available options for each step
- resolves a short preview for confirmation

### 3. Taker UI

Implement:

- calibration cards on `/start`
- details page with `Configure calibration` or `Start calibration`
- one-dimension-per-page setup flow
- confirmation page with resolved preview
- placeholder started-calibration page

## Acceptance Criteria

- `/start` shows enabled calibration cards.
- Selecting a card opens a details page.
- Simple templates can skip directly to confirmation/start.
- Context-driven templates can be configured one dimension at a time.
- Step order follows YAML order.
- Back/Continue works and changing an earlier choice clears later choices.
- Confirmation shows template name, summary/description, selected context, and item preview.
- Starting routes into a placeholder calibration page.
- `npm run build` succeeds.
- `npm run build:pages` succeeds.
