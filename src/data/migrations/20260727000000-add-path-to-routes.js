'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Routes', 'path', {
      type: Sequelize.JSONB, // PostgreSQL JSONB for structured array storage
      allowNull: true,       // nullable: existing rows have no path data
      defaultValue: null,
      comment: 'Ordered array of {x,y} coordinates computed by the A* algorithm',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Routes', 'path');
  },
};
