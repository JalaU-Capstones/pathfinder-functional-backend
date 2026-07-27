const routeRepository = require('../../data/repositories/routeRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { toApiPosition, toDbPosition } = require('../../utils/shapeMapper');
const { calculatePath } = require('../pathfinder');

const { pipe } = require('../../utils/compose');
const {
  validateMapExists,
  validateMapHasObstacles,
  validateStartInBounds,
  validateEndInBounds,
  validatePointsNotEqual,
} = require('../../utils/routeValidators');

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

const validateRouteContext = pipe(
  validateMapExists,
  validateMapHasObstacles,
  validateStartInBounds,
  validateEndInBounds,
  validatePointsNotEqual
);

const validateRouteInput = async (data) => {
  if (!data.mapId || !Number.isInteger(data.mapId)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be an integer.');
  }

  validateCoordinate(data.start, 'Start');
  validateCoordinate(data.end, 'End');

  // Fetch the Map to build the validation context
  const fetchedMap = await mapRepository.getMapById(data.mapId);
  
  const context = { 
    mapId: data.mapId, 
    start: data.start, 
    end: data.end, 
    map: fetchedMap 
  };
  
  // Execute the composed validation pipeline
  validateRouteContext(context);

  return fetchedMap;
};

const createRouteService = async (routeData) => {
  const mapExists = await validateRouteInput(routeData);

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
