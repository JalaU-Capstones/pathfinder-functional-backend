const obstacleService = require('../../business/services/obstacleService');
const { sendSuccess } = require('../../utils/httpResponse');

const createObstacle = async (req, res, next) => {
  try {
    const obstacleData = req.body;
    const newObstacle = await obstacleService.createObstacleService(obstacleData);
    return sendSuccess(res, 201, newObstacle);
  } catch (error) {
    next(error);
  }
};

const getObstacle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const obstacle = await obstacleService.getObstacleService(id);
    return sendSuccess(res, 200, obstacle);
  } catch (error) {
    next(error);
  }
};

const getAllObstacles = async (req, res, next) => {
  try {
    const { mapId } = req.query;
    const obstacles = await obstacleService.getAllObstaclesService(mapId);
    return sendSuccess(res, 200, obstacles);
  } catch (error) {
    next(error);
  }
};

const updateObstacle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedObstacle = await obstacleService.updateObstacleService(id, updateData);
    return sendSuccess(res, 200, updatedObstacle);
  } catch (error) {
    next(error);
  }
};

const deleteObstacle = async (req, res, next) => {
  try {
    const { id } = req.params;
    await obstacleService.deleteObstacleService(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createObstacle,
  getObstacle,
  getAllObstacles,
  updateObstacle,
  deleteObstacle
};
