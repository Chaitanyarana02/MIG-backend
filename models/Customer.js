'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customer.belongsTo(models.User, { foreignKey: 'UserId' });

    }
  }
  Customer.init({
    FirstName: DataTypes.STRING,
    LastName: DataTypes.STRING,
    RegisterNo: DataTypes.STRING,
    PhoneNo: DataTypes.STRING,
    IsForigner: DataTypes.ENUM('0', '1'),
    CivilWarCertificate: DataTypes.STRING,
    IdentitybackCertificate: DataTypes.STRING,
    VehicleCertificate: DataTypes.STRING,
    SteeringWheelCertificate: DataTypes.STRING,
    DrivingLinceseback: DataTypes.STRING,
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};