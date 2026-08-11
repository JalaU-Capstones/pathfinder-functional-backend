const express = require('express');
const routeController = require('../controllers/routeController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Route management
 */

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create a new route
 *     description: Creates a new route between a start and end point on a specific map. The distance is currently computed via a placeholder (Manhattan approximation) pending Phase 5B.
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mapId:
 *                 type: integer
 *                 example: 1
 *               start:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                   y:
 *                     type: integer
 *                 example: { x: 2, y: 2 }
 *               end:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                   y:
 *                     type: integer
 *                 example: { x: 8, y: 8 }
 *     responses:
 *       201:
 *         description: The route was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.post('/', routeController.createRoute);

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Retrieve a list of routes
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: mapId
 *         required: false
 *         description: "Filter by Map UUID"
 *         schema:
 *           type: string
 *           format: uuid
 *           example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799'
 *     responses:
 *       200:
 *         description: A list of routes
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
 *                     $ref: '#/components/schemas/Route'
 *       500:
 *         description: Internal server error
 */
router.get('/', routeController.getAllRoutes);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get a route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "UUID of the resource"
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 'f6a7b8c9-d0e1-2345-fabc-456789012345'
 *     responses:
 *       200:
 *         description: The route description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', routeController.getRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: Delete a route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "UUID of the resource"
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 'f6a7b8c9-d0e1-2345-fabc-456789012345'
 *     responses:
 *       204:
 *         description: The route was deleted
 *       404:
 *         description: Route not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
