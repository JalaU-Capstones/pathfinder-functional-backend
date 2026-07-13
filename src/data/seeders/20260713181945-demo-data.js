module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Users', [{
      name: 'Jane Doe',
      age: 25,
      email: 'jane.doe@example.com',
      createdAt: now,
      updatedAt: now
    }]);

    // Insert Map
    const maps = await queryInterface.bulkInsert('Maps', [{
      name: 'Level 1',
      width: 100,
      height: 100,
      createdAt: now,
      updatedAt: now
    }], { returning: true });

    // Ensure we have the map id (different SQL dialects return it differently, but for Postgres returning: true usually gives objects or an array of objects)
    const mapId = maps && maps[0] && maps[0].id ? maps[0].id : 1; 

    await queryInterface.bulkInsert('Obstacles', [
      { mapId, positionX: 10, positionY: 20, size: 5, createdAt: now, updatedAt: now },
      { mapId, positionX: 30, positionY: 40, size: 10, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Waypoints', [
      { mapId, positionX: 15, positionY: 25, name: 'Start Point', createdAt: now, updatedAt: now },
      { mapId, positionX: 95, positionY: 95, name: 'End Point', createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Routes', [
      { mapId, startX: 5, startY: 5, endX: 95, endY: 95, distance: 127.28, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Routes', null, {});
    await queryInterface.bulkDelete('Waypoints', null, {});
    await queryInterface.bulkDelete('Obstacles', null, {});
    await queryInterface.bulkDelete('Maps', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
