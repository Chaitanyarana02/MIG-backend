'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SendClaim extends Model {
    static associate(models) {
      // Define associations if any
      SendClaim.hasMany(models.QuitsImages, {
        foreignKey: 'sendClaimId',
        onDelete: 'CASCADE'
      });
    }
  }

  SendClaim.init({
    f1: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reimbursement number'
    },
    f2: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Contract Type Number (Contract Guarantee=1, Formal Procedure=2, Contract=3)'
    },
    f3: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ContractID'
    },
    f4: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ContractDetailId'
    },
    f5: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ProductID'
    },
    f6: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Current date'
    },
    f7: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Date of claim'
    },
    f8: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Date of Case date'
    },
    
    f9: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1',
      comment: 'Case number (set string value 1)'
    },
    f10: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Plate number – Not related to health insurance'
    },
    f11: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Phone number (current user login)'
    },
    f12: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Additional information (first description box step-1)'
    },
    f13: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Claimed amount (step2 float amount - claim amount phase)'
    },
    RegisterNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quitsNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'материал илгээсэн',
    },
    riskDesc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Эрүүл мэндийн даатгал',
    },
    beginDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createdAt' // Ensure this matches your database column name
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updatedAt' // Ensure this matches your database column name
    }

  }, {
    sequelize,
    modelName: 'SendClaim',
    tableName: 'SendClaim',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return SendClaim;
};
