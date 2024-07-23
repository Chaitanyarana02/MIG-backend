'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sendclaim', 'riskDesc', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'status' // Add after the 'id' column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sendclaim', 'riskDesc');
  }
};
