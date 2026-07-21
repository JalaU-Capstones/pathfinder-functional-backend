const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { toApiPosition } = require('../../utils/shapeMapper');

// Helpers for data shaping (single source of truth for mapping)
const toApiShape = (dbMap) => {
  if (!dbMap) return null;
  const raw = dbMap.toJSON ? dbMap.toJSON() : dbMap;

  const obstacles = raw.obstacles 
    ? raw.obstacles.map(toApiPosition).filter(Boolean)
    : [];

  return {
    id: raw.id,
    name: raw.name,
    dimensions: {
      width: raw.width,
      height: raw.height
    },
    obstacles,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  return {
    name: apiData.name,
    width: apiData.dimensions?.width,
    height: apiData.dimensions?.height
  };
};

// Validation Helper
const validateMapInput = (data) => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Name is required and must be a non-empty string.');
  }
  if (!data.dimensions || typeof data.dimensions !== 'object') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Dimensions object is required.');
  }
  if (!Number.isInteger(data.dimensions.width) || data.dimensions.width <= 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Width must be a positive integer.');
  }
  if (!Number.isInteger(data.dimensions.height) || data.dimensions.height <= 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Height must be a positive integer.');
  }
};

const createMapService = async (mapData) => {
  validateMapInput(mapData);
  const dbShape = toDbShape(mapData);
  const newMap = await mapRepository.createMap(dbShape);
  return toApiShape(newMap);
};

const getMapService = async (id) => {
  const map = await mapRepository.getMapById(id);
  if (!map) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with ID ${id} not found.`);
  }
  return toApiShape(map);
};

const getAllMapsService = async () => {
  const maps = await mapRepository.getAllMaps();
  return maps.map(toApiShape);
};

const updateMapService = async (id, updateData) => {
  validateMapInput(updateData);
  
  // Verify existence first
  const existingMap = await mapRepository.getMapById(id);
  if (!existingMap) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with ID ${id} not found.`);
  }

  const dbShape = toDbShape(updateData);
  const updatedMap = await mapRepository.updateMap(id, dbShape);
  return toApiShape(updatedMap);
};

const deleteMapService = async (id) => {
  const deleted = await mapRepository.deleteMap(id);
  if (!deleted) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with ID ${id} not found.`);
  }
  return true;
};

module.exports = {
  createMapService,
  getMapService,
  getAllMapsService,
  updateMapService,
  deleteMapService,
  toApiShape, // exported for testing
  toDbShape   // exported for testing
};
