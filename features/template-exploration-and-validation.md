# Template Exploration And Validation

## Goal

Help authors inspect templates, understand what is currently published, and identify structural problems before relying on a template in the main flow.

## Problem

Text-authored templates are flexible, but authors need a readable way to inspect configured templates, see validation feedback, and understand the resolved shape of what they have defined.

## Solution

Calibrate provides a combined explore tool that shows configured templates, enabled and disabled status, validation issues, inheritance, and resolved structure in a read-only author-facing view.

## Current Behaviour

- The explore tool shows configured templates for the active profile, including both enabled and disabled entries.
- Selecting a template shows its metadata, source information, inheritance chain, validation output, and resolved summary.
- Validation issues are shown as readable errors or warnings instead of breaking the page.
- Where a template package is split across files, the explore tool also shows the external structure it loads.
- The explore tool is read-only. It supports inspection and validation, not in-browser editing.

## Stories

- As an author, I can see which templates are configured and whether they are enabled in the current profile.
- As an author, I can inspect a template and read validation feedback so I can fix mistakes early.
- As an author, I can see the resolved structure of a template so I can understand what the system will use.

## Assertions

```gherkin
Scenario: Explore configured templates
  Given a person opens the explore tool
  Then they can see the configured templates for the current profile
  And whether each one is enabled or disabled

Scenario: Validation feedback
  Given a template contains structural problems
  When it is inspected
  Then the explore tool shows readable validation issues
  And the application does not crash

Scenario: Resolved structure
  Given a template is valid enough to inspect
  Then the explore tool shows its resolved structure in read-only form

Scenario: Split package inspection
  Given a template package uses additional files beyond template.yml
  Then the explore tool shows the loaded external structure for that package
```
