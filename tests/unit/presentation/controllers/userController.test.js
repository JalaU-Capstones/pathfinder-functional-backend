/* eslint-disable no-undef */
'use strict';

const request = require('supertest');
const express = require('express');

jest.mock('../../../../src/presentation/middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' };
    next();
  }
}));

const userService = require('../../../../src/business/services/userService');
jest.mock('../../../../src/business/services/userService');

const { errorHandler } = require('../../../../src/presentation/middlewares/errorHandler');
const userRoutes = require('../../../../src/presentation/routes/userRoutes');
const { createAppError, ERROR_TYPES } = require('../../../../src/utils/errors');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.user = { userId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }; next(); });
app.use('/api/users', userRoutes);
app.use(errorHandler);

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/me', () => {
    it('should return 200 with user profile', async () => {
      userService.getProfile.mockResolvedValue({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      userService.getProfile.mockRejectedValue(
        createAppError(ERROR_TYPES.NOT_FOUND, 'Not found')
      );
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should return 200 and updated user', async () => {
      userService.updateProfile.mockResolvedValue({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });
      const res = await request(app).put('/api/users/me').send({ name: 'Alice' });
      expect(res.status).toBe(200);
    });

    it('should return 404 when user not found', async () => {
      userService.updateProfile.mockRejectedValue(
        createAppError(ERROR_TYPES.NOT_FOUND, 'Not found')
      );
      const res = await request(app).put('/api/users/me').send({ name: 'Alice' });
      expect(res.status).toBe(404);
    });

    it('should return 409 on duplicate email', async () => {
      userService.updateProfile.mockRejectedValue(
        createAppError(ERROR_TYPES.CONFLICT, 'Duplicate email')
      );
      const res = await request(app).put('/api/users/me').send({ email: 'taken@example.com' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should return 204 on success', async () => {
      userService.deleteAccount.mockResolvedValue(true);
      const res = await request(app).delete('/api/users/me');
      expect(res.status).toBe(204);
    });

    it('should return 404 when user not found', async () => {
      userService.deleteAccount.mockRejectedValue(
        createAppError(ERROR_TYPES.NOT_FOUND, 'Not found')
      );
      const res = await request(app).delete('/api/users/me');
      expect(res.status).toBe(404);
    });
  });
});
