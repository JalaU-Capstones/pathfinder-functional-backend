/**
 * curry(fn) — transforms a multi-argument function into a sequence
 * of single-argument functions.
 * curry(f)(a)(b) === f(a, b)
 * 
 * Currying allows "partial application" of a function. By passing some arguments, 
 * you get back a new function waiting for the rest. This is highly useful for 
 * creating reusable, pre-configured functions that can be passed as callbacks 
 * to array methods like map or filter.
 * 
 * @param {Function} fn The function to curry
 * @returns {Function} The curried version of the function
 */
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

/**
 * Checks if a value is within grid bounds on one axis.
 * 
 * By currying, we can create specific bounds checkers like `isWithinBound(10)`
 * which can then be passed multiple values.
 * 
 * @param {number} max The exclusive upper bound
 * @param {number} value The value to check
 * @returns {boolean} True if 0 <= value < max
 */
const isWithinBound = curry((max, value) => value >= 0 && value < max);

/**
 * Checks if a point {x, y} is within a grid {width, height}.
 * 
 * Currying here is useful because `isPointInGrid(grid)` becomes a reusable 
 * validator pre-loaded with the grid dimensions. It can be applied to both 
 * the start and end points without re-specifying the grid each time.
 * 
 * @param {Object} grid The grid object containing width and height
 * @param {Object} point The coordinate point {x, y}
 * @returns {boolean} True if point is inside the grid boundaries
 */
const isPointInGrid = curry((grid, point) =>
  isWithinBound(grid.width)(point.x) && isWithinBound(grid.height)(point.y)
);

/**
 * Checks if two points are the exact same position.
 * 
 * @param {Object} a First point {x, y}
 * @param {Object} b Second point {x, y}
 * @returns {boolean} True if x and y match
 */
const isSamePoint = curry((a, b) => a.x === b.x && a.y === b.y);

module.exports = {
  curry,
  isWithinBound,
  isPointInGrid,
  isSamePoint
};
