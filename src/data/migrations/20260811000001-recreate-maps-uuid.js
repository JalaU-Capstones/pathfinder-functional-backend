'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing table (development only — data will be
    // re-seeded after all UUID migrations run)
    await queryInterface.dropTable('Obstacles');
    await queryInterface.dropTable('Waypoints');
    await queryInterface.dropTable('Routes');
    await queryInterface.dropTable('Maps');

    await queryInterface.createTable('Maps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('Maps');
    // Restoration of integer-PK tables is handled by
    // rolling back to before this migration set.
    // Re-run all previous migrations to restore the
    // original integer schema.
  },
};
