const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smer_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

pool.connect()
  .then(() => console.log('✅ Подключение к PostgreSQL успешно'))
  .catch((err) => console.error('❌ Ошибка подключения к базе:', err.message));

module.exports = pool;
