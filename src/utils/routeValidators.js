/**
 * Pure validation functions for route creation pipelines.
 */
const { ERROR_TYPES, createAppError } = require('./errors');
const { isPointInGrid, isSamePoint } = require('./curry');

/**
 * Validates that the map exists.
 * Throws a 404 NOT_FOUND error if map is null.
 * 
 * @param {Object} context Validation context
 * @returns {Object} Unmodified context
 */
const validateMapExists = (context) => {
  if (!context.map) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with id ${context.mapId} not found.`);
  }
  return context;
};

/**
 * Validates that the start point is within the map boundaries.
 * 
 * @param {Object} context Validation context
 * @returns {Object} Unmodified context
 */
const validateStartInBounds = (context) => {
  if (!isPointInGrid(context.map)(context.start)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Coordinates must be within map boundaries.');
  }
  return context;
};

/**
 * Validates that the end point is within the map boundaries.
 * 
 * @param {Object} context Validation context
 * @returns {Object} Unmodified context
 */
const validateEndInBounds = (context) => {
  if (!isPointInGrid(context.map)(context.end)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Coordinates must be within map boundaries.');
  }
  return context;
};

/**
 * Validates that the start and end points are not exactly the same.
 * 
 * @param {Object} context Validation context
 * @returns {Object} Unmodified context
 */
const validatePointsNotEqual = (context) => {
  if (isSamePoint(context.start)(context.end)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Start and end points cannot be the same.');
  }
  return context;
};

/**
 * requireNonEmpty(fieldName) — HOF that returns a validator checking
 * that the map has a non-empty array for the given field.
 * 
 * This is a higher-order function: it takes a string and returns a function.
 * 
 * @param {string} fieldName The name of the field to check on context.map
 * @returns {Function} A validator function
 */
const requireNonEmpty = (fieldName) => (context) => {
  const targetArray = context.map && context.map[fieldName];
  if (!targetArray || targetArray.length === 0) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Map must have at least one ${fieldName} configured.`
    );
  }
  return context;
};

const validateMapHasObstacles = requireNonEmpty('obstacles');
// Optionally, if we needed waypoints later: const validateMapHasWaypoints = requireNonEmpty('waypoints');

/**
 * validateWaypointsInPath — pure function.
 * Checks that every waypoint position appears in the computed path.
 * @param {Array<{x,y}>} path - The A* computed path
 * @param {Array<{x,y,name}>} waypoints - Waypoints that must be visited
 * @returns {boolean} true if all waypoints are in the path
 */
const validateWaypointsInPath = (path, waypoints) =>
  waypoints.every(wp =>
    path.some(cell => cell.x === wp.x && cell.y === wp.y)
  );

module.exports = {
  validateMapExists,
  validateStartInBounds,
  validateEndInBounds,
  validatePointsNotEqual,
  requireNonEmpty,
  validateMapHasObstacles,
  validateWaypointsInPath
};
