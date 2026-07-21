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
npm run test:cap
```

## Scripts

- `npm run dev` -> `cds watch`
- `npm run dev:company` -> `cds watch --profile development-company`
- `npm run start` -> `cds-serve`
- `npm run build` -> build CAP artifacts (`cds build`)
- `npm run build:cap` -> build CAP artifacts only
- `npm run build:ui` -> build Fiori UI module (`app/spacefarers`)
- `npm run build:all` -> build CAP + Fiori UI modules
- `npm run compile:db` -> compile CDS model in `db/` to SQL
- `npm run test:cap` -> run CAP test suite in `test` profile
- `npm run test:cap:log` -> run CAP test suite with verbose debug logs
- `npm run repl` -> CAP REPL

## Services and Authorization (Current State)

### SpaceFarerService

Service path: `/spacefarer-service`

In `srv/spacefarer-service.cds`:

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
- Activated by `npm run test:cap` via `CDS_ENV=test`

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

## Task 3 - Cosmic Event Handlers

Task 3 is implemented in `srv/spacefarer-service.ts` using CAP lifecycle hooks on `CREATE` for `SpaceFarer`.

### CREATE Parameters -> Generated Values

When `POST /spacefarer-service/SpaceFarer` is called, Task 3 logic produces these outcomes:

| Create payload parameter | Rule in Task 3 logic | What is generated or changed by server | Result if rule fails |
|---|---|---|---|
| `wormholeNavigationSkill` | Must exist and be in range `0..100` | Used to find matching `Position` (`skillBoundary_min <= value <= skillBoundary_max`) and set `position_ID` | Request rejected (`400` or `422`), no create |
| `stardustCollection` | Must exist and be in range `0..100` | Used to find matching `SpacesuitColorBoundary` (`stardustCollection_min <= value <= stardustCollection_max`) and set `spacesuitColor` | Request rejected (`400` or `422`), no create |
| `position_ID` (if sent by client) | Treated as non-authoritative for Task 3 create | Overwritten by computed value from `Position` boundary lookup | N/A (server value wins) |
| `spacesuitColor` (if sent by client) | Treated as non-authoritative for Task 3 create | Overwritten by computed value from `SpacesuitColorBoundary` lookup | N/A (server value wins) |
| `department.name` | Required by data model (`department` composition is mandatory and `name` is mandatory) | Department child record is persisted together with parent SpaceFarer create | Request rejected by CAP model validation if missing/invalid |
| `email` | Required to send post-create notification | Used as notification recipient (`to`) in `@After CREATE` | Create still succeeds; notification is skipped if missing |
| `firstName`, `lastName`, `originPlanet`, computed `position_ID`, computed `spacesuitColor`, skill/stardust | Used to compose welcome message body | Welcome email payload (`subject`, `body`) sent via `notificationService` event `notifyOnboarder` | If send fails, error is logged; create is not rolled back |

Notification implementation by environment:

- `development` and `test`: `srv/notification-mock-service.ts`
- `production`: `srv/notification-production-service.ts`

Task 3 tests in `test/space-farer-service.test.ts` verify:

- Auto-enhancement of candidate data at create time
- Rejection for out-of-range skill and stardust values
- Notification trigger after successful candidate creation

## CI (GitHub Actions)

Workflow: `.github/workflows/compile.yml`

- Name: `Build and Test Check`
- Trigger: pull requests to `main`
- Steps:
	- install dependencies (`npm ci`)
	- compile CDS model (`npm run compile:db`)
	- run tests (`npm run test:cap`)

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

## CAP Runtime Note (`exit_on_multi_install`)

The project sets `cds.server.exit_on_multi_install = false` in `package.json` to avoid local dev server termination when `@sap/cds` is detected from multiple installation paths during `cds watch` with UI tooling integration.

Why this exists: starting with the CAP change documented in May 2025, `cds-serve` fails by default if multiple `@sap/cds` installation paths are detected to prevent inconsistent runtime state.

Reference: https://cap.cloud.sap/docs/releases/2025/changelog#may-25-changed

## References

- CAP docs: https://cap.cloud.sap
- CAP security authorization: https://cap.cloud.sap/docs/guides/security/authorization
- CAP mocked auth: https://cap.cloud.sap/docs/node.js/authentication#mocked