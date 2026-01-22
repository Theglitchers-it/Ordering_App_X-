const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emoji: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { fields: ['merchant_id'] },
    { fields: ['merchant_id', 'slug'], unique: true },
    { fields: ['is_active'] }
  ]
});

module.exports = Category;
