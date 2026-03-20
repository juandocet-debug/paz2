/**
 * PuntoMapa.js — Modelo de dominio para un punto georeferenciado del mapa.
 *
 * Sin imports externos — lógica pura de dominio.
 */
export default class PuntoMapa {
  constructor({ latitud, longitud, institucion, sede, municipio, departamento, nombre_practica }) {
    this.latitud = latitud;
    this.longitud = longitud;
    this.institucion = institucion;
    this.sede = sede;
    this.municipio = municipio;
    this.departamento = departamento;
    this.nombre_practica = nombre_practica;
  }

  /**
   * Crea una instancia de PuntoMapa a partir de los datos de la API.
   * @param {Object} datos — Objeto JSON del endpoint /api/analytics/mapa
   * @returns {PuntoMapa}
   */
  static desdeApi(datos) {
    return new PuntoMapa({
      latitud:         datos.latitud,
      longitud:        datos.longitud,
      institucion:     datos.institucion ?? '',
      sede:            datos.sede ?? '',
      municipio:       datos.municipio ?? '',
      departamento:    datos.departamento ?? '',
      nombre_practica: datos.nombre_practica ?? '',
    });
  }
}
