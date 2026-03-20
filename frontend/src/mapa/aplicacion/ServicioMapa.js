/**
 * ServicioMapa.js — Servicio de aplicación para el slice de Mapa.
 *
 * Recibe el adaptador Api como dependencia inyectada.
 * Las páginas solo interactúan con este servicio.
 */
import PuntoMapa from '../dominio/PuntoMapa.js';
import * as api from '../infraestructura/ApiMapa.js';

class ServicioMapa {
  /** @param {typeof api} apiMapa — adaptador de infraestructura */
  constructor(apiMapa) {
    this.api = apiMapa;
  }

  /**
   * Obtiene los puntos georeferenciados para el mapa de calor.
   * @returns {PuntoMapa[]}
   */
  async obtenerPuntos() {
    const datos = await this.api.obtenerPuntosMapa();
    return (datos ?? []).map(PuntoMapa.desdeApi);
  }
}

/** Instancia singleton con la Api real inyectada */
const servicioMapa = new ServicioMapa(api);
export default servicioMapa;
