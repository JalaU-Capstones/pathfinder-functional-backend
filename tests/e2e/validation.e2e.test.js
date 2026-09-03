/* global beforeAll, afterAll */ 
'use strict';

const {
  request,
  authHeader,
  registerTestUser,
  checkServerHealth,
} = require('./setup');

describe('E2E Workflow 4 — Validation Endpoints', () => {
  let token;
  let mapId;

  beforeAll(async () => {
    await checkServerHealth();
    const user = await registerTestUser('validation');
    token = user.token;

    // Create a map for validation tests
    const { body } = await request('/api/maps', {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({
        name: 'Validation Test Map',
        dimensions: { width: 50, height: 50 },
      }),
    });
    mapId = body.data?.id;
  });

  // ─── UUID validation (recursive) ───────────────────────
  describe('GET /api/validation/map-id/:mapId', () => {
    it('should validate a correct UUID format', async () => {
      const { status, body } = await request(
        `/api/validation/map-id/${mapId}`
      );
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should reject an invalid UUID format', async () => {
      const { status } = await request(
        '/api/validation/map-id/not-a-valid-uuid'
      );
      expect(status).toBe(400);
    });
  });

  // ─── Map existence check ────────────────────────────────
  describe('GET /api/validation/map-exists/:mapId', () => {
    it('should confirm an existing map exists', async () => {
      const { status, body } = await request(
        `/api/validation/map-exists/${mapId}`
      );
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should return 404 for a non-existent map UUID',
      async () => {
        const fakeId =
          '00000000-0000-4000-a000-000000000000';
        const { status } = await request(
          `/api/validation/map-exists/${fakeId}`
        );
        expect(status).toBe(404);
      }
    );
  });

  // ─── Dimension validation ───────────────────────────────
  describe('POST /api/validation/dimensions', () => {
    it('should accept valid map dimensions', async () => {
      const { status } = await request(
        '/api/validation/dimensions',
        {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            width: 100, height: 100,
          }),
        }
      );
      expect(status).toBe(200);
    });

    it('should reject dimensions exceeding limits',
      async () => {
        const { status } = await request(
          '/api/validation/dimensions',
          {
            method: 'POST',
            headers: authHeader(token),
            body: JSON.stringify({
              width: 99999, height: 99999,
            }),
          }
        );
        expect(status).toBe(400);
      }
    );
  });

  // ─── Same point detection ───────────────────────────────
  describe('POST /api/validation/same-point', () => {
    it('should detect when start equals end', async () => {
      const { status, body } = await request(
        '/api/validation/same-point',
        {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            startPoint: { x: 5, y: 5 },
            endPoint: { x: 5, y: 5 },
          }),
        }
      );
      expect(status).toBe(200);
      expect(body.data.samePoint).toBe(true);
    });

    it('should confirm different start and end points',
      async () => {
        const { status, body } = await request(
          '/api/validation/same-point',
          {
            method: 'POST',
            headers: authHeader(token),
            body: JSON.stringify({
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 10, y: 10 },
            }),
          }
        );
        expect(status).toBe(200);
        expect(body.data.samePoint).toBe(false);
      }
    );
  });

  // ─── Cyclic dependency detection (DFS) ─────────────────
  describe('POST /api/validation/cyclic-dependencies', () => {
    it('should detect a cyclic dependency graph', async () => {
      const { status } = await request(
        '/api/validation/cyclic-dependencies',
        {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            mapConfig: {
              connections: [
                { source: 'A', target: 'B' },
                { source: 'B', target: 'C' },
                { source: 'C', target: 'A' }, // cycle
              ],
            },
          }),
        }
      );
      expect(status).toBe(400);
    });

    it('should accept a linear dependency graph', async () => {
      const { status } = await request(
        '/api/validation/cyclic-dependencies',
        {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            mapConfig: {
              connections: [
                { source: 'A', target: 'B' },
                { source: 'B', target: 'C' },
              ],
            },
          }),
        }
      );
      expect(status).toBe(200);
    });
  });

  // ─── Cleanup ──────────────────────────────────────────
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
});
