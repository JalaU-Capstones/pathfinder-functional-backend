'use strict';

/**
 * @fileoverview Pure filter functions for map and route
 * validation in the Pathfinder backend.
 *
 * Filters are higher-order functions that take a predicate
 * and return only the elements that satisfy it. All
 * functions here are pure: same input, same output,
 * no side effects.
 *
 * Assignment 7.4 context:
 * - Point 1: filter valid stopping points from a map.
 * - Point 6: filter invalid inputs and unsolvable maps.
 */

/**
 * filterValidWaypoints - filters a waypoints array,
 * returning only items that have valid position coordinates.
 * A waypoint is valid if it has numeric, non-negative
 * x and y coordinates and a non-empty name string.
 *
 * Uses Array.prototype.filter - the canonical functional
 * tool for selecting elements that satisfy a predicate.
 *
 * @param {Array} waypoints - Array of waypoint objects.
 * @returns {Array} Only the valid waypoints.
 */
const filterValidWaypoints = (waypoints) => {
  if (!Array.isArray(waypoints)) return [];

  return waypoints.filter(
    (wp) =>
      wp !== null &&
      typeof wp === 'object' &&
      typeof wp.position?.x === 'number' &&
      typeof wp.position?.y === 'number' &&
      wp.position.x >= 0 &&
      wp.position.y >= 0 &&
      typeof wp.name === 'string' &&
      wp.name.trim().length > 0
  );
};

/**
 * filterReachableWaypoints - filters waypoints to those
 * not directly occupied by an obstacle.
 * A waypoint position occupied by an obstacle is considered
 * unreachable at the starting check level.
 *
 * Note: full reachability (path connectivity) is determined
 * by the accumulator in accumulators.js. This filter is
 * the fast pre-check that removes obviously blocked points.
 *
 * @param {Array} waypoints - Valid waypoint objects.
 * @param {Array} obstacles - Array of {x, y} positions.
 * @param {{ width: number, height: number }} grid - Map grid.
 * @returns {Array} Waypoints not directly on an obstacle
 *   and within grid bounds.
 */
const filterReachableWaypoints = (waypoints, obstacles, grid) => {
  const obstacleSet = new Set(
    obstacles.map((o) => `${o.x},${o.y}`)
  );

  return waypoints.filter(
    (wp) =>
      !obstacleSet.has(`${wp.position.x},${wp.position.y}`) &&
      wp.position.x < grid.width &&
      wp.position.y < grid.height
  );
};

/**
 * filterValidMapInput - validates map input structure
 * and returns a result object describing which fields
 * are valid and which are not.
 *
 * Uses Array.prototype.filter internally to collect
 * all validation errors before returning, so the client
 * sees all problems at once (not just the first).
 *
 * @param {Object} map - Map input object to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
const filterValidMapInput = (map) => {
  const rules = [
    {
      test: () => map !== null && typeof map === 'object',
      error: 'Map must be an object.',
    },
    {
      test: () =>
        Array.isArray(map?.startingPoint) &&
        map.startingPoint.length === 2 &&
        map.startingPoint.every((n) => typeof n === 'number'),
      error: 'startingPoint must be an array of two numbers [x, y].',
    },
    {
      test: () =>
        Array.isArray(map?.stoppingPoints) &&
        map.stoppingPoints.length > 0,
      error: 'stoppingPoints must be a non-empty array.',
    },
    {
      test: () => Array.isArray(map?.obstacles),
      error: 'obstacles must be an array.',
    },
  ];

  const errors = rules
    .filter((rule) => !rule.test())
    .map((rule) => rule.error);

  return { valid: errors.length === 0, errors };
};

module.exports = {
  filterValidWaypoints,
  filterReachableWaypoints,
  filterValidMapInput,
};
