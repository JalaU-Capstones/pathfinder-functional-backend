/* global jest, beforeEach */
'use strict';

jest.mock(
  '../../../src/data/repositories/apiStatRepository',
  () => ({ createStat: jest.fn() })
);

// logger.js exports the logger instance directly (module.exports = logger).
// The mock must return the same shape so trackingMiddleware can call
// logger.error without a TypeError.
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

const {
  trackingMiddleware,
  withTracking,
  normalizePath,
  buildStatPayload,
} = require(
  '../../../src/presentation/middlewares/trackingMiddleware'
);

const { createStat } =
  require('../../../src/data/repositories/apiStatRepository');
const logger = require('../../../src/utils/logger');

// ─── normalizePath ─────────────────────────────────────────────
describe('normalizePath', () => {
  it('should replace UUID segments with :id', () => {
    const input =
      '/api/maps/3b47e69f-788d-4b19-b81b-0b4a2fd92799';
    expect(normalizePath(input)).toBe('/api/maps/:id');
  });

  it('should strip query strings', () => {
    expect(normalizePath('/api/obstacles?mapId=abc'))
      .toBe('/api/obstacles');
  });

  it('should handle paths with no UUID or query string', () => {
    expect(normalizePath('/api/maps')).toBe('/api/maps');
  });

  it('should replace multiple UUIDs in one path', () => {
    const uuid = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
    const input = `/api/maps/${uuid}/routes/${uuid}`;
    expect(normalizePath(input)).toBe('/api/maps/:id/routes/:id');
  });

  it('should strip query string AND replace UUID', () => {
    const uuid = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
    const input = `/api/maps/${uuid}?include=obstacles`;
    expect(normalizePath(input)).toBe('/api/maps/:id');
  });
});

// ─── buildStatPayload ──────────────────────────────────────────
describe('buildStatPayload', () => {
  it('should build a correct payload from req and response data',
    () => {
      const req = {
        originalUrl: '/api/maps',
        method: 'GET',
        user: null,
      };
      const result = buildStatPayload(req, 200, 45);

      expect(result).toMatchObject({
        endpointAccess: '/api/maps',
        requestMethod: 'GET',
        statusCode: 200,
        responseTimeMs: 45,
        userId: null,
      });
      expect(result.timestamp).toBeInstanceOf(Date);
    }
  );

  it('should extract userId from req.user.id if present', () => {
    const req = {
      originalUrl: '/api/maps',
      method: 'POST',
      user: { id: 'user-uuid-123' },
    };
    const result = buildStatPayload(req, 201, 80);
    expect(result.userId).toBe('user-uuid-123');
  });

  it('should normalize UUID in path', () => {
    const uuid = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
    const req = {
      originalUrl: `/api/maps/${uuid}`,
      method: 'GET',
      user: null,
    };
    const result = buildStatPayload(req, 200, 30);
    expect(result.endpointAccess).toBe('/api/maps/:id');
  });
});

// ─── trackingMiddleware ────────────────────────────────────────
describe('trackingMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      originalUrl: '/api/maps',
      method: 'GET',
      user: null,
    };
    res = {
      statusCode: 200,
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next()', () => {
    trackingMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should override res.json', () => {
    const originalJson = res.json;
    trackingMiddleware(req, res, next);
    expect(res.json).not.toBe(originalJson);
  });

  it('should call createStat when res.json is invoked',
    async () => {
      createStat.mockResolvedValue({});
      trackingMiddleware(req, res, next);

      // In NODE_ENV=test res.json returns a Promise — await it
      // so persistStat settles before the assertion.
      await res.json({ success: true, data: [] });

      expect(createStat).toHaveBeenCalledWith(
        expect.objectContaining({
          endpointAccess: '/api/maps',
          requestMethod: 'GET',
          statusCode: 200,
        })
      );
    }
  );

  it('should not propagate errors if createStat rejects',
    async () => {
      createStat.mockRejectedValue(new Error('DB error'));
      trackingMiddleware(req, res, next);

      // In NODE_ENV=test res.json returns a Promise.
      // The promise must resolve (not reject) because persistStat
      // catches its own errors — the client never sees the DB failure.
      await expect(
        res.json({ success: true })
      ).resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalled();
    }
  );

  it('should record response time greater than or equal to 0',
    async () => {
      createStat.mockResolvedValue({});
      trackingMiddleware(req, res, next);

      await res.json({ success: true });

      expect(createStat).toHaveBeenCalledWith(
        expect.objectContaining({
          responseTimeMs: expect.any(Number),
        })
      );
      const call = createStat.mock.calls[0][0];
      expect(call.responseTimeMs).toBeGreaterThanOrEqual(0);
    }
  );
});

// ─── withTracking ──────────────────────────────────────────────
describe('withTracking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return a function (HOF behavior)', () => {
    const controllerFn = jest.fn();
    const wrapped = withTracking(controllerFn);
    expect(typeof wrapped).toBe('function');
  });

  it('should call the original controller', async () => {
    const controllerFn = jest.fn().mockResolvedValue(undefined);
    const req = {
      originalUrl: '/api/users',
      method: 'POST',
      user: null,
    };
    const res = { statusCode: 201, json: jest.fn() };
    const next = jest.fn();
    createStat.mockResolvedValue({});

    const wrapped = withTracking(controllerFn);
    await wrapped(req, res, next);

    expect(controllerFn).toHaveBeenCalledWith(req, res, next);
  });

  it('should persist stat even if controller throws', async () => {
    const error = new Error('controller error');
    const controllerFn = jest.fn().mockRejectedValue(error);
    const req = {
      originalUrl: '/api/maps',
      method: 'GET',
      user: null,
    };
    const res = { statusCode: 500, json: jest.fn() };
    const next = jest.fn();
    createStat.mockResolvedValue({});

    const wrapped = withTracking(controllerFn);
    // Should not throw even when controller throws
    await wrapped(req, res, next).catch(() => {});

    expect(createStat).toHaveBeenCalled();
  });
});
