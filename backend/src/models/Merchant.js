const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    allowNull: false
  },
  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  cover_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address_line1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address_line2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'IT'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  business_hours: {
    type: DataTypes.JSON,
    allowNull: true
  },
  subscription_plan: {
    type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
    defaultValue: 'free',
    allowNull: false
  },
  subscription_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  subscription_started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.1000,
    allowNull: false
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending_approval', 'active', 'suspended', 'blocked'),
    defaultValue: 'pending_approval',
    allowNull: false
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  avg_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'merchants',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['owner_id'] },
    { fields: ['status'] },
    { fields: ['subscription_plan'] },
    { fields: ['latitude', 'longitude'] }
  ]
});

module.exports = Merchant;
