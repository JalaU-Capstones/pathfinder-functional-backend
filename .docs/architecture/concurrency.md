# Architecture: Concurrency and Parallel Validations

**Date:** 2026-08-11
**Context:** Phase 13C implementation to meet Assignment 6.4 concurrency requirements.

## Overview

As part of our commitment to functional and performance-oriented backend design, we've implemented distinct concurrency patterns using JavaScript's native Promise API. The validation system distinguishes clearly between dependent and independent operations.

## Execution Models

### 1. Sequential Execution (`pipeAsync`)
- **Use Case:** When step B requires the output or side-effect of step A.
- **Pattern:** Chaining asynchronous functions where each waits for the previous to resolve.
- **Example:** `validateAtLeastOneValidPath`. We *must* query the database for the map and its obstacles before we can run the A* algorithm. The pathfinder strictly depends on the map data.

### 2. Fail-Fast Parallel Execution (`Promise.all`)
- **Use Case:** When multiple independent checks must all pass for the operation to succeed. 
- **Pattern:** Handled by `src/utils/concurrency.js -> runParallel`.
- **Example:** `analyzeRoutePerformance`. We run 5 A* pathfinding calculations concurrently. The entire batch completes in the time of the slowest single run. `validateStartEndNotObstructed` uses this to validate UUID format and input shape concurrently before running A*.

### 3. Comprehensive Error Collection (`Promise.allSettled`)
- **Use Case:** When validating complex payloads, we want to return a complete error report rather than failing at the first issue (improving Developer Experience).
- **Pattern:** Handled by `src/utils/concurrency.js -> runParallelSettled` and `validateAll`.
- **Example:** `validateRouteComprehensive`. We validate UUID format, check for identical start/end points, check for route intersections, and validate route length simultaneously. All errors are collected and returned to the client in a single response if any checks fail.

## Implementation Details
The concurrency utilities are designed as pure functions (where possible) located in `src/utils/concurrency.js`. They take arrays of thunks (zero-argument functions returning Promises) to prevent eager execution before they are passed to the orchestrator.
