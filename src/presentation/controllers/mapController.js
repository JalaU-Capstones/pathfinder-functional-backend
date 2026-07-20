const mapService = require('../../business/services/mapService');
const { sendSuccess, sendError } = require('../../utils/httpResponse');

const createMap = async (req, res) => {
  try {
    const mapData = req.body;
    const newMap = await mapService.createMapService(mapData);
    return sendSuccess(res, 201, newMap);
  } catch (error) {
    return sendError(res, error);
  }
};

const getMap = async (req, res) => {
  try {
    const { id } = req.params;
    const map = await mapService.getMapService(id);
    return sendSuccess(res, 200, map);
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllMaps = async (req, res) => {
  try {
    const maps = await mapService.getAllMapsService();
    return sendSuccess(res, 200, maps);
  } catch (error) {
    return sendError(res, error);
  }
};

const updateMap = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedMap = await mapService.updateMapService(id, updateData);
    return sendSuccess(res, 200, updatedMap);
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteMap = async (req, res) => {
  try {
    const { id } = req.params;
    await mapService.deleteMapService(id);
    // 204 No Content typically does not return a body
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createMap,
  getMap,
  getAllMaps,
  updateMap,
  deleteMap
};
