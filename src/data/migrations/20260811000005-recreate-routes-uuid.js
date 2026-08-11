'use strict';

// NOTE: The 'path' (JSONB) column was originally added in
// migration 20260727000000-add-path-to-routes.js.
// It is included here because this migration recreates
// the Routes table from scratch with UUID PKs.
// The original migration is preserved for history.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Routes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      mapId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Maps',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      startX: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      startY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endX: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      distance: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      path: {
        type: Sequelize.JSONB,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Routes');
  },
};
