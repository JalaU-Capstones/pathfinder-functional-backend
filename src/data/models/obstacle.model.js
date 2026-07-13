const { DataTypes } = require('sequelize');

const defineObstacleModel = (sequelize) => {
  const Obstacle = sequelize.define('Obstacle', {
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
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Obstacles',
    timestamps: true
  });

  Obstacle.associate = (models) => {
    Obstacle.belongsTo(models.Map, { foreignKey: 'mapId', as: 'map' });
  };

  return Obstacle;
};

module.exports = { defineObstacleModel };
