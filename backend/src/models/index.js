const User = require('./User');
const Merchant = require('./Merchant');
const Category = require('./Category');
const Product = require('./Product');
const Table = require('./Table');
const Order = require('./Order');

// ============================================
// ASSOCIATIONS / RELATIONSHIPS
// ============================================

// User <-> Merchant
User.hasMany(Merchant, { foreignKey: 'owner_id', as: 'ownedMerchants' });
Merchant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Merchant <-> Category
Merchant.hasMany(Category, { foreignKey: 'merchant_id', as: 'categories' });
Category.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// Merchant <-> Product
Merchant.hasMany(Product, { foreignKey: 'merchant_id', as: 'products' });
Product.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Merchant <-> Table
Merchant.hasMany(Table, { foreignKey: 'merchant_id', as: 'tables' });
Table.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// Merchant <-> Order
Merchant.hasMany(Order, { foreignKey: 'merchant_id', as: 'orders' });
Order.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Table <-> Order
Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

module.exports = {
  User,
  Merchant,
  Category,
  Product,
  Table,
  Order
};
