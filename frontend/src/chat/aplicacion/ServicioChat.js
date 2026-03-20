/**
 * ServicioChat.js — Servicio de aplicación para el slice de Chat.
 *
 * Recibe el adaptador Api como dependencia inyectada.
 * Las páginas solo interactúan con este servicio, nunca con la Api directamente.
 */
import MensajeChat from '../dominio/MensajeChat.js';
import * as api from '../infraestructura/ApiChat.js';

class ServicioChat {
  /** @param {typeof api} apiChat — adaptador de infraestructura */
  constructor(apiChat) {
    this.api = apiChat;
  }

  /**
   * Envía un mensaje al asistente IA y devuelve la respuesta como MensajeChat.
   * @param {string} texto — texto del usuario
   * @param {MensajeChat[]} historial — mensajes previos de la conversación
   * @returns {MensajeChat}
   */
  async enviarMensaje(texto, historial = []) {
    const historialApi = historial.slice(-6).map(m => m.paraApi());
    const respuesta = await this.api.enviarMensaje(texto, historialApi);
    return MensajeChat.desdeApi(respuesta);
  }
}

/** Instancia singleton con la Api real inyectada */
const servicioChat = new ServicioChat(api);
export default servicioChat;
