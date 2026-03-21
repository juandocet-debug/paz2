/**
 * PaginaDashboard.jsx — Dashboard con KPIs y gráficos Recharts (estilo UPN).
 */
import { useState, useEffect } from 'react';
import servicioDashboard from '../aplicacion/ServicioDashboard.js';
import * as apiIA from '../../analiticas/infraestructura/ApiAnaliticasIA.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BookOpen, Map, GraduationCap, FileText, Zap } from 'lucide-react';

const AZULES   = ['#0D1B6F','#003DA5','#0072CE','#00AEEF','#B3D4FC'];
const ACENTO   = ['#0D1B6F','#F26522'];

function ProgressList({ datos, color = 'azul', max }) {
  const mx = max || Math.max(...datos.map(d => d.count), 1);
  return (
    <div className="progress-list">
      {datos.map((d, i) => (
        <div className="progress-item" key={i}>
          <div className="progress-header">
            <span className="progress-label">{d.label}</span>
            <span className="progress-val">{d.count}</span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${color}`} style={{ width: `${(d.count / mx) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function GraficoDona({ datos }) {
  if (!datos?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={datos} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {datos.map((_, i) => <Cell key={i} fill={ACENTO[i % ACENTO.length]} />)}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function PaginaDashboard({ onTotalChange }) {
  const [datos, setDatos] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [ultimoAnalisis, setUltimoAnalisis] = useState(null);
  const [errorIA, setErrorIA] = useState('');

  useEffect(() => {
    servicioDashboard.cargarDashboard().then(d => {
      setDatos(d);
      if (onTotalChange) onTotalChange(d.kpis?.total ?? '—');
    }).catch(err => console.error('Error:', err));

    /* Verificar si ya hay un análisis previo */
    apiIA.obtenerInterpretacion().then(lista => {
      if (lista?.length) setUltimoAnalisis(lista[0]?.generado_at);
    }).catch(() => {});
  }, []);

  const analizarConIA = async () => {
    setAnalizando(true);
    setErrorIA('');
    try {
      await apiIA.disparar();
      const lista = await apiIA.obtenerInterpretacion();
      if (lista?.length) setUltimoAnalisis(lista[0]?.generado_at);
    } catch (err) {
      setErrorIA(err.message || 'Error al analizar con IA');
    } finally {
      setAnalizando(false);
    }
  };

  if (!datos) return <div className="empty-msg">Cargando dashboard…</div>;

  const { kpis } = datos;

  const datosFormacion = [
    { label: 'Docentes', count: datos.porFormacion?.find(r=>r.label==='Si')?.count || 0 },
    { label: 'Estudiantes', count: datos.porMateriales?.find(r=>r.label==='Sí')?.count || 0 },
  ];

  return (
    <>
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-box"><BookOpen size={24} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Total Prácticas</div><div className="kpi-val">{kpis.total}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-box"><Map size={24} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Departamentos</div><div className="kpi-val">{kpis.departamentos}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-box"><GraduationCap size={24} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Formación</div><div className="kpi-val">{kpis.conFormacion}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-box"><FileText size={24} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Materiales</div><div className="kpi-val">{kpis.conMateriales}</div>
          </div>
        </div>
      </div>

      {/* ── Botón Analizar con IA ── */}
      <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={analizarConIA}
          disabled={analizando}
          style={{
            background: analizando
              ? '#6B7280'
              : 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: analizando ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            transition: 'transform 0.2s',
          }}
        >
          {analizando ? (
            <>⏳ Analizando con IA... (puede tardar ~20s)</>
          ) : (
            <><Zap size={16} /> Analizar con IA</>          
          )}
        </button>
        {ultimoAnalisis && !analizando && (
          <span style={{ fontSize: 11, color: '#6B7280' }}>
            ✅ Último análisis: {ultimoAnalisis}
          </span>
        )}
        {errorIA && (
          <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
            ⚠️ {errorIA}
          </span>
        )}
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <div className="chart-title">Distribución por Departamento</div>
          <div className="chart-sub">Top departamentos con más prácticas registradas</div>
          <ProgressList datos={datos.porDepartamento?.slice(0,6) || []} color="azul" />
        </div>
        <div className="chart-box">
          <div className="chart-title">Tipo de Institución</div>
          <div className="chart-sub">Naturaleza jurídica de las IE participantes</div>
          <GraficoDona datos={datos.porTipoInstitucion} />
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <div className="chart-title">Jornada Escolar</div>
          <div className="chart-sub">Distribución por jornada</div>
          <GraficoDona datos={datos.porJornada} />
        </div>

        <div className="chart-box">
          <div className="chart-title">Formación y Materiales</div>
          <div className="chart-sub">Producción académica por actor</div>
          <ProgressList datos={datosFormacion} color="azul" />
          <div style={{ marginTop: 12 }}>
            <ProgressList datos={[
              { label: 'Producción Académica', count: datos.porMateriales?.find(r=>r.label==='Sí')?.count || 0 },
            ]} color="naranja" max={kpis.total} />
          </div>
        </div>
      </div>
    </>
  );
}
