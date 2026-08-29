const { DataTypes } = require('sequelize');

const defineRouteModel = (sequelize) => {
  const Route = sequelize.define('Route', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    mapId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Maps',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    startX: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startY: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endX: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endY: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    path: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    tableName: 'Routes',
    timestamps: true
  });

  Route.associate = (models) => {
    Route.belongsTo(models.Map, { foreignKey: 'mapId', as: 'map' });
  };

  return Route;
};

module.exports = { defineRouteModel };
