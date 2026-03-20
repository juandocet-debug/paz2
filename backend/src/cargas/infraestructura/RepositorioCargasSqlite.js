/**
 * RepositorioCargasSqlite.js — Implementación concreta del puerto
 * RepositorioCargas usando PostgreSQL (pg).
 *
 * Mantenemos el nombre de archivo RepositorioCargasSqlite.js temporalmente
 * para evitar refactorizar los imports en toda la aplicación, pero la
 * lógica se ha migrado a Postgres.
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
    const res = await this.db.query('SELECT * FROM uploads WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async crear({ nombre_original, nombre_guardado, cantidad_registros }) {
    const res = await this.db.query(`
      INSERT INTO uploads (original_name, stored_name, records_count)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [nombre_original, nombre_guardado, cantidad_registros]);

    return res.rows[0].id;
  }

  async eliminarPorId(id) {
    await this.db.query('DELETE FROM uploads WHERE id = $1', [id]);
  }

  async marcarPublicado(id) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE uploads SET publicado = 0');
      const info = await client.query('UPDATE uploads SET publicado = 1 WHERE id = $1', [id]);
      if (info.rowCount === 0) throw new Error('Carga no encontrada');
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = RepositorioCargasSqlite;
