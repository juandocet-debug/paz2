/**
 * RepositorioAnaliticasSqlite.js — Implementación concreta del puerto
 * RepositorioAnaliticas adaptada a PostgreSQL (pg).
 *
 * Mantenemos el nombre de archivo RepositorioAnaliticasSqlite.js por
 * compatibilidad de imports pero la lógica es 100% pg.
 */
const RepositorioAnaliticas = require('../dominio/RepositorioAnaliticas');

const COLUMNAS_CONTEO = [
  'departamento', 'tipo_institucion', 'jornada',
  'frecuencia_lineamientos', 'recibio_formacion', 'disenaron_materiales',
];

const COLUMNAS_MULTIVALOR = [
  'conflictos_tipo', 'politicas_relacionadas',
  'temas_catedra_paz', 'entidades_cajas',
];

function construirWhere(filtros = {}) {
  const condiciones = [];
  const params = [];
  let i = 1;

  if (filtros.departamento) {
    condiciones.push(`departamento = $${i++}`);
    params.push(filtros.departamento);
  }
  if (filtros.municipio) {
    condiciones.push(`municipio = $${i++}`);
    params.push(filtros.municipio);
  }
  if (filtros.tipoInstitucion) {
    condiciones.push(`tipo_institucion = $${i++}`);
    params.push(filtros.tipoInstitucion);
  }
  if (filtros.jornada) {
    condiciones.push(`jornada = $${i++}`);
    params.push(filtros.jornada);
  }

  condiciones.push(`upload_id = (SELECT MAX(id) FROM uploads)`);

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  return { where, params };
}

class RepositorioAnaliticasSqlite extends RepositorioAnaliticas {
  constructor(db) {
    super();
    this.db = db;
  }

  async kpis(filtros = {}) {
    const { where, params } = construirWhere(filtros);
    const res = await this.db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT departamento) AS departamentos,
        COALESCE(SUM(CASE WHEN recibio_formacion = 'Si' THEN 1 ELSE 0 END), 0) AS con_formacion,
        COALESCE(SUM(CASE WHEN disenaron_materiales = 'Sí' THEN 1 ELSE 0 END), 0) AS con_materiales
      FROM practices ${where}
    `, params);
    
    const fila = res.rows[0];
    return {
      total: parseInt(fila.total || 0, 10),
      departamentos: parseInt(fila.departamentos || 0, 10),
      con_formacion: parseInt(fila.con_formacion || 0, 10),
      con_materiales: parseInt(fila.con_materiales || 0, 10),
    };
  }

  async contarPorColumna(columna, filtros = {}) {
    if (!COLUMNAS_CONTEO.includes(columna)) return [];
    
    const { where, params } = construirWhere(filtros);
    const whereCol = where
      ? `${where} AND ${columna} IS NOT NULL AND ${columna} <> ''`
      : `WHERE ${columna} IS NOT NULL AND ${columna} <> ''`;
      
    const res = await this.db.query(`
      SELECT ${columna} AS label, COUNT(*) AS count
      FROM practices ${whereCol}
      GROUP BY ${columna}
      ORDER BY count DESC
    `, params);
    
    return res.rows.map(r => ({ label: r.label, count: parseInt(r.count, 10) }));
  }

  async contarMultivalor(columna, filtros = {}) {
    if (!COLUMNAS_MULTIVALOR.includes(columna)) return [];

    const { where, params } = construirWhere(filtros);
    const whereCol = where
      ? `${where} AND ${columna} IS NOT NULL AND ${columna} <> ''`
      : `WHERE ${columna} IS NOT NULL AND ${columna} <> ''`;

    const res = await this.db.query(`SELECT ${columna} FROM practices ${whereCol}`, params);
    const filas = res.rows;

    const frecuencia = {};
    for (const fila of filas) {
      const tokens = fila[columna].split(',').map(t => t.trim()).filter(Boolean);
      for (const token of tokens) {
        frecuencia[token] = (frecuencia[token] || 0) + 1;
      }
    }

    return Object.entries(frecuencia)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  async puntosMapa(filtros = {}) {
    const { where, params } = construirWhere(filtros);
    const whereGeo = where
      ? `${where} AND latitud IS NOT NULL AND longitud IS NOT NULL`
      : 'WHERE latitud IS NOT NULL AND longitud IS NOT NULL';
      
    const res = await this.db.query(`
      SELECT latitud, longitud, institucion, sede, municipio, departamento, nombre_practica
      FROM practices ${whereGeo}
    `, params);
    
    return res.rows;
  }

  async obtenerTextosParaIA(filtros = {}) {
    const { where, params } = construirWhere(filtros);
    const res = await this.db.query(`
      SELECT conflictos_tipo, obstaculos, politicas_relacionadas,
             temas_catedra_paz, facilidades_sostenibilidad,
             nombre_practica, institucion, municipio, departamento
      FROM practices ${where}
    `, params);
    
    return res.rows;
  }
}

module.exports = RepositorioAnaliticasSqlite;
