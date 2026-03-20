/**
 * ServicioPublicacion.js — Servicio de aplicación para la vista pública.
 *
 * Orquesta la obtención de datos del dashboard, mapa y filtros disponibles.
 */
import * as api from '../infraestructura/ApiPublicacion.js';
import FiltrosPublicacion from '../dominio/FiltrosPublicacion.js';

class ServicioPublicacion {
  constructor(apiAdapter = api) {
    this.api = apiAdapter;
  }

  /**
   * Obtiene datos del dashboard con filtros opcionales.
   * @param {FiltrosPublicacion} filtros
   */
  async obtenerDashboard(filtros = new FiltrosPublicacion()) {
    const qs = filtros.toQueryString();
    return this.api.obtenerDashboard(qs);
  }

  /**
   * Obtiene puntos del mapa con filtros opcionales.
   * @param {FiltrosPublicacion} filtros
   */
  async obtenerPuntosMapa(filtros = new FiltrosPublicacion()) {
    const qs = filtros.toQueryString();
    return this.api.obtenerPuntosMapa(qs);
  }

  /** Obtiene las opciones disponibles para los dropdowns de filtros */
  async obtenerFiltrosDisponibles() {
    return this.api.obtenerFiltrosDisponibles();
  }
}

export default new ServicioPublicacion();
