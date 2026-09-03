/* global beforeAll, afterAll */ 
'use strict';

const {
  request,
  authHeader,
  registerTestUser,
  checkServerHealth,
} = require('./setup');

describe('E2E Workflow 3 — A* Pathfinding Pipeline', () => {
  let token;
  let mapId;
  let routeId;
  const obstacleIds = [];
  const waypointIds = [];

  beforeAll(async () => {
    await checkServerHealth();
    const user = await registerTestUser('pathfinding');
    token = user.token;
  });

  // ─── Setup: Create map with terrain ────────────────────
  describe('Setup — Create map with obstacles and waypoints',
    () => {
      it('should create a 15x15 test map', async () => {
        const { status, body } = await request('/api/maps', {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            name: 'E2E Pathfinding Map',
            dimensions: { width: 15, height: 15 },
          }),
        });

        expect(status).toBe(201);
        mapId = body.data.id;
      });

      it('should add obstacles to create a maze-like terrain',
        async () => {
          // Add a wall of obstacles forcing the path around
          const obstacles = [
            { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
            { x: 3, y: 3 }, { x: 3, y: 4 },
          ];

          for (const pos of obstacles) {
            const { status, body } = await request(
              '/api/obstacles',
              {
                method: 'POST',
                headers: authHeader(token),
                body: JSON.stringify({
                  mapId,
                  position: pos,
                  size: 1,
                }),
              }
            );
            expect(status).toBe(201);
            obstacleIds.push(body.data.id);
          }

          expect(obstacleIds).toHaveLength(5);
        }
      );

      it('should add a waypoint as a stopping point',
        async () => {
          const { status, body } = await request(
            '/api/waypoints',
            {
              method: 'POST',
              headers: authHeader(token),
              body: JSON.stringify({
                mapId,
                position: { x: 7, y: 7 },
                name: 'Mid Checkpoint',
              }),
            }
          );

          expect(status).toBe(201);
          waypointIds.push(body.data.id);
        }
      );
    }
  );

  // ─── Core: Route calculation ────────────────────────────
  describe('POST /api/routes — Calculate optimal route', () => {
    it('should calculate a valid A* path from start to end',
      async () => {
        const { status, body } = await request('/api/routes', {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            mapId,
            start: { x: 0, y: 0 },
            end: { x: 14, y: 14 },
          }),
        });

        expect(status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.data.distance).toBeGreaterThan(0);
        expect(body.data.optimal_path).toBeDefined();
        expect(Array.isArray(body.data.optimal_path)).toBe(true);
        expect(body.data.optimal_path.length).toBeGreaterThan(0);

        routeId = body.data.id;
      }
    );

    it('should return a path that avoids all obstacles',
      async () => {
        // Fetch the route to get the full path
        const { body: routeBody } = await request(
          `/api/routes/${routeId}`,
          { headers: authHeader(token) }
        );

        const path = routeBody.data.optimal_path || [];
        const obstaclePositions = [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 },
        ];

        // Verify no path cell coincides with an obstacle
        path.forEach((cell) => {
          const isOnObstacle = obstaclePositions.some(
            (obs) => obs.x === cell.x && obs.y === cell.y
          );
          expect(isOnObstacle).toBe(false);
        });
      }
    );

    it('should return optimal_path starting near start point',
      async () => {
        const { body } = await request(
          `/api/routes/${routeId}`,
          { headers: authHeader(token) }
        );

        const path = body.data.optimal_path || [];
        expect(path.length).toBeGreaterThan(0);

        // Path should start near (0,0)
        const firstCell = path[0];
        const distFromStart = Math.abs(firstCell.x) +
          Math.abs(firstCell.y);
        expect(distFromStart).toBeLessThanOrEqual(2);
      }
    );

    it('should reject route on blocked start point', async () => {
      // Try to route from an obstacle position
      const { status } = await request('/api/routes', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          mapId,
          start: { x: 3, y: 0 }, // this is an obstacle
          end: { x: 10, y: 10 },
        }),
      });

      // Backend should return 422 or 400 for invalid path
      expect([400, 422, 404]).toContain(status);
    });
  });

  // ─── GET routes list ────────────────────────────────────
  describe('GET /api/routes — List user routes', () => {
    it('should return the calculated route in the list',
      async () => {
        const { status, body } = await request('/api/routes', {
          headers: authHeader(token),
        });

        expect(status).toBe(200);
        const ids = (body.data || []).map((r) => r.id);
        expect(ids).toContain(routeId);
      }
    );
  });

  // ─── Cleanup ──────────────────────────────────────────
  afterAll(async () => {
    if (routeId) {
      await request(`/api/routes/${routeId}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
    }
    for (const id of waypointIds) {
      await request(`/api/waypoints/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
    }
    for (const id of obstacleIds) {
      await request(`/api/obstacles/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
    }
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
});
