/**
 * AnalizadorExcel.js — Puerto (interfaz abstracta) para parseo de archivos Excel.
 *
 * La implementación concreta (xlsx, exceljs, etc.) vive en infraestructura.
 */

class AnalizadorExcel {
  /**
   * Parsea un archivo Excel y retorna prácticas normalizadas.
   * @param {string} rutaArchivo — ruta absoluta al archivo
   * @returns {{ practicas: object[], nombreHoja: string }}
   */
  parsear(_rutaArchivo) {
    throw new Error('No implementado: parsear');
  }
}

module.exports = AnalizadorExcel;
