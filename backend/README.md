# OrderHub Backend API

Backend Node.js/Express per la piattaforma SaaS OrderHub.

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Installazione

```bash
# 1. Installa dipendenze
npm install

# 2. Copia .env.example a .env
cp .env.example .env

# 3. Configura .env con le tue credenziali
nano .env

# 4. Crea database MySQL
mysql -u root -p
CREATE DATABASE orderhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'orderhub_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON orderhub.* TO 'orderhub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 5. Importa schema database
mysql -u root -p orderhub < schema.sql

# 6. Avvia server development
npm run dev
```

Il server partirà su `http://localhost:5000`

## 📋 Variabili d'Ambiente

Configura queste variabili nel file `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=orderhub
DB_USER=orderhub_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend - FREE 3,000 emails/month)
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

## 🔑 Ottenere API Keys GRATUITE

### Resend Email (FREE 3,000 email/mese)
1. Vai su https://resend.com
2. Registrati gratis
3. Copia API key da Dashboard → API Keys
4. Aggiungi a `.env`: `RESEND_API_KEY=re_xxxxx`

### Stripe Test Mode (GRATIS per testing)
1. Vai su https://dashboard.stripe.com/register
2. Registrati gratis
3. Attiva "View test data" (toggle in alto a destra)
4. Vai su Developers → API Keys
5. Copia "Secret key" (inizia con `sk_test_`)
6. Aggiungi a `.env`: `STRIPE_SECRET_KEY=sk_test_xxxxx`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register        - Registra nuovo utente
POST   /api/auth/login           - Login
POST   /api/auth/refresh-token   - Rinnova token
GET    /api/auth/me              - Profilo utente corrente
POST   /api/auth/logout          - Logout
```

### Health Check
```
GET    /health                   - Verifica stato server
```

## 🧪 Testing

```bash
# Test registrazione
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

# Test profilo (usa il token ricevuto dal login)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📁 Struttura Progetto

```
backend/
├── src/
│   ├── config/          # Configurazione (database, socket)
│   ├── controllers/     # Controller delle routes
│   ├── models/          # Modelli Sequelize
│   ├── routes/          # Definizione routes
│   ├── middleware/      # Middleware (auth, RBAC, etc.)
│   ├── services/        # Servizi (email, payment, etc.)
│   └── utils/           # Utility (logger, helpers)
├── logs/                # File di log
├── .env                 # Variabili d'ambiente (NON committare!)
├── .env.example         # Template variabili
├── schema.sql           # Schema database MySQL
├── server.js            # Entry point
└── package.json
```

## 🔒 Security Features

- ✅ JWT authentication con refresh tokens
- ✅ Password hashing con bcrypt
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting
- ✅ Helmet.js per security headers
- ✅ CORS configurato
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)

## 👥 Ruoli Disponibili

- `super_admin` - Accesso completo
- `admin_ops` - Operazioni admin
- `merchant_admin` - Gestione ristorante
- `support_agent` - Supporto clienti
- `finance` - Gestione finanziaria
- `logistics` - Gestione consegne
- `user` - Cliente normale

## 🚢 Deploy Production

```bash
# Build
npm run start

# Usa PM2 per process management
npm install -g pm2
pm2 start server.js --name orderhub-api
pm2 save
pm2 startup
```

## 📊 Database Schema

Il database include 20+ tabelle:
- users, merchants, products, categories
- orders, order_items, tables
- transactions, payouts
- coupons, loyalty_points
- reviews, notifications
- audit_logs, sessions

Vedi `schema.sql` per lo schema completo.

## 🐛 Troubleshooting

### Errore: "connect ECONNREFUSED"
```bash
# Verifica che MySQL sia in esecuzione
sudo service mysql status
sudo service mysql start
```

### Errore: "Access denied for user"
```bash
# Verifica credenziali in .env
# Ricontrolla utente MySQL
mysql -u orderhub_user -p
```

### Errore: "Module not found"
```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts NPM

```bash
npm run dev          # Development con nodemon
npm start            # Production
npm run db:migrate   # Esegui migrations
npm run db:seed      # Seed database
```

## 🤝 Contributing

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT

## 🆘 Supporto

Per problemi o domande:
- GitHub Issues: [Link]
- Email: support@orderhub.com
