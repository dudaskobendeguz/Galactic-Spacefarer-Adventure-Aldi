# Galactic-Spacefarer-Adventure-Aldi

# Getting Started

Welcome to your new CAP project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`README.md` | this getting started guide

## Next Steps

- Install dependencies: `npm install`
- Start in development mode (auto-reload): `npm run watch`
- Start in standard mode: `npm run start`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start with your domain model, in a CDS file in `db/`

## Available Scripts

- `npm run watch` runs `cds watch` for local development with live reload.
- `npm run start` runs `cds-serve` for a standard server start.
- `npm run compile:db` compiles the CDS schema in `db/` to SQL — use this to validate the data model.

## Learn More

Learn more at <https://cap.cloud.sap>.

## Version Control System

Commits should follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

## Code Quality

### Pre-commit Hook (Husky)

[Husky](https://typicode.github.io/husky/) is configured to run a pre-commit hook automatically after `npm install` (via the `prepare` script). Before every commit, it runs `npm run compile:db` and **rejects the commit** if the CDS schema fails to compile.

No manual setup is required — the hook is active as soon as dependencies are installed.

### GitHub Actions

A CI workflow (`.github/workflows/compile.yml`) runs on every pull request targeting `main`. It installs dependencies and runs `npm run compile:db` to ensure no broken schema is merged into the main branch.