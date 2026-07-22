const routeService = require('../../business/services/routeService');
const { sendSuccess } = require('../../utils/httpResponse');

const createRoute = async (req, res, next) => {
  try {
    const routeData = req.body;
    const newRoute = await routeService.createRouteService(routeData);
    return sendSuccess(res, 201, newRoute);
  } catch (error) {
    next(error);
  }
};

const getRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await routeService.getRouteService(id);
    return sendSuccess(res, 200, route);
  } catch (error) {
    next(error);
  }
};

const getAllRoutes = async (req, res, next) => {
  try {
    const { mapId } = req.query;
    const routes = await routeService.getAllRoutesService(mapId);
    return sendSuccess(res, 200, routes);
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    await routeService.deleteRouteService(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoute,
  getRoute,
  getAllRoutes,
  deleteRoute
};
