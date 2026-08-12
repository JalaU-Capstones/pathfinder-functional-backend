'use strict';

const {
  validateUuidFormat,
  validateMapConfigStructure,
  validateMapDimensions,
  detectCyclicDependencies,
} = require('../../utils/recursion');
const mapRepository = require('../../data/repositories/mapRepository');
const { createAppError, ERROR_TYPES } = require('../../utils/errors');

/**
 * Validates UUID format of a map ID (recursive).
 * Does NOT check the database — pure format validation only.
 */
const validateMapIdFormat = (mapId) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  return { message: 'Map ID format is valid.' };
};

/**
 * Validates that a map ID exists in the database.
 * Uses async Promise (Assignment 6.4 point 2).
 */
const validateMapIdExists = async (mapId) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  const map = await mapRepository.getMapById(mapId);
  if (!map) {
    throw createAppError(
      ERROR_TYPES.NOT_FOUND,
      `Map with ID "${mapId}" does not exist in the database.`
    );
  }
  return { message: 'Map ID exists in the database.' };
};

/**
 * Validates map configuration structure recursively.
 */
const validateMapConfiguration = (mapId, mapConfig) => {
  if (!validateUuidFormat(mapId)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      `Invalid map ID format: "${mapId}" is not a valid UUID v4.`
    );
  }
  const result = validateMapConfigStructure(mapConfig);
  if (!result.valid) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, result.error);
  }
  return {
    message: 'Map configuration validated successfully.',
  };
};

/**
 * Validates map dimensions are within acceptable limits.
 */
const validateDimensions = (dimensions) => {
  const result = validateMapDimensions(dimensions);
  if (!result.valid) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, result.error);
  }
  return { message: 'Map dimensions are within acceptable limits.' };
};

/**
 * Detects cyclic dependencies in map connections.
 */
const validateNoCyclicDependencies = (mapConfig) => {
  const connections = mapConfig?.connections;
  if (!Array.isArray(connections)) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'Map configuration must include a "connections" array.'
    );
  }
  const result = detectCyclicDependencies(connections);
  if (result.hasCycle) {
    throw createAppError(
      ERROR_TYPES.VALIDATION_ERROR,
      'Cyclic dependency detected in map configuration: ' +
      `${result.cycle.join(' → ')}.`
    );
  }
  return {
    message: 'No cyclic dependencies found in map configuration.',
  };
};

module.exports = {
  validateMapIdFormat,
  validateMapIdExists,
  validateMapConfiguration,
  validateDimensions,
  validateNoCyclicDependencies,
};
