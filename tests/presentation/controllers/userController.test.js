/* global jest, beforeEach */
const request = require('supertest');
const { createApp } = require('../../../src/app');
const app = createApp();
const userService = require('../../../src/business/services/userService');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/userService', () => ({
  createUserService: jest.fn(),
  getUserService: jest.fn(),
  getAllUsersService: jest.fn(),
  updateUserService: jest.fn(),
  deleteUserService: jest.fn(),
}));

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should return 201 and created user on success', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@a.com' };
      userService.createUserService.mockResolvedValue(mockObj);

      const response = await request(app).post('/api/users').send({ email: 'a@a.com' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid');
      userService.createUserService.mockRejectedValue(error);

      const response = await request(app).post('/api/users').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
    });

    it('should return 409 on duplicate email', async () => {
      const error = createAppError(ERROR_TYPES.CONFLICT, 'Duplicate');
      userService.createUserService.mockRejectedValue(error);

      const response = await request(app).post('/api/users').send({});

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/users', () => {
    it('should return 200 and array of users', async () => {
      const mockObjs = [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }];
      userService.getAllUsersService.mockResolvedValue(mockObjs);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObjs);
    });

    it('should return 500 on unexpected error', async () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal error');
      userService.getAllUsersService.mockRejectedValue(error);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 and user', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      userService.getUserService.mockResolvedValue(mockObj);

      const response = await request(app).get('/api/users/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      userService.getUserService.mockRejectedValue(error);

      const response = await request(app).get('/api/users/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 200 and updated user', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      userService.updateUserService.mockResolvedValue(mockObj);

      const response = await request(app).put('/api/users/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({ email: 'a@a.com' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      userService.updateUserService.mockRejectedValue(error);

      const response = await request(app).put('/api/users/99999999-9999-9999-9999-999999999999').send({ email: 'a@a.com' });

      expect(response.status).toBe(404);
    });
    
    it('should return 400 on empty body', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid');
      userService.updateUserService.mockRejectedValue(error);

      const response = await request(app).put('/api/users/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({});

      expect(response.status).toBe(400);
    });
    
    it('should return 409 on duplicate email', async () => {
      const error = createAppError(ERROR_TYPES.CONFLICT, 'Duplicate');
      userService.updateUserService.mockRejectedValue(error);

      const response = await request(app).put('/api/users/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({ email: 'a@a.com' });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 204 on success', async () => {
      userService.deleteUserService.mockResolvedValue(true);

      const response = await request(app).delete('/api/users/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(204);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      userService.deleteUserService.mockRejectedValue(error);

      const response = await request(app).delete('/api/users/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });
});
