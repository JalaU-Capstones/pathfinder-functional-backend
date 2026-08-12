'use strict';

/**
 * @fileoverview Pure recursive utility functions for the
 * Pathfinder backend. Each function uses recursion to solve
 * a problem that benefits from a recursive approach:
 * structural validation, cycle detection, and string
 * format verification.
 *
 * All functions are pure: same input always produces same
 * output, no shared mutable state, no side effects.
 */

/**
 * Validates UUID v4 format recursively, processing one
 * segment at a time. Recursion is the natural fit here
 * because a UUID is a recursive structure: a sequence of
 * validated segments separated by a known delimiter.
 *
 * UUID v4 structure: 8-4-4-4-12 hexadecimal characters
 * Example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *
 * @param {string} uuid - The UUID string to validate.
 * @param {number} [segmentIndex=0] - Current segment index
 *   (used by recursive calls, not by external callers).
 * @returns {boolean} true if valid UUID v4 format.
 */
const validateUuidFormat = (uuid, segmentIndex = 0) => {
  // Base case 1: not a string or empty
  if (typeof uuid !== 'string' || uuid.length === 0) {
    return false;
  }

  const segments = uuid.split('-');

  // Base case 2: wrong number of segments
  if (segments.length !== 5) return false;

  // Base case 3: all segments validated
  if (segmentIndex >= segments.length) return true;

  const segment = segments[segmentIndex];
  const hexPattern = /^[0-9a-f]+$/i;

  // Validate current segment length
  const segmentLengths = [8, 4, 4, 4, 12];
  if (segment.length !== segmentLengths[segmentIndex]) {
    return false;
  }

  // Validate current segment is valid hex
  if (!hexPattern.test(segment)) return false;

  // Validate version (segment 2 must start with '4')
  if (segmentIndex === 2 && segment[0] !== '4') return false;

  // Validate variant (segment 3 must start with 8,9,a,b)
  if (segmentIndex === 3 && !/^[89ab]/i.test(segment)) {
    return false;
  }

  // Recursive case: validate next segment
  return validateUuidFormat(uuid, segmentIndex + 1);
};

/**
 * Validates map configuration structure recursively,
 * traversing nested objects to verify required fields
 * exist and have the correct format at each level.
 *
 * Recursion is appropriate here because map configuration
 * is a hierarchical structure: the top level contains
 * arrays, each array item has nested position objects,
 * and those objects have coordinate properties.
 *
 * @param {Object} config - Map config: { obstacles, waypoints }
 * @param {number} [depth=0] - Current recursion depth.
 *   0 = top level, 1 = array items, 2 = nested properties.
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateMapConfigStructure = (config, depth = 0) => {
  // Base case: max depth reached (prevents infinite recursion
  // on circular references or unexpectedly deep objects)
  if (depth > 3) {
    return { valid: true, error: null };
  }

  // Depth 0: validate top-level structure
  if (depth === 0) {
    if (!config || typeof config !== 'object') {
      return {
        valid: false,
        error: 'Map configuration must be an object.',
      };
    }
    if (!Array.isArray(config.obstacles) ||
        config.obstacles.length === 0) {
      return {
        valid: false,
        error: 'Map configuration must include at least ' +
               'one obstacle.',
      };
    }
    if (!Array.isArray(config.waypoints) ||
        config.waypoints.length === 0) {
      return {
        valid: false,
        error: 'Map configuration must include at least ' +
               'one waypoint (stopping point).',
      };
    }
    // Recursive case: validate first obstacle item
    return validateMapConfigStructure(
      config.obstacles[0], depth + 1
    );
  }

  // Depth 1: validate an obstacle or waypoint item
  if (depth === 1) {
    if (!config.position || typeof config.position !== 'object') {
      return {
        valid: false,
        error: 'Each obstacle and waypoint must have a ' +
               'position object with x and y coordinates.',
      };
    }
    // Recursive case: validate position object
    return validateMapConfigStructure(
      config.position, depth + 1
    );
  }

  // Depth 2: validate a position object { x, y }
  if (depth === 2) {
    if (typeof config.x !== 'number' ||
        typeof config.y !== 'number') {
      return {
        valid: false,
        error: 'Position must have numeric x and y coordinates.',
      };
    }
    // Base case: position is valid
    return { valid: true, error: null };
  }

  return { valid: true, error: null };
};

const MAP_CONSTRAINTS = Object.freeze({
  MIN_WIDTH: 10,
  MAX_WIDTH: 10000,
  MIN_HEIGHT: 10,
  MAX_HEIGHT: 10000,
});

/**
 * Validates map dimensions recursively against a list of
 * constraint rules. Recursion processes one rule per call,
 * short-circuiting on the first failure — this is the
 * natural recursive structure for rule chains.
 *
 * @param {{ width: number, height: number }} dimensions
 * @param {Array<Function>} [rules] - Constraint rules to check.
 *   Defaults to the standard MAP_CONSTRAINTS rules.
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateMapDimensions = (dimensions, rules = null) => {
  // Build default rules array on first call
  const constraintRules = rules || [
    (d) => typeof d.width !== 'number' || typeof d.height !== 'number'
      ? 'Map width and height must be numbers.'
      : null,
    (d) => d.width < MAP_CONSTRAINTS.MIN_WIDTH
      ? `Map width must be at least ${MAP_CONSTRAINTS.MIN_WIDTH}.`
      : null,
    (d) => d.width > MAP_CONSTRAINTS.MAX_WIDTH
      ? `Map width must not exceed ${MAP_CONSTRAINTS.MAX_WIDTH}.`
      : null,
    (d) => d.height < MAP_CONSTRAINTS.MIN_HEIGHT
      ? `Map height must be at least ${MAP_CONSTRAINTS.MIN_HEIGHT}.`
      : null,
    (d) => d.height > MAP_CONSTRAINTS.MAX_HEIGHT
      ? `Map height must not exceed ${MAP_CONSTRAINTS.MAX_HEIGHT}.`
      : null,
  ];

  // Base case: no more rules to check
  if (constraintRules.length === 0) {
    return { valid: true, error: null };
  }

  // Check current rule
  const [currentRule, ...remainingRules] = constraintRules;
  const error = currentRule(dimensions);

  if (error) {
    return { valid: false, error };
  }

  // Recursive case: check remaining rules
  return validateMapDimensions(dimensions, remainingRules);
};

/**
 * Detects cyclic dependencies in a directed graph using
 * recursive Depth-First Search (DFS). Recursion is the
 * canonical implementation for DFS — the call stack
 * naturally tracks the current traversal path.
 *
 * Use case: validate that map connection configurations
 * do not contain cycles, which would cause infinite loops
 * in pathfinding or route planning.
 *
 * @param {Array<{source: string, target: string}>} connections
 * @param {Set} [visited=new Set()] - Globally visited nodes.
 * @param {Set} [path=new Set()] - Nodes in current DFS path.
 * @returns {{ hasCycle: boolean, cycle: string[]|null }}
 */
const detectCyclicDependencies = (
  connections,
  visited = new Set(),
  path = new Set(),
) => {
  // Build adjacency list from connections array
  const buildGraph = (conns) =>
    conns.reduce((graph, { source, target }) => ({
      ...graph,
      [source]: [...(graph[source] || []), target],
    }), {});

  const graph = buildGraph(connections);
  const nodes = Object.keys(graph);

  // Inner recursive DFS function (pure — receives state
  // as parameters, returns new state)
  const dfs = (node, vis, currentPath) => {
    // Base case: node already in current path = cycle found
    if (currentPath.has(node)) {
      return { hasCycle: true, cycle: [...currentPath, node] };
    }

    // Base case: node already fully explored = no cycle here
    if (vis.has(node)) {
      return { hasCycle: false, cycle: null };
    }

    const newVis = new Set([...vis, node]);
    const newPath = new Set([...currentPath, node]);
    const neighbors = graph[node] || [];

    // Base case: no neighbors to explore
    if (neighbors.length === 0) {
      return { hasCycle: false, cycle: null };
    }

    // Recursive case: explore each neighbor
    const results = neighbors.map(
      (neighbor) => dfs(neighbor, newVis, newPath)
    );

    return results.find((r) => r.hasCycle) ||
           { hasCycle: false, cycle: null };
  };

  // Run DFS from each unvisited node
  for (const node of nodes) {
    if (!visited.has(node)) {
      const result = dfs(node, visited, path);
      if (result.hasCycle) return result;
    }
  }

  return { hasCycle: false, cycle: null };
};

module.exports = {
  validateUuidFormat,
  validateMapConfigStructure,
  validateMapDimensions,
  detectCyclicDependencies,
  MAP_CONSTRAINTS,
};
