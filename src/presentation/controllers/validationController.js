'use strict';

const validationService = require('../../business/services/validationService');

const validateMapId = (req, res, next) => {
  try {
    const { mapId } = req.params;
    const result = validationService.validateMapIdFormat(mapId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkMapExists = async (req, res, next) => {
  try {
    const { mapId } = req.params;
    const result = await validationService.validateMapIdExists(mapId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const validateConfig = (req, res, next) => {
  try {
    const { mapId, mapConfig } = req.body;
    const result = validationService.validateMapConfiguration(mapId, mapConfig);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const validateDimensions = (req, res, next) => {
  try {
    // Expect width and height to be provided in req.body
    const result = validationService.validateDimensions(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkCyclicDependencies = (req, res, next) => {
  try {
    const { mapConfig } = req.body;
    const result = validationService.validateNoCyclicDependencies(mapConfig);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Phase 13C controllers ────────────────────────────────────────────────────

const checkStartEndObstructed = async (req, res, next) => {
  try {
    const { mapId, startPoint, endPoint, obstacles } = req.body;
    const result = await validationService.validateStartEndNotObstructed({
      mapId, startPoint, endPoint, obstacles,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkValidPath = async (req, res, next) => {
  try {
    const { mapId, startPoint, endPoint } = req.body;
    const result = await validationService.validateAtLeastOneValidPath({
      mapId, startPoint, endPoint,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const analyzePerformance = async (req, res, next) => {
  try {
    const { startPoint, endPoint, obstacles } = req.body;
    const result = await validationService.analyzeRoutePerformance({
      startPoint, endPoint, obstacles,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkRouteIntersections = (req, res, next) => {
  try {
    const { path, obstacles } = req.body;
    const result = validationService.validateRouteNoIntersections({
      path, obstacles,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkRouteLength = (req, res, next) => {
  try {
    const { path } = req.body;
    const result = validationService.validateRouteLength({ path });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkSamePoint = (req, res, next) => {
  try {
    const { startPoint, endPoint } = req.body;
    const result = validationService.handleSameStartEnd({ startPoint, endPoint });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkComprehensive = async (req, res, next) => {
  try {
    const { mapId, startPoint, endPoint, obstacles, path } = req.body;
    const result = await validationService.validateRouteComprehensive({
      mapId, startPoint, endPoint, obstacles, path,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateMapId,
  checkMapExists,
  validateConfig,
  validateDimensions,
  checkCyclicDependencies,
  // Phase 13C
  checkStartEndObstructed,
  checkValidPath,
  analyzePerformance,
  checkRouteIntersections,
  checkRouteLength,
  checkSamePoint,
  checkComprehensive,
};
