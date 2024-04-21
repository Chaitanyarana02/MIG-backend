'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phoneNo: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otpVerifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isOtpVerified: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
        comment: '0 - No, 1 - Yes',
      },
      userType: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
        comment: '0 - Customer, 1 - Admin/Manager',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};