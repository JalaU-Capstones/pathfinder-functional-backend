const routeRepository = require('../../data/repositories/routeRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');
const { calculatePath } = require('../pathfinder');

const toApiShape = (dbRoute) => {
  if (!dbRoute) return null;
  const raw = dbRoute.toJSON ? dbRoute.toJSON() : dbRoute;
  return {
    id: raw.id,
    mapId: raw.mapId,
    start: toApiPosition({ positionX: raw.startX, positionY: raw.startY }),
    end: toApiPosition({ positionX: raw.endX, positionY: raw.endY }),
    distance: raw.distance,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  const dbStart = toDbPosition(apiData.start);
  const dbEnd = toDbPosition(apiData.end);
  return {
    mapId: apiData.mapId,
    startX: dbStart.positionX,
    startY: dbStart.positionY,
    endX: dbEnd.positionX,
    endY: dbEnd.positionY,
    distance: apiData.distance
  };
};

const validateCoordinate = (point, name) => {
  if (!point || typeof point !== 'object') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, `${name} object is required.`);
  }
  if (!Number.isInteger(point.x) || point.x < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, `${name} x must be a non-negative integer.`);
  }
  if (!Number.isInteger(point.y) || point.y < 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, `${name} y must be a non-negative integer.`);
  }
};

const validateRouteInput = async (data) => {
  if (!data.mapId || !Number.isInteger(data.mapId)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be an integer.');
  }

  // Validate Map Existence and Bounds
  const mapExists = await mapRepository.getMapById(data.mapId);
  if (!mapExists) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with id ${data.mapId} not found.`);
  }

  validateCoordinate(data.start, 'Start');
  validateCoordinate(data.end, 'End');

  if (data.start.x === data.end.x && data.start.y === data.end.y) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Start and end points cannot be the same.');
  }

  if (data.start.x >= mapExists.width || data.start.y >= mapExists.height ||
      data.end.x >= mapExists.width || data.end.y >= mapExists.height) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Coordinates must be within map boundaries.');
  }

  return mapExists;
};

const createRouteService = async (routeData) => {
  const mapExists = await validateRouteInput(routeData);

  // We have mapExists.obstacles and mapExists.waypoints from Map association? Wait, we need to map them properly.
  // We assume Map model include associations or we just pass empty if they are not loaded, but the prompt says:
  // "Fetches the Map with its Obstacles and Waypoints (needed as input to the pathfinding function)."
  
  // Actually, getMapById might not include obstacles and waypoints by default in mapRepository.
  // Let me just check what getMapById returns. Usually we might need a dedicated method to fetch Map with associations or they might already be included.
  // The pathfinder placeholder ignores obstacles, but we should pass them.
  // Let's assume mapExists has `obstacles` and `waypoints` or we fetch them if not included.
  const obstacles = mapExists.obstacles ? mapExists.obstacles.map(toApiPosition) : [];
  const waypoints = mapExists.waypoints ? mapExists.waypoints.map(w => ({ ...toApiPosition(w), name: w.name })) : [];

  const pathResult = calculatePath(
    { width: mapExists.width, height: mapExists.height },
    routeData.start,
    routeData.end,
    obstacles,
    waypoints
  );

  const routeToCreate = {
    ...routeData,
    distance: pathResult.distance
  };

  const dbShape = toDbShape(routeToCreate);
  const newRoute = await routeRepository.createRoute(dbShape);
  return toApiShape(newRoute);
};

const getRouteService = async (id) => {
  const route = await routeRepository.getRouteById(id);
  if (!route) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Route with ID ${id} not found.`);
  }
  return toApiShape(route);
};

const getAllRoutesService = async (mapId = null) => {
  const parsedMapId = mapId ? parseInt(mapId, 10) : null;
  const routes = await routeRepository.getAllRoutes(parsedMapId);
  return routes.map(toApiShape);
};

const deleteRouteService = async (id) => {
  const deleted = await routeRepository.deleteRoute(id);
  if (!deleted) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Route with ID ${id} not found.`);
  }
  return true;
};

module.exports = {
  createRouteService,
  getRouteService,
  getAllRoutesService,
  deleteRouteService,
  toApiShape,
  toDbShape
};
