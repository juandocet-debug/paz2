/**
 * ApiCargas.js — Adaptador de infraestructura para la API de cargas.
 */
import { obtener, enviarArchivo, eliminar, parchear } from '../../compartido/infraestructura/ClienteHttp.js';

export function obtenerCargas() { return obtener('/uploads'); }
export function subirArchivo(archivo) { return enviarArchivo('/uploads', archivo); }
export function eliminarCarga(id) { return eliminar(`/uploads/${id}`); }
export function publicar(id) { return parchear(`/uploads/${id}/publicar`); }
