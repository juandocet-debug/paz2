/**
 * main.jsx — Punto de entrada.
 *
 * Detecta la ruta /vista-publica y renderiza sin layout.
 * Cualquier otra ruta renderiza la App con sidebar.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import PaginaPublicacion from './publicacion/infraestructura/PaginaPublicacion.jsx';

const esVistaPublica = window.location.pathname === '/vista-publica';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {esVistaPublica ? <PaginaPublicacion /> : <App />}
  </StrictMode>,
);
