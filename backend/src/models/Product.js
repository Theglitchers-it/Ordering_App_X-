const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  long_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  track_inventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  allergens: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_sold: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'products',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['merchant_id'] },
    { fields: ['category_id'] },
    { fields: ['merchant_id', 'slug'], unique: true },
    { fields: ['is_active'] },
    { fields: ['is_featured'] },
    { fields: ['price'] },
    { fields: ['rating'] }
  ]
});

module.exports = Product;
