# Code Coverage Configuration

## Tool
Jest (built-in coverage via V8/Istanbul)

## How to Run
- Local (with HTML report): `npm run test:coverage`
- CI (strict mode): `npm run test:ci`
- Watch mode: `npm run test:coverage:watch`

## Viewing the HTML Report
After running `npm run test:coverage`, open
`coverage/index.html` in a browser for a file-by-file
interactive breakdown.

## Thresholds
Minimum enforced thresholds (Jest fails if any drops below):
| Metric | Threshold |
|---|---|
| Statements | 70% |
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |

## What Is Excluded and Why
- `sequelize.cli.js`: Sequelize CLI config file, not application logic — no business value in testing it.
- `server.js`: Entry point that starts the HTTP server — testing it would require spinning up a real server, which is an integration concern outside the scope of unit tests.
- `migrations/**`: Sequelize migration files are SQL schema definitions, not application logic. They are verified by running `db:migrate`, not by unit tests.
- `seeders/**`: Seed data files are for development/demo setup only, not production logic.

## Current Baseline (as of 2026-07-30)
| Metric | % |
|---|---|
| Statements | 63.33% |
| Branches | 75.78% |
| Functions | 69.48% |
| Lines | 62.62% |

These numbers reflect the state before Phase 11B–11D test additions. They will increase as gaps are closed. (Note: Initial 88.83% was without `collectCoverageFrom` measuring all untried source files).

## Files With Known Coverage Gaps (Phase 11B–11D targets)
- `src/app.js` (0% Stmts)
- `src/config/swagger.js` (0% Stmts)
- `src/presentation/controllers/*.js` (0% Stmts)
- `src/presentation/routes/*.js` (0% Stmts)
- `src/utils/httpResponse.js` (0% Stmts)
- `src/data/repositories/mapRepository.js` (50% Stmts)
- `src/data/repositories/routeRepository.js` (42.85% Stmts)
- `src/data/repositories/userRepository.js` (50% Stmts)
