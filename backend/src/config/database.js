const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'orderhub',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',

    // Logging
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => logger.debug(msg)
      : false,

    // Connection pool
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // Timezone
    timezone: '+00:00',

    // Performance
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },

    // Query optimization
    benchmark: process.env.NODE_ENV === 'development',
    logQueryParameters: process.env.NODE_ENV === 'development'
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    logger.info(`Connected to MySQL database: ${process.env.DB_NAME}`);
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error);
  });

module.exports = sequelize;
