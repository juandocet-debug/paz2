/**
 * ComandoCargarArchivo.js — DTO para el comando de subir un archivo Excel.
 */

class ComandoCargarArchivo {
  constructor({ rutaArchivo, nombreOriginal, nombreGuardado }) {
    this.rutaArchivo    = rutaArchivo;
    this.nombreOriginal = nombreOriginal;
    this.nombreGuardado = nombreGuardado;
  }
}

module.exports = ComandoCargarArchivo;
