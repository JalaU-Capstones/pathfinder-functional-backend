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
            id: { type: 'string', format: 'uuid', example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' },
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
            id: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
            mapId: { type: 'string', format: 'uuid', example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' },
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
            id: { type: 'string', format: 'uuid', example: 'd4e5f6a7-b8c9-0123-defa-234567890123' },
            mapId: { type: 'string', format: 'uuid', example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' },
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
            id: { type: 'string', format: 'uuid', example: 'f6a7b8c9-d0e1-2345-fabc-456789012345' },
            mapId: { type: 'string', format: 'uuid', example: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' },
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
            distance: { type: 'number', example: 127.28 },
            optimal_path: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'integer' },
                  y: { type: 'integer' }
                }
              },
              example: [{'x': 2, 'y': 2}, {'x': 3, 'y': 2}, {'x': 8, 'y': 8}]
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            name: { type: 'string', example: 'Jane Doe' },
            age: { type: 'integer', example: 25 },
            email: { type: 'string', example: 'jane.doe@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-07-13T10:00:00Z' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/presentation/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
