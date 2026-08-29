'use strict';

/**
 * Migration: add password column to Users table.
 *
 * The password field stores a bcrypt hash — NEVER the
 * plain text password. bcrypt hashes are always 60
 * characters, but STRING(255) gives future flexibility.
 *
 * allowNull: true initially for backward compatibility
 * with existing seed data rows that have no password.
 * After all existing users are migrated or replaced,
 * this could be tightened to NOT NULL in a future
 * migration if needed.
 *
 * No default value is set — a missing password means
 * the user was created before auth was implemented
 * and must reset their password before logging in.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment:
        'bcrypt hash of the user password. Never plain text. ' +
        'Null for legacy rows created before auth was added.',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'password');
  },
};
