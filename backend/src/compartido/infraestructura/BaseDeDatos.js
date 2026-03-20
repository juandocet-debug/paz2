/**
 * BaseDeDatos.js — Conexión PostgreSQL (Neon/Local) usando 'pg'.
 *
 * Mantiene compatibilidad asíncrona (exportando la instancia con métodos asíncronos).
 */
const { Pool } = require('pg');

class BaseDeDatosWrapper {
  constructor() {
    this._pool = null;
  }

  /**
   * Inicializa el Pool y asegura de que el esquema de base de datos exista.
   */
  async init() {
    if (this._pool) return this;

    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/proyecto_paz';
    const isProduction = !!process.env.DATABASE_URL;

    this._pool = new Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });

    try {
      await this._inicializarEsquema();
      console.log('✅ Base de datos PostgreSQL inicializada con éxito.');
    } catch (e) {
      console.error('❌ Error al inicializar esquema PostgreSQL:', e);
      throw e;
    }

    return this;
  }

  /**
   * Delega las consultas al pool, equivalente a db.query() estándar.
   * @param {string} text - Consulta SQL
   * @param {any[]} [params] - Parámetros $1, $2, etc.
   */
  query(text, params) {
    if (!this._pool) throw new Error('La base de datos no ha sido inicializada.');
    return this._pool.query(text, params);
  }

  /**
   * Utilizar para lógica de transacciones explícitas.
   * Retorna un cliente de la piscina ("client").
   */
  async getClient() {
    return this._pool.connect();
  }

  async _inicializarEsquema() {
    const ddl = `
      CREATE TABLE IF NOT EXISTS uploads (
        id            SERIAL PRIMARY KEY,
        original_name TEXT    NOT NULL,
        stored_name   TEXT    NOT NULL,
        records_count INTEGER NOT NULL DEFAULT 0,
        uploaded_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        publicado     INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS practices (
        id                         SERIAL PRIMARY KEY,
        upload_id                  INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
        fecha                      TEXT,
        institucion                TEXT,
        sede                       TEXT,
        tipo_institucion           TEXT,
        nombre_practica            TEXT,
        grados                     TEXT,
        areas                      TEXT,
        responsables               TEXT,
        departamento               TEXT,
        municipio                  TEXT,
        jornada                    TEXT,
        edad_estudiantes           TEXT,
        edad_docentes              TEXT,
        edad_comunidad             TEXT,
        redes_sociales             TEXT,
        web                        TEXT,
        conflictos_tipo            TEXT,
        politicas_relacionadas     TEXT,
        temas_catedra_paz          TEXT,
        frecuencia_lineamientos    TEXT,
        documentos_men             TEXT,
        recibio_formacion          TEXT,
        entidades_cajas            TEXT,
        criterios_materiales       TEXT,
        disenaron_materiales       TEXT,
        obstaculos                 TEXT,
        facilidades_sostenibilidad TEXT,
        latitud                    REAL,
        longitud                   REAL,
        created_at                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analisis_ia (
        id          SERIAL PRIMARY KEY,
        dimension   TEXT NOT NULL UNIQUE,
        resumen     TEXT,
        categorias  TEXT,
        generado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.query(ddl);
  }
}

const inst = new BaseDeDatosWrapper();
module.exports = inst;
