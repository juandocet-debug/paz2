/**
 * App.jsx — Layout principal con sidebar de navegación.
 */
import { useState, useCallback } from 'react';
import PaginaDashboard   from './dashboard/infraestructura/PaginaDashboard.jsx';
import PaginaConflictos  from './dashboard/infraestructura/PaginaConflictos.jsx';
import PaginaPracticas   from './practicas/infraestructura/PaginaPracticas.jsx';
import PaginaChat        from './chat/infraestructura/PaginaChat.jsx';
import PaginaCarga       from './cargas/infraestructura/PaginaCarga.jsx';
import PaginaHistorico   from './cargas/infraestructura/PaginaHistorico.jsx';
import PaginaMapa        from './mapa/infraestructura/PaginaMapa.jsx';
import { LayoutDashboard, FileSearch, Table, Bot, UploadCloud, Map as MapIcon, History, Globe, LogOut } from 'lucide-react';

const NAVEGACION = [
  { id: 'dashboard',   label: 'Dashboard',             icon: <LayoutDashboard size={20} /> },
  { id: 'conflictos',  label: 'Conflictos y Políticas', icon: <FileSearch size={20} /> },
  { id: 'tabla',       label: 'Tabla de Datos',         icon: <Table size={20} /> },
  { id: 'chat',        label: 'Chat con IA',            icon: <Bot size={20} /> },
  { id: 'upload',      label: 'Cargar Archivo',         icon: <UploadCloud size={20} /> },
  { id: 'mapa',        label: 'Mapa de Calor',          icon: <MapIcon size={20} /> },
  { id: 'historico',   label: 'Histórico',              icon: <History size={20} /> },
];

export default function App({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [totalPracticas, setTotalPracticas] = useState('—');
  const [idCargaFiltro, setIdCargaFiltro] = useState(undefined);
  const [refresco, setRefresco] = useState(0);

  const refrescarDatos = useCallback(() => setRefresco(n => n + 1), []);

  const verEnTabla = useCallback((idCarga) => {
    setIdCargaFiltro(idCarga);
    setTab('tabla');
  }, []);

  const renderPagina = () => {
    switch (tab) {
      case 'dashboard':  return <PaginaDashboard key={refresco} onTotalChange={setTotalPracticas} />;
      case 'conflictos': return <PaginaConflictos key={refresco} />;
      case 'tabla':      return <PaginaPracticas key={refresco} idCargaFiltro={idCargaFiltro} />;
      case 'chat':       return <PaginaChat />;
      case 'historico':  return <PaginaHistorico key={refresco} onVerEnTabla={verEnTabla} onCambio={refrescarDatos} />;
      case 'mapa':       return <PaginaMapa key={refresco} />;
      case 'upload':     return <PaginaCarga onCargaExitosa={refrescarDatos} />;
      default:           return null;
    }
  };

  return (
    <>
      {/* ── Header fijo ── */}
      <header>
        <div className="header-title">Observatorio de Prácticas Educativas</div>
        <div className="header-center">PAZ, MEMORIA Y DERECHOS HUMANOS · COLOMBIA</div>
        <div className="header-badge">✦ {totalPracticas} Prácticas</div>
      </header>

      <div className="layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand" style={{ padding: '16px 12px 8px' }}>
            <img
              src="https://i.ibb.co/mF0BbpnH/Identidad-UPN-25-vertical-azul-fondo-blanco-removebg-preview.png"
              alt="Universidad Pedagógica Nacional"
              style={{ width: '100%', maxWidth: 150, height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto', filter: 'brightness(0) invert(1)' }}
            />
          </div>

          <nav className="sidebar-nav">
            {NAVEGACION.map(item => (
              <button
                key={item.id}
                className={`nav-btn${tab === item.id ? ' active' : ''}`}
                onClick={() => { setTab(item.id); if (item.id !== 'tabla') setIdCargaFiltro(undefined); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            style={{ textDecoration: 'none', marginTop: 8 }}
          >
            <span className="nav-icon"><Globe size={20} /></span>
            Vista Pública
          </a>

          <div className="sidebar-footer">
            <img src="https://i.ibb.co/mF0BbpnH/Identidad-UPN-25-vertical-azul-fondo-blanco-removebg-preview.png" alt="UPN" className="sidebar-footer-avatar" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 0, background: 'transparent', filter: 'brightness(0) invert(1)' }} />
            <div className="sidebar-footer-info">
              {localStorage.getItem('observatorio_usuario') || 'Admin'}
              <small>Administrador</small>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              margin: '8px 12px 12px', padding: '0.6rem 1rem',
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
              width: 'calc(100% - 24px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.4rem', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </aside>

        {/* ── Contenido principal ── */}
        <main>{renderPagina()}</main>
      </div>

      <footer>
        © Universidad Pedagógica Nacional - Colombia. Paz, Memoria y Derechos Humanos.
        <br/>
        <a href="#">Contacto</a>
        <a href="#">Políticas de Privacidad</a>
        <a href="#">Repositorio Institucional</a>
      </footer>
    </>
  );
}
