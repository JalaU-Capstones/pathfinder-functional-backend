const obstacleRepository = require('../../data/repositories/obstacleRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { assertOwnership } = require('../../utils/ownershipCheck');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');

const toApiShape = (dbObstacle) => {
  if (!dbObstacle) return null;
  const raw = dbObstacle.toJSON ? dbObstacle.toJSON() : dbObstacle;
  
  // Backward compatibility: If it's a single cell, return just x and y
  // Otherwise, return x, y, endX, endY
  const position = {
    x: raw.startX,
    y: raw.startY
  };
  
  if (raw.endX !== undefined && raw.endY !== undefined && (raw.endX !== raw.startX || raw.endY !== raw.startY)) {
    position.endX = raw.endX;
    position.endY = raw.endY;
  }
  
  return {
    id: raw.id,
    mapId: raw.mapId,
    position,
    size: raw.size,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  const x = apiData.position.x;
  const y = apiData.position.y;
  const endX = apiData.position.endX !== undefined ? apiData.position.endX : x;
  const endY = apiData.position.endY !== undefined ? apiData.position.endY : y;
  const size = (endX - x + 1) * (endY - y + 1);

  return {
    mapId: apiData.mapId,
    startX: x,
    startY: y,
    endX,
    endY,
    size
  };
};

const validateObstacleInput = async (data, userId) => {
  if (!data.mapId || typeof data.mapId !== 'string') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be a string.');
  }

  // Validate Map Existence
  const mapExists = await mapRepository.getMapById(data.mapId, { userId });
  if (!mapExists) {
    const anyMap = await mapRepository.getMapById(data.mapId);
    if (anyMap) throw createAppError(ERROR_TYPES.FORBIDDEN, 'You do not have permission to access this Map.');
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with id ${data.mapId} not found.`);
  }

  if (!data.position || typeof data.position !== 'object') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position object is required.');
  }

  const { x, y, endX, endY } = data.position;

  if (!Number.isInteger(x) || x < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position x must be a non-negative integer.');
  }

  if (!Number.isInteger(y) || y < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position y must be a non-negative integer.');
  }

  if (endX !== undefined) {
    if (!Number.isInteger(endX) || endX < x) {
      throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'endX must be an integer greater than or equal to x.');
    }
  }

  if (endY !== undefined) {
    if (!Number.isInteger(endY) || endY < y) {
      throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'endY must be an integer greater than or equal to y.');
    }
  }
};

const createObstacleService = async (obstacleData, userId) => {
  await validateObstacleInput(obstacleData, userId);
  const dbShape = toDbShape(obstacleData);
  dbShape.userId = userId;
  const newObstacle = await obstacleRepository.createObstacle(dbShape);
  return toApiShape(newObstacle);
};

const getObstacleService = async (id, userId) => {
  const obstacle = await obstacleRepository.getObstacleById(id, { userId });
  if (!obstacle) {
    const anyObstacle = await obstacleRepository.getObstacleById(id);
    if (anyObstacle) throw createAppError(ERROR_TYPES.FORBIDDEN, 'You do not have permission to access this Obstacle.');
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Obstacle with ID ${id} not found.`);
  }
  return toApiShape(obstacle);
};

const getAllObstaclesService = async (mapId = null, userId) => {
  const parsedMapId = mapId || null;
  const obstacles = await obstacleRepository.getAllObstacles(parsedMapId, { userId });
  return obstacles.map(toApiShape);
};

const updateObstacleService = async (id, updateData, userId) => {
  // Check existence first
  const existingObstacle = await obstacleRepository.getObstacleById(id);
  if (!existingObstacle) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Obstacle with ID ${id} not found.`);
  }

  await validateObstacleInput(updateData, userId);
  
  const dbShape = toDbShape(updateData);
  const updatedObstacle = await obstacleRepository.updateObstacle(id, dbShape, { userId });
  await assertOwnership(updatedObstacle ? 1 : 0, () => obstacleRepository.getObstacleById(id), 'Obstacle');
  return toApiShape(updatedObstacle);
};

const deleteObstacleService = async (id, userId) => {
  const deletedCount = await obstacleRepository.deleteObstacle(id, { userId });
  await assertOwnership(deletedCount ? 1 : 0, () => obstacleRepository.getObstacleById(id), 'Obstacle');
  return true;
};

module.exports = {
  createObstacleService,
  getObstacleService,
  getAllObstaclesService,
  updateObstacleService,
  deleteObstacleService,
  toApiShape,
  toDbShape
};
