/**
 * Converts a database entity with flat positionX and positionY columns 
 * into the API shape position nested object.
 * 
 * @param {Object} dbObj - The database object containing positionX and positionY.
 * @returns {Object|null} - The nested { x, y } position object, or null if coordinates are missing.
 */
const toApiPosition = (dbObj) => {
  if (!dbObj || dbObj.positionX === undefined || dbObj.positionY === undefined) {
    return null;
  }
  return {
    x: dbObj.positionX,
    y: dbObj.positionY
  };
};

/**
 * Converts an API shape position nested object into flat positionX and positionY columns.
 * 
 * @param {Object} apiPosition - The API position object { x, y }.
 * @returns {Object} - An object containing { positionX, positionY }.
 */
const toDbPosition = (apiPosition) => {
  if (!apiPosition) {
    return { positionX: undefined, positionY: undefined };
  }
  return {
    positionX: apiPosition.x,
    positionY: apiPosition.y
  };
};

module.exports = {
  toApiPosition,
  toDbPosition
};
