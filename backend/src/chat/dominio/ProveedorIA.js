/**
 * ProveedorIA.js — Puerto (interfaz abstracta) para proveedores de IA.
 *
 * Permite sustituir Groq/Llama por OpenAI, Anthropic u otro proveedor
 * sin tocar la lógica de aplicación.
 */

class ProveedorIA {
  /**
   * Envía una conversación al modelo de IA y retorna la respuesta.
   * @param {Array<{ role: string, content: string }>} mensajes
   * @returns {Promise<string>} Texto de respuesta del modelo
   */
  async enviarMensaje(_mensajes) {
    throw new Error('No implementado: enviarMensaje');
  }
}

module.exports = ProveedorIA;
