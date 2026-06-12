/**
 * RepositorioPracticasSqlite.js — Implementación concreta del puerto
 * RepositorioPracticas usando SQLite (better-sqlite3).
 */
const RepositorioPracticas = require('../dominio/RepositorioPracticas');

const COLUMNAS_ORDEN = [
  'institucion', 'departamento', 'municipio', 'nombre_practica',
  'tipo_institucion', 'jornada', 'recibio_formacion', 'fecha',
];

const COLUMNAS_FILTRO = [
  'departamento', 'tipo_institucion', 'jornada', 'recibio_formacion',
];

class RepositorioPracticasSqlite extends RepositorioPracticas {
  constructor(db) {
    super();
    this.db = db;
  }

  async buscarTodas(consulta) {
    const columna   = COLUMNAS_ORDEN.includes(consulta.campoOrden) ? consulta.campoOrden : 'institucion';
    const direccion = consulta.direccionOrden === 'DESC' ? 'DESC' : 'ASC';

    const condiciones = ['1=1'];
    const params = [];

    if (consulta.busqueda) {
      condiciones.push(`(
        institucion LIKE ? OR
        nombre_practica LIKE ? OR
        municipio LIKE ? OR
        departamento LIKE ? OR
        responsables LIKE ?
      )`);
      const term = `%${consulta.busqueda}%`;
      params.push(term, term, term, term, term);
    }
    if (consulta.departamento) {
      condiciones.push(`departamento = ?`);
      params.push(consulta.departamento);
    }
    if (consulta.tipo) {
      condiciones.push(`tipo_institucion = ?`);
      params.push(consulta.tipo);
    }
    if (consulta.formacion) {
      condiciones.push(`recibio_formacion = ?`);
      params.push(consulta.formacion);
    }
    if (consulta.idCarga) {
      condiciones.push(`upload_id = ?`);
      params.push(consulta.idCarga);
    } else {
      condiciones.push(`upload_id = (SELECT MAX(id) FROM uploads)`);
    }

    const where = condiciones.join(' AND ');
    const desplazamiento = (consulta.pagina - 1) * consulta.tamanioPagina;

    const sqlRegistros = `SELECT * FROM practices WHERE ${where} ORDER BY ${columna} ${direccion} LIMIT ? OFFSET ?`;
    const resRegistros = await this.db.query(sqlRegistros, [...params, consulta.tamanioPagina, desplazamiento]);
    
    const resTotal = await this.db.query(`SELECT COUNT(*) as n FROM practices WHERE ${where}`, params);

    return { 
      registros: resRegistros.rows, 
      total: parseInt(resTotal.rows[0].n, 10) 
    };
  }

  async buscarPorId(id) {
    const res = await this.db.query('SELECT * FROM practices WHERE id = ?', [id]);
    return res.rows[0] || null;
  }

  async insertarMasivo(idCarga, practicas) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      const sql = `
        INSERT INTO practices (
          upload_id, fecha, institucion, sede, tipo_institucion, nombre_practica,
          grados, areas, responsables, departamento, municipio, jornada,
          edad_estudiantes, edad_docentes, edad_comunidad, redes_sociales, web,
          conflictos_tipo, politicas_relacionadas, temas_catedra_paz,
          frecuencia_lineamientos, documentos_men, recibio_formacion,
          entidades_cajas, criterios_materiales, disenaron_materiales,
          obstaculos, facilidades_sostenibilidad
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`;

      for (const f of practicas) {
        await client.query(sql, [
          idCarga, f.fecha, f.institucion, f.sede, f.tipo_institucion, f.nombre_practica,
          f.grados, f.areas, f.responsables, f.departamento, f.municipio, f.jornada,
          f.edad_estudiantes, f.edad_docentes, f.edad_comunidad, f.redes_sociales, f.web,
          f.conflictos_tipo, f.politicas_relacionadas, f.temas_catedra_paz,
          f.frecuencia_lineamientos, f.documentos_men, f.recibio_formacion,
          f.entidades_cajas, f.criterios_materiales, f.disenaron_materiales,
          f.obstaculos, f.facilidades_sostenibilidad
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }

  async valoresDistintos(columna) {
    if (!COLUMNAS_FILTRO.includes(columna)) return [];
    const res = await this.db.query(
      `SELECT DISTINCT ${columna} as valor FROM practices WHERE ${columna} IS NOT NULL AND ${columna} <> '' ORDER BY ${columna}`
    );
    return res.rows.map(r => r.valor);
  }

  async actualizarCoordenadas(id, lat, lng) {
    await this.db.query(
      'UPDATE practices SET latitud = ?, longitud = ? WHERE id = ?',
      [lat, lng, id]
    );
  }

  async eliminarPorCargaId(cargaId) {
    await this.db.query('DELETE FROM practices WHERE upload_id = ?', [cargaId]);
  }

  async eliminarHuerfanas() {
    await this.db.query('DELETE FROM practices WHERE upload_id NOT IN (SELECT id FROM uploads)');
  }
}

module.exports = RepositorioPracticasSqlite;
