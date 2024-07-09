'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Customer, { foreignKey: 'PhoneNo', sourceKey: 'phoneNo', as: 'customers' });
    }
  }
  User.init({
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isOtpVerified: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
      comment: '0 - No, 1 - Yes',
    },
    otpGeneratedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      },
      otpCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
      },
    userType: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
      comment: '0 - Customer, 1 - Admin/Manager',
    },
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { }
      }
    }
  });
  return User;
};