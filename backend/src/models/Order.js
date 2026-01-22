const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
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
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  merchant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  table_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'tables',
      key: 'id'
    }
  },
  table_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  order_type: {
    type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
    defaultValue: 'dine_in',
    allowNull: false
  },
  delivery_address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  delivery_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  service_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  tip_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'stripe', 'paypal', 'apple_pay', 'google_pay'),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  order_status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  preparing_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ready_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  out_for_delivery_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customer_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  kitchen_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  merchant_payout: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['merchant_id'] },
    { fields: ['customer_id'] },
    { fields: ['order_number'], unique: true },
    { fields: ['order_status'] },
    { fields: ['payment_status'] },
    { fields: ['created_at'] },
    { fields: ['order_type'] }
  ]
});

module.exports = Order;
