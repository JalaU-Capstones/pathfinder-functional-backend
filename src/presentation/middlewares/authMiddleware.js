'use strict';

/**
 * @fileoverview JWT authentication middleware.
 *
 * Validates the Authorization: Bearer <token> header
 * on every protected request. On success, attaches the
 * decoded token payload to req.user so downstream
 * handlers can access req.user.userId and req.user.email
 * without re-reading the database.
 *
 * On failure: throws 401 UNAUTHORIZED. The global error
 * handler converts this to the standard error response.
 *
 * This middleware does NOT check ownership of specific
 * records — that is the responsibility of each service
 * function (SRP: one middleware, one job).
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const { createAppError } = require('../../utils/errors');

/**
 * extractToken — pure function.
 * Parses the Authorization header and extracts the token.
 * Returns null if the header is missing or malformed.
 *
 * @param {Object} req - Express request object.
 * @returns {string|null} JWT string or null.
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

/**
 * verifyToken — pure function.
 * Verifies and decodes a JWT string.
 * Returns the decoded payload or throws a typed error.
 *
 * @param {string} token - JWT string to verify.
 * @returns {{ userId: string, email: string, iat, exp }}
 * @throws AppError 401 on invalid or expired token.
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!decoded.exp) {
      throw createAppError(
        'UNAUTHORIZED',
        'Invalid authentication token.'
      );
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createAppError(
        'UNAUTHORIZED',
        'Session expired. Please sign in again.'
      );
    }
    throw createAppError(
      'UNAUTHORIZED',
      'Invalid authentication token.'
    );
  }
};

/**
 * authMiddleware — Express middleware.
 * Validates Bearer token and attaches decoded payload
 * to req.user. Calls next(error) on any failure.
 *
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Next middleware.
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(createAppError(
        'UNAUTHORIZED',
        'Authentication required. Provide Authorization: Bearer <token> header.'
      ));
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  authMiddleware,
  extractToken,
  verifyToken,
};
