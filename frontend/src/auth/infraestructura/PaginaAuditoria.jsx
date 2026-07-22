import { useState } from 'react';
import { consultarAuditoria } from '../../compartido/infraestructura/ClienteHttp.js';

export default function PaginaAuditoria() {
  const [clave, setClave] = useState('');
  const [accesos, setAccesos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const consultar = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    setError('');
    try {
      const datos = await consultarAuditoria(clave);
      setAccesos(datos.accesos || []);
      setClave('');
    } catch {
      setAccesos(null);
      setError('No fue posible consultar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 14, boxShadow: '0 8px 30px #0d1b6f14' }}>
          <h1 style={{ margin: '0 0 6px', color: '#0D1B6F', fontSize: 24 }}>Registro de accesos</h1>
          <p style={{ margin: '0 0 20px', color: '#64748b' }}>Consulta interna de intentos de autenticación.</p>

          <form onSubmit={consultar} style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Clave privada"
              autoComplete="off"
              required
              style={{ flex: 1, padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: 9 }}
            />
            <button disabled={cargando} style={{ padding: '11px 20px', border: 0, borderRadius: 9, background: '#0D1B6F', color: 'white', fontWeight: 700 }}>
              {cargando ? 'Consultando…' : 'Consultar'}
            </button>
          </form>

          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {accesos && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ background: '#eef2ff', textAlign: 'left' }}>
                  {['Fecha', 'Usuario', 'Resultado', 'IP', 'Navegador'].map((titulo) => <th key={titulo} style={{ padding: 11 }}>{titulo}</th>)}
                </tr></thead>
                <tbody>
                  {accesos.map((acceso) => (
                    <tr key={acceso.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 11, whiteSpace: 'nowrap' }}>{new Date(acceso.fecha).toLocaleString('es-CO')}</td>
                      <td style={{ padding: 11 }}>{acceso.usuario}</td>
                      <td style={{ padding: 11, color: acceso.exitoso ? '#15803d' : '#b91c1c', fontWeight: 700 }}>{acceso.exitoso ? 'Exitoso' : 'Fallido'}</td>
                      <td style={{ padding: 11 }}>{acceso.ip || '—'}</td>
                      <td style={{ padding: 11, maxWidth: 400, overflowWrap: 'anywhere' }}>{acceso.navegador || '—'}</td>
                    </tr>
                  ))}
                  {!accesos.length && <tr><td colSpan="5" style={{ padding: 18, textAlign: 'center', color: '#64748b' }}>Todavía no hay accesos registrados.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
