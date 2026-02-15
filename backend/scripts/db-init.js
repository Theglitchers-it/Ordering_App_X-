/**
 * Database Initialization Script
 *
 * Usage:
 *   node scripts/db-init.js          # Sync models (safe - doesn't drop)
 *   node scripts/db-init.js --force   # Drop & recreate all tables
 *   node scripts/db-init.js --seed    # Sync + seed demo data
 *   node scripts/db-init.js --force --seed  # Full reset with demo data
 */

require('dotenv').config();
const sequelize = require('../src/config/database');
const models = require('../src/models');
const logger = require('../src/utils/logger');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const SEED = args.includes('--seed');

async function init() {
  try {
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync all models
    if (FORCE) {
      logger.info('FORCE mode: dropping and recreating all tables...');
      await sequelize.sync({ force: true });
      logger.info('All tables recreated.');
    } else {
      logger.info('Syncing models (alter mode - preserves data)...');
      await sequelize.sync({ alter: true });
      logger.info('Models synced successfully.');
    }

    // Seed demo data
    if (SEED) {
      await seedData();
    }

    logger.info('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

async function seedData() {
  const bcrypt = require('bcrypt');

  logger.info('Seeding demo data...');

  // 1. Create Super Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const [superAdmin] = await models.User.findOrCreate({
    where: { email: 'admin@orderhub.it' },
    defaults: {
      email: 'admin@orderhub.it',
      password_hash: adminPassword,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      status: 'active'
    }
  });
  logger.info(`Super Admin: admin@orderhub.it / admin123`);

  // 2. Create Merchant Users
  const merchantPassword = await bcrypt.hash('merchant123', 10);

  const [merchantUser1] = await models.User.findOrCreate({
    where: { email: 'rossi@pizzeriarossi.it' },
    defaults: {
      email: 'rossi@pizzeriarossi.it',
      password_hash: merchantPassword,
      first_name: 'Marco',
      last_name: 'Rossi',
      role: 'merchant_admin',
      status: 'active'
    }
  });

  const [merchantUser2] = await models.User.findOrCreate({
    where: { email: 'info@barcentrale.it' },
    defaults: {
      email: 'info@barcentrale.it',
      password_hash: merchantPassword,
      first_name: 'Lucia',
      last_name: 'Bianchi',
      role: 'merchant_admin',
      status: 'active'
    }
  });

  const [merchantUser3] = await models.User.findOrCreate({
    where: { email: 'mario@trattoriamario.it' },
    defaults: {
      email: 'mario@trattoriamario.it',
      password_hash: merchantPassword,
      first_name: 'Mario',
      last_name: 'Verdi',
      role: 'merchant_admin',
      status: 'active'
    }
  });

  logger.info('Merchant users created (password: merchant123)');

  // 3. Create Merchants
  const [merchant1] = await models.Merchant.findOrCreate({
    where: { slug: 'pizzeria-rossi' },
    defaults: {
      owner_id: merchantUser1.id,
      business_name: 'Pizzeria Rossi',
      slug: 'pizzeria-rossi',
      description: 'La migliore pizza napoletana di Roma',
      contact_email: 'rossi@pizzeriarossi.it',
      contact_phone: '+39 06 1234567',
      address: 'Via Roma 42',
      city: 'Roma',
      zip_code: '00100',
      country: 'IT',
      status: 'active',
      subscription_plan: 'business',
      commission_rate: 0.10
    }
  });

  const [merchant2] = await models.Merchant.findOrCreate({
    where: { slug: 'bar-centrale' },
    defaults: {
      owner_id: merchantUser2.id,
      business_name: 'Bar Centrale',
      slug: 'bar-centrale',
      description: 'Cocktail bar nel cuore di Milano',
      contact_email: 'info@barcentrale.it',
      contact_phone: '+39 02 9876543',
      address: 'Piazza Duomo 15',
      city: 'Milano',
      zip_code: '20100',
      country: 'IT',
      status: 'active',
      subscription_plan: 'business',
      commission_rate: 0.12
    }
  });

  const [merchant3] = await models.Merchant.findOrCreate({
    where: { slug: 'trattoria-mario' },
    defaults: {
      owner_id: merchantUser3.id,
      business_name: 'Trattoria Mario',
      slug: 'trattoria-mario',
      description: 'Cucina tradizionale toscana',
      contact_email: 'mario@trattoriamario.it',
      contact_phone: '+39 055 5551234',
      address: 'Via dei Calzaiuoli 8',
      city: 'Firenze',
      zip_code: '50100',
      country: 'IT',
      status: 'active',
      subscription_plan: 'starter',
      commission_rate: 0.10
    }
  });

  logger.info('3 Merchants created');

  // 4. Create Categories
  const categoryData = [
    { merchant_id: merchant1.id, name: 'Pizza', slug: 'pizza', sort_order: 1 },
    { merchant_id: merchant1.id, name: 'Pasta', slug: 'pasta', sort_order: 2 },
    { merchant_id: merchant1.id, name: 'Desserts', slug: 'desserts', sort_order: 3 },
    { merchant_id: merchant1.id, name: 'Drinks', slug: 'drinks', sort_order: 4 },
    { merchant_id: merchant2.id, name: 'Cocktails', slug: 'cocktails', sort_order: 1 },
    { merchant_id: merchant2.id, name: 'Snacks', slug: 'snacks', sort_order: 2 },
    { merchant_id: merchant3.id, name: 'Primi', slug: 'primi', sort_order: 1 },
    { merchant_id: merchant3.id, name: 'Secondi', slug: 'secondi', sort_order: 2 },
  ];

  for (const cat of categoryData) {
    await models.Category.findOrCreate({
      where: { merchant_id: cat.merchant_id, slug: cat.slug },
      defaults: cat
    });
  }
  logger.info('8 Categories created');

  // 5. Create Products
  const categories = await models.Category.findAll();
  const getCatId = (merchantId, slug) => categories.find(c => c.merchant_id === merchantId && c.slug === slug)?.id;

  const productData = [
    // Pizzeria Rossi
    { merchant_id: merchant1.id, category_id: getCatId(merchant1.id, 'pizza'), name: 'Margherita Classica', slug: 'margherita-classica', description: 'Pomodoro San Marzano, mozzarella di bufala, basilico fresco', price: 8.50, preparation_time: 15, is_available: true, is_featured: true },
    { merchant_id: merchant1.id, category_id: getCatId(merchant1.id, 'pizza'), name: 'Diavola', slug: 'diavola', description: 'Pomodoro, mozzarella, salame piccante, peperoncino', price: 10.00, preparation_time: 15, is_available: true },
    { merchant_id: merchant1.id, category_id: getCatId(merchant1.id, 'pizza'), name: 'Quattro Formaggi', slug: 'quattro-formaggi', description: 'Mozzarella, gorgonzola, fontina, parmigiano', price: 11.00, preparation_time: 18, is_available: true },
    { merchant_id: merchant1.id, category_id: getCatId(merchant1.id, 'pasta'), name: 'Carbonara', slug: 'carbonara', description: 'Guanciale, pecorino romano, uova, pepe nero', price: 12.00, preparation_time: 20, is_available: true, is_featured: true },
    { merchant_id: merchant1.id, category_id: getCatId(merchant1.id, 'desserts'), name: 'Tiramisu', slug: 'tiramisu', description: 'Mascarpone, caffe espresso, savoiardi, cacao', price: 6.50, preparation_time: 5, is_available: true },
    // Bar Centrale
    { merchant_id: merchant2.id, category_id: getCatId(merchant2.id, 'cocktails'), name: 'Aperol Spritz', slug: 'aperol-spritz', description: 'Aperol, prosecco, soda, fetta arancia', price: 8.00, preparation_time: 5, is_available: true, is_featured: true },
    { merchant_id: merchant2.id, category_id: getCatId(merchant2.id, 'cocktails'), name: 'Negroni', slug: 'negroni', description: 'Gin, Campari, vermouth rosso', price: 9.00, preparation_time: 5, is_available: true },
    { merchant_id: merchant2.id, category_id: getCatId(merchant2.id, 'snacks'), name: 'Tagliere Misto', slug: 'tagliere-misto', description: 'Salumi e formaggi locali con miele e marmellate', price: 14.00, preparation_time: 10, is_available: true },
    // Trattoria Mario
    { merchant_id: merchant3.id, category_id: getCatId(merchant3.id, 'primi'), name: 'Ribollita Toscana', slug: 'ribollita-toscana', description: 'Zuppa tradizionale con pane, cavolo nero, fagioli', price: 10.00, preparation_time: 10, is_available: true, is_featured: true },
    { merchant_id: merchant3.id, category_id: getCatId(merchant3.id, 'secondi'), name: 'Bistecca alla Fiorentina', slug: 'bistecca-fiorentina', description: 'Chianina 1.2kg, cotta sulla brace', price: 45.00, preparation_time: 30, is_available: true },
  ];

  for (const prod of productData) {
    await models.Product.findOrCreate({
      where: { merchant_id: prod.merchant_id, slug: prod.slug },
      defaults: prod
    });
  }
  logger.info('10 Products created');

  // 6. Create Tables
  const tableData = [];
  // Pizzeria Rossi - 20 tables
  for (let i = 1; i <= 20; i++) {
    tableData.push({
      merchant_id: merchant1.id,
      table_number: i,
      capacity: i <= 10 ? 2 : i <= 15 ? 4 : 6,
      location: i <= 5 ? 'Interno' : i <= 15 ? 'Terrazza' : 'Sala privata',
      current_status: 'available'
    });
  }
  // Bar Centrale - 12 tables
  for (let i = 1; i <= 12; i++) {
    tableData.push({
      merchant_id: merchant2.id,
      table_number: i,
      capacity: i <= 8 ? 2 : 4,
      location: i <= 6 ? 'Interno' : 'Esterno',
      current_status: 'available'
    });
  }
  // Trattoria Mario - 15 tables
  for (let i = 1; i <= 15; i++) {
    tableData.push({
      merchant_id: merchant3.id,
      table_number: i,
      capacity: i <= 8 ? 2 : i <= 12 ? 4 : 6,
      location: i <= 10 ? 'Sala principale' : 'Giardino',
      current_status: 'available'
    });
  }

  for (const table of tableData) {
    await models.Table.findOrCreate({
      where: { merchant_id: table.merchant_id, table_number: table.table_number },
      defaults: table
    });
  }
  logger.info('47 Tables created');

  // 7. Create a demo customer
  const customerPassword = await bcrypt.hash('demo123', 10);
  await models.User.findOrCreate({
    where: { email: 'demo@orderhub.it' },
    defaults: {
      email: 'demo@orderhub.it',
      password_hash: customerPassword,
      first_name: 'Demo',
      last_name: 'User',
      role: 'user',
      status: 'active'
    }
  });
  logger.info('Demo customer: demo@orderhub.it / demo123');

  logger.info('');
  logger.info('=== SEED COMPLETE ===');
  logger.info('');
  logger.info('Accounts created:');
  logger.info('  Super Admin:  admin@orderhub.it / admin123');
  logger.info('  Merchant 1:   rossi@pizzeriarossi.it / merchant123');
  logger.info('  Merchant 2:   info@barcentrale.it / merchant123');
  logger.info('  Merchant 3:   mario@trattoriamario.it / merchant123');
  logger.info('  Customer:     demo@orderhub.it / demo123');
  logger.info('');
  logger.info('Data:');
  logger.info('  3 Merchants, 8 Categories, 10 Products, 47 Tables');
}

init();
