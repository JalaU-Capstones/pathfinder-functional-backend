const { DataTypes } = require('sequelize');

const defineWaypointModel = (sequelize) => {
  const Waypoint = sequelize.define('Waypoint', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mapId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    positionX: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    positionY: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Waypoints',
    timestamps: true
  });

  Waypoint.associate = (models) => {
    Waypoint.belongsTo(models.Map, { foreignKey: 'mapId', as: 'map' });
  };

  return Waypoint;
};

module.exports = { defineWaypointModel };
