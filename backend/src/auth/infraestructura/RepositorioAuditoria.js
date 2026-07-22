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
    `).then(() => cliente.query(`
      CREATE TABLE IF NOT EXISTS sesiones_usuario (
        id TEXT PRIMARY KEY,
        usuario TEXT NOT NULL,
        ip TEXT,
        navegador TEXT,
        inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fin TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS eventos_sesion (
        id BIGSERIAL PRIMARY KEY,
        sesion_id TEXT NOT NULL REFERENCES sesiones_usuario(id) ON DELETE CASCADE,
        seccion TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'navegacion',
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_eventos_sesion_fecha ON eventos_sesion (sesion_id, fecha);
    `)).catch((error) => {
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

async function iniciarSesion({ id, usuario, ip, navegador }) {
  const cliente = postgres();
  if (cliente) {
    await prepararPostgres(cliente);
    await cliente.query(
      'INSERT INTO sesiones_usuario (id, usuario, ip, navegador) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [id, usuario, ip, navegador],
    );
    return;
  }
  await db.query(
    'INSERT OR IGNORE INTO sesiones_usuario (id, usuario, ip, navegador) VALUES (?, ?, ?, ?)',
    [id, usuario, ip, navegador],
  );
}

async function registrarActividad({ sesionId, seccion, tipo }) {
  const cliente = postgres();
  if (cliente) {
    await prepararPostgres(cliente);
    await cliente.query(
      `UPDATE sesiones_usuario
       SET ultima_actividad = NOW(), fin = CASE WHEN $2 = 'cierre' THEN NOW() ELSE NULL END
       WHERE id = $1`,
      [sesionId, tipo],
    );
    if (tipo !== 'latido') {
      await cliente.query(
        'INSERT INTO eventos_sesion (sesion_id, seccion, tipo) SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM sesiones_usuario WHERE id = $1)',
        [sesionId, seccion, tipo],
      );
    }
    return;
  }
  await db.query(
    `UPDATE sesiones_usuario
     SET ultima_actividad = CURRENT_TIMESTAMP, fin = CASE WHEN ? = 'cierre' THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = ?`,
    [tipo, sesionId],
  );
  if (tipo !== 'latido') {
    await db.query(
      'INSERT INTO eventos_sesion (sesion_id, seccion, tipo) SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM sesiones_usuario WHERE id = ?)',
      [sesionId, seccion, tipo, sesionId],
    );
  }
}

async function listarSesiones(limite = 200) {
  const cliente = postgres();
  let sesiones;
  let eventos;
  if (cliente) {
    await prepararPostgres(cliente);
    sesiones = (await cliente.query(
      `SELECT id, usuario, ip, navegador, inicio, ultima_actividad, fin,
              GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(fin, ultima_actividad) - inicio)))::INTEGER AS duracion_segundos
       FROM sesiones_usuario ORDER BY inicio DESC LIMIT $1`,
      [limite],
    )).rows;
    const ids = sesiones.map((sesion) => sesion.id);
    eventos = ids.length ? (await cliente.query(
      'SELECT id, sesion_id, seccion, tipo, fecha FROM eventos_sesion WHERE sesion_id = ANY($1::text[]) ORDER BY fecha ASC',
      [ids],
    )).rows : [];
  } else {
    sesiones = (await db.query(
      `SELECT id, usuario, ip, navegador, inicio, ultima_actividad, fin,
              MAX(0, CAST((JULIANDAY(COALESCE(fin, ultima_actividad)) - JULIANDAY(inicio)) * 86400 AS INTEGER)) AS duracion_segundos
       FROM sesiones_usuario ORDER BY inicio DESC LIMIT ?`,
      [limite],
    )).rows;
    eventos = [];
    for (const sesion of sesiones) {
      const filas = await db.query(
        'SELECT id, sesion_id, seccion, tipo, fecha FROM eventos_sesion WHERE sesion_id = ? ORDER BY fecha ASC',
        [sesion.id],
      );
      eventos.push(...filas.rows);
    }
  }
  const porSesion = new Map();
  for (const evento of eventos) {
    if (!porSesion.has(evento.sesion_id)) porSesion.set(evento.sesion_id, []);
    porSesion.get(evento.sesion_id).push(evento);
  }
  return sesiones.map((sesion) => ({ ...sesion, eventos: porSesion.get(sesion.id) || [] }));
}

module.exports = { registrar, listar, iniciarSesion, registrarActividad, listarSesiones };
