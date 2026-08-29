'use strict';

/**
 * Migration: add userId foreign key to Obstacles table.
 *
 * Same rationale as Maps migration:
 * - allowNull: true for backward compatibility
 * - onDelete: SET NULL to preserve obstacle data
 *   if the owning user is deleted
 *
 * Note: Obstacles already have a mapId FK. The userId
 * here is the direct creator, which may differ from
 * the map owner in theory (though in this system they
 * are always the same user). Storing both provides
 * flexibility and avoids JOINs in ownership checks.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Obstacles', 'userId', {
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

    await queryInterface.addIndex('Obstacles', ['userId'], {
      name: 'obstacles_user_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'Obstacles', 'obstacles_user_id_idx'
    );
    await queryInterface.removeColumn('Obstacles', 'userId');
  },
};
