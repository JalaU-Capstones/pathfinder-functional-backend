'use strict';

jest.mock('../../src/data/repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '7d',
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository =
  require('../../src/data/repositories/userRepository');
const { register, login } =
  require('../../src/business/services/authService');

const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Diego Botina',
  email: 'diego@example.com',
  age: 22,
  password: '$2b$12$hashedpassword',
  createdAt: new Date('2026-08-29'),
};

describe('authService.register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should register a new user and return token', async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('$2b$12$hashed');
    userRepository.createUser.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('mock.jwt.token');

    const result = await register({
      name: 'Diego Botina',
      email: 'diego@example.com',
      password: 'SecurePass1!',
      age: 22,
    });

    expect(result.token).toBe('mock.jwt.token');
    expect(result.user.email).toBe('diego@example.com');
    expect(result.user.password).toBeUndefined();
  });

  it('should hash the password with 12 rounds', async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('$2b$12$hashed');
    userRepository.createUser.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('token');

    await register({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
  });

  it('should throw 409 if email already exists', async () => {
    userRepository.getUserByEmail.mockResolvedValue(mockUser);

    await expect(register({
      name: 'Test',
      email: 'diego@example.com',
      password: 'password123',
      age: 22,
    })).rejects.toMatchObject({ type: 'CONFLICT' });
  });

  it('should throw 400 if password is too short', async () => {
    await expect(register({
      name: 'Test',
      email: 'test@example.com',
      password: 'short',
      age: 22,
    })).rejects.toMatchObject({ type: 'VALIDATION_ERROR' });
  });

  it('should throw 400 if email is invalid', async () => {
    await expect(register({
      name: 'Test',
      email: 'not-an-email',
      password: 'password123',
      age: 22,
    })).rejects.toMatchObject({ type: 'VALIDATION_ERROR' });
  });

  it('should throw 400 if name is empty', async () => {
    await expect(register({
      name: '',
      email: 'test@example.com',
      password: 'password123',
      age: 22,
    })).rejects.toMatchObject({ type: 'VALIDATION_ERROR' });
  });

  it('should never include password in response', async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('$2b$12$hashed');
    userRepository.createUser.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('token');

    const result = await register({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      age: 22,
    });

    expect(result.user).not.toHaveProperty('password');
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('$2b$');
  });
});

describe('authService.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return token for valid credentials', async () => {
    userRepository.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock.jwt.token');

    const result = await login({
      email: 'diego@example.com',
      password: 'SecurePass1!',
    });

    expect(result.token).toBe('mock.jwt.token');
    expect(result.user.email).toBe('diego@example.com');
  });

  it('should throw 401 for wrong password', async () => {
    userRepository.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login({
      email: 'diego@example.com',
      password: 'wrongpassword',
    })).rejects.toMatchObject({ type: 'UNAUTHORIZED' });
  });

  it('should throw 401 for non-existent email', async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);

    await expect(login({
      email: 'nobody@example.com',
      password: 'password123',
    })).rejects.toMatchObject({ type: 'UNAUTHORIZED' });
  });

  it('should use same error message for wrong email and wrong password',
    async () => {
      // User enumeration prevention test
      userRepository.getUserByEmail.mockResolvedValue(null);
      const result1 = await login({
        email: 'nobody@example.com',
        password: 'pass',
      }).catch((e) => e);

      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      const result2 = await login({
        email: 'diego@example.com',
        password: 'wrongpass',
      }).catch((e) => e);

      expect(result1.message).toBe(result2.message);
    }
  );

  it('should never include password in response', async () => {
    userRepository.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');

    const result = await login({
      email: 'diego@example.com',
      password: 'SecurePass1!',
    });

    expect(result.user).not.toHaveProperty('password');
  });
});
