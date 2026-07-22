const { Pool } = require('pg');
const db = require('../../compartido/infraestructura/BaseDeDatos');

let pool;
let esquemaPostgresInicializado;

function postgres() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

async function prepararPostgres(cliente) {
  if (!esquemaPostgresInicializado) {
    esquemaPostgresInicializado = cliente.query(`
      CREATE TABLE IF NOT EXISTS registro_accesos (
        id BIGSERIAL PRIMARY KEY,
        usuario TEXT NOT NULL,
        exitoso BOOLEAN NOT NULL DEFAULT FALSE,
        ip TEXT,
        navegador TEXT,
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).catch((error) => {
      esquemaPostgresInicializado = null;
      throw error;
    });
  }
  await esquemaPostgresInicializado;
}

async function registrar({ usuario, exitoso, ip, navegador }) {
  const cliente = postgres();
  if (cliente) {
    await prepararPostgres(cliente);
    await cliente.query(
      'INSERT INTO registro_accesos (usuario, exitoso, ip, navegador) VALUES ($1, $2, $3, $4)',
      [usuario, exitoso, ip, navegador],
    );
    return;
  }

  await db.query(
    'INSERT INTO registro_accesos (usuario, exitoso, ip, navegador) VALUES (?, ?, ?, ?)',
    [usuario, exitoso ? 1 : 0, ip, navegador],
  );
}

async function listar(limite = 500) {
  const cliente = postgres();
  if (cliente) {
    await prepararPostgres(cliente);
    const resultado = await cliente.query(
      'SELECT id, usuario, exitoso, ip, navegador, fecha FROM registro_accesos ORDER BY fecha DESC LIMIT $1',
      [limite],
    );
    return resultado.rows;
  }

  const resultado = await db.query(
    'SELECT id, usuario, exitoso, ip, navegador, fecha FROM registro_accesos ORDER BY fecha DESC LIMIT ?',
    [limite],
  );
  return resultado.rows.map((fila) => ({ ...fila, exitoso: Boolean(fila.exitoso) }));
}

module.exports = { registrar, listar };
