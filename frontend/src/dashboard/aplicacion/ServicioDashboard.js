/**
 * ServicioDashboard.js — Servicio de aplicación para el slice de Dashboard.
 *
 * Recibe el adaptador Api como dependencia inyectada.
 * Las páginas solo interactúan con este servicio, nunca con la Api directamente.
 */
import Dashboard from '../dominio/Dashboard.js';
import * as api from '../infraestructura/ApiDashboard.js';

class ServicioDashboard {
  /** @param {typeof api} apiDashboard — adaptador de infraestructura */
  constructor(apiDashboard) {
    this.api = apiDashboard;
  }

  /**
   * Carga los datos completos del dashboard analítico.
   * @returns {Dashboard}
   */
  async cargarDashboard() {
    const datos = await this.api.obtenerDashboard();
    return Dashboard.desdeApi(datos);
  }
}

/** Instancia singleton con la Api real inyectada */
const servicioDashboard = new ServicioDashboard(api);
export default servicioDashboard;
