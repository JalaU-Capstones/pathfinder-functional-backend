const { Waypoint } = require('../models');

const createWaypoint = async (waypointData) => {
  return await Waypoint.create(waypointData);
};

const getWaypointById = async (id) => {
  return await Waypoint.findByPk(id);
};

const getAllWaypoints = async (mapId = null) => {
  const query = { order: [['createdAt', 'DESC']] };
  if (mapId) {
    query.where = { mapId };
  }
  return await Waypoint.findAll(query);
};

const updateWaypoint = async (id, updateData) => {
  const [updatedRowsCount, updatedRows] = await Waypoint.update(updateData, {
    where: { id },
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteWaypoint = async (id) => {
  const deletedRowsCount = await Waypoint.destroy({
    where: { id }
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
