const { Map, Obstacle, Waypoint, sequelize } = require('../models');

const createMap = async (mapData) => {
  return await Map.create(mapData);
};

const createMapWithRelations = async ({ userId, name, width, height, obstacles, waypoints }) => {
  const transaction = await sequelize.transaction();
  try {
    const map = await Map.create({ userId, name, width, height }, { transaction });

    if (obstacles && obstacles.length > 0) {
      const dbObstacles = obstacles.map(obs => ({
        mapId: map.id,
        userId: obs.userId || null,
        startX: obs.startX,
        startY: obs.startY,
        endX: obs.endX !== undefined ? obs.endX : obs.startX,
        endY: obs.endY !== undefined ? obs.endY : obs.startY,
        size: obs.size !== undefined ? obs.size : (
          (obs.endX !== undefined ? obs.endX : obs.startX) - obs.startX + 1
        ) * (
          (obs.endY !== undefined ? obs.endY : obs.startY) - obs.startY + 1
        ),
      }));
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

const getMapById = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  return await Map.findOne({
    where,
    include: [
      { model: Obstacle, as: 'obstacles' },
      { model: Waypoint, as: 'waypoints' }
    ]
  });
};

const getAllMaps = async (options = {}) => {
  const where = options.userId ? { userId: options.userId } : {};
  return await Map.findAll({
    where,
    include: [
      { model: Obstacle, as: 'obstacles' },
      { model: Waypoint, as: 'waypoints' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const updateMap = async (id, updateData, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const [updatedRowsCount, updatedRows] = await Map.update(updateData, {
    where,
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteMap = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const deletedRowsCount = await Map.destroy({
    where
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
