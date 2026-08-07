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
  validateWaypointsInPath
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
    optimal_path: raw.path !== undefined ? raw.path : null,
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
    distance: apiData.distance,
    path: apiData.path
  };
};

const { pipeAsync } = require('../../utils/monad');

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

// Each step is a named pure async function — single responsibility
const fetchMapContext = async (routeData) => {
  if (!routeData.mapId || !Number.isInteger(routeData.mapId)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be an integer.');
  }

  validateCoordinate(routeData.start, 'Start');
  validateCoordinate(routeData.end, 'End');

  const fetchedMap = await mapRepository.getMapById(routeData.mapId);
  
  return { 
    routeData,
    context: {
      mapId: routeData.mapId, 
      start: routeData.start, 
      end: routeData.end, 
      map: fetchedMap 
    }
  };
};

const validateContext = (state) => {
  validateRouteContext(state.context);
  return state;
};

const computePath = (state) => {
  const { routeData, context: { map } } = state;
  const obstacles = map.obstacles ? map.obstacles.map(toApiPosition) : [];
  const waypoints = map.waypoints ? map.waypoints.map(w => ({ ...toApiPosition(w), name: w.name })) : [];

  const pathResult = calculatePath(
    { width: map.width, height: map.height },
    routeData.start,
    routeData.end,
    obstacles,
    waypoints
  );

  return { ...state, pathResult, waypoints };
};

const validatePath = (state) => {
  const { pathResult, waypoints } = state;
  if (!validateWaypointsInPath(pathResult.path, waypoints)) {
    throw createAppError(
      ERROR_TYPES.UNPROCESSABLE_ENTITY,
      'The computed path could not satisfy all waypoint constraints. Verify that waypoints are reachable and not blocked by obstacles.'
    );
  }
  return state;
};

const persistRoute = async (state) => {
  const { routeData, pathResult } = state;
  const routeToCreate = {
    ...routeData,
    distance: pathResult.distance,
    path: pathResult.path
  };

  const dbShape = toDbShape(routeToCreate);
  const newRoute = await routeRepository.createRoute(dbShape);
  return newRoute;
};

const toResponse = (newRoute) => {
  return toApiShape(newRoute);
};

// The monadic pipeline — reads like a specification:
const createRouteService = async (data) =>
  pipeAsync(
    fetchMapContext,
    validateContext,
    computePath,
    validatePath,
    persistRoute,
    toResponse
  )(data);


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
