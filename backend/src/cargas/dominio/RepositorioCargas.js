/**
 * RepositorioCargas.js — Puerto (interfaz abstracta) para gestión de cargas.
 */

class RepositorioCargas {
  /** @returns {object[]} Lista de todas las cargas, más recientes primero */
  buscarTodas() {
    throw new Error('No implementado: buscarTodas');
  }

  /** @param {number} id  @returns {object|null} */
  buscarPorId(_id) {
    throw new Error('No implementado: buscarPorId');
  }

  /**
   * @param {{ nombre_original: string, nombre_guardado: string, cantidad_registros: number }} datos
   * @returns {number} ID de la carga creada
   */
  crear(_datos) {
    throw new Error('No implementado: crear');
  }

  /** @param {number} id */
  eliminarPorId(_id) {
    throw new Error('No implementado: eliminarPorId');
  }

  /** @param {number} id */
  marcarPublicado(_id) {
    throw new Error('No implementado: marcarPublicado');
  }
}

module.exports = RepositorioCargas;
