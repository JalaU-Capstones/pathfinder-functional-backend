/* global beforeAll, afterAll */ 
'use strict';

const {
  request,
  authHeader,
  checkServerHealth,
} = require('./setup');

describe('E2E Workflow 1 — Authentication', () => {
  let token;
  
  let email;

  beforeAll(async () => {
    await checkServerHealth();
  });

  // ─── Test 1: User registration ─────────────────────────
  describe('POST /api/auth/signin — Register', () => {
    it('should create a new user and return a JWT', async () => {
      const suffix = Date.now();
      email = `auth-e2e-${suffix}@pathfinder-e2e.test`;

      const { status, body } = await request(
        '/api/auth/signin',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Auth E2E User',
            email,
            password: 'E2ETest1234!',
            age: 22,
          }),
        }
      );

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      
      email = body.data.user.email; // Capture from response
      expect(body.data.user.email).toBeDefined();
      
      expect(body.data.user).not.toHaveProperty('password');
      expect(body.data.expiresIn).toBe('7d');

      token = body.data.token;
    });

    it('should reject duplicate email with 409', async () => {
      const { status, body } = await request(
        '/api/auth/signin',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Duplicate',
            email, // same email as above
            password: 'E2ETest1234!',
            age: 22,
          }),
        }
      );

      expect(status).toBe(409);
      expect(body.success).toBe(false);
    });

    it('should reject short password with 400', async () => {
      const { status, body } = await request(
        '/api/auth/signin',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Short Pass',
            email: `short-${Date.now()}@e2e.test`,
            password: '123',
            age: 22,
          }),
        }
      );

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  // ─── Test 2: Login ────────────────────────────────────
  describe('POST /api/auth/login — Login', () => {
    it('should return a JWT for valid credentials', async () => {
      const { status, body } = await request(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password: 'E2ETest1234!',
          }),
        }
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      // Update token to the one from login
      token = body.data.token;
    });

    it('should return 401 for wrong password', async () => {
      const { status, body } = await request(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password: 'WrongPassword!',
          }),
        }
      );

      expect(status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('should return same error for wrong email vs wrong password',
      async () => {
        const { body: body1 } = await request(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'nobody@nowhere.test',
              password: 'E2ETest1234!',
            }),
          }
        );

        const { body: body2 } = await request(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email,
              password: 'WrongPassword!',
            }),
          }
        );

        // Enumeration prevention: same error message
        expect(body1.error?.message).toBe(
          body2.error?.message
        );
      }
    );
  });

  // ─── Test 3: Protected route access ──────────────────
  describe('GET /api/users/me — Profile access', () => {
    it('should return profile with valid token', async () => {
      const { status, body } = await request(
        '/api/users/me',
        { headers: authHeader(token) }
      );

      expect(status).toBe(200);
      expect(body.data.email).toBe(email);
      expect(body.data).not.toHaveProperty('password');
    });
  });

  // ─── Test 4: Profile update ───────────────────────────
  describe('PUT /api/users/me — Profile update', () => {
    it('should update the user name', async () => {
      const { status, body } = await request(
        '/api/users/me',
        {
          method: 'PUT',
          headers: authHeader(token),
          body: JSON.stringify({ name: 'Updated E2E Name' }),
        }
      );

      expect(status).toBe(200);
      expect(body.data.name).toBe('Updated E2E Name');
    });
  });

  // ─── Cleanup ──────────────────────────────────────────
  afterAll(async () => {
    if (token) {
      await request('/api/users/me', {
        method: 'DELETE',
        headers: authHeader(token),
      });
    }
  });
});
