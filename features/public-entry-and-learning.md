# Public Entry And Learning

## Goal

Help a first-time visitor understand what Calibrate is and move quickly into either starting from a template or learning more.

## Problem

People need a calm, low-friction entry into the product. They should not have to understand the whole system or navigate author tooling before getting oriented.

## Solution

Calibrate provides a minimal public landing page, a simple explainer page, and subtle access to support tools from the same shared entry point.

## Current Behaviour

- The public root is a shared entry for people starting from a template and authors using support tools.
- The landing page stays intentionally sparse, with one primary action, one secondary learning route, and subtle support-tool access.
- The primary call to action is `Let's calibrate!`.
- The learn page is informational and plain-language. It explains the product and its principles, but it is not technical documentation.
- The support-tool entry is visible from the landing page, but intentionally secondary to the main start flow.

## Stories

- As a visitor, I can land on a simple page with one obvious primary action so I can begin without confusion.
- As a visitor, I can open a short explainer so I can understand the purpose and principles of the product before starting.
- As an author, I can reach support tools from the public entry without those tools dominating the main experience.

## Assertions

```gherkin
Scenario: Shared public entry
  Given a person opens the root page
  Then they see a minimal explanation of Calibrate
  And they can choose to start or learn more
  And support-tool access is available but secondary

Scenario: Learn route
  Given a person wants more context
  When they open the learn page
  Then they can read a plain-language explanation of what Calibrate is for
  And the page does not act as technical documentation

Scenario: Secondary author access
  Given a person needs support tools
  Then they can reach them from the public entry
  And those links remain visually secondary
```
