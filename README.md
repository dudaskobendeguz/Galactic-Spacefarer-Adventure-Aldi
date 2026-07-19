# Galactic-Spacefarer-Adventure-Aldi

SAP CAP project for the Galactic Spacefarer Adventure exercise.

## Project Structure

File or Folder | Purpose
---------|----------
`app/` | UI frontend artifacts
`db/` | CDS data model and CSV seed data
`srv/` | service definitions (`SpaceFarerService` and `AdminService`)
`test/` | automated integration tests and isolated test CSV fixtures
`test/http/` | HTTP request scenarios for auth and CRUD validation
`.github/workflows/` | CI workflow for compile + test checks on pull requests

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start secure local development (mocked auth enabled):

```bash
npm run dev
```

3. Alternative profile for managed-company browsers (dummy auth):

```bash
npm run dev:company
```

4. Run automated tests:

```bash
npm test
```

## Scripts

- `npm run dev` -> `cds watch`
- `npm run dev:company` -> `cds watch --profile development-company`
- `npm run start` -> `cds-serve`
- `npm run compile:db` -> compile CDS model in `db/` to SQL
- `npm test` -> run integration tests in the `test` CAP profile (`CDS_ENV=test`)
- `npm run repl` -> CAP REPL

## Services and Authorization (Current State)

### SpaceFarerService

Service path: `/spacefarer-service`

In `srv/space-farer-service.cds`:

- Service level: `@requires: 'authenticated-user'`
- `SpaceFarer` projection: restricted with `@restrict`
	- Grants: `CREATE`, `READ`, `UPDATE`, `DELETE`
	- Role: `SpacefarerViewer`
	- Row-level filter: `originPlanet = $user.attr.planet`
- `SpaceFarer` projection: additional read access for role `SpacefarerAdmin`
	- Grants: `READ`
	- No row-level filter
- `Department` projection: `@readonly`
- `Position` projection: `@readonly`

### AdminService

Service path: `/admin-service`

In `srv/admin-service.cds`:

- Service level: `@requires: 'authenticated-user'`
- Exposes direct projections for `SpaceFarer`, `Department`, and `Position`
- No entity-level `@restrict` or `@readonly` annotations in this service

## Local Auth Profiles

`development` profile (`mocked` auth users):

- `space-admin` / `admin123` with `planet = Orion Belt`
	- Roles: `authenticated-user`, `SpacefarerAdmin`
- `space-viewer` / `viewer123` with `planet = Io Relay`
	- Roles: `authenticated-user`, `SpacefarerViewer`

`development-company` profile:

- `auth.kind = dummy`
- Used only to continue local UI work when company-managed browser policies block Basic Auth login popups.

`test` profile:

- `auth.kind = mocked` with the same `space-admin` and `space-viewer` users
- In-memory SQLite
- Activated by `npm test` via `CDS_ENV=test`

## HTTP Validation Scenarios

Use files in `test/http/`:

- `test/http/auth.http`
- `test/http/spacefarer-service.http`

They cover:

- unauthenticated vs authenticated access
- viewer/admin behavior
- CRUD checks against `SpaceFarer`
- readonly checks for `Department` and `Position`

Note: Basic auth values in the HTTP files are Base64-encoded `username:password`.

## Automated Test Coverage

Primary test suite: `test/space-farer-service.test.ts`

Dedicated test fixtures:

- `test/data/galactic.spacefarer.adventure-SpaceFarer.csv`
- `test/data/galactic.spacefarer.adventure-Department.csv`
- `test/data/galactic.spacefarer.adventure-Position.csv`

Current test organization:

- Service Root Authorization
- SpaceFarer Entity
- Department Entity (`@readonly` behavior)
- Position Entity (`@readonly` behavior)

The suite verifies authenticated access, role-based behavior, and entity-level write restrictions.

## CI (GitHub Actions)

Workflow: `.github/workflows/compile.yml`

- Name: `Build and Test Check`
- Trigger: pull requests to `main`
- Steps:
	- install dependencies (`npm ci`)
	- compile CDS model (`npm run compile:db`)
	- run tests (`npm test`)

## Data Notes

Application seed data (`db/data/`):

- `Position.ID` seed IDs use `20000000-0000-4000-8000-...`
- `SpaceFarer.ID` seed IDs use `10000000-0000-4000-8000-...`
- `Department.spaceFarer_ID` seed IDs use `30000000-0000-4000-8000-...`

Test seed data (`test/data/`):

- `Position.ID` seed IDs use `21000000-0000-4000-8000-...`
- `SpaceFarer.ID` and `Department.spaceFarer_ID` use `31000000-0000-4000-8000-...`

## Code Quality

Husky is enabled via `prepare` script and currently runs schema validation with `npm run compile:db` before commit.

## Submission Notes

On the development machine used for this project, the browser is company-managed and enforces extension/policy controls that suppress HTTP Basic Auth login dialogs.

The CAP service itself is configured correctly and returns the expected auth challenge:

- `401 Unauthorized`
- `WWW-Authenticate: Basic realm="Users"`

Because the browser prompt is blocked by policy, authentication and authorization validation were executed with API clients (`curl` and HTTP test files in `test/http/`).

To continue local UI development despite this environment constraint, an additional local profile `development-company` (`auth.kind = dummy`) is provided. Security validation is still performed with the secure `development` profile (`auth.kind = mocked`).

## References

- CAP docs: https://cap.cloud.sap
- CAP security authorization: https://cap.cloud.sap/docs/guides/security/authorization
- CAP mocked auth: https://cap.cloud.sap/docs/node.js/authentication#mocked