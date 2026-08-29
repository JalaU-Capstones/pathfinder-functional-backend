'use strict';

/**
 * Migration: add userId foreign key to Routes table.
 * Same rationale as Maps and Obstacles migrations.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Routes', 'userId', {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('Routes', ['userId'], {
      name: 'routes_user_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'Routes', 'routes_user_id_idx'
    );
    await queryInterface.removeColumn('Routes', 'userId');
  },
};
