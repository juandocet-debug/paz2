/**
 * ManejadorConsultaPracticas.js — Caso de uso: listar prácticas paginadas.
 *
 * Responsabilidad única: ejecutar búsqueda con filtros/paginación/orden.
 * Recibe un RepositorioPracticas (puerto) por inyección.
 */

class ManejadorConsultaPracticas {
  /** @param {import('../dominio/RepositorioPracticas')} repositorio */
  constructor(repositorio) {
    this.repositorio = repositorio;
  }

  /**
   * @param {import('./ConsultaPracticas')} consulta
   * @returns {{ registros: object[], total: number }}
   */
  async ejecutar(consulta) {
    const { registros, total } = await this.repositorio.buscarTodas(consulta);
    const paginasTotales = Math.ceil(total / consulta.tamanioPagina) || 1;

    return {
      registros,
      total,
      paginasTotales,
    };
  }
}

module.exports = ManejadorConsultaPracticas;
