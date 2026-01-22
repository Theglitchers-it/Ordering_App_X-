# 🚀 ORDERHUB BACKEND - PIANO COMPLETO
## MySQL + Node.js/Express + WebSocket + Stripe

---

## 📊 INDICE

1. [Schema Database MySQL](#1-schema-database-mysql)
2. [Architettura Backend](#2-architettura-backend)
3. [API Endpoints](#3-api-endpoints)
4. [Autenticazione JWT](#4-autenticazione-jwt)
5. [Payment Integration (Stripe)](#5-payment-integration-stripe)
6. [Real-Time Features (WebSocket)](#6-real-time-features-websocket)
7. [Notifiche (Email/SMS)](#7-notifiche-emailsms)
8. [Stack Tecnologico](#8-stack-tecnologico)
9. [Roadmap Implementazione](#9-roadmap-implementazione)
10. [Costi e Scalabilità](#10-costi-e-scalabilità)

---

## 1. SCHEMA DATABASE MYSQL

### 1.1 Multi-Tenancy Strategy

**Approccio:** **Shared Database + Tenant Isolation** (tenant_id in ogni tabella)

**Vantaggi:**
- ✅ Più economico e scalabile
- ✅ Backup centralizzato
- ✅ Facile aggiungere nuovi merchant
- ✅ Query cross-tenant per super admin

**Alternative considerate:**
- ❌ Database separato per tenant (troppo costoso)
- ❌ Schema separato per tenant (complesso da gestire)

---

### 1.2 Schema Completo

```sql
-- ============================================
-- TABELLA: users
-- Gestisce tutti gli utenti (clienti, admin, merchant)
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

  -- Verifica account
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
-- TABELLA: merchants
-- Ristoratori/Commercianti sulla piattaforma
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

  -- Business Hours (JSON format: {"monday": {"open": "09:00", "close": "22:00"}})
  business_hours JSON,

  -- Subscription
  subscription_plan ENUM('free', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
  subscription_price DECIMAL(10, 2) DEFAULT 0.00,
  subscription_started_at TIMESTAMP NULL,
  subscription_expires_at TIMESTAMP NULL,

  -- Commission
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.1000, -- 10%

  -- Settings
  settings JSON, -- {"primaryColor": "#FF5733", "enableTakeaway": true, ...}

  -- Status
  status ENUM('pending_approval', 'active', 'suspended', 'blocked') NOT NULL DEFAULT 'pending_approval',
  approved_at TIMESTAMP NULL,
  approved_by BIGINT UNSIGNED NULL,

  -- Stats (cached for performance)
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
-- TABELLA: categories
-- Categorie prodotti (pizza, pasta, etc.)
-- ============================================
CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,

  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  image_url VARCHAR(500),

  -- Ordinamento
  sort_order INT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_merchant_slug (merchant_id, slug),
  INDEX idx_merchant (merchant_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: products
-- Prodotti/Menu items
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
  original_price DECIMAL(10, 2) NULL, -- Per mostrare sconti
  cost DECIMAL(10, 2) NULL, -- Costo di produzione (per calcolare margine)

  -- Media
  image_url VARCHAR(500),
  images JSON, -- Array di immagini aggiuntive

  -- Inventory
  sku VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  track_inventory BOOLEAN DEFAULT FALSE,
  low_stock_threshold INT DEFAULT 5,

  -- Options & Variants (JSON: {"size": ["S", "M", "L"], "toppings": ["cheese", "bacon"]})
  options JSON,

  -- Metadata
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  preparation_time INT DEFAULT 15, -- minuti
  calories INT NULL,
  allergens VARCHAR(255), -- "gluten, dairy, nuts"

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Ordinamento
  sort_order INT DEFAULT 0,

  -- Stats
  total_sold INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0.00,

  -- Metadata
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
-- TABELLA: tables
-- Tavoli del ristorante
-- ============================================
CREATE TABLE tables (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,

  table_number VARCHAR(50) NOT NULL,
  table_name VARCHAR(100), -- Es: "Tavolo Romantico", "Saletta VIP"

  -- Capacity
  capacity INT NOT NULL DEFAULT 4,

  -- QR Code
  qr_code_url VARCHAR(500),
  qr_code_data TEXT, -- Base64 encoded QR

  -- Location
  floor VARCHAR(50), -- Piano/Sala
  section VARCHAR(100), -- Sezione

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  current_status ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_merchant_table (merchant_id, table_number),
  INDEX idx_merchant (merchant_id),
  INDEX idx_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: orders
-- Ordini dei clienti
-- ============================================
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  order_number VARCHAR(50) UNIQUE NOT NULL,

  -- Tenant
  merchant_id BIGINT UNSIGNED NOT NULL,

  -- Customer
  customer_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),

  -- Table (for dine-in)
  table_id BIGINT UNSIGNED NULL,
  table_number VARCHAR(50),

  -- Order Type
  order_type ENUM('dine_in', 'takeaway', 'delivery') NOT NULL DEFAULT 'dine_in',

  -- Delivery (if applicable)
  delivery_address JSON, -- {"line1", "city", "postal_code", "lat", "lng"}
  delivery_instructions TEXT,
  delivery_time TIMESTAMP NULL,
  driver_id BIGINT UNSIGNED NULL,

  -- Items (denormalized for performance)
  items JSON NOT NULL, -- [{"product_id": 1, "name": "Pizza", "quantity": 2, "price": 8.50, "options": {...}}]

  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
  service_fee DECIMAL(10, 2) DEFAULT 0.00,
  tip_amount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,

  -- Payment
  payment_method ENUM('cash', 'card', 'stripe', 'paypal', 'apple_pay', 'google_pay') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  payment_intent_id VARCHAR(255), -- Stripe Payment Intent ID

  -- Status
  order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',

  -- Status Timestamps
  confirmed_at TIMESTAMP NULL,
  preparing_at TIMESTAMP NULL,
  ready_at TIMESTAMP NULL,
  out_for_delivery_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason TEXT,

  -- Notes
  customer_notes TEXT,
  kitchen_notes TEXT,
  admin_notes TEXT,

  -- Commission & Revenue
  commission_rate DECIMAL(5, 4) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  merchant_payout DECIMAL(10, 2) NOT NULL,

  -- Metadata
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
-- TABELLA: order_items
-- Singoli prodotti dell'ordine (normalizzato per analytics)
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

  -- Options (JSON: {"size": "L", "toppings": ["cheese", "bacon"]})
  options JSON,

  -- Notes
  special_instructions TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,

  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: transactions
-- Transazioni di pagamento
-- ============================================
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),

  -- Relation
  order_id BIGINT UNSIGNED NOT NULL,
  merchant_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,

  -- Transaction
  transaction_type ENUM('payment', 'refund', 'payout', 'commission') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Payment Gateway
  payment_method VARCHAR(50),
  gateway VARCHAR(50), -- 'stripe', 'paypal'
  gateway_transaction_id VARCHAR(255),

  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',

  -- Details
  description TEXT,
  metadata JSON,

  -- Timestamps
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
-- TABELLA: payouts
-- Pagamenti ai merchant
-- ============================================
CREATE TABLE payouts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),

  merchant_id BIGINT UNSIGNED NOT NULL,

  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Orders included
  order_count INT NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,

  -- Bank Details
  bank_account_name VARCHAR(255),
  bank_account_iban VARCHAR(100),
  bank_account_swift VARCHAR(20),

  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',

  -- Gateway
  payout_method VARCHAR(50), -- 'bank_transfer', 'stripe_connect', 'paypal'
  gateway_payout_id VARCHAR(255),

  -- Approval
  approved_by BIGINT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,

  -- Processing
  processed_at TIMESTAMP NULL,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_merchant (merchant_id),
  INDEX idx_status (status),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: coupons
-- Coupon e promozioni
-- ============================================
CREATE TABLE coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NULL, -- NULL = platform-wide coupon

  -- Code
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Discount
  discount_type ENUM('percentage', 'fixed_amount', 'free_delivery') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2) NULL, -- Per percentage discount

  -- Conditions
  min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
  max_uses INT NULL,
  max_uses_per_user INT DEFAULT 1,

  -- Applicability
  applicable_products JSON, -- Array di product_ids
  applicable_categories JSON, -- Array di category_ids

  -- Validity
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Stats
  times_used INT DEFAULT 0,
  total_discount_given DECIMAL(12, 2) DEFAULT 0.00,

  -- Metadata
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
-- TABELLA: coupon_usages
-- Traccia utilizzo coupon
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
-- TABELLA: loyalty_points
-- Sistema fedeltà punti
-- ============================================
CREATE TABLE loyalty_points (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  merchant_id BIGINT UNSIGNED NULL, -- NULL = platform points

  -- Points
  points INT NOT NULL DEFAULT 0,

  -- Tier (Bronze, Silver, Gold, Platinum)
  tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',

  -- Lifetime stats
  lifetime_points_earned INT DEFAULT 0,
  lifetime_points_redeemed INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

  UNIQUE KEY unique_user_merchant (user_id, merchant_id),
  INDEX idx_user (user_id),
  INDEX idx_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: loyalty_transactions
-- Storico transazioni punti
-- ============================================
CREATE TABLE loyalty_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loyalty_points_id BIGINT UNSIGNED NOT NULL,

  -- Transaction
  transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
  points INT NOT NULL,

  -- Reference
  order_id BIGINT UNSIGNED NULL,
  description TEXT,

  -- Admin adjustment
  adjusted_by BIGINT UNSIGNED NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (loyalty_points_id) REFERENCES loyalty_points(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_loyalty (loyalty_points_id),
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: reviews
-- Recensioni prodotti/merchant
-- ============================================
CREATE TABLE reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Review target
  merchant_id BIGINT UNSIGNED NULL,
  product_id BIGINT UNSIGNED NULL,
  order_id BIGINT UNSIGNED NOT NULL,

  -- Reviewer
  user_id BIGINT UNSIGNED NOT NULL,

  -- Review
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,

  -- Media
  images JSON,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE, -- Ha effettivamente ordinato?
  is_approved BOOLEAN DEFAULT TRUE,

  -- Response
  merchant_response TEXT,
  merchant_responded_at TIMESTAMP NULL,

  -- Metadata
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
-- TABELLA: notifications
-- Notifiche agli utenti
-- ============================================
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  -- Type
  type ENUM('order_status', 'payment', 'promotion', 'system', 'review') NOT NULL,

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Action
  action_url VARCHAR(500),

  -- Related
  order_id BIGINT UNSIGNED NULL,

  -- Channel
  sent_via_push BOOLEAN DEFAULT FALSE,
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_sms BOOLEAN DEFAULT FALSE,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: audit_logs
-- Audit trail per compliance
-- ============================================
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Actor
  user_id BIGINT UNSIGNED NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(50),

  -- Action
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  resource VARCHAR(100) NOT NULL, -- 'orders', 'products', etc.
  resource_id VARCHAR(100),

  -- Changes
  old_values JSON,
  new_values JSON,

  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_user (user_id),
  INDEX idx_resource (resource, resource_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: sessions
-- Gestione sessioni JWT
-- ============================================
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  -- Token
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,

  -- Device
  device_name VARCHAR(255),
  device_type ENUM('web', 'mobile', 'tablet', 'desktop') DEFAULT 'web',
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Validity
  expires_at TIMESTAMP NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_token (token_hash),
  INDEX idx_refresh (refresh_token_hash),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELLA: email_queue
-- Queue per email da inviare
-- ============================================
CREATE TABLE email_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Recipient
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),

  -- Email
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- Template
  template_name VARCHAR(100),
  template_data JSON,

  -- Status
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,

  -- Error
  error_message TEXT,

  -- Priority
  priority INT DEFAULT 5, -- 1=highest, 10=lowest

  -- Timestamps
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. ARCHITETTURA BACKEND

### 2.1 Stack Tecnologico Backend

```
Backend Framework:  Node.js 20+ + Express.js 4.x
Database:           MySQL 8.0+
ORM:                Sequelize 6.x (o Prisma per type safety)
Authentication:     JWT + bcrypt
Payment:            Stripe SDK
Real-Time:          Socket.IO
File Storage:       AWS S3 / Cloudinary
Email:              SendGrid / Amazon SES
SMS:                Twilio
Push Notifications: Firebase Cloud Messaging (FCM)
Caching:            Redis (optional, for performance)
Queue:              Bull + Redis (for background jobs)
API Docs:           Swagger / OpenAPI
Monitoring:         Sentry (errors) + Winston (logging)
```

### 2.2 Struttura Progetto Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL connection
│   │   ├── stripe.js            # Stripe config
│   │   ├── email.js             # Email provider
│   │   └── sockets.js           # Socket.IO setup
│   │
│   ├── models/                  # Sequelize models
│   │   ├── User.js
│   │   ├── Merchant.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── ...
│   │
│   ├── controllers/             # Route handlers
│   │   ├── auth.controller.js
│   │   ├── orders.controller.js
│   │   ├── products.controller.js
│   │   ├── merchants.controller.js
│   │   └── ...
│   │
│   ├── routes/                  # Express routes
│   │   ├── auth.routes.js
│   │   ├── orders.routes.js
│   │   ├── products.routes.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── rbac.middleware.js   # Role permissions
│   │   ├── validate.middleware.js # Input validation
│   │   ├── rateLimiter.middleware.js
│   │   └── errorHandler.middleware.js
│   │
│   ├── services/
│   │   ├── stripe.service.js    # Payment processing
│   │   ├── email.service.js     # Email sending
│   │   ├── sms.service.js       # SMS via Twilio
│   │   ├── notification.service.js
│   │   └── qrcode.service.js    # QR generation
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── jobs/                    # Background jobs
│   │   ├── emailQueue.job.js
│   │   ├── payoutProcessor.job.js
│   │   └── analyticsCalculator.job.js
│   │
│   ├── sockets/                 # WebSocket handlers
│   │   ├── orderTracking.socket.js
│   │   └── notifications.socket.js
│   │
│   ├── migrations/              # DB migrations
│   └── seeders/                 # DB seeders
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── package.json
├── server.js                    # Entry point
└── README.md
```

---

## 3. API ENDPOINTS

### 3.1 Authentication & Users

```
POST   /api/auth/register          # Registrazione utente
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/refresh-token     # Rinnova JWT
POST   /api/auth/forgot-password   # Reset password
POST   /api/auth/reset-password    # Conferma reset
POST   /api/auth/verify-email      # Verifica email
POST   /api/auth/resend-verification

GET    /api/users/me               # Profilo utente corrente
PATCH  /api/users/me               # Aggiorna profilo
GET    /api/users/:id              # Profilo pubblico utente
```

### 3.2 Merchants

```
# Public
GET    /api/merchants              # Lista merchant attivi
GET    /api/merchants/:slug        # Dettaglio merchant
GET    /api/merchants/:slug/menu   # Menu pubblico

# Merchant Admin
POST   /api/merchants              # Registra nuovo merchant
GET    /api/merchants/me           # Il mio merchant
PATCH  /api/merchants/me           # Aggiorna merchant
GET    /api/merchants/me/stats     # Statistiche

# Super Admin
GET    /api/admin/merchants        # Tutti i merchant
PATCH  /api/admin/merchants/:id/approve
PATCH  /api/admin/merchants/:id/block
DELETE /api/admin/merchants/:id
```

### 3.3 Products / Menu

```
# Public
GET    /api/merchants/:merchantId/products
GET    /api/products/:id

# Merchant Admin
POST   /api/products               # Crea prodotto
PATCH  /api/products/:id           # Aggiorna prodotto
DELETE /api/products/:id           # Elimina prodotto
POST   /api/products/bulk-import   # Import CSV
PATCH  /api/products/:id/stock     # Aggiorna stock
```

### 3.4 Categories

```
GET    /api/merchants/:merchantId/categories
POST   /api/categories             # Crea categoria
PATCH  /api/categories/:id
DELETE /api/categories/:id
PATCH  /api/categories/reorder     # Riordina
```

### 3.5 Orders

```
# Customer
POST   /api/orders                 # Crea ordine
GET    /api/orders                 # I miei ordini
GET    /api/orders/:id             # Dettaglio ordine
PATCH  /api/orders/:id/cancel      # Annulla ordine

# Merchant
GET    /api/merchants/me/orders    # Ordini del merchant
PATCH  /api/orders/:id/status      # Aggiorna stato
POST   /api/orders/:id/refund      # Rimborso

# Admin
GET    /api/admin/orders           # Tutti gli ordini
PATCH  /api/admin/orders/:id       # Admin override
POST   /api/admin/orders/bulk-update
POST   /api/admin/orders/export    # Export CSV
```

### 3.6 Tables & QR Codes

```
GET    /api/merchants/me/tables
POST   /api/tables                 # Crea tavolo
PATCH  /api/tables/:id
DELETE /api/tables/:id
POST   /api/tables/:id/regenerate-qr
GET    /api/tables/:id/qr-code     # Download QR
PATCH  /api/tables/:id/status      # Cambia stato (occupied/available)
```

### 3.7 Payments (Stripe)

```
POST   /api/payments/create-intent       # Stripe PaymentIntent
POST   /api/payments/confirm             # Conferma pagamento
POST   /api/payments/webhook             # Stripe webhook
GET    /api/payments/:orderId/status
POST   /api/payments/:orderId/refund
```

### 3.8 Coupons & Discounts

```
GET    /api/coupons                      # Coupon disponibili
POST   /api/coupons/validate             # Valida codice
POST   /api/coupons                      # Crea coupon (admin)
PATCH  /api/coupons/:id
DELETE /api/coupons/:id
GET    /api/coupons/:id/usages
```

### 3.9 Loyalty Points

```
GET    /api/loyalty/me                   # I miei punti
GET    /api/loyalty/me/transactions      # Storico
POST   /api/loyalty/redeem               # Riscatta punti
POST   /api/admin/loyalty/adjust         # Admin adjust
```

### 3.10 Reviews

```
GET    /api/merchants/:merchantId/reviews
GET    /api/products/:productId/reviews
POST   /api/reviews                      # Crea review
PATCH  /api/reviews/:id                  # Aggiorna
DELETE /api/reviews/:id
POST   /api/reviews/:id/merchant-response
```

### 3.11 Analytics & Reports

```
# Merchant
GET    /api/analytics/dashboard          # Dashboard stats
GET    /api/analytics/sales              # Vendite
GET    /api/analytics/products           # Top prodotti
GET    /api/analytics/revenue            # Revenue trend
POST   /api/analytics/export             # Export dati

# Super Admin
GET    /api/admin/analytics/platform     # Platform-wide stats
GET    /api/admin/analytics/merchants    # Per-merchant stats
GET    /api/admin/analytics/revenue      # Platform revenue
```

### 3.12 Notifications

```
GET    /api/notifications                # Tutte le notifiche
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/mark-all-read
DELETE /api/notifications/:id
```

### 3.13 File Uploads

```
POST   /api/uploads/image                # Upload immagine
POST   /api/uploads/logo                 # Logo merchant
POST   /api/uploads/product-images
DELETE /api/uploads/:id
```

---

## 4. AUTENTICAZIONE JWT

### 4.1 Strategia JWT

**Access Token:** 15 minuti (breve durata per sicurezza)
**Refresh Token:** 7 giorni (stored in database)

**Flow:**
1. User fa login → Riceve `accessToken` (15min) + `refreshToken` (7d)
2. Frontend salva `accessToken` in memoria (non localStorage per sicurezza!)
3. `refreshToken` salvato in httpOnly cookie
4. Quando `accessToken` scade → Chiama `/auth/refresh-token` con `refreshToken`
5. Backend valida `refreshToken` → Emette nuovo `accessToken`

### 4.2 Struttura JWT Payload

```javascript
{
  "sub": "user_uuid",           // User ID
  "email": "user@example.com",
  "role": "merchant_admin",
  "merchantId": "merchant_123", // Se applicabile
  "iat": 1234567890,
  "exp": 1234568790
}
```

### 4.3 Middleware Auth

```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Estrai token dall'header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Carica user dal database
    const user = await User.findByPk(decoded.sub);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Aggiungi user a req
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### 4.4 RBAC Middleware

```javascript
// middleware/rbac.middleware.js
const { hasPermission } = require('../utils/rbac');

const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = hasPermission(req.userRole, resource, action);

    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You don't have permission to ${action} ${resource}`
      });
    }

    next();
  };
};

// Usage:
// router.post('/products', authMiddleware, checkPermission('products', 'create'), createProduct);
```

---

## 5. PAYMENT INTEGRATION (STRIPE)

### 5.1 Setup Stripe

```bash
npm install stripe
```

```javascript
// config/stripe.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

### 5.2 Payment Flow

**1. Frontend crea ordine:**
```javascript
POST /api/orders
{
  "merchantId": 123,
  "tableNumber": "T1",
  "items": [...],
  "paymentMethod": "stripe"
}
```

**2. Backend crea Payment Intent:**
```javascript
// services/stripe.service.js
const createPaymentIntent = async (order) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // Stripe usa centesimi
    currency: 'eur',
    metadata: {
      orderId: order.id,
      merchantId: order.merchant_id
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Salva payment_intent_id nell'ordine
  await order.update({ payment_intent_id: paymentIntent.id });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
};
```

**3. Frontend conferma pagamento con Stripe.js:**
```javascript
const { error } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: 'https://app.com/order-confirmation'
  }
});
```

**4. Stripe webhook notifica il backend:**
```javascript
// controllers/payments.controller.js
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (paymentIntent) => {
  const order = await Order.findOne({
    where: { payment_intent_id: paymentIntent.id }
  });

  if (order) {
    await order.update({
      payment_status: 'paid',
      paid_at: new Date(),
      order_status: 'confirmed'
    });

    // Crea transaction record
    await Transaction.create({
      order_id: order.id,
      merchant_id: order.merchant_id,
      customer_id: order.customer_id,
      transaction_type: 'payment',
      amount: order.total,
      gateway: 'stripe',
      gateway_transaction_id: paymentIntent.id,
      status: 'completed'
    });

    // Invia notifica al merchant
    await notificationService.notifyNewOrder(order);

    // Invia email conferma al cliente
    await emailService.sendOrderConfirmation(order);
  }
};
```

### 5.3 Refund Flow

```javascript
const processRefund = async (orderId, amount, reason) => {
  const order = await Order.findByPk(orderId);

  if (!order.payment_intent_id) {
    throw new Error('No payment to refund');
  }

  // Crea refund su Stripe
  const refund = await stripe.refunds.create({
    payment_intent: order.payment_intent_id,
    amount: amount ? Math.round(amount * 100) : undefined, // Partial refund
    reason: reason || 'requested_by_customer',
    metadata: {
      orderId: order.id
    }
  });

  // Aggiorna ordine
  const isFullRefund = !amount || amount >= order.total;
  await order.update({
    payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
    order_status: 'cancelled'
  });

  // Crea transaction
  await Transaction.create({
    order_id: order.id,
    merchant_id: order.merchant_id,
    customer_id: order.customer_id,
    transaction_type: 'refund',
    amount: amount || order.total,
    gateway: 'stripe',
    gateway_transaction_id: refund.id,
    status: 'completed'
  });

  return refund;
};
```

---

## 6. REAL-TIME FEATURES (WebSocket)

### 6.1 Setup Socket.IO

```bash
npm install socket.io
```

```javascript
// config/sockets.js
const { Server } = require('socket.io');

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // Middleware: Auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      socket.merchantId = decoded.merchantId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join merchant room (if merchant)
    if (socket.merchantId) {
      socket.join(`merchant:${socket.merchantId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
```

### 6.2 Order Status Updates

```javascript
// sockets/orderTracking.socket.js

// Quando merchant aggiorna stato ordine:
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findByPk(orderId);
  await order.update({ order_status: newStatus });

  // Emit real-time update al cliente
  io.to(`user:${order.customer_id}`).emit('order:status-updated', {
    orderId: order.id,
    status: newStatus,
    timestamp: new Date()
  });

  // Emit a merchant dashboard
  io.to(`merchant:${order.merchant_id}`).emit('order:updated', {
    orderId: order.id,
    status: newStatus
  });
};
```

### 6.3 Live Notifications

```javascript
// services/notification.service.js

const sendNotification = async (userId, notification) => {
  // Salva in DB
  const notif = await Notification.create({
    user_id: userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    order_id: notification.orderId
  });

  // Emit real-time via WebSocket
  io.to(`user:${userId}`).emit('notification:new', {
    id: notif.id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    timestamp: notif.created_at
  });

  // Send push notification (Firebase)
  if (notification.sendPush) {
    await pushNotificationService.send(userId, notification);
  }

  // Send email (if critical)
  if (notification.sendEmail) {
    await emailService.send(userId, notification);
  }
};
```

### 6.4 Merchant Dashboard Live Updates

```javascript
// Quando arriva nuovo ordine:
io.to(`merchant:${merchantId}`).emit('order:new', {
  order: orderData,
  timestamp: new Date()
});

// Quando cliente visualizza menu:
io.to(`merchant:${merchantId}`).emit('analytics:live-visitor', {
  merchantId,
  visitorCount: activeVisitors
});
```

---

## 7. NOTIFICHE (Email/SMS)

### 7.1 Email Service (SendGrid)

```bash
npm install @sendgrid/mail
```

```javascript
// services/email.service.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderConfirmation = async (order) => {
  const msg = {
    to: order.customer_email,
    from: process.env.FROM_EMAIL,
    subject: `Ordine #${order.order_number} Confermato`,
    templateId: 'd-xxxxxxxxxxxxx', // SendGrid template ID
    dynamicTemplateData: {
      orderNumber: order.order_number,
      items: order.items,
      total: order.total,
      merchantName: order.merchant.business_name
    }
  };

  await sgMail.send(msg);
};

const sendOrderStatusUpdate = async (order, newStatus) => {
  const statusMessages = {
    confirmed: 'Il tuo ordine è stato confermato!',
    preparing: 'Il tuo ordine è in preparazione',
    ready: 'Il tuo ordine è pronto!',
    delivered: 'Il tuo ordine è stato consegnato'
  };

  await sgMail.send({
    to: order.customer_email,
    from: process.env.FROM_EMAIL,
    subject: `Ordine #${order.order_number} - ${statusMessages[newStatus]}`,
    templateId: 'd-yyyyyyyyyyy',
    dynamicTemplateData: {
      orderNumber: order.order_number,
      status: newStatus,
      statusMessage: statusMessages[newStatus]
    }
  });
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate
};
```

### 7.2 SMS Service (Twilio)

```bash
npm install twilio
```

```javascript
// services/sms.service.js
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOrderReadySMS = async (order) => {
  if (!order.customer_phone) return;

  await client.messages.create({
    body: `🍕 Il tuo ordine #${order.order_number} è pronto! Vieni a ritirarlo.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: order.customer_phone
  });
};

const sendDeliveryETA = async (order, etaMinutes) => {
  await client.messages.create({
    body: `🚗 Il tuo ordine #${order.order_number} arriverà tra ${etaMinutes} minuti!`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: order.customer_phone
  });
};
```

---

## 8. STACK TECNOLOGICO

### 8.1 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "mysql2": "^3.6.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "socket.io": "^4.6.1",
    "stripe": "^14.10.0",
    "@sendgrid/mail": "^8.1.0",
    "twilio": "^4.19.0",
    "qrcode": "^1.5.3",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1508.0",
    "bull": "^4.11.5",
    "ioredis": "^5.3.2",
    "winston": "^3.11.0",
    "@sentry/node": "^7.91.0",
    "compression": "^1.7.4",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.2"
  }
}
```

### 8.2 Environment Variables (.env)

```bash
# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://app.orderhub.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=orderhub
DB_USER=orderhub_user
DB_PASSWORD=strong_password

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@orderhub.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=orderhub-uploads
AWS_REGION=eu-west-1

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=orderhub-prod
FIREBASE_PRIVATE_KEY=xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@orderhub.iam.gserviceaccount.com
```

---

## 9. ROADMAP IMPLEMENTAZIONE

### FASE 1: FONDAMENTA (2-3 settimane)

**Week 1: Setup & Database**
- ✅ Setup progetto Node.js/Express
- ✅ Configurazione MySQL
- ✅ Creazione schema database (migrations)
- ✅ Seeders per dati di test
- ✅ Setup Sequelize models

**Week 2: Autenticazione & Users**
- ✅ Sistema JWT
- ✅ Registrazione/Login
- ✅ RBAC middleware
- ✅ Password reset flow
- ✅ Email verification

**Week 3: Core Entities**
- ✅ Merchants CRUD
- ✅ Products/Menu CRUD
- ✅ Categories CRUD
- ✅ Tables & QR codes

---

### FASE 2: CORE FEATURES (3-4 settimane)

**Week 4: Orders System**
- ✅ Create order flow
- ✅ Order status management
- ✅ Multi-tenancy isolation
- ✅ Order validation

**Week 5: Payments (Stripe)**
- ✅ Payment Intent creation
- ✅ Webhook handling
- ✅ Refund system
- ✅ Transaction tracking

**Week 6: Real-Time (WebSocket)**
- ✅ Socket.IO setup
- ✅ Order tracking real-time
- ✅ Notifications real-time
- ✅ Merchant dashboard live updates

**Week 7: Notifications**
- ✅ Email service (SendGrid)
- ✅ SMS service (Twilio)
- ✅ Email templates
- ✅ Notification preferences

---

### FASE 3: ADVANCED FEATURES (2-3 settimane)

**Week 8: Coupons & Loyalty**
- ✅ Coupon system
- ✅ Loyalty points
- ✅ Redemption flow

**Week 9: Reviews & Analytics**
- ✅ Reviews CRUD
- ✅ Rating calculation
- ✅ Analytics endpoints
- ✅ Reports generation

**Week 10: Admin Features**
- ✅ Super admin dashboard
- ✅ Merchant management
- ✅ Platform analytics
- ✅ Payouts system

---

### FASE 4: POLISH & DEPLOY (2 settimane)

**Week 11: Testing & Security**
- ✅ Unit tests
- ✅ Integration tests
- ✅ Security audit
- ✅ Rate limiting
- ✅ Input validation

**Week 12: Deploy & Monitoring**
- ✅ Production deployment
- ✅ Monitoring setup (Sentry)
- ✅ Logging (Winston)
- ✅ API documentation (Swagger)
- ✅ Performance optimization

---

### TOTALE: 10-12 settimane (2.5-3 mesi)

---

## 10. COSTI E SCALABILITÀ

### 10.1 Costi Mensili Stimati

**Infrastruttura (Startup - 100 ordini/giorno):**
```
VPS/Cloud Server (2GB RAM):     $10-20/mese
MySQL Database (Managed):        $15/mese
Redis (optional):                $10/mese
AWS S3 (Storage):                $5/mese
Domain + SSL:                    $2/mese
-------------------------------------------
TOTALE INFRA:                    ~$42-52/mese
```

**Servizi SaaS:**
```
Stripe (2.9% + $0.30 per transaction)
SendGrid (Free tier: 100 email/day):    $0-15/mese
Twilio SMS:                              ~$0.01/SMS
Firebase Push (Free tier):               $0
Sentry Error Tracking (Free tier):       $0
-------------------------------------------
TOTALE SERVIZI:                          ~$15-30/mese
```

**TOTALE INIZIALE: ~$60-80/mese**

---

**Scale-up (1000 ordini/giorno):**
```
Cloud Server (4GB RAM):          $40/mese
Database (Managed + Replica):    $50/mese
Redis:                           $20/mese
S3:                              $10/mese
CDN (Cloudflare):                $0-20/mese
SendGrid:                        $50/mese
Twilio SMS:                      $50/mese
-------------------------------------------
TOTALE:                          ~$220-240/mese
```

---

### 10.2 Scalabilità

**Vertical Scaling (fino a 5K ordini/giorno):**
- Aumenta RAM/CPU server
- Usa MySQL read replicas
- Redis caching aggressivo

**Horizontal Scaling (oltre 5K ordini/giorno):**
- Load balancer (Nginx/AWS ALB)
- Multiple app servers
- Database sharding per merchant
- Microservices per funzioni critiche
- Queue system (Bull + Redis) per background jobs

---

## 11. ALTERNATIVE & TRADE-OFFS

### MySQL vs PostgreSQL?
- **MySQL:** Più semplice, ottimo per read-heavy, grande community
- **PostgreSQL:** JSON migliore, più features, better per analytics complesse
- **Raccomandazione:** MySQL per semplicità, PostgreSQL se serve advanced JSON queries

### Sequelize vs Prisma?
- **Sequelize:** Mature, più flessibile
- **Prisma:** Type-safe, DX migliore, migrations più pulite
- **Raccomandazione:** Prisma se usi TypeScript, Sequelize altrimenti

### Express vs NestJS?
- **Express:** Leggero, flessibile, grande ecosystem
- **NestJS:** Structured, TypeScript-first, scalabile
- **Raccomandazione:** Express per MVP veloce, NestJS per team grandi

---

## 12. NEXT STEPS

### Immediate Actions:

1. ✅ **Approva questo piano** → Conferma stack e architettura
2. ⏳ **Setup repository backend** → Crea progetto Node.js
3. ⏳ **Crea database MySQL** → Esegui migrations
4. ⏳ **Implementa FASE 1** → Auth + Core entities

### Domande da risolvere:

- ❓ Preferisci Sequelize o Prisma come ORM?
- ❓ Hai già un account Stripe? (Serve per pagamenti)
- ❓ Hosting preference? (AWS, DigitalOcean, Heroku, Vercel?)
- ❓ Vuoi TypeScript o JavaScript?

---

## 📌 CONCLUSIONE

Hai ora un **PIANO COMPLETO** per trasformare OrderHub da prototype frontend a **piattaforma SaaS production-ready**.

**MySQL è la scelta GIUSTA** per questo progetto grazie a:
- ✅ Relazioni complesse ben gestite
- ✅ ACID compliance per pagamenti
- ✅ Ottimo per analytics e reporting
- ✅ Multi-tenancy solido
- ✅ Ecosystem maturo e affidabile

**Prossimo passo:** Vuoi che inizi l'implementazione? Dimmi:
1. JavaScript o TypeScript?
2. Sequelize o Prisma?
3. Dove deployare? (AWS/DigitalOcean/altro)

Sono pronto a partire! 🚀
