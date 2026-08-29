/* global jest, beforeEach */
'use strict';

jest.mock(
  '../../src/data/repositories/apiStatRepository',
  () => ({ getAllStats: jest.fn() })
);

const {
  getRequestStats,
  getResponseTimeStats,
  getStatusCodeStats,
  getPopularEndpoints,
  groupBy,
  computeResponseTimeStats,
  countByMethod,
} = require('../../src/business/services/statsService');

const { getAllStats } =
  require('../../src/data/repositories/apiStatRepository');

// Helper to build mock stat records
const makeStat = (overrides = {}) => ({
  endpointAccess: '/api/maps',
  requestMethod: 'GET',
  statusCode: 200,
  responseTimeMs: 100,
  ...overrides,
});

// ─── Pure helpers (no mocks needed) ──────────────────────────
describe('groupBy', () => {
  it('should group records by the key function result', () => {
    const records = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ];
    const result = groupBy(records, (r) => r.type);
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
  });

  it('should return empty object for empty array', () => {
    expect(groupBy([], (r) => r.key)).toEqual({});
  });
});

describe('computeResponseTimeStats', () => {
  it('should compute correct avg, min and max', () => {
    const records = [
      makeStat({ responseTimeMs: 100 }),
      makeStat({ responseTimeMs: 200 }),
      makeStat({ responseTimeMs: 50 }),
    ];
    const result = computeResponseTimeStats(records);
    expect(result.avg).toBe(117);
    expect(result.min).toBe(50);
    expect(result.max).toBe(200);
  });

  it('should return zeros for empty array', () => {
    expect(computeResponseTimeStats([])).toEqual(
      { avg: 0, min: 0, max: 0 }
    );
  });

  it('should handle single record', () => {
    const result = computeResponseTimeStats(
      [makeStat({ responseTimeMs: 75 })]
    );
    expect(result).toEqual({ avg: 75, min: 75, max: 75 });
  });
});

describe('countByMethod', () => {
  it('should count occurrences of each HTTP method', () => {
    const records = [
      makeStat({ requestMethod: 'GET' }),
      makeStat({ requestMethod: 'GET' }),
      makeStat({ requestMethod: 'POST' }),
    ];
    const result = countByMethod(records);
    expect(result.GET).toBe(2);
    expect(result.POST).toBe(1);
  });

  it('should return empty object for empty array', () => {
    expect(countByMethod([])).toEqual({});
  });
});

// ─── Service functions (mock getAllStats) ─────────────────────
describe('getRequestStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return total_requests and breakdown', async () => {
    getAllStats.mockResolvedValue([
      makeStat({ endpointAccess: '/api/maps',
        requestMethod: 'GET' }),
      makeStat({ endpointAccess: '/api/maps',
        requestMethod: 'POST' }),
      makeStat({ endpointAccess: '/api/users',
        requestMethod: 'GET' }),
    ]);

    const result = await getRequestStats();

    expect(result.total_requests).toBe(3);
    expect(result.breakdown['/api/maps'].GET).toBe(1);
    expect(result.breakdown['/api/maps'].POST).toBe(1);
    expect(result.breakdown['/api/users'].GET).toBe(1);
  });

  it('should return zero total for empty stats', async () => {
    getAllStats.mockResolvedValue([]);
    const result = await getRequestStats();
    expect(result.total_requests).toBe(0);
    expect(result.breakdown).toEqual({});
  });
});

describe('getResponseTimeStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return avg min max per endpoint', async () => {
    getAllStats.mockResolvedValue([
      makeStat({ endpointAccess: '/api/maps',
        responseTimeMs: 100 }),
      makeStat({ endpointAccess: '/api/maps',
        responseTimeMs: 200 }),
      makeStat({ endpointAccess: '/api/users',
        responseTimeMs: 50 }),
    ]);

    const result = await getResponseTimeStats();

    expect(result['/api/maps'].avg).toBe(150);
    expect(result['/api/maps'].min).toBe(100);
    expect(result['/api/maps'].max).toBe(200);
    expect(result['/api/users'].avg).toBe(50);
  });

  it('should return empty object for no stats', async () => {
    getAllStats.mockResolvedValue([]);
    const result = await getResponseTimeStats();
    expect(result).toEqual({});
  });
});

describe('getStatusCodeStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should count each status code', async () => {
    getAllStats.mockResolvedValue([
      makeStat({ statusCode: 200 }),
      makeStat({ statusCode: 200 }),
      makeStat({ statusCode: 404 }),
      makeStat({ statusCode: 201 }),
    ]);

    const result = await getStatusCodeStats();

    expect(result[200]).toBe(2);
    expect(result[404]).toBe(1);
    expect(result[201]).toBe(1);
  });

  it('should return empty object for no stats', async () => {
    getAllStats.mockResolvedValue([]);
    const result = await getStatusCodeStats();
    expect(result).toEqual({});
  });
});

describe('getPopularEndpoints', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return most popular endpoint and ranked list',
    async () => {
      getAllStats.mockResolvedValue([
        makeStat({ endpointAccess: '/api/maps' }),
        makeStat({ endpointAccess: '/api/maps' }),
        makeStat({ endpointAccess: '/api/maps' }),
        makeStat({ endpointAccess: '/api/users' }),
        makeStat({ endpointAccess: '/api/users' }),
      ]);

      const result = await getPopularEndpoints();

      expect(result.most_popular).toBe('/api/maps');
      expect(result.request_count).toBe(3);
      expect(result.ranked[0].endpoint).toBe('/api/maps');
      expect(result.ranked[1].endpoint).toBe('/api/users');
    }
  );

  it('should handle no stats gracefully', async () => {
    getAllStats.mockResolvedValue([]);
    const result = await getPopularEndpoints();
    expect(result.most_popular).toBeNull();
    expect(result.ranked).toEqual([]);
  });

  it('should rank endpoints in descending order', async () => {
    getAllStats.mockResolvedValue([
      makeStat({ endpointAccess: '/api/routes' }),
      makeStat({ endpointAccess: '/api/maps' }),
      makeStat({ endpointAccess: '/api/maps' }),
      makeStat({ endpointAccess: '/api/maps' }),
    ]);

    const result = await getPopularEndpoints();

    expect(result.ranked[0].request_count).toBeGreaterThan(
      result.ranked[1].request_count
    );
  });
});
