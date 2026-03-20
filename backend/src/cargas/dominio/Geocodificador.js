/**
 * Geocodificador.js — Puerto (interfaz abstracta) para geocodificación.
 *
 * Define el contrato que cualquier implementación concreta debe cumplir.
 * La capa de aplicación depende SOLO de este puerto.
 */

class Geocodificador {
  /**
   * Obtiene las coordenadas geográficas de un municipio y departamento.
   * @param {string} municipio
   * @param {string} departamento
   * @returns {Promise<{lat: number, lng: number}|null>}
   */
  async geocodificar(_municipio, _departamento) {
    throw new Error('No implementado: geocodificar');
  }
}

module.exports = Geocodificador;
