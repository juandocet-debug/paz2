/**
 * Dashboard.js — Modelo de dominio para los datos del dashboard analítico.
 *
 * Sin imports externos — lógica pura de dominio.
 */
export default class Dashboard {
  constructor({
    kpis, porDepartamento, porTipoInstitucion, porJornada,
    porFrecuenciaLinea, porFormacion, porMateriales,
    porConflictos, porPoliticas, porTemasCatedraPaz, porEntidades,
  }) {
    this.kpis = kpis;
    this.porDepartamento = porDepartamento;
    this.porTipoInstitucion = porTipoInstitucion;
    this.porJornada = porJornada;
    this.porFrecuenciaLinea = porFrecuenciaLinea;
    this.porFormacion = porFormacion;
    this.porMateriales = porMateriales;
    this.porConflictos = porConflictos;
    this.porPoliticas = porPoliticas;
    this.porTemasCatedraPaz = porTemasCatedraPaz;
    this.porEntidades = porEntidades;
  }

  /**
   * Crea una instancia de Dashboard a partir de la respuesta de la API.
   * @param {Object} datos — JSON completo del endpoint /api/analytics/dashboard
   * @returns {Dashboard}
   */
  static desdeApi(datos) {
    return new Dashboard({
      kpis: {
        total:          datos.kpis?.total ?? 0,
        departamentos:  datos.kpis?.departamentos ?? 0,
        conFormacion:   datos.kpis?.conFormacion ?? 0,
        conMateriales:  datos.kpis?.conMateriales ?? 0,
      },
      porDepartamento:    datos.porDepartamento ?? [],
      porTipoInstitucion: datos.porTipoInstitucion ?? [],
      porJornada:         datos.porJornada ?? [],
      porFrecuenciaLinea: datos.porFrecuenciaLinea ?? [],
      porFormacion:       datos.porFormacion ?? [],
      porMateriales:      datos.porMateriales ?? [],
      porConflictos:      datos.porConflictos ?? [],
      porPoliticas:       datos.porPoliticas ?? [],
      porTemasCatedraPaz: datos.porTemasCatedraPaz ?? [],
      porEntidades:       datos.porEntidades ?? [],
    });
  }
}
