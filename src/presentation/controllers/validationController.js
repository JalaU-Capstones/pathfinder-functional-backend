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

module.exports = {
  validateMapId,
  checkMapExists,
  validateConfig,
  validateDimensions,
  checkCyclicDependencies,
};
