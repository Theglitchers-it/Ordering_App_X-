#!/bin/bash

# OrderHub Database Setup Script
# This script creates the MySQL database and user for OrderHub

set -e

echo "================================================"
echo "  OrderHub - MySQL Database Setup"
echo "================================================"
echo ""

# Configuration (change these if needed)
DB_NAME="orderhub"
DB_USER="orderhub_user"
DB_PASSWORD="orderhub_secure_2024"
DB_HOST="localhost"
DB_PORT="3306"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will:${NC}"
echo "  1. Create database: $DB_NAME"
echo "  2. Create user: $DB_USER"
echo "  3. Grant permissions"
echo "  4. Import schema from schema.sql"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}ERROR: MySQL is not installed!${NC}"
    echo ""
    echo "Install MySQL:"
    echo "  Ubuntu/Debian: sudo apt install mysql-server"
    echo "  MacOS: brew install mysql"
    echo "  Windows: Download from https://dev.mysql.com/downloads/installer/"
    exit 1
fi

# Check if schema.sql exists
if [ ! -f "schema.sql" ]; then
    echo -e "${RED}ERROR: schema.sql not found!${NC}"
    echo "Please run this script from the backend/ directory"
    exit 1
fi

echo -e "${YELLOW}Enter MySQL root password:${NC}"
read -s MYSQL_ROOT_PASSWORD

echo ""
echo -e "${GREEN}Creating database and user...${NC}"

# Create database and user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';

-- Grant all privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';

-- Flush privileges
FLUSH PRIVILEGES;

SELECT 'Database and user created successfully!' AS status;
EOF

echo -e "${GREEN}✓ Database created: $DB_NAME${NC}"
echo -e "${GREEN}✓ User created: $DB_USER${NC}"
echo ""

echo -e "${GREEN}Importing schema...${NC}"

# Import schema
mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" < schema.sql

echo -e "${GREEN}✓ Schema imported successfully!${NC}"
echo ""

# Verify tables
echo -e "${GREEN}Verifying tables...${NC}"
mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" -e "SHOW TABLES;"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Database Setup Complete! 🎉${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Database Credentials:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update backend/.env with these credentials"
echo "  2. Run: npm run dev"
echo ""
echo -e "${YELLOW}To connect manually:${NC}"
echo "  mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME"
echo ""
