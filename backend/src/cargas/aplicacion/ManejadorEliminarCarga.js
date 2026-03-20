/**
 * ManejadorEliminarCarga.js — Caso de uso: eliminar una carga y sus prácticas.
 *
 * Elimina explícitamente las prácticas antes de la carga porque sql.js
 * no siempre respeta ON DELETE CASCADE.
 * El archivo físico se elimina de forma best-effort.
 */
const fs = require('fs');
const path = require('path');

const DIRECTORIO_UPLOADS = path.join(__dirname, '../../../uploads');

class ManejadorEliminarCarga {
  /**
   * @param {import('../dominio/RepositorioCargas')} repositorioCargas
   * @param {import('../../practicas/dominio/RepositorioPracticas')} repositorioPracticas
   */
  constructor(repositorioCargas, repositorioPracticas) {
    this.repositorioCargas    = repositorioCargas;
    this.repositorioPracticas = repositorioPracticas;
  }

  /**
   * @param {number} id
   * @returns {{ mensaje: string }}
   * @throws Error si la carga no existe
   */
  async ejecutar(id) {
    console.log(`🗑️  Eliminando carga #${id}...`);

    const carga = await this.repositorioCargas.buscarPorId(id);
    if (!carga) {
      const error = new Error('Carga no encontrada');
      error.status = 404;
      throw error;
    }

    /* ── 1. Eliminar prácticas de esta carga explícitamente ── */
    await this.repositorioPracticas.eliminarPorCargaId(id);
    console.log(`   ✔ Prácticas de la carga #${id} eliminadas`);

    /* ── 2. Eliminar el registro de carga ── */
    await this.repositorioCargas.eliminarPorId(id);
    console.log(`   ✔ Registro de carga #${id} eliminado`);

    /* ── 3. Red de seguridad: limpiar cualquier huérfana restante ── */
    await this.repositorioPracticas.eliminarHuerfanas();
    console.log(`   ✔ Limpieza de prácticas huérfanas completada`);

    /* ── 4. Eliminar el archivo físico (best-effort) ── */
    const rutaArchivo = path.join(DIRECTORIO_UPLOADS, carga.stored_name);
    fs.unlink(rutaArchivo, () => {});

    return { mensaje: 'Carga eliminada correctamente.' };
  }
}

module.exports = ManejadorEliminarCarga;
