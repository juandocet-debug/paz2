/**
 * ClienteHttp.js — Cliente HTTP centralizado para el frontend React.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

async function solicitud(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, opciones);
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  }
  return respuesta.json();
}

export function obtener(ruta) {
  return solicitud(ruta);
}

export function enviar(ruta, datos) {
  return solicitud(ruta, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(datos),
  });
}

export function enviarArchivo(ruta, archivo) {
  const formData = new FormData();
  formData.append('file', archivo);
  return solicitud(ruta, { method: 'POST', body: formData });
}

export function eliminar(ruta) {
  return solicitud(ruta, { method: 'DELETE' });
}

export function parchear(ruta, datos = {}) {
  return solicitud(ruta, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(datos),
  });
}

export function consultarAuditoria(clave) {
  return solicitud('/internal/access-audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Audit-Key': clave,
    },
    body: '{}',
  });
}
