/**
 * Practica.js — Entidad de dominio que representa una práctica educativa.
 *
 * Contiene los campos del registro y un factory method para mapear
 * desde una fila de base de datos.
 */

/** Campos válidos de la entidad Practica */
const CAMPOS = [
  'id', 'id_carga', 'fecha', 'institucion', 'sede', 'tipo_institucion',
  'nombre_practica', 'grados', 'areas', 'responsables', 'departamento',
  'municipio', 'jornada', 'edad_estudiantes', 'edad_docentes',
  'edad_comunidad', 'redes_sociales', 'web', 'conflictos_tipo',
  'politicas_relacionadas', 'temas_catedra_paz', 'frecuencia_lineamientos',
  'documentos_men', 'recibio_formacion', 'entidades_cajas',
  'criterios_materiales', 'disenaron_materiales', 'obstaculos',
  'facilidades_sostenibilidad', 'creado_en',
];

class Practica {
  constructor(datos = {}) {
    for (const campo of CAMPOS) {
      this[campo] = datos[campo] ?? null;
    }
  }

  /** Crea una instancia de Practica a partir de una fila de la BD */
  static desdeFila(fila) {
    return new Practica(fila);
  }
}

module.exports = { Practica, CAMPOS };
