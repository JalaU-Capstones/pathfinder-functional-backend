const { Router } = require('express');
const { getHealth } = require('../controllers/health.controller');

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Pathfinder Backend API is running
 */
router.get('/health', getHealth);

module.exports = router;
