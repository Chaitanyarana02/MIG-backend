
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sendclaim', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      f1: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Reimbursement number'
      },
      f2: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Contract Type Number (Contract Guarantee=1, Formal Procedure=2, Contract=3)'
      },
      f3: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ContractID'
      },
      f4: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ContractDetailId'
      },
      f5: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ProductID'
      },
      f6: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'current date'
      },
      f7: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'date of Case date'
      },
      f8: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ProductID'
      },
      f9: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1',
        comment: 'Case number (set string value 1)'
      },
      f10: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Plate number – Not related to health insurance'
      },
      f11: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Phone number (current user login)'
      },
      f12: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Additional information (first description box step-1)'
      },
      f13: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Claimed amount (step2 float amount - claim amount phase)'
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

    await queryInterface.createTable('quitsimages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary key'
      },
      sendClaimId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sendclaim',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        comment: 'Foreign key to sendclaim'
      },
      quitsType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      f1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID or sort order'
      },
      f2: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Image name'
      },
      f3: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Image Url'
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('quitsimages');
    await queryInterface.dropTable('sendclaim');
  }
};

