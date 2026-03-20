/**
 * ComandoEnviarMensaje.js — DTO para el comando de enviar un mensaje al chat.
 */

class ComandoEnviarMensaje {
  /**
   * @param {string} mensaje — Texto del usuario
   * @param {Array<{ role: string, content: string }>} historial — Últimos turnos de conversación
   */
  constructor({ mensaje, historial = [] }) {
    this.mensaje   = mensaje;
    this.historial = historial;
  }
}

module.exports = ComandoEnviarMensaje;
