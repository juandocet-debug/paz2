/**
 * ApiPublicacion.js — Adaptador HTTP: reutiliza endpoints existentes del backend.
 */
import { obtener } from '../../compartido/infraestructura/ClienteHttp.js';

export function obtenerDashboard(queryString = '') {
  return obtener(`/analytics/dashboard${queryString}`);
}

export function obtenerPuntosMapa(queryString = '') {
  return obtener(`/analytics/mapa${queryString}`);
}

export function obtenerFiltrosDisponibles() {
  return obtener('/practices/filters');
}
