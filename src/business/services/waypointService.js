const waypointRepository = require('../../data/repositories/waypointRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');

const toApiShape = (dbWaypoint) => {
  if (!dbWaypoint) return null;
  const raw = dbWaypoint.toJSON ? dbWaypoint.toJSON() : dbWaypoint;
  return {
    id: raw.id,
    mapId: raw.mapId,
    name: raw.name,
    position: toApiPosition(raw),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  return {
    mapId: apiData.mapId,
    name: apiData.name,
    ...toDbPosition(apiData.position)
  };
};

const validateWaypointInput = async (data) => {
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

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Name is required and must be a non-empty string.');
  }
};

const createWaypointService = async (waypointData) => {
  await validateWaypointInput(waypointData);
  const dbShape = toDbShape(waypointData);
  const newWaypoint = await waypointRepository.createWaypoint(dbShape);
  return toApiShape(newWaypoint);
};

const getWaypointService = async (id) => {
  const waypoint = await waypointRepository.getWaypointById(id);
  if (!waypoint) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Waypoint with ID ${id} not found.`);
  }
  return toApiShape(waypoint);
};

const getAllWaypointsService = async (mapId = null) => {
  const parsedMapId = mapId ? parseInt(mapId, 10) : null;
  const waypoints = await waypointRepository.getAllWaypoints(parsedMapId);
  return waypoints.map(toApiShape);
};

const updateWaypointService = async (id, updateData) => {
  const existingWaypoint = await waypointRepository.getWaypointById(id);
  if (!existingWaypoint) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Waypoint with ID ${id} not found.`);
  }

  await validateWaypointInput(updateData);
  
  const dbShape = toDbShape(updateData);
  const updatedWaypoint = await waypointRepository.updateWaypoint(id, dbShape);
  return toApiShape(updatedWaypoint);
};

const deleteWaypointService = async (id) => {
  const deleted = await waypointRepository.deleteWaypoint(id);
  if (!deleted) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Waypoint with ID ${id} not found.`);
  }
  return true;
};

module.exports = {
  createWaypointService,
  getWaypointService,
  getAllWaypointsService,
  updateWaypointService,
  deleteWaypointService,
  toApiShape,
  toDbShape
};
