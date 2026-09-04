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
// Maze generation (iterative DFS) for a grid of even size.
// Returns a Set of obstacle coordinates as strings "x,y".
// ------------------------------------------------------------------
function generateMazeObstacles(size) {
  // All cells initially obstacles (walls)
  const obstacles = new Set();
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      obstacles.add(`${x},${y}`);
    }
  }

  // Node grid: only odd-odd cells are potential corridors (size/2 x size/2)
  const half = size / 2;
  const visited = Array.from({ length: half }, () => Array(half).fill(false));
  const stack = [];

  // Start at node (0,0) -> coordinates (1,1)
  const startNode = { i: 0, j: 0 };
  visited[0][0] = true;
  stack.push(startNode);

  // Remove the start cell from obstacles (it becomes a corridor)
  obstacles.delete(`${1},${1}`);

  const directions = [
    { di: -1, dj: 0 }, // up
    { di: 1, dj: 0 },  // down
    { di: 0, dj: -1 }, // left
    { di: 0, dj: 1 }   // right
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { i, j } = current;

    // Collect unvisited neighbours
    const neighbours = [];
    for (const d of directions) {
      const ni = i + d.di;
      const nj = j + d.dj;
      if (ni >= 0 && ni < half && nj >= 0 && nj < half && !visited[ni][nj]) {
        neighbours.push({ i: ni, j: nj });
      }
    }

    if (neighbours.length > 0) {
      // Pick a random neighbour
      const chosen = neighbours[Math.floor(Math.random() * neighbours.length)];
      const { i: ni, j: nj } = chosen;

      // Remove the wall between current and chosen neighbour
      // The wall is at: (2*i + 1 + (ni-i), 2*j + 1 + (nj-j))? Let's compute carefully:
      // Current corridor cell: (2*i+1, 2*j+1)
      // Chosen corridor cell: (2*ni+1, 2*nj+1)
      // Wall is exactly in the middle: (2*i+1 + (ni-i), 2*j+1 + (nj-j))
      const wallX = 2 * i + 1 + (ni - i);
      const wallY = 2 * j + 1 + (nj - j);
      obstacles.delete(`${wallX},${wallY}`);

      // Mark the neighbour as visited and remove its cell from obstacles
      visited[ni][nj] = true;
      obstacles.delete(`${2*ni+1},${2*nj+1}`);

      // Push the neighbour onto the stack
      stack.push({ i: ni, j: nj });
    } else {
      // Dead end – backtrack
      stack.pop();
    }
  }

  return obstacles;
}

/**
 * Build the full maze obstacle list for a 100x100 map.
 * The maze is generated using iterative DFS, producing a perfect maze.
 * Obstacles are returned as an array of objects, sorted deterministically.
 * The first two entries receive the fixed UUIDs (OBSTACLE_1_ID, OBSTACLE_2_ID).
 */
function buildMazeObstacles(mapId, userId, now) {
  const obstacleSet = generateMazeObstacles(100);
  // Convert to array and sort for deterministic order
  const sorted = Array.from(obstacleSet).sort((a, b) => {
    const [ax, ay] = a.split(',').map(Number);
    const [bx, by] = b.split(',').map(Number);
    return ay !== by ? ay - by : ax - bx;
  });

  return sorted.map((cell, index) => {
    const [x, y] = cell.split(',').map(Number);
    let id;
    if (index === 0) id = OBSTACLE_1_ID;
    else if (index === 1) id = OBSTACLE_2_ID;
    else id = randomUUID();

    return {
      id,
      mapId,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      size: 1,
      userId,
      createdAt: now,
      updatedAt: now
    };
  });
}

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

    // Generate the maze obstacles
    const obstacles = buildMazeObstacles(MAP_ID, USER_ID, now);
    await queryInterface.bulkInsert('Obstacles', obstacles);

    // Insert waypoints – Start at (1,1) and End at (99,99)
    // Both are odd-odd, guaranteed to be corridors in the maze.
    await queryInterface.bulkInsert('Waypoints', [
      { id: WAYPOINT_1_ID, mapId: MAP_ID, positionX: 1, positionY: 1, name: 'Start Point', userId: USER_ID, createdAt: now, updatedAt: now },
      { id: WAYPOINT_2_ID, mapId: MAP_ID, positionX: 99, positionY: 99, name: 'End Point', userId: USER_ID, createdAt: now, updatedAt: now }
    ]);

    // Calculate optimal path using A* pathfinder
    const start = { x: 1, y: 1 };
    const end = { x: 99, y: 99 };

    // Build obstacles array in the format the pathfinder expects
    const obstaclePositions = obstacles.map(o => ({ x: o.startX, y: o.startY }));

    // Run A* algorithm – no DB calls, no transaction conflicts
    const { path: optimalPath, distance } = calculatePath(
      { width: 100, height: 100 },
      start,
      end,
      obstaclePositions,
      []  // no extra blocked cells
    );

    // Insert Route directly with fixed UUID – no service call
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