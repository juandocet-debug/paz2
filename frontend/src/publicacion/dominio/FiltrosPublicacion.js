/**
 * FiltrosPublicacion.js — Modelo de dominio para los filtros de la vista pública.
 */
export default class FiltrosPublicacion {
  constructor({
    departamento = '',
    municipio = '',
    tipoInstitucion = '',
    jornada = '',
    area = '',
  } = {}) {
    this.departamento    = departamento;
    this.municipio       = municipio;
    this.tipoInstitucion = tipoInstitucion;
    this.jornada         = jornada;
    this.area            = area;
  }

  /** Retorna los filtros como query string para la URL */
  toQueryString() {
    const params = new URLSearchParams();
    if (this.departamento)    params.set('departamento', this.departamento);
    if (this.municipio)       params.set('municipio', this.municipio);
    if (this.tipoInstitucion) params.set('tipoInstitucion', this.tipoInstitucion);
    if (this.jornada)         params.set('jornada', this.jornada);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  /** Verifica si hay al menos un filtro activo */
  tieneAlguno() {
    return !!(this.departamento || this.municipio || this.tipoInstitucion || this.jornada || this.area);
  }
}
