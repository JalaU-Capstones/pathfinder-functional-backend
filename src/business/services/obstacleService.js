const obstacleRepository = require('../../data/repositories/obstacleRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
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

const validateObstacleInput = async (data) => {
  if (!data.mapId || !Number.isInteger(data.mapId)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be an integer.');
  }

  // Validate Map Existence
  const mapExists = await mapRepository.getMapById(data.mapId);
  if (!mapExists) {
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

const createObstacleService = async (obstacleData) => {
  await validateObstacleInput(obstacleData);
  const dbShape = toDbShape(obstacleData);
  const newObstacle = await obstacleRepository.createObstacle(dbShape);
  return toApiShape(newObstacle);
};

const getObstacleService = async (id) => {
  const obstacle = await obstacleRepository.getObstacleById(id);
  if (!obstacle) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Obstacle with ID ${id} not found.`);
  }
  return toApiShape(obstacle);
};

const getAllObstaclesService = async (mapId = null) => {
  const parsedMapId = mapId ? parseInt(mapId, 10) : null;
  const obstacles = await obstacleRepository.getAllObstacles(parsedMapId);
  return obstacles.map(toApiShape);
};

const updateObstacleService = async (id, updateData) => {
  // Check existence first
  const existingObstacle = await obstacleRepository.getObstacleById(id);
  if (!existingObstacle) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Obstacle with ID ${id} not found.`);
  }

  await validateObstacleInput(updateData);
  
  const dbShape = toDbShape(updateData);
  const updatedObstacle = await obstacleRepository.updateObstacle(id, dbShape);
  return toApiShape(updatedObstacle);
};

const deleteObstacleService = async (id) => {
  const deleted = await obstacleRepository.deleteObstacle(id);
  if (!deleted) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Obstacle with ID ${id} not found.`);
  }
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
