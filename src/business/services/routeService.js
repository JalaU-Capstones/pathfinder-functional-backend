const routeRepository = require('../../data/repositories/routeRepository');
const mapRepository = require('../../data/repositories/mapRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { assertOwnership } = require('../../utils/ownershipCheck');
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
const fetchMapContext = async ({ routeData, userId }) => {
  if (!routeData.mapId || typeof routeData.mapId !== 'string') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'mapId is required and must be a string.');
  }

  validateCoordinate(routeData.start, 'Start');
  validateCoordinate(routeData.end, 'End');

  const fetchedMap = await mapRepository.getMapById(routeData.mapId, { userId });
  if (!fetchedMap) {
    const anyMap = await mapRepository.getMapById(routeData.mapId);
    if (anyMap) throw createAppError(ERROR_TYPES.FORBIDDEN, 'You do not have permission to access this Map.');
    // else let validator throw NOT_FOUND
  }
  
  return { 
    routeData,
    userId,
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
  const { routeData, pathResult, userId } = state;
  const routeToCreate = {
    ...routeData,
    distance: pathResult.distance,
    path: pathResult.path
  };

  const dbShape = toDbShape(routeToCreate);
  dbShape.userId = userId;
  const newRoute = await routeRepository.createRoute(dbShape);
  return newRoute;
};

const toResponse = (newRoute) => {
  return toApiShape(newRoute);
};

// The monadic pipeline — reads like a specification:
const createRouteService = async (data, userId) =>
  pipeAsync(
    fetchMapContext,
    validateContext,
    computePath,
    validatePath,
    persistRoute,
    toResponse
  )({ routeData: data, userId });


const getRouteService = async (id, userId) => {
  const route = await routeRepository.getRouteById(id, { userId });
  if (!route) {
    const anyRoute = await routeRepository.getRouteById(id);
    if (anyRoute) throw createAppError(ERROR_TYPES.FORBIDDEN, 'You do not have permission to access this Route.');
    throw createAppError(ERROR_TYPES.NOT_FOUND, `Route with ID ${id} not found.`);
  }
  return toApiShape(route);
};

const getAllRoutesService = async (mapId = null, userId) => {
  const parsedMapId = mapId || null;
  const routes = await routeRepository.getAllRoutes(parsedMapId, { userId });
  return routes.map(toApiShape);
};

const deleteRouteService = async (id, userId) => {
  const deletedCount = await routeRepository.deleteRoute(id, { userId });
  await assertOwnership(deletedCount ? 1 : 0, () => routeRepository.getRouteById(id), 'Route');
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
