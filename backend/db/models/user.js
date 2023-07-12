'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafeObject() {
      const { id, firstName, lastName, email, username } = this; // context will be the User instance
      // console.log('firstName:', firstName);
      // console.log('lastName:', lastName);
      return { id, firstName, lastName, email, username };
    }
    static associate(models) {
      this.hasMany(models.Spot, { foreignKey: 'owner_id', as: 'spots' });
      this.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' });
      this.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
    }
  };

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          }
        }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 60]
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'createdAt', 'updatedAt']
        }
      },
      scopes: {
        withFullName: {
          attributes: ['id', 'firstName', 'lastName', 'email', 'username']
        }
      }
    }
  );
  return User;
};
