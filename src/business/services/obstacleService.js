const obstacleRepository = require('../../data/repositories/obstacleRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { assertOwnership } = require('../../utils/ownershipCheck');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');

const toApiShape = (dbObstacle) => {
  if (!dbObstacle) return null;
  const raw = dbObstacle.toJSON ? dbObstacle.toJSON() : dbObstacle;
  return {
    id: raw.id,
    mapId: raw.mapId,
    position: toApiPosition(raw),
    size: raw.size,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  const { positionX, positionY } = toDbPosition(apiData.position);
  return {
    mapId: apiData.mapId,
    positionX,
    positionY,
    size: apiData.size
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
    if (anyMap) throw createAppError(ERROR_TYPES.FORBIDDEN, `You do not have permission to access this Map.`);
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with id ${data.mapId} not found.`);
  }

  if (!data.position || typeof data.position !== 'object') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position object is required.');
  }

  if (!Number.isInteger(data.position.x) || data.position.x < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position x must be a non-negative integer.');
  }

  if (!Number.isInteger(data.position.y) || data.position.y < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Position y must be a non-negative integer.');
  }

  if (!Number.isInteger(data.size) || data.size <= 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Size must be a positive integer.');
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
    if (anyObstacle) throw createAppError(ERROR_TYPES.FORBIDDEN, `You do not have permission to access this Obstacle.`);
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
