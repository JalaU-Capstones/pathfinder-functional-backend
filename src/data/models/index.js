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

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
