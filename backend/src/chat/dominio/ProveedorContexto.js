/**
 * ProveedorContexto.js — Puerto (interfaz abstracta) para obtener
 * datos del sistema que alimentan el prompt del chat.
 *
 * Desacopla el slice de chat del slice de analíticas/prácticas.
 * El chat no sabe de dónde vienen los datos, solo los consume.
 */

class ProveedorContexto {
  /**
   * Obtiene los datos analíticos del observatorio para el prompt.
   * @returns {object} Datos del dashboard (kpis, distribuciones, etc.)
   */
  obtenerAnaliticas() {
    throw new Error('No implementado: obtenerAnaliticas');
  }

  /**
   * Obtiene una muestra de prácticas para incluir en el prompt.
   * @param {number} cantidad
   * @returns {object[]} Array de prácticas
   */
  obtenerMuestraPracticas(_cantidad) {
    throw new Error('No implementado: obtenerMuestraPracticas');
  }
}

module.exports = ProveedorContexto;
