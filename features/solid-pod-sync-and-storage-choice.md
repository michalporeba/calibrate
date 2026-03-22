# Solid Pod Sync And Storage Choice

## Goal

Let a person choose whether Calibrate stays local-only in the browser or also
syncs saved events to a Solid Pod they control.

## Problem

Local-first storage is useful, but browser-only storage is fragile and tied to
one device. People need a clear choice between staying local and connecting a
personal Pod for synchronisation.

## Solution

Calibrate provides a storage settings flow, a visible local-only warning, and a
Solid connection path that syncs events to `/calibrate/events/` in the user
pod.

## Current Behaviour

- `/storage` is the user-facing storage settings route.
- The default mode is local-only storage in the browser.
- Event pages show a visible warning when information is only stored locally.
- A user can start a Solid login flow from `/storage`.
- A connected user can sync events to and from their Solid Pod.
- Events sync to `/calibrate/events/` in the connected pod.
- Local IndexedDB remains the working store even when Pod sync is enabled.
- A dockerized local Community Solid Server and browser integration test harness
  are included for development.

## Stories

- As a person using Calibrate privately, I can keep my information only in this
  browser and be clearly warned about that choice.
- As a person who wants synchronisation, I can connect a Solid Pod and keep my
  events under my own control.
- As a developer, I can run a local Community Solid Server and exercise the pod
  connection workflow automatically.

## Assertions

```gherkin
Scenario: Local-only warning
  Given a person has not connected a Solid Pod
  Then event pages show that saved information stays only in this browser

Scenario: Pod sync choice
  Given a person opens storage settings
  When they connect to a Solid Pod
  Then the app can sync events to /calibrate/events/ in the pod
  And local storage remains available

Scenario: Development pod workflow
  Given a developer runs the Pod integration harness
  Then a local Community Solid Server is started
  And the browser connection workflow is exercised against it
```
