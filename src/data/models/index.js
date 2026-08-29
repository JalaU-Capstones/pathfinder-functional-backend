const { sequelize } = require('../../config/database');

const { defineUserModel } = require('./user.model');
const { defineMapModel } = require('./map.model');
const { defineObstacleModel } = require('./obstacle.model');
const { defineWaypointModel } = require('./waypoint.model');
const { defineRouteModel } = require('./route.model');

const models = {
  User: defineUserModel(sequelize),
  Map: defineMapModel(sequelize),
  Obstacle: defineObstacleModel(sequelize),
  Waypoint: defineWaypointModel(sequelize),
  Route: defineRouteModel(sequelize)
};

const ApiStat = require('./apiStat.model')(sequelize);

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// User ownership associations
// A user owns many maps, obstacles, waypoints, routes.
// If the user is deleted, owned records have userId set
// to null (SET NULL) — data is preserved, not deleted.
models.User.hasMany(models.Map, {
  foreignKey: 'userId',
  as: 'ownedMaps',
  onDelete: 'SET NULL',
});
models.Map.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'owner',
});

models.User.hasMany(models.Obstacle, {
  foreignKey: 'userId',
  as: 'ownedObstacles',
  onDelete: 'SET NULL',
});
models.Obstacle.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'owner',
});

models.User.hasMany(models.Waypoint, {
  foreignKey: 'userId',
  as: 'ownedWaypoints',
  onDelete: 'SET NULL',
});
models.Waypoint.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'owner',
});

models.User.hasMany(models.Route, {
  foreignKey: 'userId',
  as: 'ownedRoutes',
  onDelete: 'SET NULL',
});
models.Route.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'owner',
});

module.exports = {
  sequelize,
  ...models,
  ApiStat
};

