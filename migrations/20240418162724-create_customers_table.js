'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',     
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      FirstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      LastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      RegisterNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      PhoneNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      IsForigner: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: true,
        defaultValue: '0',
        comment: '0 - Not a foreigner, 1 - Foreigner',
      },
      CivilWarCertificate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      IdentitybackCertificate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      VehicleCertificate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      SteeringWheelCertificate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      DrivingLinceseback: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Customers');
  }
};