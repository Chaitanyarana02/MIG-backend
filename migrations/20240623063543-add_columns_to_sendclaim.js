'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sendclaim', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'материал илгээсэн',
      allowNull: false,
      after: 'id' // Add after the 'id' column
    });

    await queryInterface.addColumn('sendclaim', 'RegisterNo', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'status' // Add after the 'status' column
    });

    await queryInterface.addColumn('sendclaim', 'quitsNo', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'RegisterNo' // Add after the 'RegisterNo' column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sendclaim', 'status');
    await queryInterface.removeColumn('sendclaim', 'RegisterNo');
    await queryInterface.removeColumn('sendclaim', 'quitsNo');
  }
};
