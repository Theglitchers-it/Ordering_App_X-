const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM(
      'super_admin',
      'admin_ops',
      'merchant_admin',
      'support_agent',
      'finance',
      'logistics',
      'user'
    ),
    defaultValue: 'user',
    allowNull: false
  },
  oauth_provider: {
    type: DataTypes.ENUM('google', 'facebook', 'apple'),
    allowNull: true
  },
  oauth_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'deleted'),
    defaultValue: 'active',
    allowNull: false
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['email'] },
    { fields: ['uuid'] },
    { fields: ['role'] },
    { fields: ['status'] },
    { fields: ['oauth_provider', 'oauth_id'] }
  ]
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.deleted_at;
  return values;
};

// Class methods
User.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

module.exports = User;
