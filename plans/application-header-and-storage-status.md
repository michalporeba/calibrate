# Application Header And Storage Status

## Summary

Replace the current footer-based storage status with a light shared application
header that appears on the working app pages and stays off the public landing
and learn pages.

This slice should:

- add a standard application header component
- show the Calibrate brand linking to the landing page
- show a small amount of navigation headroom for current and future links
- move storage identity and sync state into that header
- keep the header visually light so it only nudges content down slightly

## Key Changes

### Shared application header

- Add a single reusable header component for application pages.
- Show:
  - `calibrate` brand linking to `/`
  - a small navigation area
  - storage mode / identity / sync state
  - a link to `/storage`
- Keep the header compact and unobtrusive.

### Route placement

- Show the application header on working app pages such as:
  - `/start`
  - `/start/...`
  - `/record`
  - `/events`
  - `/storage`
  - `/explore`
  - calibration pages
- Do not show it on:
  - `/`
  - `/learn`

### Page-frame cleanup

- Treat the application header as the standard shell chrome for app pages.
- Remove redundant page-local home/back links where the header already provides
  the route back to the landing page.

## Test Plan

- Working app pages show the shared header.
- `/` and `/learn` do not show the shared header.
- The header shows brand, storage state, and navigation without noticeably
  distorting the main page content.
- Storage sync state is no longer shown in a global footer.
- `npm run build` and `npm run build:pages` continue to pass.

## Assumptions

- The app header is the right place for storage and identity state.
- The public landing and learn pages should remain more minimal than the
  working application pages.
