/* global jest, beforeEach */
'use strict';

jest.mock('../../src/data/models', () => ({
  ApiStat: {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn(),
  },
}));

const {
  createStat,
  getAllStats,
  getStatsByEndpoint,
  getStatCount,
  clearStats,
} = require('../../src/data/repositories/apiStatRepository');

const { ApiStat } = require('../../src/data/models');

describe('apiStatRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createStat', () => {
    it('should create a stat with all required fields', async () => {
      const payload = {
        endpointAccess: '/api/maps',
        requestMethod: 'GET',
        statusCode: 200,
        responseTimeMs: 45,
        userId: null,
      };
      const mockStat = { id: 'uuid-1', ...payload };
      ApiStat.create.mockResolvedValue(mockStat);

      const result = await createStat(payload);

      expect(ApiStat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          endpointAccess: '/api/maps',
          requestMethod: 'GET',
          statusCode: 200,
          responseTimeMs: 45,
          userId: null,
        })
      );
      expect(result).toEqual(mockStat);
    });

    it('should default userId to null when not provided',
      async () => {
        const payload = {
          endpointAccess: '/api/routes',
          requestMethod: 'POST',
          statusCode: 201,
          responseTimeMs: 120,
        };
        ApiStat.create.mockResolvedValue({ id: 'uuid-2',
          ...payload, userId: null });

        await createStat(payload);

        expect(ApiStat.create).toHaveBeenCalledWith(
          expect.objectContaining({ userId: null })
        );
      }
    );

    it('should propagate errors from Sequelize', async () => {
      ApiStat.create.mockRejectedValue(
        new Error('DB connection error')
      );
      await expect(
        createStat({
          endpointAccess: '/api/maps',
          requestMethod: 'GET',
          statusCode: 200,
          responseTimeMs: 10,
        })
      ).rejects.toThrow('DB connection error');
    });
  });

  describe('getAllStats', () => {
    it('should return all stats ordered by timestamp DESC',
      async () => {
        const mockStats = [
          { id: 'uuid-1', endpointAccess: '/api/maps' },
          { id: 'uuid-2', endpointAccess: '/api/users' },
        ];
        ApiStat.findAll.mockResolvedValue(mockStats);

        const result = await getAllStats();

        expect(ApiStat.findAll).toHaveBeenCalledWith({
          order: [['timestamp', 'DESC']],
        });
        expect(result).toEqual(mockStats);
      }
    );

    it('should return empty array when no stats exist',
      async () => {
        ApiStat.findAll.mockResolvedValue([]);
        const result = await getAllStats();
        expect(result).toEqual([]);
      }
    );
  });

  describe('getStatsByEndpoint', () => {
    it('should filter by endpointAccess', async () => {
      const mockStats = [
        {
          id: 'uuid-1',
          endpointAccess: '/api/maps',
          requestMethod: 'GET',
        },
      ];
      ApiStat.findAll.mockResolvedValue(mockStats);

      const result = await getStatsByEndpoint('/api/maps');

      expect(ApiStat.findAll).toHaveBeenCalledWith({
        where: { endpointAccess: '/api/maps' },
        order: [['timestamp', 'DESC']],
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when endpoint has no stats',
      async () => {
        ApiStat.findAll.mockResolvedValue([]);
        const result =
          await getStatsByEndpoint('/api/nonexistent');
        expect(result).toEqual([]);
      }
    );
  });

  describe('getStatCount', () => {
    it('should return total count of stat records',
      async () => {
        ApiStat.count.mockResolvedValue(42);
        const result = await getStatCount();
        expect(ApiStat.count).toHaveBeenCalled();
        expect(result).toBe(42);
      }
    );

    it('should return 0 when no records exist', async () => {
      ApiStat.count.mockResolvedValue(0);
      const result = await getStatCount();
      expect(result).toBe(0);
    });
  });

  describe('clearStats', () => {
    it('should destroy all records', async () => {
      ApiStat.destroy.mockResolvedValue(15);
      await clearStats();
      expect(ApiStat.destroy).toHaveBeenCalledWith({
        where: {},
        truncate: true,
      });
    });
  });
});
