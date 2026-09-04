/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const { authMiddleware, extractToken, verifyToken } = require('../../../../src/presentation/middlewares/authMiddleware');
const { JWT_SECRET } = require('../../../../src/config/env');

describe('Auth Middleware', () => {
  const FIXED_TIME = new Date('2026-09-04T12:00:00Z').getTime();
  const FIXED_TIME_SEC = Math.floor(FIXED_TIME / 1000);

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_TIME);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('extractToken', () => {
    it('should return null if no authorization header', () => {
      expect(extractToken({ headers: {} })).toBeNull();
    });
    it('should return null if header does not start with Bearer', () => {
      expect(extractToken({ headers: { authorization: 'Basic token' } })).toBeNull();
    });
    it('should extract the token correctly', () => {
      expect(extractToken({ headers: { authorization: 'Bearer mytoken123' } })).toBe('mytoken123');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token (Test Case A)', () => {
      const token = jwt.sign({ userId: '123', exp: FIXED_TIME_SEC + 3600 }, JWT_SECRET);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe('123');
    });

    it('should reject expired token (Test Case B)', () => {
      const token = jwt.sign({ userId: '123', exp: FIXED_TIME_SEC - 3600 }, JWT_SECRET);
      expect(() => verifyToken(token)).toThrow('Session expired. Please sign in again.');
    });

    it('should reject token with exp set to current time (Test Case C)', () => {
      const token = jwt.sign({ userId: '123', exp: FIXED_TIME_SEC }, JWT_SECRET);
      expect(() => verifyToken(token)).toThrow('Session expired. Please sign in again.');
    });

    it('should reject token missing exp claim (Test Case D)', () => {
      // Create token without exp
      const token = jwt.sign({ userId: '123' }, JWT_SECRET);
      expect(() => verifyToken(token)).toThrow('Invalid authentication token.');
    });
  });

  describe('authMiddleware', () => {
    it('should call next with error if no token is provided', () => {
      const req = { headers: {} };
      const next = jest.fn();
      authMiddleware(req, {}, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.type).toBe('UNAUTHORIZED');
    });

    it('should attach decoded payload to req.user on valid token', () => {
      const token = jwt.sign({ userId: '123', exp: FIXED_TIME_SEC + 3600 }, JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();
      authMiddleware(req, {}, next);
      expect(req.user.userId).toBe('123');
      expect(next).toHaveBeenCalledWith();
    });
  });
});
