/**
 * main.jsx — Punto de entrada.
 *
 * Rutas:
 *   /        → Vista pública (PaginaPublicacion)
 *   /login   → Pantalla de inicio de sesión
 *   cualquier otra ruta con token válido → Dashboard (App)
 *   cualquier otra ruta sin token → redirige a /login
 */
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import PaginaPublicacion from './publicacion/infraestructura/PaginaPublicacion.jsx';
import PaginaLogin from './auth/infraestructura/PaginaLogin.jsx';

function Raiz() {
  const ruta = window.location.pathname;
  const [token, setToken] = useState(localStorage.getItem('observatorio_token'));

  /* Si el token cambia externamente (logout en otra pestaña), actualizamos */
  useEffect(() => {
    const sincronizar = () => setToken(localStorage.getItem('observatorio_token'));
    window.addEventListener('storage', sincronizar);
    return () => window.removeEventListener('storage', sincronizar);
  }, []);

  const onLogin = (nuevoToken) => {
    setToken(nuevoToken);
    window.history.replaceState(null, '', '/app');
  };

  const onLogout = () => {
    localStorage.removeItem('observatorio_token');
    localStorage.removeItem('observatorio_usuario');
    setToken(null);
    window.location.href = '/';
  };

  /* ── Lógica de enrutamiento ── */

  // Raíz → siempre pública
  if (ruta === '/' || ruta === '/index.html') {
    return <PaginaPublicacion />;
  }

  // Login
  if (ruta === '/login' || ruta === '/login/') {
    if (token) { window.location.href = '/app'; return null; }
    return <PaginaLogin onLogin={onLogin} />;
  }

  // App (dashboard) — requiere token
  if (token) {
    return <App onLogout={onLogout} />;
  }

  // Sin token → Login
  return <PaginaLogin onLogin={onLogin} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Raiz />
  </StrictMode>,
);
