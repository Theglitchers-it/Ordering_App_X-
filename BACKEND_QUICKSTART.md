# 🚀 ORDERHUB BACKEND - QUICK START GUIDE

Guida rapida per iniziare subito l'implementazione del backend.

---

## ⚡ SETUP RAPIDO (15 minuti)

### 1. Prerequisiti

```bash
# Verifica versioni
node --version    # v20+
npm --version     # v9+
mysql --version   # 8.0+
```

### 2. Crea Database MySQL

```bash
# Login a MySQL
mysql -u root -p

# Crea database
CREATE DATABASE orderhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crea utente (optional ma raccomandato)
CREATE USER 'orderhub_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON orderhub.* TO 'orderhub_user'@'localhost';
FLUSH PRIVILEGES;

# Esci
EXIT;

# Importa schema
mysql -u root -p orderhub < backend/schema.sql
```

### 3. Setup Backend Project

```bash
# Crea directory backend
mkdir -p backend/src
cd backend

# Inizializza progetto Node.js
npm init -y

# Installa dipendenze principali
npm install express mysql2 sequelize bcrypt jsonwebtoken dotenv cors helmet express-rate-limit

# Installa dev dependencies
npm install --save-dev nodemon

# Installa servizi (opzionali per ora)
npm install stripe @sendgrid/mail socket.io qrcode
```

### 4. Crea struttura progetto

```bash
cd src

# Crea directories
mkdir -p config models controllers routes middleware services utils

# Crea entry point
touch ../server.js
touch config/database.js
```

### 5. Configurazione Base

**File: `backend/.env`**
```env
# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=orderhub
DB_USER=orderhub_user
DB_PASSWORD=your_strong_password

# JWT
JWT_SECRET=change-this-to-a-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=change-this-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (opzionale per ora - usa test keys)
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SendGrid (opzionale)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@orderhub.local
```

**File: `backend/server.js`**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OrderHub API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OrderHub API listening on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
```

**File: `backend/src/config/database.js`**
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch(err => console.error('❌ MySQL connection error:', err));

module.exports = sequelize;
```

**File: `backend/package.json` (aggiungi scripts)**
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### 6. Testa il Setup

```bash
# Avvia server
npm run dev

# In un altro terminale, testa
curl http://localhost:5000/health
```

**Output atteso:**
```json
{
  "status": "OK",
  "message": "OrderHub API is running"
}
```

---

## 🎯 FASE 1: Implementazione Base (Week 1-2)

### Step 1: Crea Model User

**File: `backend/src/models/User.js`**
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
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
  first_name: DataTypes.STRING(100),
  last_name: DataTypes.STRING(100),
  phone: DataTypes.STRING(20),
  role: {
    type: DataTypes.ENUM(
      'super_admin', 'admin_ops', 'merchant_admin',
      'support_agent', 'finance', 'logistics', 'user'
    ),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'deleted'),
    defaultValue: 'active'
  },
  email_verified_at: DataTypes.DATE,
  last_login_at: DataTypes.DATE,
  last_login_ip: DataTypes.STRING(45)
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = User;
```

### Step 2: Auth Controller

**File: `backend/src/controllers/auth.controller.js`**
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone
    });

    // Generate JWT
    const token = jwt.sign(
      { sub: user.uuid, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email, status: 'active' } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({
      last_login_at: new Date(),
      last_login_ip: req.ip
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { sub: user.uuid, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { sub: user.uuid },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { uuid: req.user.sub },
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
```

### Step 3: Auth Middleware

**File: `backend/src/middleware/auth.middleware.js`**
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;

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

### Step 4: Auth Routes

**File: `backend/src/routes/auth.routes.js`**
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
```

### Step 5: Integra Routes in Server

**File: `backend/server.js` (aggiorna)**
```javascript
// ... dopo middleware ...

// Database
const sequelize = require('./src/config/database');

// Routes
const authRoutes = require('./src/routes/auth.routes');

app.use('/api/auth', authRoutes);

// ... resto del codice ...
```

### Step 6: Testa Auth

```bash
# Restart server
npm run dev

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the token from response, then test /me
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 CHECKLIST PROSSIMI STEP

Dopo aver completato il setup base:

- [ ] **Week 1:**
  - [ ] Implementa Merchant model & routes
  - [ ] Implementa Products model & routes
  - [ ] Implementa Categories model & routes

- [ ] **Week 2:**
  - [ ] Implementa Orders model & routes
  - [ ] Integra QR code generation
  - [ ] RBAC middleware completo

- [ ] **Week 3-4:**
  - [ ] Stripe integration
  - [ ] WebSocket setup
  - [ ] Email notifications

---

## 🐛 TROUBLESHOOTING

### Errore: "Access denied for user"
```bash
# Verifica credenziali MySQL nel .env
# Verifica che l'utente esista
mysql -u orderhub_user -p
```

### Errore: "connect ECONNREFUSED"
```bash
# Verifica che MySQL sia in esecuzione
sudo service mysql status

# Avvia MySQL
sudo service mysql start
```

### Errore: "Module not found"
```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 RESOURCES

- **Sequelize Docs:** https://sequelize.org/docs/v6/
- **Express.js Guide:** https://expressjs.com/en/guide/routing.html
- **JWT Guide:** https://jwt.io/introduction
- **Stripe API Docs:** https://stripe.com/docs/api
- **MySQL Documentation:** https://dev.mysql.com/doc/

---

## 🎉 PRONTO!

Hai ora il backend funzionante con:
✅ Database MySQL configurato
✅ Server Express in esecuzione
✅ Autenticazione JWT funzionante
✅ Registrazione/Login/Me endpoints

**Next:** Continua con FASE 2 del BACKEND_PLAN.md!
