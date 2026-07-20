module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Obstacles', {
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
      positionX: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      positionY: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
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
  async down(queryInterface) {
    await queryInterface.dropTable('Obstacles');
  }
};
