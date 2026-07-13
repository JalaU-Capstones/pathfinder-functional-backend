# ESLint Configuration for Functional Programming

## Context
To ensure the team adheres to the functional programming requirements, we need automated enforcement of code style and paradigms.

## Decision
We configured `eslint.config.js` to penalize non-functional approaches.

## Key Rules Rationale
- `'prefer-const': 'error'` and `'no-var': 'error'`: Enforces immutability by preventing variable reassignment. Developers must use constants and derive new values rather than modifying existing ones.
- `'no-param-reassign': 'error'`: Prevents modifying function arguments, a common source of side-effects.

Additional rules enforce standard code hygiene (2 spaces indentation, single quotes, mandatory semicolons) to ensure a consistent, professional codebase.
