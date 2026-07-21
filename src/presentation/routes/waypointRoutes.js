const express = require('express');
const waypointController = require('../controllers/waypointController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Waypoints
 *   description: Waypoint management
 */

/**
 * @swagger
 * /api/waypoints:
 *   post:
 *     summary: Create a new waypoint
 *     tags: [Waypoints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Waypoint'
 *     responses:
 *       201:
 *         description: The waypoint was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Waypoint'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.post('/', waypointController.createWaypoint);

/**
 * @swagger
 * /api/waypoints:
 *   get:
 *     summary: Retrieve a list of waypoints
 *     tags: [Waypoints]
 *     parameters:
 *       - in: query
 *         name: mapId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter waypoints by Map ID
 *     responses:
 *       200:
 *         description: A list of waypoints
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
 *                     $ref: '#/components/schemas/Waypoint'
 *       500:
 *         description: Internal server error
 */
router.get('/', waypointController.getAllWaypoints);

/**
 * @swagger
 * /api/waypoints/{id}:
 *   get:
 *     summary: Get a waypoint by ID
 *     tags: [Waypoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The waypoint ID
 *     responses:
 *       200:
 *         description: The waypoint description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Waypoint'
 *       404:
 *         description: Waypoint not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', waypointController.getWaypoint);

/**
 * @swagger
 * /api/waypoints/{id}:
 *   put:
 *     summary: Update a waypoint by ID
 *     tags: [Waypoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The waypoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Waypoint'
 *     responses:
 *       200:
 *         description: The waypoint was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Waypoint'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Waypoint or Map not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', waypointController.updateWaypoint);

/**
 * @swagger
 * /api/waypoints/{id}:
 *   delete:
 *     summary: Delete a waypoint by ID
 *     tags: [Waypoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The waypoint ID
 *     responses:
 *       204:
 *         description: The waypoint was deleted
 *       404:
 *         description: Waypoint not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', waypointController.deleteWaypoint);

module.exports = router;
