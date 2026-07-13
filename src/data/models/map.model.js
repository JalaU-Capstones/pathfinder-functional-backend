const { DataTypes } = require('sequelize');

const defineMapModel = (sequelize) => {
  const Map = sequelize.define('Map', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Maps',
    timestamps: true
  });

  Map.associate = (models) => {
    Map.hasMany(models.Obstacle, { foreignKey: 'mapId', as: 'obstacles', onDelete: 'CASCADE' });
    Map.hasMany(models.Waypoint, { foreignKey: 'mapId', as: 'waypoints', onDelete: 'CASCADE' });
    Map.hasMany(models.Route, { foreignKey: 'mapId', as: 'routes', onDelete: 'CASCADE' });
  };

  return Map;
};

module.exports = { defineMapModel };
