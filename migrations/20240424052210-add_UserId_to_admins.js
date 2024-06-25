'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Admins', 'UserId', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'id'
    });
  },  

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Admins', 'UserId');
  }
};
