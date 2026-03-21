# Hosted Theme Variants

## Goal

Allow the same product behaviour to be available in more than one visual style.

## Problem

Calibrate needs a minimal personal presentation and a GDS-aligned presentation without splitting into separate products or changing behaviour between them.

## Solution

Calibrate is built once and published in multiple predefined visual variants, with the same routes, semantics, and interactions available in each hosted variant.

## Current Behaviour

- The hosted demo exposes a root chooser at `/calibrate/`.
- The current hosted variants are `/calibrate/me/` and `/calibrate/gds/`.
- The same application routes exist in both hosted variants.
- Theme choice is fixed per build and per URL. There is no in-app runtime theme switcher.
- Local development also supports the two variants side by side on separate dev servers.

## Stories

- As a user, I can use the same product in either hosted style without relearning the flow.
- As a deployer, I can publish more than one visual variant from one codebase.
- As a reviewer, I can compare themed variants without seeing different product behaviour.

## Assertions

```gherkin
Scenario: Variant chooser
  Given a person opens the hosted root
  Then they can choose between the available hosted theme variants
  And each choice leads to a dedicated themed app root

Scenario: Shared behaviour across themes
  Given a person opens the same route in different hosted variants
  Then the behaviour and content structure are the same
  And the visual presentation is different

Scenario: Stable themed entry points
  Given the product is hosted
  Then each theme variant has its own stable URL
  And theme selection does not depend on user settings inside the app
```
