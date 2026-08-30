'use strict';

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: "Public authentication endpoints.
 *       No Authorization header required.
 *       All other /api/* endpoints require
 *       Authorization: Bearer <token>."
 */

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: "Register a new user account"
 *     description: "Creates a new user and immediately
 *       returns a JWT. The token expires in 7 days.
 *       Email must be unique. Password minimum 8 chars.
 *       This endpoint is PUBLIC - no token required."
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, age]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Diego Botina"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "diego@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass1!"
 *               age:
 *                 type: integer
 *                 example: 22
 *     responses:
 *       201:
 *         description: "Account created and JWT issued"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                       example: "7d"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         age:
 *                           type: integer
 *       400:
 *         description: "Validation error"
 *       409:
 *         description: "Email already registered"
 */
router.post('/signin', authController.signin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Login with existing account"
 *     description: "Verifies credentials and returns a JWT.
 *       The token expires in 7 days. Use the returned token
 *       in the Authorization header for all other requests:
 *       Authorization: Bearer <token>.
 *       This endpoint is PUBLIC - no token required."
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "diego@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass1!"
 *     responses:
 *       200:
 *         description: "Login successful, JWT issued"
 *       400:
 *         description: "Missing or invalid fields"
 *       401:
 *         description: "Invalid email or password"
 */
router.post('/login', authController.login);

module.exports = router;
