'use strict';

jest.mock('../../src/business/services/authService', () => ({
  register: jest.fn(),
  login: jest.fn(),
}));

const request = require('supertest');
const { createApp } = require('../../src/app');
const authService = require('../../src/business/services/authService');
const app = createApp();

const mockAuthResponse = {
  token: 'mock.jwt.token',
  expiresIn: '7d',
  user: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Diego Botina',
    email: 'diego@example.com',
    age: 22,
  },
};

describe('POST /api/auth/signin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 201 with token on successful registration',
    async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          name: 'Diego Botina',
          email: 'diego@example.com',
          password: 'SecurePass1!',
          age: 22,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe('mock.jwt.token');
      expect(res.body.data.user.email).toBe('diego@example.com');
    }
  );

  it('should return 409 for duplicate email', async () => {
    const { createAppError } = require('../../src/utils/errors');
    authService.register.mockRejectedValue(
      createAppError('CONFLICT', 'Email already exists')
    );

    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        name: 'Test',
        email: 'taken@example.com',
        password: 'SecurePass1!',
        age: 22,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 200 with token on valid credentials',
    async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'diego@example.com',
          password: 'SecurePass1!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    }
  );

  it('should return 401 for invalid credentials', async () => {
    const { createAppError } = require('../../src/utils/errors');
    authService.login.mockRejectedValue(
      createAppError(
        'UNAUTHORIZED', 'Invalid email or password.'
      )
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
