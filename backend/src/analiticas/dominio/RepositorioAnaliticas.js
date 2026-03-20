/**
 * RepositorioAnaliticas.js — Puerto (interfaz abstracta) para datos analíticos.
 *
 * Define el contrato para obtener KPIs, conteos por columna
 * y conteos de valores múltiples (columnas con listas separadas por comas).
 */

class RepositorioAnaliticas {
  /**
   * @returns {{ total: number, departamentos: number, con_formacion: number, con_materiales: number }}
   */
  kpis() {
    throw new Error('No implementado: kpis');
  }

  /**
   * Cuenta registros agrupados por una columna simple.
   * @param {string} columna
   * @returns {{ etiqueta: string, cantidad: number }[]}
   */
  contarPorColumna(_columna) {
    throw new Error('No implementado: contarPorColumna');
  }

  /**
   * Cuenta ocurrencias en columnas con valores múltiples (separados por comas).
   * @param {string} columna
   * @returns {{ etiqueta: string, cantidad: number }[]}
   */
  contarMultivalor(_columna) {
    throw new Error('No implementado: contarMultivalor');
  }

  /**
   * Obtiene los puntos georeferenciados para el mapa de calor.
   * @returns {{ latitud: number, longitud: number, institucion: string, municipio: string, departamento: string, total: number }[]}
   */
  puntosMapa() {
    throw new Error('No implementado: puntosMapa');
  }
}

module.exports = RepositorioAnaliticas;
