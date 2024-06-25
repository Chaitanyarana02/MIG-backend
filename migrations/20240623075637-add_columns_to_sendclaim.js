'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sendclaim', 'productName', {
      type: Sequelize.STRING,
      defaultValue: 'Эрүүл мэндийн даатгал',
      allowNull: true,
      after: 'quitsNo' // Add after the 'id' column
    });

    await queryInterface.addColumn('sendclaim', 'beginDate', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'productName' // Add after the 'status' column
    });

    await queryInterface.addColumn('sendclaim', 'endDate', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'beginDate' // Add after the 'RegisterNo' column
    });
    await queryInterface.addColumn('sendclaim', 'rate', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'endDate' // Add after the 'RegisterNo' column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sendclaim', 'productName');
    await queryInterface.removeColumn('sendclaim', 'beginDate');
    await queryInterface.removeColumn('sendclaim', 'endDate');
    await queryInterface.removeColumn('sendclaim', 'rate');
  }
};
