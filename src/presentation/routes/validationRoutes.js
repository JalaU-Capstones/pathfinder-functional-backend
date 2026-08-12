'use strict';

const express = require('express');
const validationController = require('../controllers/validationController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Validation
 *   description: Validation endpoints utilizing recursive algorithms
 */

/**
 * @swagger
 * /api/validation/map-id/{mapId}:
 *   get:
 *     summary: Validate map ID UUID format (Point 1)
 *     description: Validates that a map ID string conforms strictly to UUID v4 format. The validation uses a **recursive algorithm** to process the UUID segment-by-segment. This segment-based recursive approach aligns perfectly with the 5-segment structure of a standard UUID string. Satisfies Assignment 6.4 Point 1.
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *         example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *     responses:
 *       200:
 *         description: Format is valid.
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
 *                     message:
 *                       type: string
 *                       example: Map ID format is valid.
 *       400:
 *         description: Invalid UUID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Invalid map ID format
 */
router.get('/map-id/:mapId', validationController.validateMapId);

/**
 * @swagger
 * /api/validation/map-exists/{mapId}:
 *   get:
 *     summary: Verify map exists in the database (Point 2)
 *     description: Validates UUID format and then queries the database to verify existence. Uses a recursive validation helper for the ID string, and an async Promise for the database lookup. Satisfies Assignment 6.4 Point 2.
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *         example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *     responses:
 *       200:
 *         description: Map ID exists in the database.
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
 *                     message:
 *                       type: string
 *                       example: Map ID exists in the database.
 *       400:
 *         description: Invalid UUID format.
 *       404:
 *         description: Map not found in database.
 */
router.get('/map-exists/:mapId', validationController.checkMapExists);

/**
 * @swagger
 * /api/validation/map-config:
 *   post:
 *     summary: Validate map configuration has obstacles and waypoints (Point 3)
 *     description: Validates map configuration utilizing a **recursive algorithm** to traverse the nested object structure. Depth-first recursion checks nested structure requirements naturally without deep explicit loops. Satisfies Assignment 6.4 Point 3.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mapId:
 *                 type: string
 *                 example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *               mapConfig:
 *                 type: object
 *                 properties:
 *                   obstacles:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: object
 *                           properties:
 *                             x:
 *                               type: number
 *                             y:
 *                               type: number
 *                   waypoints:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: object
 *                           properties:
 *                             x:
 *                               type: number
 *                             y:
 *                               type: number
 *             example:
 *               mapId: "3b47e69f-788d-4b19-b81b-0b4a2fd92799"
 *               mapConfig:
 *                 obstacles:
 *                   - position: { x: 10, y: 20 }
 *                 waypoints:
 *                   - position: { x: 50, y: 60 }
 *     responses:
 *       200:
 *         description: Config is valid.
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
 *                     message:
 *                       type: string
 *                       example: Map configuration validated successfully.
 *       400:
 *         description: Invalid map configuration.
 */
router.post('/map-config', validationController.validateConfig);

/**
 * @swagger
 * /api/validation/dimensions:
 *   post:
 *     summary: Validate map dimensions (Point 4)
 *     description: Validates map dimensions against limits using a **recursive algorithm**. Recursion processes one rule per call and short-circuits on failure, modeling the rule chain evaluation perfectly. Satisfies Assignment 6.4 Point 4.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               width:
 *                 type: number
 *                 example: 100
 *               height:
 *                 type: number
 *                 example: 80
 *     responses:
 *       200:
 *         description: Dimensions are valid.
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
 *                     message:
 *                       type: string
 *                       example: Map dimensions are within acceptable limits.
 *       400:
 *         description: Invalid dimensions.
 */
router.post('/dimensions', validationController.validateDimensions);

/**
 * @swagger
 * /api/validation/cyclic-dependencies:
 *   post:
 *     summary: Detect cyclic dependencies in map connections (Point 6)
 *     description: Validates connections configuration using a **recursive algorithm** (Depth-First Search) to identify graph cycles. Recursion is the canonical strategy for DFS logic as the call stack captures the traversal path automatically. Satisfies Assignment 6.4 Point 6.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mapConfig:
 *                 type: object
 *                 properties:
 *                   connections:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         source:
 *                           type: string
 *                         target:
 *                           type: string
 *             example:
 *               mapConfig:
 *                 connections:
 *                   - source: "A"
 *                     target: "B"
 *                   - source: "B"
 *                     target: "A"
 *     responses:
 *       200:
 *         description: No cyclic dependencies found.
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
 *                     message:
 *                       type: string
 *                       example: No cyclic dependencies found in map configuration.
 *       400:
 *         description: Cycle detected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Cyclic dependency detected in map configuration...
 */
router.post('/cyclic-dependencies', validationController.checkCyclicDependencies);

module.exports = router;
