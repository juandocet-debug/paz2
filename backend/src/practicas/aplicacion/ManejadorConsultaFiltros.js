/**
 * ManejadorConsultaFiltros.js — Caso de uso: obtener valores distintos para dropdowns.
 *
 * Responsabilidad única: retornar los valores únicos de columnas filtradas.
 */

class ManejadorConsultaFiltros {
  /** @param {import('../dominio/RepositorioPracticas')} repositorio */
  constructor(repositorio) {
    this.repositorio = repositorio;
  }

  /**
   * @returns {{ departamentos: string[], tipos: string[], jornadas: string[] }}
   */
  async ejecutar() {
    const [departamentos, tipos, formaciones, jornadas] = await Promise.all([
      this.repositorio.valoresDistintos('departamento'),
      this.repositorio.valoresDistintos('tipo_institucion'),
      this.repositorio.valoresDistintos('recibio_formacion'),
      this.repositorio.valoresDistintos('jornada')
    ]);

    return { departamentos, tipos, formaciones, jornadas };
  }
}

module.exports = ManejadorConsultaFiltros;
