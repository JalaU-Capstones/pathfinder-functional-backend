/* global jest, beforeEach */
'use strict';

const { createCacheMiddleware } = require(
  '../../../../src/presentation/middlewares/cacheMiddleware'
);

jest.mock('../../../../src/utils/logger', () => ({
  debug: jest.fn(),
}));

describe('createCacheMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------- factory validation ---------------

  describe('factory validation', () => {
    it('should throw if max is invalid', () => {
      expect(() => createCacheMiddleware({ max: 0, maxAge: 1000 }))
        .toThrow('createLRUCache: max must be a positive integer.');
    });

    it('should throw if maxAge is invalid', () => {
      expect(() => createCacheMiddleware({ max: 10, maxAge: -1 }))
        .toThrow('createLRUCache: maxAge must be a positive integer.');
    });

    it('should return a function for valid options', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      expect(typeof middleware).toBe('function');
    });
  });

  // --------------- non-GET requests ---------------

  describe('non-GET requests', () => {
    const buildReq = (method) => ({
      method,
      originalUrl: '/api/maps',
    });

    it('should call next() without caching for POST', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = buildReq('POST');
      const res = { setHeader: jest.fn(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('should call next() without caching for PUT', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = buildReq('PUT');
      const res = { setHeader: jest.fn(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('should call next() without caching for DELETE', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = buildReq('DELETE');
      const res = { setHeader: jest.fn(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('should not set X-Cache header for non-GET', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = buildReq('POST');
      const res = { setHeader: jest.fn(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        'X-Cache', expect.any(String)
      );
    });
  });

  // --------------- cache miss (first GET) ---------------

  describe('cache miss (first GET request)', () => {
    it('should set X-Cache: MISS header', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = { method: 'GET', originalUrl: '/api/maps' };
      const res = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    });

    it('should call next()', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = { method: 'GET', originalUrl: '/api/maps' };
      const res = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should intercept res.json and cache the response', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = { method: 'GET', originalUrl: '/api/maps' };
      const res = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Simulate the route handler calling res.json
      res.json({ success: true, data: [] });

      // Second request should be a hit
      const req2 = { method: 'GET', originalUrl: '/api/maps' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(next2).not.toHaveBeenCalled();
    });
  });

  // --------------- cache hit (subsequent GET) ---------------

  describe('cache hit (subsequent GET request)', () => {
    const seedCache = (middleware, url, body) => {
      const req = { method: 'GET', originalUrl: url };
      const res = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();
      middleware(req, res, next);
      // Trigger the json interception to populate cache
      res.json(body);
    };

    it('should set X-Cache: HIT header', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [] });

      const req2 = { method: 'GET', originalUrl: '/api/maps' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      middleware(req2, res2, jest.fn());

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });

    it('should NOT call next()', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [] });

      const req2 = { method: 'GET', originalUrl: '/api/maps' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(next2).not.toHaveBeenCalled();
    });

    it('should respond with cached status and body', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const body = { success: true, data: [{ id: '1' }] };
      seedCache(middleware, '/api/maps', body);

      const req2 = { method: 'GET', originalUrl: '/api/maps' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      middleware(req2, res2, jest.fn());

      expect(res2.status).toHaveBeenCalledWith(200);
      expect(res2.json).toHaveBeenCalledWith(body);
    });

    it('should respond immediately without reaching route handler', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [] });

      const req2 = { method: 'GET', originalUrl: '/api/maps' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      // next() must not be called -- response served from cache
      expect(next2).not.toHaveBeenCalled();
      expect(res2.json).toHaveBeenCalled();
    });
  });

  // --------------- error responses not cached ---------------

  describe('error responses not cached', () => {
    it('should not cache 4xx responses', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = {
        method: 'GET',
        originalUrl: '/api/maps/nonexistent',
      };
      const res = {
        statusCode: 404,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);
      res.json({ success: false, error: 'Not found' });

      // Second identical request should still be a MISS
      const req2 = {
        method: 'GET',
        originalUrl: '/api/maps/nonexistent',
      };
      const res2 = {
        statusCode: 404,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next2).toHaveBeenCalled();
    });

    it('should not cache 5xx responses', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const req = {
        method: 'GET',
        originalUrl: '/api/maps',
      };
      const res = {
        statusCode: 500,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);
      res.json({ success: false, error: 'Internal server error' });

      // Second identical request should still be a MISS
      const req2 = {
        method: 'GET',
        originalUrl: '/api/maps',
      };
      const res2 = {
        statusCode: 500,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next2).toHaveBeenCalled();
    });
  });

  // --------------- cache key generation ---------------

  describe('cache key generation', () => {
    it('should treat same URL with different query params as different keys', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });

      // Seed /api/maps?page=1
      const req1 = { method: 'GET', originalUrl: '/api/maps?page=1' };
      const res1 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next1 = jest.fn();
      middleware(req1, res1, next1);
      res1.json({ success: true, data: [{ id: 'a' }] });

      // Request /api/maps?page=2 -- should be a miss
      const req2 = { method: 'GET', originalUrl: '/api/maps?page=2' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next2).toHaveBeenCalled();
    });

    it('should treat same path with same query params as same key', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      const body = { success: true, data: [] };

      // Seed /api/maps?page=1
      const req1 = { method: 'GET', originalUrl: '/api/maps?page=1' };
      const res1 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      middleware(req1, res1, jest.fn());
      res1.json(body);

      // Same URL again -- should be a hit
      const req2 = { method: 'GET', originalUrl: '/api/maps?page=1' };
      const res2 = {
        statusCode: 200,
        setHeader: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next2 = jest.fn();
      middleware(req2, res2, next2);

      expect(res2.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(next2).not.toHaveBeenCalled();
    });
  });

  // --------------- cache invalidation after mutations ---------------

  describe('cache invalidation after successful mutations', () => {
    /**
     * Helper: seeds a GET cache entry for the given URL.
     */
    const seedCache = (middleware, url, body) => {
      const req = { method: 'GET', originalUrl: url };
      const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn() };
      middleware(req, res, jest.fn());
      res.json(body);
    };

    /**
     * Helper: simulate a mutating request completing successfully.
     */
    const simulateMutation = (middleware, method, url, statusCode = 201) => {
      const req = { method, originalUrl: url };
      const res = {
        statusCode,
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      const next = jest.fn();
      middleware(req, res, next);
      // Simulate route handler calling res.json after next()
      res.json({ success: true });
    };

    it('POST /api/maps (201) → GET /api/maps becomes a MISS', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [] });

      // Confirm it's a HIT before the mutation
      const preReq = { method: 'GET', originalUrl: '/api/maps' };
      const preRes = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      middleware(preReq, preRes, jest.fn());
      expect(preRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');

      // Perform successful POST
      simulateMutation(middleware, 'POST', '/api/maps', 201);

      // GET should now be a MISS
      const postReq = { method: 'GET', originalUrl: '/api/maps' };
      const postRes = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();
      middleware(postReq, postRes, next);

      expect(postRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next).toHaveBeenCalled();
    });

    it('PUT /api/maps/:id (200) → GET /api/maps becomes a MISS', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [{ id: '1' }] });

      simulateMutation(middleware, 'PUT', '/api/maps/uuid-123', 200);

      const req = { method: 'GET', originalUrl: '/api/maps' };
      const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();
      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next).toHaveBeenCalled();
    });

    it('DELETE /api/maps/:id (200) → GET /api/maps becomes a MISS', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [{ id: '1' }] });

      simulateMutation(middleware, 'DELETE', '/api/maps/uuid-123', 200);

      const req = { method: 'GET', originalUrl: '/api/maps' };
      const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();
      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(next).toHaveBeenCalled();
    });

    it('POST /api/maps also clears /api/maps?page=1 (query-string variant)', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps?page=1', { success: true, data: [] });
      seedCache(middleware, '/api/maps?page=2', { success: true, data: [] });

      simulateMutation(middleware, 'POST', '/api/maps', 201);

      // Both query-string variants should be MISSes
      ['page=1', 'page=2'].forEach((qs) => {
        const req = { method: 'GET', originalUrl: `/api/maps?${qs}` };
        const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
        const next = jest.fn();
        middleware(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
        expect(next).toHaveBeenCalled();
      });
    });

    it('POST /api/maps does NOT clear /api/obstacles cache (granular)', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/obstacles', { success: true, data: [] });

      simulateMutation(middleware, 'POST', '/api/maps', 201);

      // /api/obstacles cache must remain a HIT
      const req = { method: 'GET', originalUrl: '/api/obstacles' };
      const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      middleware(req, res, jest.fn());

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });

    it('failed POST (400) → cache NOT cleared', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [{ id: '1' }] });

      // Simulate failed POST (400)
      const req = { method: 'POST', originalUrl: '/api/maps' };
      const res = { statusCode: 400, setHeader: jest.fn(), json: jest.fn() };
      middleware(req, res, jest.fn());
      res.json({ success: false, error: 'Bad request' });

      // Cache should still be a HIT
      const getReq = { method: 'GET', originalUrl: '/api/maps' };
      const getRes = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      middleware(getReq, getRes, jest.fn());

      expect(getRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });

    it('failed POST (401) → cache NOT cleared', () => {
      const middleware = createCacheMiddleware({ max: 10, maxAge: 60000 });
      seedCache(middleware, '/api/maps', { success: true, data: [] });

      const req = { method: 'POST', originalUrl: '/api/maps' };
      const res = { statusCode: 401, setHeader: jest.fn(), json: jest.fn() };
      middleware(req, res, jest.fn());
      res.json({ success: false, error: 'Unauthorized' });

      const getReq = { method: 'GET', originalUrl: '/api/maps' };
      const getRes = { statusCode: 200, setHeader: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
      middleware(getReq, getRes, jest.fn());

      expect(getRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });
  });
});
