const waypointService = require('../../business/services/waypointService');
const { sendSuccess } = require('../../utils/httpResponse');

const createWaypoint = async (req, res, next) => {
  try {
    const waypointData = req.body;
    const newWaypoint = await waypointService.createWaypointService(waypointData);
    return sendSuccess(res, 201, newWaypoint);
  } catch (error) {
    next(error);
  }
};

const getWaypoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const waypoint = await waypointService.getWaypointService(id);
    return sendSuccess(res, 200, waypoint);
  } catch (error) {
    next(error);
  }
};

const getAllWaypoints = async (req, res, next) => {
  try {
    const { mapId } = req.query;
    const waypoints = await waypointService.getAllWaypointsService(mapId);
    return sendSuccess(res, 200, waypoints);
  } catch (error) {
    next(error);
  }
};

const updateWaypoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedWaypoint = await waypointService.updateWaypointService(id, updateData);
    return sendSuccess(res, 200, updatedWaypoint);
  } catch (error) {
    next(error);
  }
};

const deleteWaypoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    await waypointService.deleteWaypointService(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWaypoint,
  getWaypoint,
  getAllWaypoints,
  updateWaypoint,
  deleteWaypoint
};
