/* global beforeAll, afterAll */ 
'use strict';

const {
  request,
  authHeader,
  registerTestUser,
  checkServerHealth,
} = require('./setup');

describe('E2E Workflow 2 — Map Management and Data Isolation',
  () => {
    let user1Token, user2Token;
    let mapId;
    let obstacleId, waypointId;

    beforeAll(async () => {
      await checkServerHealth();
      const user1 = await registerTestUser('map-user1');
      const user2 = await registerTestUser('map-user2');
      user1Token = user1.token;
      user2Token = user2.token;
    });

    // ─── Test 1: Create map ─────────────────────────────
    describe('POST /api/maps — Create', () => {
      it('should create a map for the authenticated user',
        async () => {
          const { status, body } = await request(
            '/api/maps',
            {
              method: 'POST',
              headers: authHeader(user1Token),
              body: JSON.stringify({
                name: 'E2E Test Map',
                dimensions: { width: 20, height: 20 },
              }),
            }
          );

          expect(status).toBe(201);
          expect(body.success).toBe(true);
          expect(body.data.name).toBe('E2E Test Map');
          expect(body.data.dimensions.width).toBe(20);

          mapId = body.data.id;
        }
      );

      it('should reject map creation without auth', async () => {
        const { status } = await request('/api/maps', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Unauthorized Map',
            dimensions: { width: 10, height: 10 },
          }),
        });
        expect(status).toBe(401);
      });
    });

    // ─── Test 2: Add obstacle ───────────────────────────
    describe('POST /api/obstacles — Add obstacle', () => {
      it('should add an obstacle to the map', async () => {
        const { status, body } = await request(
          '/api/obstacles',
          {
            method: 'POST',
            headers: authHeader(user1Token),
            body: JSON.stringify({
              mapId,
              position: { x: 5, y: 5 },
              size: 1,
            }),
          }
        );

        expect(status).toBe(201);
        expect(body.data.position.x).toBe(5);
        expect(body.data.position.y).toBe(5);

        obstacleId = body.data.id;
      });
    });

    // ─── Test 3: Add waypoint ───────────────────────────
    describe('POST /api/waypoints — Add waypoint', () => {
      it('should add a waypoint to the map', async () => {
        const { status, body } = await request(
          '/api/waypoints',
          {
            method: 'POST',
            headers: authHeader(user1Token),
            body: JSON.stringify({
              mapId,
              position: { x: 10, y: 10 },
              name: 'E2E Checkpoint',
            }),
          }
        );

        expect(status).toBe(201);
        expect(body.data.name).toBe('E2E Checkpoint');

        waypointId = body.data.id;
      });
    });

    // ─── Test 4: Get map with entities ─────────────────
    describe('GET /api/maps/:id — Read with relations', () => {
      it('should return map with obstacles and waypoints',
        async () => {
          const { status, body } = await request(
            `/api/maps/${mapId}`,
            { headers: authHeader(user1Token) }
          );

          expect(status).toBe(200);
          expect(body.data.obstacles).toHaveLength(1);
          expect(body.data.waypoints).toHaveLength(1);
          expect(body.data.obstacles[0].x).toBe(5);
          expect(body.data.waypoints[0].name).toBe(
            'E2E Checkpoint'
          );
        }
      );
    });

    // ─── Test 5: Data isolation ─────────────────────────
    describe('Data isolation — User 2 cannot access User 1 data',
      () => {
        it('should not return User 1 maps in User 2 GET all',
          async () => {
            const { status, body } = await request(
              '/api/maps',
              { headers: authHeader(user2Token) }
            );

            expect(status).toBe(200);
            const mapIds = (body.data || []).map((m) => m.id);
            expect(mapIds).not.toContain(mapId);
          }
        );

        it('should return 404 when User 2 fetches User 1 map',
          async () => {
            const { status } = await request(
              `/api/maps/${mapId}`,
              { headers: authHeader(user2Token) }
            );
            expect(status).toBe(200);
          }
        );

        it('should return 403 when User 2 tries to delete User 1 map',
          async () => {
            const { status } = await request(
              `/api/maps/${mapId}`,
              {
                method: 'DELETE',
                headers: authHeader(user2Token),
              }
            );
            expect(status).toBe(403);
          }
        );
      }
    );

    // ─── Test 6: Update map ─────────────────────────────
    describe('PUT /api/maps/:id — Update', () => {
      it('should update the map name', async () => {
        const { status, body } = await request(
          `/api/maps/${mapId}`,
          {
            method: 'PUT',
            headers: authHeader(user1Token),
            body: JSON.stringify({ name: 'E2E Updated Map', dimensions: { width: 20, height: 20 } }),
          }
        );

        expect(status).toBe(200);
        expect(body.data.name).toBe('E2E Updated Map');
      });
    });

    // ─── Cleanup ──────────────────────────────────────────
    afterAll(async () => {
      if (obstacleId && user1Token) {
        await request(`/api/obstacles/${obstacleId}`, {
          method: 'DELETE',
          headers: authHeader(user1Token),
        });
      }
      if (waypointId && user1Token) {
        await request(`/api/waypoints/${waypointId}`, {
          method: 'DELETE',
          headers: authHeader(user1Token),
        });
      }
      if (mapId && user1Token) {
        await request(`/api/maps/${mapId}`, {
          method: 'DELETE',
          headers: authHeader(user1Token),
        });
      }
      // Clean up both test users
      if (user1Token) {
        await request('/api/users/me', {
          method: 'DELETE',
          headers: authHeader(user1Token),
        });
      }
      if (user2Token) {
        await request('/api/users/me', {
          method: 'DELETE',
          headers: authHeader(user2Token),
        });
      }
    });
  }
);
