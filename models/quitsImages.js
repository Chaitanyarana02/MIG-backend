'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuitsImages extends Model {
    static associate(models) {
      // Define associations if any
      QuitsImages.belongsTo(models.SendClaim, {
        foreignKey: 'sendClaimId',
        onDelete: 'CASCADE'
      });
    }
  }

  QuitsImages.init({
    sendClaimId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment:"sendClaim id is define "
    },
    quitsType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:"type of quits in text "
    },
    f1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'type of quits'
    },
    f2: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Image name'
    },
    f3: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Image Url'
    },
  
  }, {
    sequelize,
    tableName: 'QuitsImages',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return QuitsImages;
};
