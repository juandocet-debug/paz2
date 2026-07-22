import { Fragment, useState } from 'react';
import { consultarAuditoria } from '../../compartido/infraestructura/ClienteHttp.js';

function duracion(segundos = 0) {
  const total = Math.max(0, Number(segundos) || 0);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segs = total % 60;
  if (horas) return `${horas} h ${minutos} min`;
  if (minutos) return `${minutos} min ${segs} s`;
  return `${segs} s`;
}

function hora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
}

export default function PaginaAuditoria() {
  const [clave, setClave] = useState('');
  const [accesos, setAccesos] = useState(null);
  const [sesiones, setSesiones] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [abierta, setAbierta] = useState(null);

  const consultar = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    setError('');
    try {
      const datos = await consultarAuditoria(clave);
      setAccesos(datos.accesos || []);
      setSesiones(datos.sesiones || []);
      setClave('');
    } catch {
      setAccesos(null);
      setSesiones(null);
      setError('No fue posible consultar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1250, margin: '0 auto' }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 14, boxShadow: '0 8px 30px #0d1b6f14' }}>
          <h1 style={{ margin: '0 0 6px', color: '#0D1B6F', fontSize: 24 }}>Actividad de usuarios</h1>
          <p style={{ margin: '0 0 20px', color: '#64748b' }}>Tiempo aproximado en el sistema y recorrido por sus módulos.</p>

          <form onSubmit={consultar} style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Clave privada"
              autoComplete="off" required style={{ flex: 1, padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: 9 }} />
            <button disabled={cargando} style={{ padding: '11px 20px', border: 0, borderRadius: 9, background: '#0D1B6F', color: 'white', fontWeight: 700 }}>
              {cargando ? 'Consultando…' : 'Consultar'}
            </button>
          </form>

          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

          {sesiones && <>
            <h2 style={{ color: '#0D1B6F', fontSize: 18, margin: '4px 0 12px' }}>Sesiones registradas</h2>
            <div style={{ overflowX: 'auto', marginBottom: 26 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ background: '#0D1B6F', color: 'white', textAlign: 'left' }}>
                  {['Inicio', 'Usuario', 'Duración', 'Última actividad', 'IP', 'Recorrido'].map((titulo) => <th key={titulo} style={{ padding: 11 }}>{titulo}</th>)}
                </tr></thead>
                <tbody>
                  {sesiones.map((sesion) => <Fragment key={sesion.id}>
                    <tr key={sesion.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 11, whiteSpace: 'nowrap' }}>{new Date(sesion.inicio).toLocaleString('es-CO')}</td>
                      <td style={{ padding: 11 }}>{sesion.usuario}</td>
                      <td style={{ padding: 11, fontWeight: 800, color: '#0D1B6F', whiteSpace: 'nowrap' }}>{duracion(sesion.duracion_segundos)}</td>
                      <td style={{ padding: 11, whiteSpace: 'nowrap' }}>{hora(sesion.ultima_actividad)}</td>
                      <td style={{ padding: 11 }}>{sesion.ip || '—'}</td>
                      <td style={{ padding: 11 }}>
                        <button onClick={() => setAbierta(abierta === sesion.id ? null : sesion.id)} style={{ border: 0, borderRadius: 8, padding: '7px 10px', background: '#e8eefc', color: '#0D1B6F', fontWeight: 700, cursor: 'pointer' }}>
                          {sesion.eventos.length} pasos {abierta === sesion.id ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {abierta === sesion.id && <tr key={`${sesion.id}-detalle`}>
                      <td colSpan="6" style={{ padding: '12px 16px 18px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {sesion.eventos.map((evento, indice) => (
                            <div key={evento.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              {indice > 0 && <span style={{ color: '#94a3b8' }}>→</span>}
                              <span style={{ background: evento.tipo === 'cierre' ? '#fee2e2' : '#e0e7ff', color: evento.tipo === 'cierre' ? '#991b1b' : '#1e3a8a', borderRadius: 999, padding: '6px 10px', whiteSpace: 'nowrap' }}>
                                <strong>{evento.seccion}</strong> · {hora(evento.fecha)}
                              </span>
                            </div>
                          ))}
                          {!sesion.eventos.length && <span style={{ color: '#64748b' }}>No se registraron cambios de sección.</span>}
                        </div>
                      </td>
                    </tr>}
                  </Fragment>)}
                  {!sesiones.length && <tr><td colSpan="6" style={{ padding: 18, textAlign: 'center', color: '#64748b' }}>Las sesiones nuevas aparecerán aquí.</td></tr>}
                </tbody>
              </table>
            </div>
          </>}

          {accesos && <details>
            <summary style={{ color: '#0D1B6F', fontWeight: 800, cursor: 'pointer', marginBottom: 12 }}>Ver intentos de acceso ({accesos.length})</summary>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ background: '#eef2ff', textAlign: 'left' }}>
                  {['Fecha', 'Usuario', 'Resultado', 'IP', 'Navegador'].map((titulo) => <th key={titulo} style={{ padding: 11 }}>{titulo}</th>)}
                </tr></thead>
                <tbody>{accesos.map((acceso) => (
                  <tr key={acceso.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: 11, whiteSpace: 'nowrap' }}>{new Date(acceso.fecha).toLocaleString('es-CO')}</td>
                    <td style={{ padding: 11 }}>{acceso.usuario}</td>
                    <td style={{ padding: 11, color: acceso.exitoso ? '#15803d' : '#b91c1c', fontWeight: 700 }}>{acceso.exitoso ? 'Exitoso' : 'Fallido'}</td>
                    <td style={{ padding: 11 }}>{acceso.ip || '—'}</td>
                    <td style={{ padding: 11, maxWidth: 400, overflowWrap: 'anywhere' }}>{acceso.navegador || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </details>}
        </div>
      </div>
    </div>
  );
}
