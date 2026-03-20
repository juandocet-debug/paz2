/**
 * ManejadorCargarArchivo.js — Caso de uso: procesar y almacenar un archivo Excel.
 *
 * Orquesta: parsear → crear registro de carga → insertar prácticas masivamente.
 * Después dispara la geocodificación en background sin bloquear la respuesta.
 * Recibe los cuatro puertos por inyección.
 */

class ManejadorCargarArchivo {
  /**
   * @param {import('../dominio/RepositorioCargas')} repositorioCargas
   * @param {import('../dominio/AnalizadorExcel')} analizadorExcel
   * @param {import('../../practicas/dominio/RepositorioPracticas')} repositorioPracticas
   * @param {import('../dominio/Geocodificador')} geocodificador
   */
  constructor(repositorioCargas, analizadorExcel, repositorioPracticas, geocodificador) {
    this.repositorioCargas    = repositorioCargas;
    this.analizadorExcel      = analizadorExcel;
    this.repositorioPracticas = repositorioPracticas;
    this.geocodificador       = geocodificador;
  }

  /**
   * @param {import('./ComandoCargarArchivo')} comando
   * @returns {{ idCarga: number, cantidadRegistros: number }}
   */
  async ejecutar(comando) {
    const { practicas } = this.analizadorExcel.parsear(comando.rutaArchivo);

    const idCarga = await this.repositorioCargas.crear({
      nombre_original:    comando.nombreOriginal,
      nombre_guardado:    comando.nombreGuardado,
      cantidad_registros: practicas.length,
    });

    await this.repositorioPracticas.insertarMasivo(idCarga, practicas);

    /* Geocodificación en background — no bloquea la respuesta HTTP */
    this._geocodificarEnBackground(idCarga, practicas);

    return { idCarga, cantidadRegistros: practicas.length };
  }

  /**
   * Itera las prácticas insertadas y actualiza coordenadas.
   * Se ejecuta sin await para no bloquear.
   */
  async _geocodificarEnBackground(idCarga, practicas) {
    if (!this.geocodificador) return;

    console.log(`🌍 Iniciando geocodificación de ${practicas.length} prácticas (carga #${idCarga})...`);

    /* Obtener los IDs de las prácticas recién insertadas */
    const { registros } = await this.repositorioPracticas.buscarTodas({
      busqueda: '', departamento: '', tipo: '', formacion: '',
      pagina: 1, tamanioPagina: practicas.length,
      campoOrden: 'id', direccionOrden: 'DESC', idCarga,
    });

    let geocodificadas = 0;
    for (const practica of registros) {
      if (!practica.municipio || !practica.departamento) continue;
      try {
        const coords = await this.geocodificador.geocodificar(
          practica.municipio, practica.departamento, practica.sede
        );
        if (coords) {
          await this.repositorioPracticas.actualizarCoordenadas(practica.id, coords.lat, coords.lng);
          geocodificadas++;
        }
      } catch (err) {
        console.error(`❌ Error geocodificando práctica #${practica.id}:`, err.message);
      }
    }

    console.log(`✅ Geocodificación completada: ${geocodificadas}/${practicas.length} prácticas georeferenciadas.`);
  }
}

module.exports = ManejadorCargarArchivo;
