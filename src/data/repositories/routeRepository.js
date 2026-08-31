const { Route } = require('../models');

const createRoute = async (routeData) => {
  return await Route.create(routeData);
};

const getRouteById = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  return await Route.findOne({ where });
};

const getAllRoutes = async (mapId = null, options = {}) => {
  const query = { order: [['createdAt', 'DESC']] };
  query.where = {};
  if (mapId) query.where.mapId = mapId;
  if (options.userId) query.where.userId = options.userId;
  if (Object.keys(query.where).length === 0) delete query.where;
  return await Route.findAll(query);
};

const deleteRoute = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const deletedRowsCount = await Route.destroy({
    where
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createRoute,
  getRouteById,
  getAllRoutes,
  deleteRoute
};
