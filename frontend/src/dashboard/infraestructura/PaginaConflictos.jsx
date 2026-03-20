/**
 * PaginaConflictos.jsx — Análisis de Conflictos y Marco de Políticas (estilo UPN).
 */
import { useState, useEffect } from 'react';
import servicioDashboard from '../../dashboard/aplicacion/ServicioDashboard.js';

function ProgressList({ datos, color = 'azul', showPercent = false }) {
  const mx = Math.max(...datos.map(d => d.count), 1);
  const total = datos.reduce((s, d) => s + d.count, 0);
  return (
    <div className="progress-list">
      {datos.map((d, i) => (
        <div className="progress-item" key={i}>
          <div className="progress-header">
            <span className="progress-label">{d.label}</span>
            <span className="progress-val">{showPercent ? `${Math.round((d.count / total) * 100)}%` : `${d.count}`}</span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${color}`} style={{ width: `${(d.count / mx) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PaginaConflictos() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    servicioDashboard.cargarDashboard().then(setDatos).catch(err => console.error('Error:', err));
  }, []);

  if (!datos) return <div className="empty-msg">Cargando datos…</div>;

  return (
    <>
      <h1 className="page-title">Análisis de Conflictos y Marco de Políticas</h1>
      <p className="page-sub">Exploración detallada de las tensiones territoriales y el alineamiento institucional de las prácticas educativas registradas en el observatorio.</p>

      <div className="chart-grid">
        <div className="chart-box">
          <div className="chart-title">Tipos de Conflicto Asociados</div>
          <div className="chart-sub">Distribución de tensiones sociales y políticas en el territorio.</div>
          <ProgressList datos={datos.porConflictos?.slice(0,6) || []} color="azul" showPercent />
        </div>
        <div className="chart-box">
          <div className="chart-title">Políticas y Apuestas Institucionales</div>
          <div className="chart-sub">Alineamiento con marcos legales y apuestas educativas.</div>
          <ProgressList datos={datos.porPoliticas?.slice(0,6) || []} color="azul" showPercent />
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <div className="chart-title">Temáticas de Cátedra de Paz <span className="badge badge-naranja" style={{background:'var(--naranja)',color:'white',marginLeft:8,fontSize:10,padding:'2px 8px',borderRadius:4}}>PRIORITARIO</span></div>
          <div className="chart-sub">Enfoques curriculares predominantes.</div>
          <ProgressList datos={datos.porTemasCatedraPaz?.slice(0,5) || []} color="naranja" />
        </div>
        <div className="chart-box">
          <div className="chart-title">Entidades Proveedoras de Materiales</div>
          <div className="chart-sub">Fuentes de recursos didácticos y pedagógicos.</div>
          <ProgressList datos={datos.porEntidades?.slice(0,5) || []} color="amarillo" />
        </div>
      </div>

      <div className="cta-section">
        <h3>¿Desea profundizar en los datos territoriales?</h3>
        <p>Acceda a la base de datos completa para filtrar por municipio, actor educativo o periodo de implementación.</p>
        <div className="cta-btns">
          <button className="cta-btn">📊 Exportar Reporte</button>
          <button className="cta-btn">🗺️ Ver Mapa Interactivo</button>
        </div>
      </div>
    </>
  );
}
