# Start And Configure Calibration

## Goal

Help a person choose a template, configure any required context, and begin a calibration with a clear and low-friction flow.

## Problem

Starting a calibration can involve both simple templates and context-heavy templates. The user needs a flow that stays understandable in both cases and only asks for the setup that matters.

## Solution

Calibrate provides a start flow with template selection, template details, one-dimension-at-a-time setup where needed, confirmation for configured templates, and direct start for simple templates.

## Current Behaviour

- `/start` shows enabled templates for the current profile.
- Selecting a template opens a details page before any setup begins.
- If a template has setup dimensions, they are presented one at a time.
- Setup order currently follows YAML dimension order.
- Changing an earlier choice clears later choices.
- Templates with setup dimensions lead to a confirmation step showing the selected context and a short resolved preview.
- Templates with no setup dimensions start directly from the details page.
- The flow currently ends in a placeholder started-calibration view rather than a full editable calibration workspace.
- Resume and re-entry of in-progress calibrations are not implemented yet.

## Stories

- As a person starting a calibration, I can choose a template from a clear list so I can begin from a known starting point.
- As a person using a context-heavy template, I can choose one setup dimension at a time so the flow stays manageable.
- As a person using a simple template, I can start immediately without unnecessary confirmation.

## Assertions

```gherkin
Scenario: Template selection
  Given a person opens the start flow
  Then they can choose from the enabled templates in the current profile

Scenario: Template details before start
  Given a person selects a template
  Then they can review its details before continuing

Scenario: One dimension at a time
  Given a selected template requires setup
  Then the person chooses one dimension per step
  And later choices depend on earlier selections where relevant
  And changing an earlier choice clears later choices

Scenario: Confirmation for configured templates
  Given a template requires setup
  When all required selections are made
  Then the person can review the resolved context before starting

Scenario: Direct start for simple templates
  Given a template has no setup dimensions
  Then the person can start directly from the template details page

Scenario: Current handoff after start
  Given a person starts a template
  Then they are routed into the current started-calibration placeholder view
```
