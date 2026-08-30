'use strict';

/**
 * @fileoverview Auth controller.
 * Thin functions — parse request, call service, send
 * response. No business logic, no token generation.
 */

const authService = require('../../business/services/authService');
const { sendSuccess } = require('../../utils/httpResponse');

/**
 * signin — POST /api/auth/signin
 * Creates a new user account and returns a JWT.
 */
const signin = async (req, res, next) => {
  try {
    const { name, email, password, age } = req.body;
    const result = await authService.register({
      name, email, password, age,
    });
    return sendSuccess(res, result, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * login — POST /api/auth/login
 * Verifies credentials and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, result, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = { signin, login };
