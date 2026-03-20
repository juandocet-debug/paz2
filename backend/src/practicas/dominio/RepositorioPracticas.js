/**
 * RepositorioPracticas.js — Puerto (interfaz abstracta).
 *
 * Define el contrato que cualquier implementación concreta debe cumplir.
 * La capa de aplicación depende SOLO de este puerto, nunca de la
 * implementación SQLite/PostgreSQL.
 */

class RepositorioPracticas {
  /**
   * Busca prácticas con paginación, filtros y ordenamiento.
   * @param {object} consulta — { busqueda, departamento, tipo, formacion, pagina, tamanioPagina, campoOrden, direccionOrden, idCarga }
   * @returns {{ registros: object[], total: number }}
   */
  buscarTodas(_consulta) {
    throw new Error('No implementado: buscarTodas');
  }

  /**
   * Busca una práctica por su ID.
   * @param {number} id
   * @returns {object|null}
   */
  buscarPorId(_id) {
    throw new Error('No implementado: buscarPorId');
  }

  /**
   * Inserción masiva de prácticas bajo una carga específica.
   * @param {number} idCarga
   * @param {object[]} practicas
   */
  insertarMasivo(_idCarga, _practicas) {
    throw new Error('No implementado: insertarMasivo');
  }

  /**
   * Retorna valores distintos de una columna (para filtros dropdown).
   * @param {string} columna
   * @returns {string[]}
   */
  valoresDistintos(_columna) {
    throw new Error('No implementado: valoresDistintos');
  }

  /**
   * Actualiza las coordenadas geográficas de una práctica.
   * @param {number} id
   * @param {number} lat
   * @param {number} lng
   */
  actualizarCoordenadas(_id, _lat, _lng) {
    throw new Error('No implementado: actualizarCoordenadas');
  }

  /**
   * Elimina todas las prácticas asociadas a una carga.
   * @param {number} cargaId
   */
  eliminarPorCargaId(_cargaId) {
    throw new Error('No implementado: eliminarPorCargaId');
  }

  /**
   * Elimina prácticas cuyos uploads ya no existen en la BD (huérfanas).
   */
  eliminarHuerfanas() {
    throw new Error('No implementado: eliminarHuerfanas');
  }
}

module.exports = RepositorioPracticas;
