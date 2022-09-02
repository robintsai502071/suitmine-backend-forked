require('dotenv').config();

const mysql = require('mysql2/promise');
let pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // 為了 pool 新增的參數
  connectionLimit: 10,
  dateStrings: true,
});

module.exports = pool;
