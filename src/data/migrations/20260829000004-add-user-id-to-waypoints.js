'use strict';

/**
 * Migration: add userId foreign key to Waypoints table.
 * Same rationale as Obstacles migration.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Waypoints', 'userId', {
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

    await queryInterface.addIndex('Waypoints', ['userId'], {
      name: 'waypoints_user_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'Waypoints', 'waypoints_user_id_idx'
    );
    await queryInterface.removeColumn('Waypoints', 'userId');
  },
};
