# 🗄️ Database Setup Guide

Complete guide to setup MySQL database for OrderHub backend.

---

## 📋 Prerequisites

- **MySQL 8.0+** installed
- **Root access** to MySQL
- **Backend files** in `/backend` directory

---

## 🚀 Quick Setup (Automated)

### **Option 1: Using Setup Script (Recommended)**

```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

This script will:
1. ✅ Create database `orderhub`
2. ✅ Create user `orderhub_user`
3. ✅ Import schema from `schema.sql`
4. ✅ Verify all tables created

**Default Credentials:**
- Database: `orderhub`
- User: `orderhub_user`
- Password: `orderhub_secure_2024`

---

## 🔧 Manual Setup

### **Step 1: Install MySQL (if not installed)**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**MacOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download from: https://dev.mysql.com/downloads/installer/

---

### **Step 2: Secure MySQL Installation (First time only)**

```bash
sudo mysql_secure_installation
```

Follow prompts:
- Set root password
- Remove anonymous users: YES
- Disallow root login remotely: YES
- Remove test database: YES
- Reload privilege tables: YES

---

### **Step 3: Create Database and User**

```bash
mysql -u root -p
```

Then run:

```sql
-- Create database
CREATE DATABASE orderhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'orderhub_user'@'localhost' IDENTIFIED BY 'orderhub_secure_2024';

-- Grant all privileges
GRANT ALL PRIVILEGES ON orderhub.* TO 'orderhub_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SELECT user, host FROM mysql.user WHERE user = 'orderhub_user';

-- Exit
EXIT;
```

---

### **Step 4: Import Schema**

```bash
cd backend
mysql -u orderhub_user -p orderhub < schema.sql
```

Enter password: `orderhub_secure_2024`

---

### **Step 5: Verify Tables Created**

```bash
mysql -u orderhub_user -p orderhub
```

```sql
SHOW TABLES;
```

You should see **20 tables**:
```
+----------------------------+
| Tables_in_orderhub         |
+----------------------------+
| analytics_events           |
| categories                 |
| coupons                    |
| coupon_usages              |
| delivery_drivers           |
| favorites                  |
| loyalty_points             |
| merchants                  |
| notifications              |
| orders                     |
| payments                   |
| products                   |
| push_tokens                |
| reviews                    |
| sessions                   |
| settings                   |
| support_tickets            |
| tables                     |
| ticket_messages            |
| users                      |
+----------------------------+
```

---

## ⚙️ Configure Backend

Update `backend/.env`:

```bash
cd backend
nano .env
```

Ensure these values match:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=orderhub
DB_USER=orderhub_user
DB_PASSWORD=orderhub_secure_2024
```

**Note:** `.env` is already configured with these defaults!

---

## 🧪 Test Database Connection

```bash
cd backend
npm run dev
```

Look for:
```
✅ Database connection established successfully
🚀 OrderHub API listening on port 5000
```

If you see errors, check:
1. MySQL is running: `sudo systemctl status mysql`
2. Credentials are correct in `.env`
3. Database exists: `mysql -u root -p -e "SHOW DATABASES;"`

---

## 🔍 Useful MySQL Commands

### **Check Database Size**
```sql
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'orderhub'
GROUP BY table_schema;
```

### **Check Table Sizes**
```sql
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'orderhub'
ORDER BY (data_length + index_length) DESC;
```

### **Create Sample Data (for testing)**
```sql
-- Create super admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
VALUES (
    'admin@orderhub.com',
    '$2b$10$X1.5K9Z3oE2bQ3vN8rJ0J.dKQ0oQ5xZ1hH2yU7cV8nE3gT9rW5yS6', -- password: admin123
    'Super',
    'Admin',
    'super_admin',
    TRUE
);

-- Create test merchant
INSERT INTO merchants (business_name, business_type, email, phone, status, vat_number, address, city, postal_code, country)
VALUES (
    'Pizza Roma Test',
    'restaurant',
    'pizza@test.com',
    '+39 06 1234567',
    'active',
    'IT12345678901',
    'Via Roma 1',
    'Roma',
    '00100',
    'IT'
);
```

---

## 🐳 Docker Alternative (Optional)

If you prefer Docker:

```bash
# Create docker-compose.yml
cat > backend/docker-compose.yml <<EOF
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: orderhub
      MYSQL_USER: orderhub_user
      MYSQL_PASSWORD: orderhub_secure_2024
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
volumes:
  mysql_data:
EOF

# Start MySQL
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 🔒 Production Recommendations

When deploying to production:

1. **Use Strong Passwords:**
   ```bash
   # Generate strong password
   openssl rand -base64 32
   ```

2. **Create Production User:**
   ```sql
   CREATE USER 'orderhub_prod'@'%' IDENTIFIED BY 'your_strong_password_here';
   GRANT ALL PRIVILEGES ON orderhub.* TO 'orderhub_prod'@'%';
   ```

3. **Enable SSL/TLS:**
   ```env
   DB_SSL=true
   DB_SSL_CA=/path/to/ca-cert.pem
   ```

4. **Use Managed Database:**
   - AWS RDS
   - DigitalOcean Managed MySQL
   - Google Cloud SQL
   - Azure Database for MySQL

5. **Backup Strategy:**
   ```bash
   # Daily backup
   mysqldump -u orderhub_user -p orderhub > backup_$(date +%Y%m%d).sql

   # Compress
   gzip backup_$(date +%Y%m%d).sql
   ```

---

## 🆘 Troubleshooting

### **Error: Access denied for user**
```bash
# Reset user password
mysql -u root -p
ALTER USER 'orderhub_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### **Error: Can't connect to MySQL server**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

### **Error: Unknown database 'orderhub'**
```bash
# Recreate database
mysql -u root -p
CREATE DATABASE orderhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import schema
mysql -u orderhub_user -p orderhub < backend/schema.sql
```

### **Error: Table doesn't exist**
```bash
# Re-import schema
mysql -u orderhub_user -p orderhub < backend/schema.sql
```

---

## ✅ Verification Checklist

- [ ] MySQL 8.0+ installed
- [ ] Database `orderhub` created
- [ ] User `orderhub_user` created with correct password
- [ ] All 20 tables imported from schema.sql
- [ ] `backend/.env` configured with correct credentials
- [ ] Backend can connect to database (`npm run dev` shows success)
- [ ] Test user can be created via API

---

## 📝 Next Steps

After database is ready:

1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Start frontend: `npm run dev`
3. ✅ Test registration: POST `/api/auth/register`
4. ✅ Test login: POST `/api/auth/login`
5. ✅ Create first merchant via API

---

**Database setup complete!** 🎉
