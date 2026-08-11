const { DataTypes } = require('sequelize');

const defineWaypointModel = (sequelize) => {
  const Waypoint = sequelize.define('Waypoint', {
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
