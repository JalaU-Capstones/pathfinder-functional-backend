/**
 * Converts a database entity with flat positionX and positionY columns 
 * into the API shape position nested object.
 * 
 * @param {Object} dbObj - The database object containing positionX and positionY.
 * @returns {Object|null} - The nested { x, y } position object, or null if coordinates are missing.
 */
const toApiPosition = (dbObj) => {
  if (!dbObj) {
    return null;
  }
  const raw = dbObj.toJSON ? dbObj.toJSON() : dbObj;
  if (raw.positionX !== undefined && raw.positionY !== undefined) {
    return {
      x: raw.positionX,
      y: raw.positionY
    };
  }
  if (raw.startX !== undefined && raw.startY !== undefined) {
    return {
      startX: raw.startX,
      startY: raw.startY,
      endX: raw.endX !== undefined ? raw.endX : raw.startX,
      endY: raw.endY !== undefined ? raw.endY : raw.startY
    };
  }
  return null;
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
