'use strict';

/**
 * @fileoverview Authentication service.
 *
 * Handles user registration and login. Depends directly
 * on userRepository (not userService) to avoid cross-service
 * coupling. Each service has one reason to change:
 * - authService changes when auth logic changes
 * - userService changes when user profile logic changes
 *
 * Password security:
 * - Passwords are NEVER stored in plain text
 * - bcrypt with cost factor 12 is used for hashing
 * - Timing-safe comparison via bcrypt.compare prevents
 *   timing attacks
 *
 * Token security:
 * - JWT signed with HS256 and a strong secret
 * - Expiration: 7 days (configurable via JWT_EXPIRES_IN)
 * - Payload contains only userId and email (minimal claims)
 * - Password hash is NEVER included in the token payload
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const userRepository = require('../../data/repositories/userRepository');
const { createAppError } = require('../../utils/errors');
const { isValidEmail } = require('../../utils/validation');

// ─── Constants ────────────────────────────────────────────────

/**
 * BCRYPT_ROUNDS — cost factor for bcrypt hashing.
 * 12 rounds is the current industry recommendation:
 * strong enough to resist brute force, fast enough
 * for a normal login flow (~300ms on modern hardware).
 * Do not use fewer than 10 in production.
 */
const BCRYPT_ROUNDS = 12;

// ─── Pure helpers ─────────────────────────────────────────────

/**
 * buildTokenPayload — pure function.
 * Constructs the JWT claims object. Minimal payload:
 * only userId and email. Never include password, role,
 * or sensitive data in the token.
 *
 * @param {Object} user - User record from DB.
 * @returns {{ userId: string, email: string }}
 */
const buildTokenPayload = (user) => ({
  userId: user.id,
  email: user.email,
});

/**
 * signToken — generates a signed JWT for a user.
 * Pure in intent: given the same user and secret,
 * produces a deterministic token structure (though the
 * iat claim makes each token unique).
 *
 * @param {Object} user - User record.
 * @returns {string} Signed JWT string.
 */
const signToken = (user) =>
  jwt.sign(
    buildTokenPayload(user),
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
  );

/**
 * toAuthResponse — pure function.
 * Shapes the successful auth response. The password hash
 * is explicitly excluded — it must NEVER appear in any
 * API response.
 *
 * @param {Object} user - User record from DB.
 * @param {string} token - Signed JWT.
 * @returns {Object} Safe auth response shape.
 */
const toAuthResponse = (user, token) => ({
  token,
  expiresIn: JWT_EXPIRES_IN,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    createdAt: user.createdAt,
    // password: NEVER included
  },
});

// ─── Validation ───────────────────────────────────────────────

/**
 * validateRegistrationInput — validates all fields
 * required for user registration.
 * Throws 400 on the first validation failure.
 *
 * @param {Object} input
 * @param {string} input.name
 * @param {string} input.email
 * @param {string} input.password
 * @param {number} input.age
 */
const validateRegistrationInput = ({ name, email, password, age }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createAppError(
      'VALIDATION_ERROR', 'Name is required and must be a non-empty string.'
    );
  }
  if (!email || !isValidEmail(email)) {
    throw createAppError(
      'VALIDATION_ERROR', 'A valid email address is required.'
    );
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw createAppError(
      'VALIDATION_ERROR', 'Password must be at least 8 characters.'
    );
  }
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 90) {
    throw createAppError(
      'VALIDATION_ERROR', 'Age must be a number between 0 and 90.'
    );
  }
};

// ─── Service functions ────────────────────────────────────────

/**
 * register — creates a new user account and returns a
 * JWT so the user is immediately signed in.
 *
 * Steps:
 * 1. Validate input (name, email, password, age).
 * 2. Check email uniqueness — throw 409 if taken.
 * 3. Hash the password with bcrypt (12 rounds).
 * 4. Create the user record in the DB.
 * 5. Sign and return a JWT.
 *
 * @param {Object} input - { name, email, password, age }
 * @returns {Promise<{ token, expiresIn, user }>}
 */
const register = async ({ name, email, password, age }) => {
  validateRegistrationInput({ name, email, password, age });

  const existing = await userRepository.getUserByEmail(email);
  if (existing) {
    throw createAppError(
      'CONFLICT', `An account with email "${email}" already exists.`
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await userRepository.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age: Number(age),
    password: passwordHash,
  });

  const token = signToken(user);
  return toAuthResponse(user, token);
};

/**
 * login — verifies credentials and returns a JWT.
 *
 * Steps:
 * 1. Validate email format.
 * 2. Find user by email using the unscoped query
 *    (must include password hash for comparison).
 * 3. If not found: throw 401 with a generic message
 *    (do not reveal whether email or password is wrong —
 *    this prevents user enumeration attacks).
 * 4. Compare provided password against stored hash.
 * 5. If mismatch: throw 401 with the same generic message.
 * 6. Sign and return a JWT.
 *
 * @param {Object} input - { email, password }
 * @returns {Promise<{ token, expiresIn, user }>}
 */
const login = async ({ email, password }) => {
  if (!email || !isValidEmail(email)) {
    throw createAppError(
      'VALIDATION_ERROR', 'A valid email address is required.'
    );
  }
  if (!password) {
    throw createAppError(
      'VALIDATION_ERROR', 'Password is required.'
    );
  }

  // Fetch user WITH password hash (bypass defaultScope)
  const user = await userRepository.getUserByEmail(
    email,
    { includePassword: true }
  );

  // Generic error message — do not reveal which field
  // is wrong. This prevents user enumeration attacks.
  const INVALID_CREDENTIALS_MSG = 'Invalid email or password.';

  if (!user || !user.password) {
    throw createAppError(
      'UNAUTHORIZED', INVALID_CREDENTIALS_MSG
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw createAppError(
      'UNAUTHORIZED', INVALID_CREDENTIALS_MSG
    );
  }

  const token = signToken(user);
  return toAuthResponse(user, token);
};

module.exports = { register, login };
