'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const [results, metadata] = await queryInterface.sequelize.query(
        "SHOW COLUMNS FROM Users WHERE Field = 'userType'"
      );
  
      const enumValues = results[0].Type.replace(/(^enum\(|\)$|')/g, '').split(',');
      if (!enumValues.includes('2')) {
        enumValues.push('2');
        await queryInterface.changeColumn('Users', 'userType', {
          type: Sequelize.ENUM(...enumValues),
          allowNull: false,
          defaultValue: '0',
          comment: '0 - Customer, 1 - Admin/Manager, 2 - Superadmin',
        }, { transaction });
      }
    });
    await queryInterface.bulkInsert('Users', [{
      phoneNo: '99009900',
      userType:'2',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    
  }
};
