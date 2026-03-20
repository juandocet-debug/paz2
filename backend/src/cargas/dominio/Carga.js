/**
 * Carga.js — Entidad de dominio que representa una carga de archivo Excel.
 */

class Carga {
  constructor({ id = null, nombre_original = '', nombre_guardado = '', cantidad_registros = 0, fecha_carga = null } = {}) {
    this.id = id;
    this.nombre_original = nombre_original;
    this.nombre_guardado = nombre_guardado;
    this.cantidad_registros = cantidad_registros;
    this.fecha_carga = fecha_carga;
  }

  static desdeFila(fila) {
    return new Carga(fila);
  }
}

module.exports = Carga;
