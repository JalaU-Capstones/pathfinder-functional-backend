// Use fixed UUIDs for reproducibility in demos:
const MAP_ID = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OBSTACLE_1_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const OBSTACLE_2_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
const WAYPOINT_1_ID = 'd4e5f6a7-b8c9-0123-defa-234567890123';
const WAYPOINT_2_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';
const ROUTE_1_ID = 'f6a7b8c9-d0e1-2345-fabc-456789012345';

const bcrypt = require('bcryptjs');
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo1234!', 10);

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('Users', [{
      id: USER_ID,
      name: 'Jane Doe',
      age: 25,
      email: 'jane.doe@example.com',
      password: DEMO_PASSWORD_HASH,
      createdAt: now,
      updatedAt: now
    }]);

    await queryInterface.bulkInsert('Maps', [{
      id: MAP_ID,
      name: 'Level 1',
      width: 100,
      height: 100,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now
    }]);

    await queryInterface.bulkInsert('Obstacles', [
      { id: OBSTACLE_1_ID, mapId: MAP_ID, positionX: 10, positionY: 20, size: 5, userId: USER_ID, createdAt: now, updatedAt: now },
      { id: OBSTACLE_2_ID, mapId: MAP_ID, positionX: 30, positionY: 40, size: 10, userId: USER_ID, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Waypoints', [
      { id: WAYPOINT_1_ID, mapId: MAP_ID, positionX: 15, positionY: 25, name: 'Start Point', userId: USER_ID, createdAt: now, updatedAt: now },
      { id: WAYPOINT_2_ID, mapId: MAP_ID, positionX: 95, positionY: 95, name: 'End Point', userId: USER_ID, createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Routes', [
      { id: ROUTE_1_ID, mapId: MAP_ID, startX: 5, startY: 5, endX: 95, endY: 95, distance: 127.28, path: null, userId: USER_ID, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Routes', null, {});
    await queryInterface.bulkDelete('Waypoints', null, {});
    await queryInterface.bulkDelete('Obstacles', null, {});
    await queryInterface.bulkDelete('Maps', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
