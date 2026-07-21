# Galactic Spacefarer Adventure – Agent Instructions

# note:
- im currently learning SAP with this homework. i know nothing about the framework and its other parts ui5, fiori, capire ....
- before running any command in agent mode, give me a quick explanation about wht it does

## Project Overview

SAP CAP (Node.js) backend + SAP Fiori Elements frontend (List Report + Object Page) for managing Spacefarers.  
See [docs/task.md](docs/task.md) for full requirements.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | SAP Cloud Application Programming Model (CAP), Node.js |
| Database | SQLite (local dev), HANA (production) |
| Frontend | SAP Fiori Elements (List Report + Object Page via SAP UI5) |
| Tooling | `@sap/cds-dk`, `@sap/fiori-tools-vsce` |

## Project Conventions

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat:`, `fix:`, `chore:`, etc.).
- **CDS files**: Data model in `db/`, service definitions in `srv/`, Fiori annotations in `app/`.
- **Authorization**: Use `@requires` and `@restrict` annotations in `.cds` service files. Planet-level row isolation via `@restrict.where`.
- **Event handlers**: Use `@Before`/`@After` hooks in `srv/*.js` (or `.ts`) for validation and side-effects (e.g. notification emails on create).

## Common Commands

```bash
# Install dependencies
npm install

# Start CAP server (watch mode)
cds watch

# Deploy to local SQLite
cds deploy --to sqlite

# Run tests
npm test
```

## Key Files & Directories (once scaffolded)

| Path | Purpose |
|------|---------|
| `db/schema.cds` | Spacefarer data model |
| `srv/spacefarer-service.cds` | Service definition & authorization |
| `srv/spacefarer-service.js` | Event handlers (`@Before`/`@After`) |
| `app/spacefarers/` | Fiori Elements app (annotations, manifest) |
| `docs/task.md` | Full task requirements |

## Tips

- Use `cds watch` during development — it auto-reloads on `.cds` and `.js` changes.
- Fiori annotations (`@UI.LineItem`, `@UI.FieldGroup`, etc.) live in `app/` as `.cds` files, not in `srv/`.
- For local SQLite, run `cds deploy --to sqlite` before `cds watch` on first run.
- The "SAP Fiori Tools - Application Modeler" VS Code extension helps scaffold and preview the UI.
