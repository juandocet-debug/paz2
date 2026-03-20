/**
 * ManejadorConsultaPracticaPorId.js — Caso de uso: obtener detalle de una práctica.
 *
 * Responsabilidad única: buscar una práctica por su ID.
 */

class ManejadorConsultaPracticaPorId {
  /** @param {import('../dominio/RepositorioPracticas')} repositorio */
  constructor(repositorio) {
    this.repositorio = repositorio;
  }

  /**
   * @param {number} id
   * @returns {object|null}
   */
  async ejecutar(id) {
    return await this.repositorio.buscarPorId(id);
  }
}

module.exports = ManejadorConsultaPracticaPorId;
