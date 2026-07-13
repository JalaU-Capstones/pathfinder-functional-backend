module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Routes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mapId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Maps',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      startX: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      startY: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      endX: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      endY: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      distance: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Routes');
  }
};
