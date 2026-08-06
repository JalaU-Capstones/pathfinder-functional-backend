const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');
const { isValidObstacle, isValidWaypoint } = require('../../utils/validation');

// Helpers for data shaping (single source of truth for mapping)
const toApiShape = (dbMap) => {
  if (!dbMap) return null;
  const raw = dbMap.toJSON ? dbMap.toJSON() : dbMap;

  const obstacles = raw.obstacles 
    ? raw.obstacles.map(toApiPosition).filter(Boolean)
    : [];

  const waypoints = raw.waypoints
    ? raw.waypoints.map(wp => ({ ...toApiPosition(wp), name: wp.name }))
    : [];

  return {
    id: raw.id,
    name: raw.name,
    dimensions: {
      width: raw.width,
      height: raw.height
    },
    obstacles,
    waypoints,
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

const buildObstacleRecords = (obstacles) => obstacles.map(obs => {
  if (!isValidObstacle(obs)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid obstacle data provided.');
  }
  return {
    size: obs.size,
    ...toDbPosition(obs.position)
  };
});

const buildWaypointRecords = (waypoints) => waypoints.map(wp => {
  if (!isValidWaypoint(wp)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid waypoint data provided.');
  }
  return {
    name: wp.name,
    ...toDbPosition(wp.position)
  };
});

const createMapService = async (mapData) => {
  validateMapInput(mapData);
  
  const { name, dimensions, obstacles = [], waypoints = [] } = mapData;

  // Unknown fields (e.g. 'type', 'description') are intentionally
  // ignored — they are not part of the current schema.
  // Future migrations may add them if required.
  const dbObstacles = buildObstacleRecords(obstacles);
  const dbWaypoints = buildWaypointRecords(waypoints);

  const mapId = await mapRepository.createMapWithRelations({
    name,
    width: dimensions.width,
    height: dimensions.height,
    obstacles: dbObstacles,
    waypoints: dbWaypoints
  });

  return await getMapService(mapId);
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
