/**
 * MensajeChat.js — Modelo de dominio para un mensaje de chat.
 *
 * Sin imports externos — lógica pura de dominio.
 */
export default class MensajeChat {
  /**
   * @param {'user'|'assistant'} rol — Emisor del mensaje.
   * @param {string} contenido — Texto del mensaje.
   */
  constructor(rol, contenido) {
    this.rol = rol;
    this.contenido = contenido;
  }

  /** ¿Es un mensaje del usuario? */
  get esUsuario() {
    return this.rol === 'user';
  }

  /**
   * Crea una instancia de MensajeChat a partir de la respuesta de la API.
   * @param {Object} datos — { reply: string }
   * @returns {MensajeChat}
   */
  static desdeApi(datos) {
    return new MensajeChat('assistant', datos.reply ?? datos.content ?? '');
  }

  /**
   * Crea un mensaje del usuario.
   * @param {string} texto
   * @returns {MensajeChat}
   */
  static deUsuario(texto) {
    return new MensajeChat('user', texto);
  }

  /**
   * Crea un mensaje del asistente.
   * @param {string} texto
   * @returns {MensajeChat}
   */
  static deAsistente(texto) {
    return new MensajeChat('assistant', texto);
  }

  /** Convierte al formato que espera la API para el historial */
  paraApi() {
    return { role: this.rol, content: this.contenido };
  }
}
