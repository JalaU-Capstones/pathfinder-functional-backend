const waypointRepository = require('../../data/repositories/waypointRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { assertOwnership } = require('../../utils/ownershipCheck');
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

const validateWaypointInput = async (data, userId) => {
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

const createWaypointService = async (waypointData, userId) => {
  await validateWaypointInput(waypointData, userId);
  const dbShape = toDbShape(waypointData);
  dbShape.userId = userId;
  const newWaypoint = await waypointRepository.createWaypoint(dbShape);
  return toApiShape(newWaypoint);
};

const getWaypointService = async (id, userId) => {
  const waypoint = await waypointRepository.getWaypointById(id, { userId });
  if (!waypoint) {
    const anyWaypoint = await waypointRepository.getWaypointById(id);
    if (anyWaypoint) throw createAppError(ERROR_TYPES.FORBIDDEN, 'You do not have permission to access this Waypoint.');
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Waypoint with ID ${id} not found.`);
  }
  return toApiShape(waypoint);
};

const getAllWaypointsService = async (mapId = null, userId) => {
  const parsedMapId = mapId || null;
  const waypoints = await waypointRepository.getAllWaypoints(parsedMapId, { userId });
  return waypoints.map(toApiShape);
};

const updateWaypointService = async (id, updateData, userId) => {
  const existingWaypoint = await waypointRepository.getWaypointById(id);
  if (!existingWaypoint) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Waypoint with ID ${id} not found.`);
  }

  await validateWaypointInput(updateData, userId);
  
  const dbShape = toDbShape(updateData);
  const updatedWaypoint = await waypointRepository.updateWaypoint(id, dbShape, { userId });
  await assertOwnership(updatedWaypoint ? 1 : 0, () => waypointRepository.getWaypointById(id), 'Waypoint');
  return toApiShape(updatedWaypoint);
};

const deleteWaypointService = async (id, userId) => {
  const deletedCount = await waypointRepository.deleteWaypoint(id, { userId });
  await assertOwnership(deletedCount ? 1 : 0, () => waypointRepository.getWaypointById(id), 'Waypoint');
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
