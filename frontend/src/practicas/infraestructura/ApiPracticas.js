/**
 * ApiPracticas.js — Adaptador de infraestructura para la API de prácticas.
 */
import { obtener } from '../../compartido/infraestructura/ClienteHttp.js';

export function obtenerPracticas(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return obtener(`/practices${qs ? '?' + qs : ''}`);
}

export function obtenerPracticaPorId(id) {
  return obtener(`/practices/${id}`);
}

export function obtenerFiltros() {
  return obtener('/practices/filters');
}
