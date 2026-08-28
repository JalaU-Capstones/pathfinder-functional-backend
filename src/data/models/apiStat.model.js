'use strict';

const { DataTypes } = require('sequelize');

/**
 * ApiStat model — represents one tracked HTTP request.
 *
 * Fields match the migration exactly. The model does not
 * define associations: ApiStats is a standalone analytics
 * table, not part of the core entity graph.
 */
module.exports = (sequelize) => {
  const ApiStat = sequelize.define(
    'ApiStat',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      endpointAccess: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requestMethod: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      responseTimeMs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'ApiStats',
      timestamps: true,
    }
  );

  return ApiStat;
};
