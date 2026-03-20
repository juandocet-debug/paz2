/**
 * main.jsx — Punto de entrada.
 *
 * Detecta la ruta /vista-publica y renderiza sin layout.
 * Cualquier otra ruta renderiza la App con sidebar.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import PaginaPublicacion from './publicacion/infraestructura/PaginaPublicacion.jsx';

function AdminRoute() {
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem('observatorio_admin') === 'true'
  );
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  if (autenticado) {
    return <App />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    // Contraseña simple para proteger edición temporalmente
    if (pass === 'adminPaz2026') {
      localStorage.setItem('observatorio_admin', 'true');
      setAutenticado(true);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f7fa', fontFamily: 'system-ui' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
        <h2 style={{ color: '#1a365d', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Administración<br/>Observatorio UPN</h2>
        <input 
          type="password" 
          value={pass} 
          onChange={(e) => { setPass(e.target.value); setError(false); }} 
          placeholder="Código de Acceso" 
          style={{ padding: '0.8rem', width: '100%', marginBottom: '1rem', border: error ? '2px solid #e53e3e' : '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
        />
        {error && <p style={{ color: '#e53e3e', fontSize: '0.9rem', margin: '-0.5rem 0 1rem 0', fontWeight: '500' }}>Código incorrecto</p>}
        <button type="submit" style={{ padding: '0.8rem 1.5rem', background: '#e05a10', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' }}>
          Ingresar al Panel
        </button>
      </form>
    </div>
  );
}

const esAdmin = new URLSearchParams(window.location.search).has('admin')
  || localStorage.getItem('observatorio_admin') === 'true';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {esAdmin ? <AdminRoute /> : <PaginaPublicacion />}
  </StrictMode>,
);
