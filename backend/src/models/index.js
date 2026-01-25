const User = require('./User');
const Merchant = require('./Merchant');
const Category = require('./Category');
const Product = require('./Product');
const Table = require('./Table');
const Order = require('./Order');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Review = require('./Review');

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

// ============================================
// COUPON ASSOCIATIONS
// ============================================

// Merchant <-> Coupon (merchant-specific coupons)
Merchant.hasMany(Coupon, { foreignKey: 'merchant_id', as: 'coupons' });
Coupon.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// User <-> Coupon (created by)
User.hasMany(Coupon, { foreignKey: 'created_by', as: 'createdCoupons' });
Coupon.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Coupon <-> CouponUsage
Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

// Order <-> CouponUsage
Order.hasMany(CouponUsage, { foreignKey: 'order_id', as: 'couponUsages' });
CouponUsage.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> CouponUsage
User.hasMany(CouponUsage, { foreignKey: 'user_id', as: 'couponUsages' });
CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============================================
// REVIEW ASSOCIATIONS
// ============================================

// Merchant <-> Review
Merchant.hasMany(Review, { foreignKey: 'merchant_id', as: 'reviews' });
Review.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order <-> Review
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

module.exports = {
  User,
  Merchant,
  Category,
  Product,
  Table,
  Order,
  Coupon,
  CouponUsage,
  Review
};
