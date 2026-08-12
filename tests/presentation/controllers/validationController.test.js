/* global jest, beforeEach, beforeAll */
'use strict';

const request = require('supertest');
const express = require('express');
const validationRoutes = require('../../../src/presentation/routes/validationRoutes');
const validationService = require('../../../src/business/services/validationService');
const { errorHandler } = require('../../../src/presentation/middlewares/errorHandler');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/validationService');

describe('validationController', () => {
  let app;
  const validMapId = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/validation', validationRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/validation/map-id/:mapId', () => {
    it('should return 200 for valid format', async () => {
      validationService.validateMapIdFormat.mockReturnValue({ message: 'Map ID format is valid.' });
      
      const res = await request(app).get(`/api/validation/map-id/${validMapId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Map ID format is valid.');
    });

    it('should return 400 for invalid format', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid format');
      validationService.validateMapIdFormat.mockImplementation(() => { throw error; });
      
      const res = await request(app).get('/api/validation/map-id/invalid-id');
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/validation/map-exists/:mapId', () => {
    it('should return 200 when map exists', async () => {
      validationService.validateMapIdExists.mockResolvedValue({ message: 'Map ID exists in the database.' });
      
      const res = await request(app).get(`/api/validation/map-exists/${validMapId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when map does not exist', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not Found');
      validationService.validateMapIdExists.mockRejectedValue(error);
      
      const res = await request(app).get(`/api/validation/map-exists/${validMapId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/validation/map-config', () => {
    it('should return 200 for valid map config', async () => {
      validationService.validateMapConfiguration.mockReturnValue({ message: 'Map configuration validated successfully.' });
      
      const res = await request(app).post('/api/validation/map-config')
        .send({ mapId: validMapId, mapConfig: {} });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid map config', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid config');
      validationService.validateMapConfiguration.mockImplementation(() => { throw error; });
      
      const res = await request(app).post('/api/validation/map-config').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/validation/dimensions', () => {
    it('should return 200 for valid dimensions', async () => {
      validationService.validateDimensions.mockReturnValue({ message: 'Map dimensions are within acceptable limits.' });
      
      const res = await request(app).post('/api/validation/dimensions')
        .send({ width: 100, height: 100 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid dimensions', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid dimensions');
      validationService.validateDimensions.mockImplementation(() => { throw error; });
      
      const res = await request(app).post('/api/validation/dimensions').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/validation/cyclic-dependencies', () => {
    it('should return 200 when no cycle is detected', async () => {
      validationService.validateNoCyclicDependencies.mockReturnValue({ message: 'No cyclic dependencies found in map configuration.' });
      
      const res = await request(app).post('/api/validation/cyclic-dependencies')
        .send({ mapConfig: { connections: [] } });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when cycle is detected', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Cycle detected');
      validationService.validateNoCyclicDependencies.mockImplementation(() => { throw error; });
      
      const res = await request(app).post('/api/validation/cyclic-dependencies').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Phase 13C controllers ────────────────────────────────────────────────────

  describe('POST /api/validation/start-end-obstructed', () => {
    it('should return 200 on success', async () => {
      validationService.validateStartEndNotObstructed.mockResolvedValue({ message: 'ok' });
      const res = await request(app).post('/api/validation/start-end-obstructed').send({});
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return error if validation fails', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'failed');
      validationService.validateStartEndNotObstructed.mockRejectedValue(error);
      const res = await request(app).post('/api/validation/start-end-obstructed').send({});
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/validation/valid-path', () => {
    it('should return 200 on success', async () => {
      validationService.validateAtLeastOneValidPath.mockResolvedValue({ message: 'ok' });
      const res = await request(app).post('/api/validation/valid-path').send({});
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/validation/performance', () => {
    it('should return 200 with analysis', async () => {
      validationService.analyzeRoutePerformance.mockResolvedValue({ analysis: { runs: 5 } });
      const res = await request(app).post('/api/validation/performance').send({});
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.analysis.runs).toBe(5);
    });
  });

  describe('POST /api/validation/route-intersections', () => {
    it('should return 200 if valid', async () => {
      validationService.validateRouteNoIntersections.mockReturnValue({ message: 'ok' });
      const res = await request(app).post('/api/validation/route-intersections').send({});
      expect(res.statusCode).toEqual(200);
    });

    it('should handle sync errors', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'failed');
      validationService.validateRouteNoIntersections.mockImplementation(() => { throw error; });
      const res = await request(app).post('/api/validation/route-intersections').send({});
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/validation/route-length', () => {
    it('should return 200 if valid', async () => {
      validationService.validateRouteLength.mockReturnValue({ message: 'ok' });
      const res = await request(app).post('/api/validation/route-length').send({});
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('POST /api/validation/same-point', () => {
    it('should return 200 with samePoint bool', async () => {
      validationService.handleSameStartEnd.mockReturnValue({ samePoint: true });
      const res = await request(app).post('/api/validation/same-point').send({});
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.samePoint).toBe(true);
    });
  });

  describe('POST /api/validation/comprehensive', () => {
    it('should return 200 on success', async () => {
      validationService.validateRouteComprehensive.mockResolvedValue({ results: [] });
      const res = await request(app).post('/api/validation/comprehensive').send({});
      expect(res.statusCode).toEqual(200);
    });

    it('should return 400 on error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'failed');
      validationService.validateRouteComprehensive.mockRejectedValue(error);
      const res = await request(app).post('/api/validation/comprehensive').send({});
      expect(res.statusCode).toEqual(400);
    });
  });

});
