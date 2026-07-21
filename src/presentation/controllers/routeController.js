const routeService = require('../../business/services/routeService');
const { sendSuccess, sendError } = require('../../utils/httpResponse');

const createRoute = async (req, res) => {
  try {
    const routeData = req.body;
    const newRoute = await routeService.createRouteService(routeData);
    return sendSuccess(res, 201, newRoute);
  } catch (error) {
    return sendError(res, error);
  }
};

const getRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await routeService.getRouteService(id);
    return sendSuccess(res, 200, route);
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const { mapId } = req.query;
    const routes = await routeService.getAllRoutesService(mapId);
    return sendSuccess(res, 200, routes);
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    await routeService.deleteRouteService(id);
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createRoute,
  getRoute,
  getAllRoutes,
  deleteRoute
};
