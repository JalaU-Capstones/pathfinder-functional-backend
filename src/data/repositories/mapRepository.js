const { Map, Obstacle, Waypoint, sequelize } = require('../models');

const createMap = async (mapData) => {
  return await Map.create(mapData);
};

const createMapWithRelations = async ({ name, width, height, obstacles, waypoints }) => {
  const transaction = await sequelize.transaction();
  try {
    const map = await Map.create({ name, width, height }, { transaction });

    if (obstacles && obstacles.length > 0) {
      const dbObstacles = obstacles.map(obs => ({ ...obs, mapId: map.id }));
      await Obstacle.bulkCreate(dbObstacles, { transaction });
    }

    if (waypoints && waypoints.length > 0) {
      const dbWaypoints = waypoints.map(wp => ({ ...wp, mapId: map.id }));
      await Waypoint.bulkCreate(dbWaypoints, { transaction });
    }

    await transaction.commit();
    return map.id;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getMapById = async (id) => {
  return await Map.findByPk(id, {
    include: [
      { model: Obstacle, as: 'obstacles' },
      { model: Waypoint, as: 'waypoints' }
    ]
  });
};

const getAllMaps = async () => {
  return await Map.findAll({
    include: [
      { model: Obstacle, as: 'obstacles' },
      { model: Waypoint, as: 'waypoints' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const updateMap = async (id, updateData) => {
  const [updatedRowsCount, updatedRows] = await Map.update(updateData, {
    where: { id },
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteMap = async (id) => {
  const deletedRowsCount = await Map.destroy({
    where: { id }
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createMap,
  createMapWithRelations,
  getMapById,
  getAllMaps,
  updateMap,
  deleteMap
};
