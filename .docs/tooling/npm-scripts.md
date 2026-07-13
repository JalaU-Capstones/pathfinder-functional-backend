# NPM Scripts

## Context
Standardizing command-line tasks across the team.

## Scripts Overview

- `npm run dev`: Starts the local development server using Node v26's native `--watch` flag. This avoids the need for external dependencies like `nodemon`.
- `npm test`: Runs the Jest test suite. In the future, this will include unit tests for the business logic and integration tests (via `supertest`) for the API endpoints.
- `npm run lint`: Runs ESLint across the codebase to ensure code quality and adherence to functional programming rules.
- `npm run db:test-connection`: A utility script to verify that the application can successfully connect to the PostgreSQL database running in Docker.
