require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mysql',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME     || 'universidade',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

async function conectar(tentativa = 1, maxTentativas = 10) {
  try {
    const conn = await pool.getConnection();
    console.log('✅  Conectado ao MySQL com sucesso.');
    conn.release();
  } catch (err) {
    if (tentativa >= maxTentativas) {
      console.error('❌  Não foi possível conectar ao MySQL:', err.message);
      process.exit(1);
    }
    const espera = tentativa * 2000;
    console.warn(`⏳  Tentativa ${tentativa}/${maxTentativas}. Aguardando ${espera / 1000}s...`);
    await new Promise(r => setTimeout(r, espera));
    return conectar(tentativa + 1, maxTentativas);
  }
}

conectar();

module.exports = pool;
