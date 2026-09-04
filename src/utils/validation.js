/**
 * Shared primitive validation utilities for entities.
 */

/**
 * Validates if the given string is a valid email format.
 * 
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  // A standard, robust regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidObstacle = (obstacle) => {
  if (!obstacle || typeof obstacle !== 'object') return false;
  if (!obstacle.position || typeof obstacle.position !== 'object') return false;
  
  const { x, y, endX, endY } = obstacle.position;
  if (!Number.isInteger(x) || x < 0) return false;
  if (!Number.isInteger(y) || y < 0) return false;
  
  if (endX !== undefined) {
    if (!Number.isInteger(endX) || endX < x) return false;
  }
  
  if (endY !== undefined) {
    if (!Number.isInteger(endY) || endY < y) return false;
  }
  
  return true;
};

/**
 * Validates if the given waypoint object has the correct shape.
 * 
 * @param {Object} waypoint 
 * @returns {boolean}
 */
const isValidWaypoint = (waypoint) => {
  if (!waypoint || typeof waypoint !== 'object') return false;
  if (!waypoint.position || typeof waypoint.position !== 'object') return false;
  
  const { x, y } = waypoint.position;
  if (!Number.isInteger(x) || x < 0) return false;
  if (!Number.isInteger(y) || y < 0) return false;
  
  if (!waypoint.name || typeof waypoint.name !== 'string' || waypoint.name.trim() === '') return false;
  
  return true;
};

module.exports = { 
  isValidEmail,
  isValidObstacle,
  isValidWaypoint
};
