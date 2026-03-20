/**
 * ProveedorIAGroq.js — Implementación concreta del puerto ProveedorIA
 * usando la API de Groq con el modelo Llama 3.3 70B.
 */
const ProveedorIA = require('../dominio/ProveedorIA');

const URL_API_GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO       = 'llama-3.3-70b-versatile';

class ProveedorIAGroq extends ProveedorIA {
  /** @param {string} apiKey — Clave de la API de Groq */
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async enviarMensaje(mensajes) {
    const respuesta = await fetch(URL_API_GROQ, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       MODELO,
        messages:    mensajes,
        max_tokens:  600,
        temperature: 0.4,
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.json().catch(() => ({}));
      const error = new Error(detalle.error?.message || `Error de Groq ${respuesta.status}`);
      error.status = 502;
      throw error;
    }

    const datos = await respuesta.json();
    return datos.choices?.[0]?.message?.content || 'Sin respuesta.';
  }
}

module.exports = ProveedorIAGroq;
