const { DataTypes } = require('sequelize');

/**
 * Obstacle model — represents a rectangular blocked area
 * on a map grid.
 *
 * Geometry is stored as four scalar INTEGER columns:
 * - startX, startY: top-left corner of the rectangle
 * - endX, endY: bottom-right corner of the rectangle
 *
 * For a single-cell obstacle: endX === startX, endY === startY
 * For a rectangular obstacle: endX > startX or endY > startY
 *
 * The size field is always calculated by the system:
 * size = (endX - startX + 1) * (endY - startY + 1)
 * It is never provided by the user.
 *
 * The A* pathfinder expands each obstacle into individual
 * blocked cells using the rectangle bounds. A cell (x, y)
 * is blocked if:
 * startX <= x <= endX AND startY <= y <= endY
 */
const defineObstacleModel = (sequelize) => {
  const Obstacle = sequelize.define(
    'Obstacle',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      mapId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Maps', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // Rectangular geometry — four scalar columns
      startX: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          'Top-left X coordinate of the obstacle rectangle.',
      },
      startY: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          'Top-left Y coordinate of the obstacle rectangle.',
      },
      endX: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          'Bottom-right X coordinate. ' +
          'Equals startX for single-cell obstacles.',
      },
      endY: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          'Bottom-right Y coordinate. ' +
          'Equals startY for single-cell obstacles.',
      },

      // Calculated field — set by service, never by user
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment:
          'Number of grid cells occupied: ' +
          '(endX-startX+1)*(endY-startY+1). ' +
          'Calculated by the system, never user-provided.',
      },
    },
    {
      tableName: 'Obstacles',
      timestamps: true,
    }
  );

  Obstacle.associate = (models) => {
    Obstacle.belongsTo(models.Map, { foreignKey: 'mapId', as: 'map' });
  };

  return Obstacle;
};

module.exports = { defineObstacleModel };
