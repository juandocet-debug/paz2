/**
 * PaginaLogin.jsx — Pantalla de inicio de sesión del Observatorio.
 *
 * Envía credenciales al backend y guarda el JWT en localStorage.
 */
import { useState } from 'react';
import { enviar } from '../../compartido/infraestructura/ClienteHttp.js';

export default function PaginaLogin({ onLogin }) {
  const [usuario,   setUsuario]   = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error,     setError]     = useState('');
  const [cargando,  setCargando]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await enviar('/auth/login', { usuario, contrasena });
      localStorage.setItem('observatorio_token', data.token);
      localStorage.setItem('observatorio_usuario', data.usuario);
      onLogin(data.token);
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #0D1B6F 0%, #003DA5 50%, #0072CE 100%)',
      fontFamily: "'Inter', system-ui, sans-serif", padding: '1rem',
    }}>
      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.97)', borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)', padding: '2.5rem 2rem',
        width: '100%', maxWidth: '400px', textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: '16px', margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, #0D1B6F, #003DA5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: 'white', fontWeight: 800, letterSpacing: '-1px',
          boxShadow: '0 8px 20px rgba(13,27,111,0.4)',
        }}>UPN</div>

        <h1 style={{ color: '#0D1B6F', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
          Observatorio UPN
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 2rem' }}>
          Paz, Memoria y Derechos Humanos
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            Usuario
          </label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => { setUsuario(e.target.value); setError(''); }}
            placeholder="admin"
            autoComplete="username"
            style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
              border: error ? '2px solid #ef4444' : '1.5px solid #E2E8F0',
              fontSize: '0.95rem', marginBottom: '1rem', outline: 'none',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
          />

          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => { setContrasena(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
              border: error ? '2px solid #ef4444' : '1.5px solid #E2E8F0',
              fontSize: '0.95rem', marginBottom: error ? '0.5rem' : '1.5rem',
              outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{
              color: '#ef4444', fontSize: '0.82rem', fontWeight: 500,
              margin: '0 0 1rem', padding: '0.5rem 0.75rem',
              background: '#fef2f2', borderRadius: '8px', textAlign: 'center',
            }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
              background: cargando ? '#94a3b8' : 'linear-gradient(135deg, #0D1B6F, #003DA5)',
              color: 'white', fontWeight: 700, fontSize: '1rem', cursor: cargando ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', transition: 'opacity 0.2s',
              boxShadow: cargando ? 'none' : '0 4px 14px rgba(13,27,111,0.35)',
            }}
          >
            {cargando ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Acceso restringido al personal autorizado UPN
        </p>
      </div>
    </div>
  );
}
