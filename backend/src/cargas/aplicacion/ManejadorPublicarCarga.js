/**
 * ManejadorPublicarCarga.js — Caso de uso para establecer una carga como publicada
 * y que sea la única visible en la Vista Pública.
 */
class ManejadorPublicarCarga {
  /**
   * @param {import('../dominio/RepositorioCargas')} repositorioCargas
   */
  constructor(repositorioCargas) {
    this.repositorioCargas = repositorioCargas;
  }

  async ejecutar(id) {
    const carga = await this.repositorioCargas.buscarPorId(id);
    if (!carga) {
      throw Object.assign(new Error('Carga no encontrada'), { status: 404 });
    }

    await this.repositorioCargas.marcarPublicado(id);
    return {
      exito: true,
      mensaje: `La carga ID ${id} ahora es la fuente de datos de la Vista Pública.`,
    };
  }
}

module.exports = ManejadorPublicarCarga;
