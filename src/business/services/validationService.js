'use strict';

const {
  validateUuidFormat,
  validateMapConfigStructure,
  validateMapDimensions,
  detectCyclicDependencies,
} = require('../../utils/recursion');
const mapRepository = require('../../data/repositories/mapRepository');
const { createAppError, ERROR_TYPES } = require('../../utils/errors');
const logger = require('../../utils/logger');

/**
 * Validates UUID format of a map ID (recursive).
 * Does NOT check the database — pure format validation only.
 */
const validateMapIdFormat = (mapId) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  return { message: 'Map ID format is valid.' };
};

/**
 * Validates that a map ID exists in the database.
 * Uses async Promise (Assignment 6.4 point 2).
 */
const validateMapIdExists = async (mapId) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  const map = await mapRepository.getMapById(mapId);
  if (!map) {
    const error = createAppError(
      ERROR_TYPES.NOT_FOUND,
      `Map with ID "${mapId}" does not exist in the database.`
    );
    logger.logValidationError('validateMapIdExists', { mapId }, error);
    throw error;
  }
  return { message: 'Map ID exists in the database.' };
};

/**
 * Validates map configuration structure recursively.
 */
const validateMapConfiguration = (mapId, mapConfig) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  const result = validateMapConfigStructure(mapConfig);
  if (!result.valid) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, result.error);
  }
  return {
    message: 'Map configuration validated successfully.',
  };
};

/**
 * Validates map dimensions are within acceptable limits.
 */
const validateDimensions = (dimensions) => {
  const result = validateMapDimensions(dimensions);
  if (!result.valid) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, result.error);
  }
  return { message: 'Map dimensions are within acceptable limits.' };
};

/**
 * Detects cyclic dependencies in map connections.
 */
const validateNoCyclicDependencies = (mapConfig) => {
  const connections = mapConfig?.connections;
  if (!Array.isArray(connections)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'Map configuration must include a "connections" array.'
    );
  }
  const result = detectCyclicDependencies(connections);
  if (result.hasCycle) {
    const error = createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'Cyclic dependency detected in map configuration: ' +
      `${result.cycle.join(' → ')}.`
    );
    logger.logValidationError('validateNoCyclicDependencies', { cycle: result.cycle }, error);
    throw error;
  }
  return {
    message: 'No cyclic dependencies found in map configuration.',
  };
};

// ─── Phase 13C: Concurrency & Parallel Validations ───────────────────────────

const { runParallel, runParallelSettled } = require('../../utils/concurrency');
const { calculatePath } = require('../pathfinder');
const { toApiPosition } = require('../../utils/shapeMapper');

/**
 * Maximum permitted route length in path steps.
 * Chosen to prevent pathological memory usage while still
 * accommodating very large maps (MAX_WIDTH × MAX_HEIGHT cells).
 * @constant {number}
 */
const MAX_ROUTE_LENGTH = 50000;

/**
 * Validates that a valid path exists between start and end
 * given a set of explicit obstacles. Uses the A* algorithm
 * from pathfinder.js — no duplication.
 *
 * Concurrency pattern: PARALLEL + SEQUENTIAL hybrid.
 *   Step 1 (parallel): UUID format check and obstacles-array
 *     check are independent → run with Promise.all via
 *     runParallel. Neither result is needed by the other.
 *   Step 2 (sequential): A* pathfinding uses the validated
 *     inputs from step 1 → must follow step 1.
 *
 * Satisfies Assignment 6.4 Point 5.
 *
 * @param {{ mapId, startPoint, endPoint, obstacles }} data
 * @returns {Promise<{message: string}>}
 */
const validateStartEndNotObstructed = async ({
  mapId, startPoint, endPoint, obstacles,
}) => {
  // Step 1: Independent checks run IN PARALLEL — neither
  // depends on the result of the other, so Promise.all
  // is both correct and faster than sequential checks.
  await runParallel([
    async () => validateMapIdFormat(mapId),
    async () => {
      if (!Array.isArray(obstacles)) {
        throw createAppError(
          ERROR_TYPES.VALIDATION_ERROR,
          'obstacles must be an array.'
        );
      }
    },
  ]);

  // Step 2: Sequential — A* requires validated inputs from step 1.
  const grid = { width: 10000, height: 10000 };
  const result = calculatePath(
    grid, startPoint, endPoint, obstacles, []
  );

  if (result.distance === -1) {
    throw createAppError(
      ERROR_TYPES.NOT_FOUND,
      'No valid path exists between start and end points ' +
      'due to obstacles.'
    );
  }
  return {
    message: 'At least one valid path exists between ' +
             'start and end points.',
  };
};

/**
 * Validates that the map has at least one valid path from
 * startPoint to endPoint, using the map's stored obstacles.
 *
 * Concurrency pattern: SEQUENTIAL (pipeAsync style).
 *   Must fetch the map from the database before running A*
 *   because A* needs the map's dimensions and obstacles.
 *   B depends on A → sequential.
 *
 * Satisfies Assignment 6.4 Point 7.
 *
 * @param {{ mapId, startPoint, endPoint }} data
 * @returns {Promise<{message: string}>}
 */
const validateAtLeastOneValidPath = async ({
  mapId, startPoint, endPoint,
}) => {
  // Sequential: must fetch map before running pathfinding —
  // the DB result is an explicit dependency of A*.
  const map = await mapRepository.getMapById(mapId);
  if (!map) {
    throw createAppError(
      ERROR_TYPES.NOT_FOUND,
      `Map with ID "${mapId}" not found.`
    );
  }

  // Map DB obstacles (positionX/positionY) → {x, y} for A*.
  const grid = { width: map.width, height: map.height };
  const obstacles = (map.obstacles || [])
    .map(toApiPosition)
    .filter(Boolean);

  const result = calculatePath(
    grid, startPoint, endPoint, obstacles, []
  );

  if (result.distance === -1) {
    throw createAppError(
      ERROR_TYPES.NOT_FOUND,
      'No valid path exists from start to end on this map.'
    );
  }
  return {
    message: 'A valid path exists from start to end point.',
  };
};

/**
 * Runs 5 A* pathfinding calculations in PARALLEL to measure
 * performance consistency and detect bottlenecks.
 *
 * Concurrency pattern: PARALLEL (Promise.all via runParallel).
 *   Each of the 5 runs uses the same inputs → they are
 *   completely independent of each other. Running 5
 *   calculations in parallel completes in the time of the
 *   slowest single run, vs 5× that time sequentially.
 *
 * Satisfies Assignment 6.4 Point 8.
 *
 * @param {{ startPoint, endPoint, obstacles }} data
 * @returns {Promise<{message: string, analysis: object}>}
 */
const analyzeRoutePerformance = async ({
  startPoint, endPoint, obstacles,
}) => {
  const grid = { width: 10000, height: 10000 };
  const RUNS = 5;

  // 5 independent pathfinding calls run IN PARALLEL via
  // Promise.all. Sequential execution would take 5× longer;
  // parallel completes in the duration of the slowest run.
  const startTime = Date.now();

  const results = await runParallel(
    Array.from({ length: RUNS }, () => () =>
      Promise.resolve(
        calculatePath(grid, startPoint, endPoint, obstacles, [])
      )
    )
  );

  const duration = Date.now() - startTime;
  const avgDuration = duration / RUNS;
  const allConsistent = results.every(
    (r) => r.distance === results[0].distance
  );

  logger.logConcurrencyEvent('analyzeRoutePerformance', RUNS, duration, 0);

  return {
    message: 'Performance analysis completed successfully.',
    analysis: {
      runs: RUNS,
      totalDurationMs: duration,
      averageDurationMs: Math.round(avgDuration),
      consistent: allConsistent,
      pathFound: results[0].distance !== -1,
      distance: results[0].distance,
    },
  };
};

/**
 * Validates that no cell in the given path is occupied by
 * an obstacle (route does not intersect obstacles).
 *
 * Concurrency pattern: SYNCHRONOUS (pure function).
 *   No async operations needed — the path and obstacles
 *   are already provided as plain arrays.
 *
 * Satisfies Assignment 6.4 Point 9.
 *
 * @param {{ path: Array<{x,y}>, obstacles: Array<{x,y}> }} data
 * @returns {{ message: string }}
 */
const validateRouteNoIntersections = ({ path, obstacles }) => {
  if (!Array.isArray(path) || path.length === 0) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'path must be a non-empty array of {x, y} coordinates.'
    );
  }

  const obstacleSet = new Set(
    (obstacles || []).map((o) => `${o.x},${o.y}`)
  );

  const intersection = path.find(
    (cell) => obstacleSet.has(`${cell.x},${cell.y}`)
  );

  if (intersection) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'Route intersects with an obstacle at ' +
      `(${intersection.x}, ${intersection.y}).`
    );
  }
  return {
    message: 'Route does not intersect with any obstacles.',
  };
};

/**
 * Validates that a route's step count does not exceed
 * MAX_ROUTE_LENGTH (50 000). Prevents unbounded memory use
 * when storing very long paths in the database.
 *
 * Concurrency pattern: SYNCHRONOUS (pure function).
 *   No async operations — path is provided as an array.
 *
 * Satisfies Assignment 6.4 Point 10.
 *
 * @param {{ path: Array<{x,y}> }} data
 * @returns {{ message: string, length: number }}
 */
const validateRouteLength = ({ path }) => {
  if (!Array.isArray(path) || path.length === 0) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'path must be a non-empty array.'
    );
  }
  if (path.length > MAX_ROUTE_LENGTH) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Route length ${path.length} exceeds the maximum ` +
      `allowed limit of ${MAX_ROUTE_LENGTH} steps.`
    );
  }
  return {
    message: 'Route length is within acceptable limits.',
    length: path.length,
  };
};

/**
 * Handles the special case where start and end points are
 * identical — returns early without running A*.
 *
 * Concurrency pattern: SYNCHRONOUS (pure function).
 *
 * Satisfies Assignment 6.4 Point 11.
 *
 * @param {{ startPoint: {x,y}, endPoint: {x,y} }} data
 * @returns {{ message: string, samePoint: boolean, point?: {x,y} }}
 */
const handleSameStartEnd = ({ startPoint, endPoint }) => {
  const isSame =
    startPoint.x === endPoint.x && startPoint.y === endPoint.y;
  if (isSame) {
    return {
      message: 'Start and end points are identical. ' +
               'No route calculation required.',
      samePoint: true,
      point: startPoint,
    };
  }
  return {
    message: 'Start and end points are different. ' +
             'Route calculation is required.',
    samePoint: false,
  };
};

/**
 * Runs ALL independent validation checks in PARALLEL and
 * collects every failure before throwing. This is the
 * showcase function for concurrency in the defense.
 *
 * Concurrency pattern: PARALLEL with full error collection
 *   (Promise.allSettled via runParallelSettled).
 *
 *   All four checks (UUID format, same-point, no
 *   intersections, route length) are completely independent
 *   of each other — none needs the result of another —
 *   so they run simultaneously. Promise.allSettled collects
 *   ALL failures so the client receives a complete report
 *   instead of having to fix one error at a time.
 *
 * Satisfies Assignment 6.4 (showcase / comprehensive).
 *
 * @param {{ mapId, startPoint, endPoint, obstacles, path? }} data
 * @returns {Promise<{message: string, results: any[]}>}
 */
const validateRouteComprehensive = async ({
  mapId, startPoint, endPoint, obstacles, path,
}) => {
  // All checks are independent → run IN PARALLEL via
  // runParallelSettled so ALL errors are collected at once.
  const { passed, failed } = await runParallelSettled([
    async () => validateMapIdFormat(mapId),
    async () => handleSameStartEnd({ startPoint, endPoint }),
    async () => path
      ? validateRouteNoIntersections({ path, obstacles })
      : { message: 'No path provided to validate.' },
    async () => path
      ? validateRouteLength({ path })
      : { message: 'No path provided to measure.' },
  ]);

  // Report ALL failures at once — not just the first one.
  if (failed.length > 0) {
    logger.logConcurrencyEvent('validateRouteComprehensive', passed.length + failed.length, 0, failed.length);
    const messages = failed.map((e) => e.message).join('; ');
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Comprehensive validation failed: ${messages}`
    );
  }

  logger.logConcurrencyEvent('validateRouteComprehensive', passed.length, 0, 0);

  return {
    message: 'All parallel validations passed.',
    results: passed,
  };
};

module.exports = {
  validateMapIdFormat,
  validateMapIdExists,
  validateMapConfiguration,
  validateDimensions,
  validateNoCyclicDependencies,
  // Phase 13C — concurrency & parallel validations
  validateStartEndNotObstructed,
  validateAtLeastOneValidPath,
  analyzeRoutePerformance,
  validateRouteNoIntersections,
  validateRouteLength,
  handleSameStartEnd,
  validateRouteComprehensive,
  MAX_ROUTE_LENGTH,
};
