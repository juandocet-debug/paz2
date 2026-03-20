/**
 * ServicioCargas.js — Servicio de aplicación para el slice de Cargas.
 *
 * Recibe el adaptador Api como dependencia inyectada.
 * Las páginas solo interactúan con este servicio, nunca con la Api directamente.
 */
import Carga from '../dominio/Carga.js';
import * as api from '../infraestructura/ApiCargas.js';

class ServicioCargas {
  /** @param {typeof api} apiCargas — adaptador de infraestructura */
  constructor(apiCargas) {
    this.api = apiCargas;
  }

  /**
   * Obtiene la lista de todas las cargas realizadas.
   * @returns {Carga[]}
   */
  async listarCargas() {
    const datos = await this.api.obtenerCargas();
    return (datos ?? []).map(Carga.desdeApi);
  }

  /**
   * Sube un archivo Excel al servidor.
   * @param {File} archivo — archivo .xlsx o .xls
   * @returns {{ message: string }}
   */
  async subirArchivo(archivo) {
    return this.api.subirArchivo(archivo);
  }

  /**
   * Elimina una carga y todas sus prácticas asociadas.
   * @param {number} id
   */
  async eliminarCarga(id) {
    return this.api.eliminarCarga(id);
  }

  /**
   * Marca una carga como publicada para filtrarla en la Vista Pública.
   * @param {number} id
   */
  async publicarCarga(id) {
    return this.api.publicar(id);
  }
}

/** Instancia singleton con la Api real inyectada */
const servicioCargas = new ServicioCargas(api);
export default servicioCargas;
