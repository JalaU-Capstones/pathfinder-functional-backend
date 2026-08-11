const express = require('express');
const mapController = require('../controllers/mapController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Maps
 *   description: Map management
 */

/**
 * @swagger
 * /api/maps:
 *   post:
 *     summary: Create a new map
 *     tags: [Maps]
 *     requestBody:
 *       description: The map data. `obstacles` and `waypoints` are optional. If omitted or empty, the map is created with no associated records. Unknown fields within each item (e.g. `type`, `description`) are ignored.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Map'
 *           example:
 *             name: "Open World Map"
 *             dimensions:
 *               width: 500
 *               height: 500
 *             obstacles:
 *               - position:
 *                   x: 100
 *                   y: 150
 *                 size: 10
 *             waypoints:
 *               - position:
 *                   x: 50
 *                   y: 50
 *                 name: "Start Zone"
 *     responses:
 *       201:
 *         description: The map was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Map'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', mapController.createMap);

/**
 * @swagger
 * /api/maps:
 *   get:
 *     summary: Retrieve a list of maps
 *     tags: [Maps]
 *     responses:
 *       200:
 *         description: A list of maps
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
 *                     $ref: '#/components/schemas/Map'
 *       500:
 *         description: Internal server error
 */
router.get('/', mapController.getAllMaps);

/**
 * @swagger
 * /api/maps/{id}:
 *   get:
 *     summary: Get a map by ID
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *       schema:
 *         type: string
 *         format: uuid
 *       example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799'
 *       description: "UUID of the resource"
 *         required: true
 *         description: The map ID
 *     responses:
 *       200:
 *         description: The map description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Map'
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', mapController.getMap);

/**
 * @swagger
 * /api/maps/{id}:
 *   put:
 *     summary: Update a map by ID
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *       schema:
 *         type: string
 *         format: uuid
 *       example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799'
 *       description: "UUID of the resource"
 *         required: true
 *         description: The map ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Map'
 *     responses:
 *       200:
 *         description: The map was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Map'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', mapController.updateMap);

/**
 * @swagger
 * /api/maps/{id}:
 *   delete:
 *     summary: Delete a map by ID
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *       schema:
 *         type: string
 *         format: uuid
 *       example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799'
 *       description: "UUID of the resource"
 *         required: true
 *         description: The map ID
 *     responses:
 *       204:
 *         description: The map was deleted
 *       404:
 *         description: Map not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', mapController.deleteMap);

module.exports = router;
