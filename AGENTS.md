# AGENTS

This file tells agents how to work in this repository.
Follow these instructions unless a later project document explicitly supersedes them.

## Non-negotiables

- Read `README.md` and `ADR.md` before making substantive changes.
- Do not modify `ORIGIN.md`.
- Do not start implementation of a new feature without a corresponding `plans/*.md` file.
- Once implementation starts on a feature, do not edit its `plans/*.md` file.

## Source of truth

Use project documents in this order:

1. `README.md` for project purpose, scope, and outcomes
2. `ADR.md` for accepted technical direction
3. `PLANS.md` for feature order and current roadmap
4. `plans/*.md` for implementation-ready feature definitions
5. `WIP.md` for restart context during active work

`ORIGIN.md` is background material only. Do not treat it as a maintained project document and do not modify it.

## Planning workflow

- New features must be defined in `plans/*.md`.
- Each feature plan should be specific enough to implement without further design work.
- `PLANS.md` should contain the ordered list of planned features and link to the relevant `plans/*.md` files.
- Once implementation starts on a feature, its `plans/*.md` file becomes immutable.
- If the planned approach becomes invalid, create a new plan file and update `PLANS.md` rather than rewriting the old plan.

## Working state

- Use `WIP.md` as temporary working memory for an in-progress agent session.
- `WIP.md` should make it possible to resume interrupted work without relying on chat history alone.
- Keep `WIP.md` concise and factual: current task, latest decisions, remaining steps, blockers, and verification status.
- `WIP.md` is not a source of long-term project truth and should not replace `README.md`, `ADR.md`, `PLANS.md`, or feature plans.
- `WIP.md` must be ignored by git.


