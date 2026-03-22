# Event Recording And Local Storage

## Goal

Help a person capture professional events as reusable records they can keep,
review, and later draw into reflection or assessment work.

## Problem

Reflection and self-assessment often start from something that actually
happened. Without a simple way to record those moments over time, people have
to reconstruct evidence later or lose useful context entirely.

## Solution

Calibrate provides a record flow and an events list backed by local IndexedDB
storage. Events are saved as standalone CPD entries in the app model, with a
separate RDF mapping layer prepared for later Pod persistence.

## Current Behaviour

- `/record` is a real entry form rather than a placeholder.
- A saved event includes a title, description, and an occurred-at value.
- Occurred-at supports explicit precision: exact date, month, season, or year.
- Saving an event writes it to local IndexedDB and routes the user to `/events`.
- `/events` lists saved events in reverse chronological order using the best
  available occurred-at sort key.
- Events currently stand alone. They are not yet linked from reflections or
  calibrations.
- The working storage model is app-shaped. RDF is currently a mapping layer for
  later SOLID Pod work, not the direct runtime storage format.

## Stories

- As a person keeping a professional record, I can save something that happened
  without first choosing a template.
- As a person who does not know the exact date, I can still record an event
  using broader time precision.
- As a person returning later, I can browse my saved events and recognise what
  each one is about.

## Assertions

```gherkin
Scenario: Save an event locally
  Given a person fills in the record form with a date, title, and description
  When they save the event
  Then the event is stored locally
  And they are taken to the events list

Scenario: Record with imprecise time
  Given a person does not know the exact date
  When they choose month, season, or year precision
  Then they can still save the event
  And its time meaning is preserved

Scenario: Browse saved events
  Given a person has recorded one or more events
  When they open the events page
  Then they see the saved events in reverse chronological order
  And each event shows a readable date, title, and short description
```
