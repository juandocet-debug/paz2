/**
 * ApiMapa.js — Adaptador de infraestructura para la API del mapa de calor.
 */
import { obtener } from '../../compartido/infraestructura/ClienteHttp.js';

export function obtenerPuntosMapa() {
  return obtener('/analytics/mapa');
}
