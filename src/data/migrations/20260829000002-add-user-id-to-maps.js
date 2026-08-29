'use strict';

/**
 * Migration: add userId foreign key to Maps table.
 *
 * Links each map to the user who created it.
 * allowNull: true for backward compatibility with
 * existing map rows. New maps created after this
 * migration will always have a userId.
 *
 * onDelete: SET NULL — if a user is deleted, their
 * maps are NOT deleted. The maps become orphaned
 * (userId = null) and are no longer visible to any
 * user. This is safer than CASCADE delete which would
 * destroy all map data when a user account is removed.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Maps', 'userId', {
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

    await queryInterface.addIndex('Maps', ['userId'], {
      name: 'maps_user_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Maps', 'maps_user_id_idx');
    await queryInterface.removeColumn('Maps', 'userId');
  },
};
