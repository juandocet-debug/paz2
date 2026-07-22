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
      fontFamily: "'Inter', system-ui, sans-serif", padding: '1.5rem', boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes demoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes demoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(242, 101, 34, .34); }
          50% { box-shadow: 0 0 0 10px rgba(242, 101, 34, 0); }
        }
        .login-layout {
          width: 100%; max-width: 900px; display: flex; align-items: center;
          justify-content: center; gap: 3rem;
        }
        .demo-card { animation: demoFloat 4s ease-in-out infinite; }
        .demo-download { animation: demoPulse 2.4s ease-out infinite; }
        .demo-download:hover { transform: translateY(-2px); filter: brightness(1.06); }
        @media (prefers-reduced-motion: reduce) {
          .demo-card, .demo-download { animation: none; }
        }
        @media (max-width: 780px) {
          .login-layout { flex-direction: column-reverse; gap: 1.25rem; }
          .demo-card { width: min(400px, 100%) !important; animation: none; }
        }
      `}</style>

      <div className="login-layout">
        <aside className="demo-card" style={{
          width: 310, boxSizing: 'border-box', padding: '1.65rem', borderRadius: 18,
          color: 'white', background: 'rgba(6, 24, 92, 0.78)',
          border: '1px solid rgba(255,255,255,0.24)',
          boxShadow: '0 22px 55px rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0.38rem 0.7rem',
            borderRadius: 999, background: 'rgba(255,255,255,0.12)',
            color: '#FED7AA', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
          }}>
            MATERIAL DE EVALUACIÓN
          </div>
          <div style={{
            width: 54, height: 54, display: 'grid', placeItems: 'center', margin: '1.2rem 0 1rem',
            borderRadius: 15, background: '#F26522', fontSize: '1.65rem',
            boxShadow: '0 10px 24px rgba(242,101,34,0.35)',
          }} aria-hidden="true">▦</div>
          <h2 style={{ fontSize: '1.35rem', lineHeight: 1.2, margin: '0 0 0.65rem', fontWeight: 800 }}>
            Matriz de datos demo
          </h2>
          <p style={{ color: '#DBEAFE', fontSize: '0.86rem', lineHeight: 1.55, margin: '0 0 1.25rem' }}>
            Use este archivo para probar la carga de información en el sistema.
          </p>
          <a
            className="demo-download"
            href="/Matriz_de_datos_Instrumento_observacion_DEMO.xlsx"
            download="Matriz_de_datos_Instrumento_observacion_DEMO.xlsx"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '0.82rem 1rem', borderRadius: 10, background: '#F26522',
              color: 'white', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 800,
              transition: 'transform .2s ease, filter .2s ease',
            }}
          >
            <span aria-hidden="true">↓</span> Descargar archivo de prueba
          </a>
          <p style={{ color: '#BFDBFE', fontSize: '0.72rem', margin: '0.8rem 0 0', lineHeight: 1.4 }}>
            Después de ingresar, vaya a <strong>Cargar datos</strong> y seleccione el archivo descargado.
          </p>
        </aside>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)', borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)', padding: '2.5rem 2rem',
          width: '100%', maxWidth: '400px', textAlign: 'center', boxSizing: 'border-box',
        }}>
        {/* Logo */}
        <img
          src="https://i.ibb.co/mF0BbpnH/Identidad-UPN-25-vertical-azul-fondo-blanco-removebg-preview.png"
          alt="Universidad Pedagógica Nacional"
          style={{
            width: 180, height: 'auto', objectFit: 'contain',
            margin: '0 auto 1.25rem', display: 'block',
          }}
        />

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
    </div>
  );
}
