/**
 * ManejadorConsultaDashboard.js — Caso de uso: obtener datos del dashboard.
 *
 * Acepta filtros opcionales para la vista pública filtrada.
 */

class ManejadorConsultaDashboard {
  /** @param {import('../dominio/RepositorioAnaliticas')} repositorio */
  constructor(repositorio) {
    this.repositorio = repositorio;
  }

  /**
   * @param {object} [filtros] — { departamento, municipio, tipoInstitucion, jornada }
   */
  async ejecutar(filtros = {}) {
    const [
      kpisRaw, porDepartamento, porTipoInstitucion, porJornada,
      porFrecuenciaLinea, porFormacion, porMateriales,
      porConflictos, porPoliticas, porTemasCatedraPaz, porEntidades
    ] = await Promise.all([
      this.repositorio.kpis(filtros),
      this.repositorio.contarPorColumna('departamento', filtros),
      this.repositorio.contarPorColumna('tipo_institucion', filtros),
      this.repositorio.contarPorColumna('jornada', filtros),
      this.repositorio.contarPorColumna('frecuencia_lineamientos', filtros),
      this.repositorio.contarPorColumna('recibio_formacion', filtros),
      this.repositorio.contarPorColumna('disenaron_materiales', filtros),
      this.repositorio.contarMultivalor('conflictos_tipo', filtros),
      this.repositorio.contarMultivalor('politicas_relacionadas', filtros),
      this.repositorio.contarMultivalor('temas_catedra_paz', filtros),
      this.repositorio.contarMultivalor('entidades_cajas', filtros)
    ]);

    return {
      kpis: {
        total:         kpisRaw.total,
        departamentos: kpisRaw.departamentos,
        conFormacion:  kpisRaw.con_formacion,
        conMateriales: kpisRaw.con_materiales,
      },
      porDepartamento: porDepartamento.slice(0, 10),
      porTipoInstitucion,
      porJornada,
      porFrecuenciaLinea,
      porFormacion,
      porMateriales,
      porConflictos,
      porPoliticas,
      porTemasCatedraPaz,
      porEntidades,
    };
  }
}

module.exports = ManejadorConsultaDashboard;
