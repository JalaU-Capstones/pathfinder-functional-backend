# NPM Scripts

## Context
Standardizing command-line tasks across the team.

## Scripts Overview

- `npm run dev`: Starts the local development server using Node v26's native `--watch` flag. This avoids the need for external dependencies like `nodemon`.
- `npm test`: Runs the Jest test suite. In the future, this will include unit tests for the business logic and integration tests (via `supertest`) for the API endpoints.
- `npm run lint`: Runs ESLint across the codebase to ensure code quality and adherence to functional programming rules.
- `npm run db:test-connection`: A utility script to verify that the application can successfully connect to the PostgreSQL database running in Docker.

## CI/CD Integration

The following scripts are used in automated pipelines:

- `npm ci`: used in CI instead of `npm install` for deterministic, reproducible installs from `package-lock.json`.
- `npm run lint`: runs ESLint. Pipeline fails if any error is reported.
- `npm run test:ci`: runs Jest with `--ci` and `--forceExit` flags. `--ci` disables interactive prompts and enforces coverage thresholds. `--forceExit` ensures Jest exits cleanly after async Sequelize handles resolve.

### Pipeline files

- GitHub Actions: `.github/workflows/ci.yml`
- GitLab CI: `.gitlab-ci.yml`

Both pipelines run the same three steps in order: install, lint, test with coverage.
