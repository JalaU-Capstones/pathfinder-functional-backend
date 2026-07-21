const { Obstacle } = require('../models');

const createObstacle = async (obstacleData) => {
  return await Obstacle.create(obstacleData);
};

const getObstacleById = async (id) => {
  return await Obstacle.findByPk(id);
};

const getAllObstacles = async (mapId = null) => {
  const query = { order: [['createdAt', 'DESC']] };
  if (mapId) {
    query.where = { mapId };
  }
  return await Obstacle.findAll(query);
};

const updateObstacle = async (id, updateData) => {
  const [updatedRowsCount, updatedRows] = await Obstacle.update(updateData, {
    where: { id },
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteObstacle = async (id) => {
  const deletedRowsCount = await Obstacle.destroy({
    where: { id }
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
