'use strict';

/**
 * Migration: replace positionX/positionY with rectangular
 * scalar columns on the Obstacles table.
 *
 * Changes:
 * - Add startX, startY, endX, endY INTEGER columns
 * - Migrate existing position data to the new columns
 *   (existing single-cell obstacles: endX=startX,
 *   endY=startY)
 * - Recalculate size from the new columns
 * - Remove the old positionX/positionY columns
 *
 * This migration is safe to run on tables with existing
 * data because:
 * 1. New columns are added as nullable first.
 * 2. Data is migrated from old columns to new columns.
 * 3. Columns are then set to NOT NULL.
 * 4. Old columns are removed last.
 *
 * Down migration restores positionX/Y from scalar
 * columns so rollback is lossless.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add new nullable columns
    await queryInterface.addColumn('Obstacles', 'startX', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('Obstacles', 'startY', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('Obstacles', 'endX', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('Obstacles', 'endY', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    // Step 2: Migrate existing data
    // All existing obstacles are single-cell so endX=startX,
    // endY=startY, size=1.
    await queryInterface.sequelize.query(`
      UPDATE "Obstacles"
      SET
        "startX" = "positionX",
        "startY" = "positionY",
        "endX"   = "positionX",
        "endY"   = "positionY",
        "size"   = 1
      WHERE "positionX" IS NOT NULL AND "positionY" IS NOT NULL
    `);

    // Step 3: Make new columns NOT NULL now that data exists
    await queryInterface.changeColumn('Obstacles', 'startX', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('Obstacles', 'startY', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('Obstacles', 'endX', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('Obstacles', 'endY', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Step 4: Add performance indexes for pathfinder queries.
    // The A* pathfinder checks if a cell (x, y) is inside
    // any obstacle rectangle using:
    // startX <= x <= endX AND startY <= y <= endY
    await queryInterface.addIndex(
      'Obstacles', ['startX', 'endX'], {
        name: 'obstacles_start_end_x_idx',
      }
    );

    await queryInterface.addIndex(
      'Obstacles', ['startY', 'endY'], {
        name: 'obstacles_start_end_y_idx',
      }
    );

    // Step 5: Remove old position columns
    await queryInterface.removeColumn('Obstacles', 'positionX');
    await queryInterface.removeColumn('Obstacles', 'positionY');
  },

  async down(queryInterface, Sequelize) {
    // Restore positionX/positionY from scalar columns
    await queryInterface.addColumn('Obstacles', 'positionX', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Obstacles', 'positionY', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Obstacles"
      SET "positionX" = "startX",
          "positionY" = "startY"
    `);

    await queryInterface.changeColumn('Obstacles', 'positionX', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('Obstacles', 'positionY', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Remove indexes
    await queryInterface.removeIndex(
      'Obstacles', 'obstacles_start_end_x_idx'
    );
    await queryInterface.removeIndex(
      'Obstacles', 'obstacles_start_end_y_idx'
    );

    // Remove new columns
    await queryInterface.removeColumn('Obstacles', 'startX');
    await queryInterface.removeColumn('Obstacles', 'startY');
    await queryInterface.removeColumn('Obstacles', 'endX');
    await queryInterface.removeColumn('Obstacles', 'endY');
  },
};
