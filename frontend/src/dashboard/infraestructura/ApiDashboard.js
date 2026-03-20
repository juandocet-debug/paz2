/**
 * ApiDashboard.js — Adaptador de infraestructura para la API de analíticas.
 */
import { obtener } from '../../compartido/infraestructura/ClienteHttp.js';

export function obtenerDashboard() {
  return obtener('/analytics/dashboard');
}
