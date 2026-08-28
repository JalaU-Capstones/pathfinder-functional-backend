'use strict';

/**
 * Migration: create ApiStats table
 *
 * Stores per-request tracking data for the API usage
 * statistics middleware (Lab Week 8). Each row represents
 * one HTTP request processed by the backend.
 *
 * The responseTime column stores a JSONB object with avg,
 * min, and max because those aggregations are computed
 * across many requests in the stats service layer, not
 * stored pre-computed per row.
 *
 * Per-row storage (not pre-aggregated) is the correct
 * approach: it allows flexible aggregation at query time
 * using SQL or JavaScript reduce/filter/map operations.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApiStats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      endpointAccess: {
        type: Sequelize.STRING,
        allowNull: false,
        comment:
          'The route path accessed, e.g. /api/maps or ' +
          '/api/routes. Normalized before storage ' +
          '(query strings stripped, UUIDs replaced).',
      },
      requestMethod: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'HTTP method: GET, POST, PUT, DELETE, etc.',
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'HTTP response status code returned.',
      },
      responseTimeMs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment:
          'Response time in milliseconds for this request. ' +
          'Avg/min/max are computed by the stats service ' +
          'at query time using reduce over this field.',
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment:
          'Optional: user identifier if authentication ' +
          'is implemented. Null for unauthenticated requests.',
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When the request was received.',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Index on endpointAccess for faster stats queries
    await queryInterface.addIndex('ApiStats', ['endpointAccess'], {
      name: 'api_stats_endpoint_access_idx',
    });

    // Index on timestamp for time-range queries
    await queryInterface.addIndex('ApiStats', ['timestamp'], {
      name: 'api_stats_timestamp_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ApiStats');
  },
};
