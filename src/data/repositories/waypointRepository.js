const { Waypoint } = require('../models');

const createWaypoint = async (waypointData) => {
  return await Waypoint.create(waypointData);
};

const getWaypointById = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  return await Waypoint.findOne({ where });
};

const getAllWaypoints = async (mapId = null, options = {}) => {
  const query = { order: [['createdAt', 'DESC']] };
  query.where = {};
  if (mapId) query.where.mapId = mapId;
  if (options.userId) query.where.userId = options.userId;
  if (Object.keys(query.where).length === 0) delete query.where;
  return await Waypoint.findAll(query);
};

const updateWaypoint = async (id, updateData, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const [updatedRowsCount, updatedRows] = await Waypoint.update(updateData, {
    where,
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteWaypoint = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const deletedRowsCount = await Waypoint.destroy({
    where
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createWaypoint,
  getWaypointById,
  getAllWaypoints,
  updateWaypoint,
  deleteWaypoint
};
