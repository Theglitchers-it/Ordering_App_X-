const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true, // null = global coupon (all merchants)
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_delivery'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Only for percentage discounts
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  max_uses: {
    type: DataTypes.INTEGER,
    allowNull: true // null = unlimited
  },
  max_uses_per_user: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  applicable_products: {
    type: DataTypes.JSON,
    allowNull: true // null = all products
  },
  applicable_categories: {
    type: DataTypes.JSON,
    allowNull: true // null = all categories
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  times_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_discount_given: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['merchant_id'] },
    { fields: ['is_active'] },
    { fields: ['valid_from', 'valid_until'] }
  ]
});

// Instance methods
Coupon.prototype.isValid = function() {
  const now = new Date();
  return (
    this.is_active &&
    now >= new Date(this.valid_from) &&
    now <= new Date(this.valid_until) &&
    (this.max_uses === null || this.times_used < this.max_uses)
  );
};

Coupon.prototype.isExpired = function() {
  return new Date() > new Date(this.valid_until);
};

Coupon.prototype.isFullyUsed = function() {
  return this.max_uses !== null && this.times_used >= this.max_uses;
};

Coupon.prototype.calculateDiscount = function(orderTotal) {
  if (!this.isValid()) return 0;

  if (orderTotal < parseFloat(this.min_order_amount)) return 0;

  let discount = 0;

  switch (this.discount_type) {
    case 'percentage':
      discount = (orderTotal * parseFloat(this.discount_value)) / 100;
      if (this.max_discount_amount) {
        discount = Math.min(discount, parseFloat(this.max_discount_amount));
      }
      break;
    case 'fixed_amount':
      discount = Math.min(parseFloat(this.discount_value), orderTotal);
      break;
    case 'free_delivery':
      // This should be handled by the order logic
      discount = 0;
      break;
  }

  return Math.round(discount * 100) / 100;
};

Coupon.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Add computed properties
  values.isValid = this.isValid();
  values.isExpired = this.isExpired();
  values.isFullyUsed = this.isFullyUsed();
  return values;
};

module.exports = Coupon;
