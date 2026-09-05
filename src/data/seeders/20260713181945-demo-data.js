// Use fixed UUIDs for reproducibility in demos:
const MAP_ID = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OBSTACLE_1_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const OBSTACLE_2_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
const WAYPOINT_1_ID = 'd4e5f6a7-b8c9-0123-defa-234567890123';
const WAYPOINT_2_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';
const ROUTE_1_ID = 'f6a7b8c9-d0e1-2345-fabc-456789012345';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { calculatePath } = require('../../business/pathfinder');

const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo1234!', 10);

// ------------------------------------------------------------------
// Maze generation (iterative DFS) – returns a Set of blocked cells "x,y"
// ------------------------------------------------------------------
function generateMazeObstacles(size) {
  const blocked = new Set();
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      blocked.add(`${x},${y}`);
    }
  }

  const half = size / 2;
  const visited = Array.from({ length: half }, () => Array(half).fill(false));
  const stack = [];

  visited[0][0] = true;
  stack.push({ i: 0, j: 0 });
  blocked.delete(`${1},${1}`);

  const dirs = [
    { di: -1, dj: 0 }, { di: 1, dj: 0 },
    { di: 0, dj: -1 }, { di: 0, dj: 1 }
  ];

  while (stack.length > 0) {
    const { i, j } = stack[stack.length - 1];
    const neighbours = [];

    for (const d of dirs) {
      const ni = i + d.di;
      const nj = j + d.dj;
      if (ni >= 0 && ni < half && nj >= 0 && nj < half && !visited[ni][nj]) {
        neighbours.push({ i: ni, j: nj });
      }
    }

    if (neighbours.length > 0) {
      const chosen = neighbours[Math.floor(Math.random() * neighbours.length)];
      const { i: ni, j: nj } = chosen;

      const wallX = 2 * i + 1 + (ni - i);
      const wallY = 2 * j + 1 + (nj - j);
      blocked.delete(`${wallX},${wallY}`);

      visited[ni][nj] = true;
      blocked.delete(`${2 * ni + 1},${2 * nj + 1}`);

      stack.push({ i: ni, j: nj });
    } else {
      stack.pop();
    }
  }

  return blocked;
}

// ------------------------------------------------------------------
// Compress blocked cells into non‑overlapping rectangles (start/end inclusive)
// ------------------------------------------------------------------
function compressObstacles(blockedSet) {
  const rows = new Map(); // y -> array of x
  for (const cell of blockedSet) {
    const [x, y] = cell.split(',').map(Number);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }

  const segments = []; // { y, startX, endX }
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let start = xs[0];
    let end = xs[0];
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] === end + 1) {
        end = xs[i];
      } else {
        segments.push({ y, startX: start, endX: end });
        start = xs[i];
        end = xs[i];
      }
    }
    segments.push({ y, startX: start, endX: end });
  }

  const intervalMap = new Map(); // key -> array of y
  for (const seg of segments) {
    const key = `${seg.startX},${seg.endX}`;
    if (!intervalMap.has(key)) intervalMap.set(key, []);
    intervalMap.get(key).push(seg.y);
  }

  const rectangles = [];
  for (const [key, ys] of intervalMap) {
    const [startX, endX] = key.split(',').map(Number);
    ys.sort((a, b) => a - b);
    let startY = ys[0];
    let endY = ys[0];
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] === endY + 1) {
        endY = ys[i];
      } else {
        rectangles.push({ startX, startY, endX, endY });
        startY = ys[i];
        endY = ys[i];
      }
    }
    rectangles.push({ startX, startY, endX, endY });
  }

  return rectangles;
}

// ------------------------------------------------------------------
// Build the final obstacle list for a 50x50 map.
// The first two rectangles (sorted) receive fixed UUIDs.
// ------------------------------------------------------------------
function buildMazeObstacles(mapId, userId, now) {
  const blocked = generateMazeObstacles(50); // 50x50
  const rectangles = compressObstacles(blocked);

  // Sort deterministically by (startY, startX)
  rectangles.sort((a, b) =>
    a.startY !== b.startY ? a.startY - b.startY : a.startX - b.startX
  );

  return rectangles.map((rect, index) => {
    const id =
      index === 0 ? OBSTACLE_1_ID :
        index === 1 ? OBSTACLE_2_ID :
          randomUUID();

    const width = rect.endX - rect.startX + 1;
    const height = rect.endY - rect.startY + 1;
    const area = width * height;

    return {
      id,
      mapId,
      startX: rect.startX,
      startY: rect.startY,
      endX: rect.endX,
      endY: rect.endY,
      size: area,        // area of the rectangle
      userId,
      createdAt: now,
      updatedAt: now
    };
  });
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1. Create user
    await queryInterface.bulkInsert('Users', [{
      id: USER_ID,
      name: 'Jane Doe',
      age: 25,
      email: 'jane.doe@example.com',
      password: DEMO_PASSWORD_HASH,
      createdAt: now,
      updatedAt: now
    }]);

    // 2. Create map (50x50)
    await queryInterface.bulkInsert('Maps', [{
      id: MAP_ID,
      name: 'Level 1',
      width: 50,
      height: 50,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now
    }]);

    // 3. Generate and insert obstacles (rectangles)
    const obstacles = buildMazeObstacles(MAP_ID, USER_ID, now);
    await queryInterface.bulkInsert('Obstacles', obstacles);

    // 4. Insert waypoints: Start (1,1) and End (49,49)
    await queryInterface.bulkInsert('Waypoints', [
      {
        id: WAYPOINT_1_ID,
        mapId: MAP_ID,
        positionX: 1,
        positionY: 1,
        name: 'Start Point',
        userId: USER_ID,
        createdAt: now,
        updatedAt: now
      },
      {
        id: WAYPOINT_2_ID,
        mapId: MAP_ID,
        positionX: 49,
        positionY: 49,
        name: 'End Point',
        userId: USER_ID,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // 5. Calculate optimal path using A* (pass the same rectangles)
    const start = { x: 1, y: 1 };
    const end = { x: 49, y: 49 };

    const obstacleRectangles = obstacles.map(o => ({
      startX: o.startX,
      startY: o.startY,
      endX: o.endX,
      endY: o.endY
    }));

    const { path: optimalPath, distance } = calculatePath(
      { width: 50, height: 50 },
      start,
      end,
      obstacleRectangles,
      [] // no extra blocked cells
    );

    // 6. Insert the computed route
    await queryInterface.bulkInsert('Routes', [{
      id: ROUTE_1_ID,
      mapId: MAP_ID,
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      distance: Number(distance.toFixed(2)),
      path: JSON.stringify(optimalPath),
      userId: USER_ID,
      createdAt: now,
      updatedAt: now
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Routes', null, {});
    await queryInterface.bulkDelete('Waypoints', null, {});
    await queryInterface.bulkDelete('Obstacles', null, {});
    await queryInterface.bulkDelete('Maps', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};