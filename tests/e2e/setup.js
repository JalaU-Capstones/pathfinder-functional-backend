/* global fetch */ 
'use strict';

const BASE_URL =
  process.env.E2E_BASE_URL || 'http://localhost:3000';

/**
 * request — thin fetch wrapper for E2E tests.
 * Handles JSON serialization and response parsing.
 * Returns the full response object so tests can
 * assert on both status and body.
 *
 * @param {string} path - API path, e.g. '/api/maps'
 * @param {Object} [options] - fetch options
 * @returns {Promise<{ status, body }>}
 */
const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body };
};

/**
 * authHeader — returns the Authorization header object
 * for an authenticated request.
 *
 * @param {string} token - JWT token
 * @returns {Object}
 */
const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

/**
 * registerTestUser — creates a unique test user and
 * returns their token and userId.
 * Uses a timestamp + random suffix to guarantee uniqueness
 * across test runs without conflicting with other suites.
 *
 * @param {string} [prefix='e2e'] - Email prefix
 * @returns {Promise<{ token, userId, email }>}
 */
const registerTestUser = async (prefix = 'e2e') => {
  const suffix =
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const email = `${prefix}-${suffix}@pathfinder-e2e.test`;

  const { status, body } = await request(
    '/api/auth/signin',
    {
      method: 'POST',
      body: JSON.stringify({
        name: `E2E Test User ${prefix}`,
        email,
        password: 'E2ETest1234!',
        age: 22,
      }),
    }
  );

  if (status !== 201) {
    throw new Error(
      `registerTestUser failed: ${status} ` +
      JSON.stringify(body)
    );
  }

  return {
    token: body.data.token,
    userId: body.data.user.id,
    email,
  };
};

/**
 * checkServerHealth — verifies the server is reachable.
 * Called in beforeAll of each test suite.
 * Fails with a descriptive error if the server is down.
 *
 * @returns {Promise<void>}
 */
const checkServerHealth = async () => {
  try {
    const { status } = await request('/api/health');
    if (status !== 200) {
      throw new Error(`Health check returned ${status}`);
    }
  } catch (error) {
    throw new Error(
      'E2E server is not reachable at ' +
      `${BASE_URL}. ` +
      'Start the server with "npm run dev" before ' +
      'running E2E tests.\n' +
      `Original error: ${error.message}`, { cause: error }
    );
  }
};

module.exports = {
  BASE_URL,
  request,
  authHeader,
  registerTestUser,
  checkServerHealth,
};
