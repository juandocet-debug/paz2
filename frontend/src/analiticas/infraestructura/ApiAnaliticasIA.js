/**
 * ApiAnaliticasIA.js — Adaptador de infraestructura para el análisis IA.
 */
import { obtener, enviar } from '../../compartido/infraestructura/ClienteHttp.js';

/** Dispara el análisis IA en el backend (solo panel interno) */
export function disparar() {
  return enviar('/analytics/analizar', {});
}

/** Obtiene las interpretaciones guardadas en SQLite */
export function obtenerInterpretacion() {
  return obtener('/analytics/interpretacion');
}

/** Obtiene interpretaciones dinámicas al vuelo basándose en filtros */
export function obtenerInterpretacionDinamica(filtros) {
  return enviar('/analytics/interpretacion-dinamica', filtros);
}
