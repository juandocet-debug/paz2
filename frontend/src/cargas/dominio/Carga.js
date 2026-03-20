/**
 * Carga.js — Modelo de dominio para una carga (importación de archivo).
 *
 * Sin imports externos — lógica pura de dominio.
 */
export default class Carga {
  constructor({ id, nombreOriginal, nombreAlmacenado, cantidadRegistros, fechaCarga, publicado }) {
    this.id = id;
    this.nombreOriginal = nombreOriginal;
    this.nombreAlmacenado = nombreAlmacenado;
    this.cantidadRegistros = cantidadRegistros;
    this.fechaCarga = fechaCarga;
    this.publicado = publicado;
  }

  /**
   * Crea una instancia de Carga a partir de los datos crudos de la API.
   * @param {Object} datos — Objeto JSON devuelto por el backend.
   * @returns {Carga}
   */
  static desdeApi(datos) {
    return new Carga({
      id:                 datos.id,
      nombreOriginal:     datos.original_name ?? null,
      nombreAlmacenado:   datos.stored_name ?? null,
      cantidadRegistros:  datos.records_count ?? 0,
      fechaCarga:         datos.uploaded_at ?? null,
      publicado:          Boolean(datos.publicado),
    });
  }

  /** Formatea la fecha de carga para visualización */
  get fechaFormateada() {
    if (!this.fechaCarga) return '—';
    const d = new Date(this.fechaCarga);
    return isNaN(d) ? this.fechaCarga : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
