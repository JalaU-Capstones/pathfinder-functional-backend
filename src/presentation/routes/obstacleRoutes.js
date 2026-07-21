const express = require('express');
const obstacleController = require('../controllers/obstacleController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Obstacles
 *   description: Obstacle management
 */

/**
 * @swagger
 * /api/obstacles:
 *   post:
 *     summary: Create a new obstacle
 *     tags: [Obstacles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Obstacle'
 *     responses:
 *       201:
 *         description: The obstacle was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Obstacle'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.post('/', obstacleController.createObstacle);

/**
 * @swagger
 * /api/obstacles:
 *   get:
 *     summary: Retrieve a list of obstacles
 *     tags: [Obstacles]
 *     parameters:
 *       - in: query
 *         name: mapId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter obstacles by Map ID
 *     responses:
 *       200:
 *         description: A list of obstacles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Obstacle'
 *       500:
 *         description: Internal server error
 */
router.get('/', obstacleController.getAllObstacles);

/**
 * @swagger
 * /api/obstacles/{id}:
 *   get:
 *     summary: Get an obstacle by ID
 *     tags: [Obstacles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The obstacle ID
 *     responses:
 *       200:
 *         description: The obstacle description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Obstacle'
 *       404:
 *         description: Obstacle not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', obstacleController.getObstacle);

/**
 * @swagger
 * /api/obstacles/{id}:
 *   put:
 *     summary: Update an obstacle by ID
 *     tags: [Obstacles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The obstacle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Obstacle'
 *     responses:
 *       200:
 *         description: The obstacle was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Obstacle'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Obstacle or Map not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', obstacleController.updateObstacle);

/**
 * @swagger
 * /api/obstacles/{id}:
 *   delete:
 *     summary: Delete an obstacle by ID
 *     tags: [Obstacles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The obstacle ID
 *     responses:
 *       204:
 *         description: The obstacle was deleted
 *       404:
 *         description: Obstacle not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', obstacleController.deleteObstacle);

module.exports = router;
