-- ============================================
-- ORDERHUB - COMPLETE MySQL DATABASE SCHEMA
-- Multi-Tenant SaaS Platform for Restaurant Ordering
-- ============================================
--
-- USAGE:
--   1. Create database: CREATE DATABASE orderhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   2. Execute this file: mysql -u root -p orderhub < schema.sql
--
-- ============================================

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS loyalty_transactions;
DROP TABLE IF EXISTS loyalty_points;
DROP TABLE IF EXISTS coupon_usages;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS=1;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin_ops', 'merchant_admin', 'support_agent', 'finance', 'logistics', 'user') NOT NULL DEFAULT 'user',

  -- OAuth/Social Login
  oauth_provider ENUM('google', 'facebook', 'apple') NULL,
  oauth_id VARCHAR(255) NULL,

  -- Verification
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,

  -- Status
  status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',

  -- Security
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45) NULL,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_oauth (oauth_provider, oauth_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MERCHANTS TABLE
-- ============================================
CREATE TABLE merchants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  owner_id BIGINT UNSIGNED NOT NULL,

  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'IT',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Business Hours (JSON: {"monday": {"open": "09:00", "close": "22:00"}})
  business_hours JSON,

  -- Subscription
  subscription_plan ENUM('free', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
  subscription_price DECIMAL(10, 2) DEFAULT 0.00,
  subscription_started_at TIMESTAMP NULL,
  subscription_expires_at TIMESTAMP NULL,

  -- Commission
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.1000,

  -- Settings
  settings JSON,

  -- Status
  status ENUM('pending_approval', 'active', 'suspended', 'blocked') NOT NULL DEFAULT 'pending_approval',
  approved_at TIMESTAMP NULL,
  approved_by BIGINT UNSIGNED NULL,

  -- Cached Stats
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0.00,
  avg_rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_slug (slug),
  INDEX idx_owner (owner_id),
  INDEX idx_status (status),
  INDEX idx_subscription (subscription_plan, subscription_expires_at),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,

  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  image_url VARCHAR(500),

  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_merchant_slug (merchant_id, slug),
  INDEX idx_merchant (merchant_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,

  -- Product Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NULL,
  cost DECIMAL(10, 2) NULL,

  -- Media
  image_url VARCHAR(500),
  images JSON,

  -- Inventory
  sku VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  track_inventory BOOLEAN DEFAULT FALSE,
  low_stock_threshold INT DEFAULT 5,

  -- Options & Variants
  options JSON,

  -- Metadata
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  preparation_time INT DEFAULT 15,
  calories INT NULL,
  allergens VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  sort_order INT DEFAULT 0,

  -- Stats
  total_sold INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0.00,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  UNIQUE KEY unique_merchant_slug (merchant_id, slug),
  INDEX idx_merchant (merchant_id),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured),
  INDEX idx_price (price),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES TABLE
-- ============================================
CREATE TABLE tables (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,

  table_number VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  capacity INT NOT NULL DEFAULT 4,

  qr_code_url VARCHAR(500),
  qr_code_data TEXT,

  floor VARCHAR(50),
  section VARCHAR(100),

  is_active BOOLEAN DEFAULT TRUE,
  current_status ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_merchant_table (merchant_id, table_number),
  INDEX idx_merchant (merchant_id),
  INDEX idx_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  order_number VARCHAR(50) UNIQUE NOT NULL,

  merchant_id BIGINT UNSIGNED NOT NULL,

  customer_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),

  table_id BIGINT UNSIGNED NULL,
  table_number VARCHAR(50),

  order_type ENUM('dine_in', 'takeaway', 'delivery') NOT NULL DEFAULT 'dine_in',

  delivery_address JSON,
  delivery_instructions TEXT,
  delivery_time TIMESTAMP NULL,
  driver_id BIGINT UNSIGNED NULL,

  items JSON NOT NULL,

  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
  service_fee DECIMAL(10, 2) DEFAULT 0.00,
  tip_amount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,

  payment_method ENUM('cash', 'card', 'stripe', 'paypal', 'apple_pay', 'google_pay') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  payment_intent_id VARCHAR(255),

  order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',

  confirmed_at TIMESTAMP NULL,
  preparing_at TIMESTAMP NULL,
  ready_at TIMESTAMP NULL,
  out_for_delivery_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason TEXT,

  customer_notes TEXT,
  kitchen_notes TEXT,
  admin_notes TEXT,

  commission_rate DECIMAL(5, 4) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  merchant_payout DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,

  INDEX idx_merchant (merchant_id),
  INDEX idx_customer (customer_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (order_status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at),
  INDEX idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,

  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,

  options JSON,
  special_instructions TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,

  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),

  order_id BIGINT UNSIGNED NOT NULL,
  merchant_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,

  transaction_type ENUM('payment', 'refund', 'payout', 'commission') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  payment_method VARCHAR(50),
  gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),

  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',

  description TEXT,
  metadata JSON,

  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_order (order_id),
  INDEX idx_merchant (merchant_id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_gateway (gateway, gateway_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYOUTS TABLE
-- ============================================
CREATE TABLE payouts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),

  merchant_id BIGINT UNSIGNED NOT NULL,

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  order_count INT NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,

  bank_account_name VARCHAR(255),
  bank_account_iban VARCHAR(100),
  bank_account_swift VARCHAR(20),

  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',

  payout_method VARCHAR(50),
  gateway_payout_id VARCHAR(255),

  approved_by BIGINT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,
  processed_at TIMESTAMP NULL,

  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_merchant (merchant_id),
  INDEX idx_status (status),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NULL,

  code VARCHAR(50) UNIQUE NOT NULL,

  discount_type ENUM('percentage', 'fixed_amount', 'free_delivery') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2) NULL,

  min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
  max_uses INT NULL,
  max_uses_per_user INT DEFAULT 1,

  applicable_products JSON,
  applicable_categories JSON,

  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,

  times_used INT DEFAULT 0,
  total_discount_given DECIMAL(12, 2) DEFAULT 0.00,

  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_code (code),
  INDEX idx_merchant (merchant_id),
  INDEX idx_active (is_active),
  INDEX idx_validity (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COUPON_USAGES TABLE
-- ============================================
CREATE TABLE coupon_usages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,

  discount_amount DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_coupon (coupon_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LOYALTY_POINTS TABLE
-- ============================================
CREATE TABLE loyalty_points (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  merchant_id BIGINT UNSIGNED NULL,

  points INT NOT NULL DEFAULT 0,
  tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',

  lifetime_points_earned INT DEFAULT 0,
  lifetime_points_redeemed INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_user_merchant (user_id, merchant_id),
  INDEX idx_user (user_id),
  INDEX idx_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LOYALTY_TRANSACTIONS TABLE
-- ============================================
CREATE TABLE loyalty_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loyalty_points_id BIGINT UNSIGNED NOT NULL,

  transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
  points INT NOT NULL,

  order_id BIGINT UNSIGNED NULL,
  description TEXT,
  adjusted_by BIGINT UNSIGNED NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (loyalty_points_id) REFERENCES loyalty_points(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_loyalty (loyalty_points_id),
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  merchant_id BIGINT UNSIGNED NULL,
  product_id BIGINT UNSIGNED NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,

  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,

  images JSON,

  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,

  merchant_response TEXT,
  merchant_responded_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_merchant (merchant_id),
  INDEX idx_product (product_id),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  type ENUM('order_status', 'payment', 'promotion', 'system', 'review') NOT NULL,

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),

  order_id BIGINT UNSIGNED NULL,

  sent_via_push BOOLEAN DEFAULT FALSE,
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_sms BOOLEAN DEFAULT FALSE,

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  user_id BIGINT UNSIGNED NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(50),

  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),

  old_values JSON,
  new_values JSON,

  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_user (user_id),
  INDEX idx_resource (resource, resource_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  token_hash VARCHAR(255) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,

  device_name VARCHAR(255),
  device_type ENUM('web', 'mobile', 'tablet', 'desktop') DEFAULT 'web',
  ip_address VARCHAR(45),
  user_agent TEXT,

  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_token (token_hash),
  INDEX idx_refresh (refresh_token_hash),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMAIL_QUEUE TABLE
-- ============================================
CREATE TABLE email_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),

  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  template_name VARCHAR(100),
  template_data JSON,

  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,

  error_message TEXT,
  priority INT DEFAULT 5,

  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- END OF SCHEMA
-- ============================================
