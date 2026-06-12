/**
 * RepositorioCargasSqlite.js — Implementación concreta del puerto
 * RepositorioCargas usando SQLite (better-sqlite3).
 */
const RepositorioCargas = require('../dominio/RepositorioCargas');

class RepositorioCargasSqlite extends RepositorioCargas {
  /** @param {import('../../compartido/infraestructura/BaseDeDatos')} db */
  constructor(db) {
    super();
    this.db = db;
  }

  async buscarTodas() {
    const res = await this.db.query('SELECT * FROM uploads ORDER BY uploaded_at DESC');
    return res.rows;
  }

  async buscarPorId(id) {
    const res = await this.db.query('SELECT * FROM uploads WHERE id = ?', [id]);
    return res.rows[0] || null;
  }

  async crear({ nombre_original, nombre_guardado, cantidad_registros }) {
    // SQLite no tiene RETURNING, usamos insertId del wrapper
    const res = await this.db.query(
      `INSERT INTO uploads (original_name, stored_name, records_count) VALUES (?, ?, ?)`,
      [nombre_original, nombre_guardado, cantidad_registros]
    );
    return res.insertId;
  }

  async eliminarPorId(id) {
    await this.db.query('DELETE FROM uploads WHERE id = ?', [id]);
  }

  async marcarPublicado(id) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE uploads SET publicado = 0');
      const info = await client.query('UPDATE uploads SET publicado = 1 WHERE id = ?', [id]);
      if (info.rowCount === 0) throw new Error('Carga no encontrada');
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }
}

module.exports = RepositorioCargasSqlite;
