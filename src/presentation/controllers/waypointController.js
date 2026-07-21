const waypointService = require('../../business/services/waypointService');
const { sendSuccess, sendError } = require('../../utils/httpResponse');

const createWaypoint = async (req, res) => {
  try {
    const waypointData = req.body;
    const newWaypoint = await waypointService.createWaypointService(waypointData);
    return sendSuccess(res, 201, newWaypoint);
  } catch (error) {
    return sendError(res, error);
  }
};

const getWaypoint = async (req, res) => {
  try {
    const { id } = req.params;
    const waypoint = await waypointService.getWaypointService(id);
    return sendSuccess(res, 200, waypoint);
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllWaypoints = async (req, res) => {
  try {
    const { mapId } = req.query;
    const waypoints = await waypointService.getAllWaypointsService(mapId);
    return sendSuccess(res, 200, waypoints);
  } catch (error) {
    return sendError(res, error);
  }
};

const updateWaypoint = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedWaypoint = await waypointService.updateWaypointService(id, updateData);
    return sendSuccess(res, 200, updatedWaypoint);
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteWaypoint = async (req, res) => {
  try {
    const { id } = req.params;
    await waypointService.deleteWaypointService(id);
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createWaypoint,
  getWaypoint,
  getAllWaypoints,
  updateWaypoint,
  deleteWaypoint
};
