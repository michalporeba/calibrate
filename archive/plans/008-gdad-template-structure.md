# GDaD Template Structure

## Summary

Restructure the GDaD template so `template.yml` stays small and readable while
roles and skills move into external YAML files under `roles/` and `skills/`.

The model is:

- `role-family` is a shared taxonomy
- `role` is a shared entity that may belong to multiple families
- `role-level` is contained within a role
- `grade` is a shared vocabulary mapped from role-level
- `skill` is a shared item catalogue
- each role-level chooses the target proficiency for each required skill
- each skill defines its proficiency-specific wording centrally

## Decisions

- `templates/gdad/template.yml` remains the entry point and dimension manifest.
- `role-family`, `grade`, and `proficiency` stay inline in the template.
- `role` becomes a directory-backed dimension sourced from `roles/`.
- `items` become a directory-backed shared skill catalogue sourced from `skills/`.
- Each role is stored in its own YAML file.
- Each skill is stored in its own YAML file.
- `families` are declared only on the role.
- `role-level` belongs to exactly one role.
- Skill proficiency variants are defined on the skill, not on the role-level.

## Deliverables

### 1. GDaD repository split

Create:

- `templates/gdad/roles/`
- `templates/gdad/skills/`

and rewrite `templates/gdad/template.yml` to reference those directories.

### 2. Parser and validation updates

Extend the local template parser and explorer so:

- dimensions can use directory-backed sources
- items can use a directory-backed source
- role files and skill files are loaded from the generated template bundle
- cross-reference validation works across families, grades, proficiencies, role levels, and skills

### 3. Explorer support

Show the GDaD structure clearly in `/explore`, including:

- external role counts and details
- external skill counts and details
- role families per role
- role-level counts and skill counts
- skill proficiency variant counts

### 4. Initial GDaD sample content

Add at least one real role definition using the agreed shape, with:

- multiple family membership
- multiple role-levels
- shared skill references
- target proficiencies per role-level

and add a shared skill catalogue with centrally defined proficiency variants.

## Acceptance Criteria

- `templates/gdad/template.yml` no longer embeds role options or skill items inline.
- The GDaD role dimension is sourced from `roles/`.
- The GDaD item catalogue is sourced from `skills/`.
- Role files validate family and grade references.
- Role-level skill mappings validate skill ids and proficiency ids.
- Skill files validate proficiency variant structure.
- `/explore` shows the new GDaD structure without breaking reflective templates.
- `npm run build` succeeds.
- `npm run build:pages` succeeds.
