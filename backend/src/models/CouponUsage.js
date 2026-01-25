const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  coupon_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'coupon_usages',
  timestamps: true,
  updatedAt: false, // Only track creation
  indexes: [
    { fields: ['coupon_id'] },
    { fields: ['order_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = CouponUsage;
