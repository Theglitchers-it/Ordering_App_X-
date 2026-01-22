const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Table = sequelize.define('Table', {
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
  table_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  table_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    allowNull: false
  },
  qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  floor: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  section: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  current_status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning'),
    defaultValue: 'available'
  }
}, {
  tableName: 'tables',
  timestamps: true,
  indexes: [
    { fields: ['merchant_id'] },
    { fields: ['merchant_id', 'table_number'], unique: true },
    { fields: ['current_status'] }
  ]
});

module.exports = Table;
