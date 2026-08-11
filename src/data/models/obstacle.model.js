const { DataTypes } = require('sequelize');

const defineObstacleModel = (sequelize) => {
  const Obstacle = sequelize.define('Obstacle', {
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
