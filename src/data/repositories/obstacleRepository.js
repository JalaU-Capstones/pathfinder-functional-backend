const { Obstacle } = require('../models');

const createObstacle = async (obstacleData) => {
  return await Obstacle.create(obstacleData);
};

const getObstacleById = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  return await Obstacle.findOne({ where });
};

const getAllObstacles = async (mapId = null, options = {}) => {
  const query = { order: [['createdAt', 'DESC']] };
  query.where = {};
  if (mapId) query.where.mapId = mapId;
  if (options.userId) query.where.userId = options.userId;
  if (Object.keys(query.where).length === 0) delete query.where;
  return await Obstacle.findAll(query);
};

const updateObstacle = async (id, updateData, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const [updatedRowsCount, updatedRows] = await Obstacle.update(updateData, {
    where,
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteObstacle = async (id, options = {}) => {
  const where = { id };
  if (options.userId) where.userId = options.userId;
  const deletedRowsCount = await Obstacle.destroy({
    where
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createObstacle,
  getObstacleById,
  getAllObstacles,
  updateObstacle,
  deleteObstacle
};
