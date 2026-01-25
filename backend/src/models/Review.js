const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'products',
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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  merchant_response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  merchant_responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['merchant_id'] },
    { fields: ['product_id'] },
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['rating'] }
  ]
});

// Instance methods
Review.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = Review;
