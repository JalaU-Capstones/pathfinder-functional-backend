const { DataTypes } = require('sequelize');

const defineUserModel = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
  });

  return User;
};

module.exports = { defineUserModel };
