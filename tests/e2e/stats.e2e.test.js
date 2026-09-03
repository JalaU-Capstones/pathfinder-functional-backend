/* global beforeAll, afterAll */ 
'use strict';

const {
  request,
  authHeader,
  registerTestUser,
  checkServerHealth,
} = require('./setup');

describe('E2E Workflow 5 — API Tracking and Statistics',
  () => {
    let token;
    let mapId;

    beforeAll(async () => {
      await checkServerHealth();
      const user = await registerTestUser('stats');
      token = user.token;

      // Create a map to generate tracked requests
      const { body } = await request('/api/maps', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          name: 'Stats Test Map',
          dimensions: { width: 10, height: 10 },
        }),
      });
      mapId = body.data?.id;

      // Make several tracked requests to generate data
      await request('/api/maps', {
        headers: authHeader(token),
      });
      await request('/api/maps', {
        headers: authHeader(token),
      });
      await request('/api/obstacles', {
        headers: authHeader(token),
      });
    });

    // ─── Test 1: Request stats ──────────────────────────
    describe('GET /stats/requests', () => {
      it('should return total request count and breakdown',
        async () => {
          const { status, body } = await request(
            '/stats/requests',
            { headers: authHeader(token) }
          );

          expect(status).toBe(200);
          expect(body.success).toBe(true);
          expect(typeof body.data.total_requests).toBe('number');
          expect(body.data.total_requests).toBeGreaterThan(0);
          expect(body.data.breakdown).toBeDefined();
        }
      );

      it('should include /api/maps in the breakdown',
        async () => {
          const { body } = await request('/stats/requests', {
            headers: authHeader(token),
          });

          const endpoints = Object.keys(body.data.breakdown);
          expect(endpoints.some(
            (e) => e.includes('/api/maps'))
          ).toBe(true);
        }
      );
    });

    // ─── Test 2: Response times ─────────────────────────
    describe('GET /stats/response-times', () => {
      it('should return avg, min, max per endpoint',
        async () => {
          const { status, body } = await request(
            '/stats/response-times',
            { headers: authHeader(token) }
          );

          expect(status).toBe(200);
          expect(body.success).toBe(true);

          const endpoints = Object.values(body.data);
          if (endpoints.length > 0) {
            const first = endpoints[0];
            expect(typeof first.avg).toBe('number');
            expect(typeof first.min).toBe('number');
            expect(typeof first.max).toBe('number');
            expect(first.min).toBeLessThanOrEqual(first.avg);
            expect(first.avg).toBeLessThanOrEqual(first.max);
          }
        }
      );
    });

    // ─── Test 3: Status codes ───────────────────────────
    describe('GET /stats/status-codes', () => {
      it('should return status code counts', async () => {
        const { status, body } = await request(
          '/stats/status-codes',
          { headers: authHeader(token) }
        );

        expect(status).toBe(200);
        expect(body.success).toBe(true);

        const codes = Object.keys(body.data);
        expect(codes.length).toBeGreaterThan(0);

        // All values should be positive integers
        Object.values(body.data).forEach((count) => {
          expect(count).toBeGreaterThan(0);
          expect(Number.isInteger(count)).toBe(true);
        });
      });

      it('should include 200 status code from GET requests',
        async () => {
          const { body } = await request(
            '/stats/status-codes',
            { headers: authHeader(token) }
          );
          // We made multiple GET requests in beforeAll
          expect(body.data['200']).toBeGreaterThan(0);
        }
      );
    });

    // ─── Test 4: Popular endpoints ──────────────────────
    describe('GET /stats/popular-endpoints', () => {
      it('should return ranked endpoints by request count',
        async () => {
          const { status, body } = await request(
            '/stats/popular-endpoints',
            { headers: authHeader(token) }
          );

          expect(status).toBe(200);
          expect(body.success).toBe(true);
          expect(body.data.most_popular).toBeDefined();
          expect(body.data.request_count).toBeGreaterThan(0);
          expect(Array.isArray(body.data.ranked)).toBe(true);
        }
      );

      it('should rank endpoints in descending order',
        async () => {
          const { body } = await request(
            '/stats/popular-endpoints',
            { headers: authHeader(token) }
          );

          const ranked = body.data.ranked || [];
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].request_count).toBeGreaterThanOrEqual(
              ranked[i + 1].request_count
            );
          }
        }
      );

      it('should require auth for stats endpoints',
        async () => {
          const { status } = await request(
            '/stats/requests'
          );
          expect(status).toBe(401);
        }
      );
    });

    // ─── Cleanup ────────────────────────────────────────
    afterAll(async () => {
      if (mapId) {
        await request(`/api/maps/${mapId}`, {
          method: 'DELETE',
          headers: authHeader(token),
        });
      }
      await request('/api/users/me', {
        method: 'DELETE',
        headers: authHeader(token),
      });
    });
  }
);
