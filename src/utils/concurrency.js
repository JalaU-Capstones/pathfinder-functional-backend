'use strict';

/**
 * @fileoverview Concurrency utilities for the Pathfinder
 * backend. Provides helpers that run independent async
 * operations in parallel, improving throughput when
 * validations or checks do not depend on each other.
 *
 * Key distinction:
 * - Sequential (pipeAsync): step B needs the result of
 *   step A. Each step is blocked until the previous one
 *   resolves. Use when there is a data dependency between
 *   operations (e.g., fetch map → validate → pathfind).
 *
 * - Parallel (Promise.all): steps are independent — they
 *   can start at the same time. ALL must succeed before
 *   proceeding. Fails fast: the first rejection rejects
 *   the whole batch.
 *
 * - Parallel collect (Promise.allSettled): run all, wait
 *   for every result regardless of success or failure.
 *   Use when you want to report ALL validation errors at
 *   once instead of stopping at the first one.
 */

/**
 * runParallel — runs multiple async thunks simultaneously
 * using Promise.all. Fails fast: if any function rejects,
 * the whole operation rejects immediately.
 *
 * When to use: all checks are independent AND all must
 * pass before proceeding. Because they are independent,
 * running them in parallel is both correct and faster than
 * running them sequentially one after another.
 *
 * When NOT to use: when step B depends on the result of
 * step A — use pipeAsync for those cases.
 *
 * @param {Array<() => Promise<any>>} asyncFns - Thunks
 *   (zero-argument functions that return Promises) to run
 *   in parallel.
 * @returns {Promise<Array<any>>} Array of resolved values,
 *   in the same order as the input functions.
 */
const runParallel = (asyncFns) =>
  Promise.all(asyncFns.map((fn) => fn()));

/**
 * runParallelSettled — runs all async thunks and collects
 * ALL results (fulfilled and rejected). Does not fail fast
 * — waits for every operation to complete.
 *
 * When to use: you want to report ALL validation errors at
 * once, not just the first one encountered. This gives the
 * client a complete picture of what needs to be fixed.
 *
 * @param {Array<() => Promise<any>>} asyncFns - Thunks.
 * @returns {Promise<{passed: any[], failed: Error[]}>}
 *   An object with two arrays:
 *   - passed: resolved values of fulfilled operations.
 *   - failed: rejection reasons of rejected operations.
 */
const runParallelSettled = async (asyncFns) => {
  const results = await Promise.allSettled(
    asyncFns.map((fn) => fn())
  );
  return {
    passed: results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value),
    failed: results
      .filter((r) => r.status === 'rejected')
      .map((r) => r.reason),
  };
};

/**
 * validateAll — runs independent validations in parallel
 * and throws a combined error if ANY fail. Uses
 * Promise.allSettled internally to collect ALL errors
 * before throwing, so the client sees all problems at once
 * rather than having to fix one error at a time.
 *
 * This is the preferred pattern over plain Promise.all for
 * validation scenarios because it provides a complete error
 * report in a single round trip.
 *
 * @param {Array<() => Promise<any>>} validationFns - Thunks.
 * @returns {Promise<void>} Resolves if all validations pass.
 * @throws {Object} AppError with combined error messages.
 */
const validateAll = async (validationFns) => {
  const { failed } = await runParallelSettled(validationFns);
  if (failed.length > 0) {
    const messages = failed.map((e) => e.message).join('; ');
    // Require inside function body to avoid coupling a utility
    // module to the error module at the top level.
    const { createAppError, ERROR_TYPES } = require('./errors');
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Validation failed: ${messages}`
    );
  }
};

module.exports = { runParallel, runParallelSettled, validateAll };
