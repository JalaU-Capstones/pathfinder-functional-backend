const swaggerJsdoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pathfinder Functional Backend API',
      version: packageJson.version,
      description: 'API documentation for the Pathfinder backend, built using a functional programming paradigm and a three-layer architecture.',
    },
    components: {
      schemas: {
        Map: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Level 1' },
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'integer', example: 100 },
                height: { type: 'integer', example: 100 }
              }
            },
            obstacles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'integer', example: 10 },
                  y: { type: 'integer', example: 20 }
                }
              }
            }
          }
        },
        Obstacle: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            mapId: { type: 'integer', example: 1 },
            position: {
              type: 'object',
              properties: {
                x: { type: 'integer', example: 10 },
                y: { type: 'integer', example: 20 }
              }
            },
            size: { type: 'integer', example: 5 }
          }
        },
        Waypoint: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            mapId: { type: 'integer', example: 1 },
            position: {
              type: 'object',
              properties: {
                x: { type: 'integer', example: 15 },
                y: { type: 'integer', example: 25 }
              }
            },
            name: { type: 'string', example: 'Start Point' }
          }
        },
        Route: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            mapId: { type: 'integer', example: 1 },
            start: {
              type: 'object',
              properties: {
                x: { type: 'integer', example: 5 },
                y: { type: 'integer', example: 5 }
              }
            },
            end: {
              type: 'object',
              properties: {
                x: { type: 'integer', example: 95 },
                y: { type: 'integer', example: 95 }
              }
            },
            distance: { type: 'number', example: 127.28 }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Jane Doe' },
            age: { type: 'integer', example: 25 },
            email: { type: 'string', example: 'jane.doe@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-07-13T10:00:00Z' }
          }
        }
      }
    }
  },
  apis: ['./src/presentation/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
