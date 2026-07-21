const { Route } = require('../models');

const createRoute = async (routeData) => {
  return await Route.create(routeData);
};

const getRouteById = async (id) => {
  return await Route.findByPk(id);
};

const getAllRoutes = async (mapId = null) => {
  const query = { order: [['createdAt', 'DESC']] };
  if (mapId) {
    query.where = { mapId };
  }
  return await Route.findAll(query);
};

const deleteRoute = async (id) => {
  const deletedRowsCount = await Route.destroy({
    where: { id }
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createRoute,
  getRouteById,
  getAllRoutes,
  deleteRoute
};
