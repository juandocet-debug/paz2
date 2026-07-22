/**
 * BaseDeDatos.js — Conexión a SQLite usando 'better-sqlite3'.
 *
 * Mantiene compatibilidad asíncrona con el wrapper anterior para no romper los repositorios,
 * simulando las respuestas de pg (res.rows).
 */
const Database = require('better-sqlite3');
const path = require('path');

class BaseDeDatosWrapper {
  constructor() {
    this._db = null;
  }

  async init() {
    if (this._db) return this;

    try {
      // Crea el archivo SQLite local en la raíz del backend
      const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../../../proyecto_paz.sqlite');
      this._db = new Database(dbPath, { verbose: null });
      this._db.pragma('journal_mode = WAL');
      
      this._inicializarEsquema();
      console.log('✅ Base de datos SQLite inicializada con éxito.');
    } catch (e) {
      console.error('❌ Error al inicializar esquema SQLite:', e);
      throw e;
    }

    return this;
  }

  /**
   * Delega las consultas a better-sqlite3 emulando el comportamiento de pg.
   * En pg: await db.query('SELECT...', [1]) => devuelve { rows: [...] }
   * En SQLite: db.prepare('SELECT...').all(1)
   */
  async query(text, params = []) {
    if (!this._db) throw new Error('La base de datos no ha sido inicializada.');
    
    // SQLite requiere que la sintaxis de variables sea ? o @var, los repositorios
    // ya estarán modificados para usar ?.
    const stmt = this._db.prepare(text);
    
    // Si la consulta empieza por SELECT o PRAGMA, usamos .all()
    // Si es INSERT, UPDATE, DELETE o CREATE, usamos .run()
    const isSelect = /^\s*(SELECT|PRAGMA|WITH.*SELECT)/i.test(text);
    
    try {
      if (isSelect) {
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes, insertId: info.lastInsertRowid };
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Utilizar para lógica de transacciones explícitas.
   * Emula el "client" de pg devolviendo el mismo wrapper, 
   * ya que SQLite no maneja conexiones concurrentes del mismo modo.
   */
  async getClient() {
    return {
      query: (text, params) => this.query(text, params)
    };
  }

  _inicializarEsquema() {
    const ddl = `
      CREATE TABLE IF NOT EXISTS uploads (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        original_name TEXT    NOT NULL,
        stored_name   TEXT    NOT NULL,
        records_count INTEGER NOT NULL DEFAULT 0,
        uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        publicado     INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS practices (
        id                         INTEGER PRIMARY KEY AUTOINCREMENT,
        upload_id                  INTEGER NOT NULL,
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
        created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(upload_id) REFERENCES uploads(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS analisis_ia (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        dimension   TEXT NOT NULL UNIQUE,
        resumen     TEXT,
        categorias  TEXT,
        generado_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS registro_accesos (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario        TEXT NOT NULL,
        exitoso        INTEGER NOT NULL DEFAULT 0,
        ip             TEXT,
        navegador      TEXT,
        fecha          DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Ejecuta las sentencias múltiples separadas
    this._db.exec(ddl);
  }
}

const inst = new BaseDeDatosWrapper();
module.exports = inst;
