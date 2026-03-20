/**
 * PaginaPublicacion.jsx — Vista pública de solo lectura.
 *
 * Bento-grid premium dashboard con mapa, KPIs, conflictos,
 * jornada, tipo institución, cátedra de paz y más.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import servicio from '../aplicacion/ServicioPublicacion.js';
import FiltrosPublicacion from '../dominio/FiltrosPublicacion.js';
import * as apiIA from '../../analiticas/infraestructura/ApiAnaliticasIA.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ── Constantes ── */
const CENTRO_COLOMBIA = { lat: 4.5709, lng: -74.2973 };
const ZOOM_INICIAL = 6;
const RADIO_AGRUPACION = 0.01;

const PALETA = {
  azul:    '#0D1B6F',
  medio:   '#003DA5',
  claro:   '#0072CE',
  cielo:   '#00AEEF',
  naranja: '#F26522',
  rojo:    '#C0392B',
  verde:   '#27AE60',
  lila:    '#8B5CF6',
  rosa:    '#EC4899',
};

const GRADIENTES = [
  PALETA.azul,  PALETA.medio,  PALETA.claro,
  PALETA.cielo, PALETA.naranja, PALETA.lila,
  PALETA.verde, PALETA.rosa,
];

/* ── Configurar Google Maps ── */
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let mapaConfigurado = false;
if (apiKey && !mapaConfigurado) {
  setOptions({ key: apiKey, version: 'weekly' });
  mapaConfigurado = true;
}

/* ═══════════════════════════ Helpers de gráficos ═══════════════════════════ */

function ProgressBar({ label, count, total, color = PALETA.azul }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 13 }}>{pct}%</span>
      </div>
      <div style={{ background: '#E5E7EB', borderRadius: 99, height: 7, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function ListaProgreso({ datos, color = PALETA.azul, max = 5 }) {
  if (!datos?.length) return <p style={{ color: '#9CA3AF', fontSize: 12 }}>Sin datos</p>;
  const total = datos.reduce((s, d) => s + d.count, 0);
  return (
    <div>
      {datos.slice(0, max).map((d, i) => (
        <ProgressBar key={i} label={d.label} count={d.count} total={total}
          color={GRADIENTES[i % GRADIENTES.length]} />
      ))}
    </div>
  );
}

function GraficoDona({ datos, height = 200 }) {
  if (!datos?.length) return <p style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>Sin datos</p>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={datos} dataKey="count" nameKey="label" cx="50%" cy="50%"
          innerRadius="55%" outerRadius="82%" paddingAngle={3}>
          {datos.map((_, i) => <Cell key={i} fill={GRADIENTES[i % GRADIENTES.length]} />)}
        </Pie>
        <Tooltip wrapperStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} formatter={(v) => v.length > 18 ? v.slice(0, 18) + '…' : v} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function GraficoBarras({ datos, color = PALETA.azul, height = 140 }) {
  if (!datos?.length) return <p style={{ color: '#9CA3AF', fontSize: 12 }}>Sin datos</p>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={datos} margin={{ top: 4, right: 0, left: -22, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748B' }} interval={0} axisLine={false} tickLine={false}
          tickFormatter={v => v.length > 10 ? v.slice(0, 9) + '…' : v} />
        <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <Tooltip wrapperStyle={{ fontSize: 10, borderRadius: 8 }} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {datos.map((_, i) => <Cell key={i} fill={GRADIENTES[i % GRADIENTES.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ═══════════════════════════ Mapa helpers ═══════════════════════════ */

function mejorNombre(p) {
  return p.institucion || p.sede || p.nombre_practica || '';
}

function agruparPuntos(puntos) {
  const clusters = [];
  const usado = new Set();
  for (let i = 0; i < puntos.length; i++) {
    if (usado.has(i)) continue;
    const grupo = [puntos[i]];
    usado.add(i);
    for (let j = i + 1; j < puntos.length; j++) {
      if (usado.has(j)) continue;
      if (Math.abs(puntos[i].latitud - puntos[j].latitud) < RADIO_AGRUPACION &&
          Math.abs(puntos[i].longitud - puntos[j].longitud) < RADIO_AGRUPACION) {
        grupo.push(puntos[j]);
        usado.add(j);
      }
    }
    const lat = grupo.reduce((s, p) => s + p.latitud, 0) / grupo.length;
    const lng = grupo.reduce((s, p) => s + p.longitud, 0) / grupo.length;
    const municipios = [...new Set(grupo.map(p => p.municipio).filter(Boolean))];
    const instituciones = [...new Set(grupo.map(p => mejorNombre(p)).filter(Boolean))];
    clusters.push({ lat, lng, count: grupo.length, municipios, instituciones });
  }
  return clusters;
}

function crearCirculo(count, maxCount) {
  const minV = 20, maxV = 60;
  const size = Math.floor(minV + ((count / maxCount) * (maxV - minV)));
  const ratio = count / maxCount;
  const r = Math.floor(59 + (ratio * (217 - 59)));
  const g = Math.floor(130 + (ratio * (56 - 130)));
  const b = Math.floor(246 + (ratio * (56 - 246)));
  const opacity = 0.85 + (ratio * 0.15);
  
  const div = document.createElement('div');
  div.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:rgba(${r},${g},${b},${opacity});border:2px solid rgba(${r},${g},${b},${Math.min(opacity+0.2,1)});cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:${Math.max(10,size/3.5)}px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.5);transition:transform .2s;box-shadow:0 2px 6px rgba(0,0,0,0.3)`;
  if (count > 1) div.textContent = count;
  div.onmouseenter = () => { div.style.transform = 'scale(1.3)'; };
  div.onmouseleave = () => { div.style.transform = 'scale(1)'; };
  return div;
}

function TextoExpandible({ texto, clamp = 3, color = '#4B5563' }) {
  const [expandido, setExpandido] = useState(false);
  if (!texto) return null;
  const largo = texto.length > 120;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: expandido ? 'none' : 1, marginBottom: 8 }}>
      <p style={{
        fontSize: 11, color, margin: 0, lineHeight: 1.5,
        display: expandido ? 'block' : '-webkit-box',
        WebkitLineClamp: expandido ? 'unset' : clamp,
        WebkitBoxOrient: 'vertical',
        overflow: expandido ? 'visible' : 'hidden',
        transition: 'all 0.3s'
      }}>
        {texto}
      </p>
      {largo && (
        <button 
          onClick={() => setExpandido(!expandido)}
          style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 10, fontWeight: 700, padding: '4px 0', cursor: 'pointer', textAlign: 'left', marginTop: 2, width: 'max-content' }}
        >
          {expandido ? 'Leer menos' : 'Leer más...'}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════ Componente principal ═══════════════════════════ */

export default function PaginaPublicacion() {
  const [datos, setDatos] = useState(null);
  const [puntosMapa, setPuntosMapa] = useState([]);
  const [filtrosDisponibles, setFiltrosDisponibles] = useState({});
  const [cargando, setCargando] = useState(true);
  const [interpretacionIA, setInterpretacionIA] = useState([]);
  const [analizandoIA, setAnalizandoIA] = useState(false);

  const [deptSel, setDeptSel] = useState('');
  const [tipoSel, setTipoSel] = useState('');
  const [jornadaSel, setJornadaSel] = useState('');

  const mapaRef = useRef(null);
  const mapaInstanciaRef = useRef(null);
  const marcadoresRef = useRef([]);
  const infoWindowRef = useRef(null);
  const filtrosAnterioresRef = useRef('');
  const boundsAjustadosRef = useRef(false);

  /* Filtros disponibles */
  useEffect(() => {
    servicio.obtenerFiltrosDisponibles().then(setFiltrosDisponibles)
      .catch(err => console.error('Error cargando filtros:', err));
  }, []);

  /* Interpretación IA — reactiva a filtros */
  useEffect(() => {
    const hayFiltros = deptSel || tipoSel || jornadaSel;
    const cargarIA = async () => {
      try {
        if (hayFiltros) {
          setInterpretacionIA([]); // Vuelve a diseño crudo mientras analiza
          setAnalizandoIA(true);
        }
        const filtrosObj = { departamento: deptSel, tipoInstitucion: tipoSel, jornada: jornadaSel };
        const res = hayFiltros
          ? await apiIA.obtenerInterpretacionDinamica(filtrosObj)
          : await apiIA.obtenerInterpretacion();
        setInterpretacionIA(res);
      } catch (err) {
        console.error('Error IA Dinámica:', err);
      } finally {
        setAnalizandoIA(false);
      }
    };
    
    cargarIA();
    
    // Polling estático opcional solo si NO hay filtros
    let id;
    if (!hayFiltros) id = setInterval(cargarIA, 35000);
    return () => { if (id) clearInterval(id); };
  }, [deptSel, tipoSel, jornadaSel]);

  /* Carga de datos */
  const cargarDatos = useCallback(async (filtros = new FiltrosPublicacion(), silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const [dash, mapa] = await Promise.all([
        servicio.obtenerDashboard(filtros),
        servicio.obtenerPuntosMapa(filtros),
      ]);
      setDatos(dash);
      setPuntosMapa(mapa);
    } catch (err) {
      console.error('Error cargando datos públicos:', err);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  /* Polling de 3s + reset de bounds si cambian filtros */
  useEffect(() => {
    const filtros = new FiltrosPublicacion({
      departamento: deptSel,
      tipoInstitucion: tipoSel,
      jornada: jornadaSel,
    });
    const filtrosRaw = JSON.stringify(filtros);
    const cambiaronFiltros = filtrosAnterioresRef.current !== filtrosRaw;
    filtrosAnterioresRef.current = filtrosRaw;
    if (cambiaronFiltros) boundsAjustadosRef.current = false;
    cargarDatos(filtros, !cambiaronFiltros);
    const id = setInterval(() => cargarDatos(filtros, true), 3000);
    return () => clearInterval(id);
  }, [deptSel, tipoSel, jornadaSel, cargarDatos]);

  /* Renderizar mapa */
  useEffect(() => {
    if (!apiKey || !mapaRef.current) return;
    const renderizarMapa = async () => {
      try {
        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');
        if (!mapaInstanciaRef.current) {
          mapaInstanciaRef.current = new Map(mapaRef.current, {
            center: CENTRO_COLOMBIA, zoom: ZOOM_INICIAL,
            mapId: 'vista_publica_mapa', mapTypeId: 'terrain',
          });
        }
        const mapa = mapaInstanciaRef.current;
        marcadoresRef.current.forEach(m => (m.map = null));
        marcadoresRef.current = [];
        if (puntosMapa.length > 0) {
          const clusters = agruparPuntos(puntosMapa);
          const maxCount = Math.max(...clusters.map(c => c.count));
          for (const cluster of clusters) {
            const marker = new AdvancedMarkerElement({
              map: mapa,
              position: { lat: cluster.lat, lng: cluster.lng },
              content: crearCirculo(cluster.count, maxCount),
              title: cluster.municipios.join(', '),
            });
            marker.addListener('click', () => {
              if (infoWindowRef.current) infoWindowRef.current.close();
              const lista = cluster.instituciones.length
                ? cluster.instituciones.map(inst => `<li style="padding:3px 0;border-bottom:1px solid #f0f0f0">• ${inst}</li>`).join('')
                : '<li style="color:#999">Sin información de institución</li>';
              const iw = new window.google.maps.InfoWindow({
                content: `<div style="font-family:Inter,sans-serif;max-width:280px;max-height:260px;overflow-y:auto">
                  <strong style="font-size:13px;color:#0D1B6F">📍 ${cluster.municipios.join(' / ')} — ${cluster.count} práctica${cluster.count > 1 ? 's' : ''}</strong>
                  <ul style="margin:8px 0 0;padding-left:4px;list-style:none;font-size:11px;color:#374151">${lista}</ul>
                </div>`,
              });
              iw.open({ anchor: marker, map: mapa });
              infoWindowRef.current = iw;
            });
            marcadoresRef.current.push(marker);
          }
          if (!boundsAjustadosRef.current) {
            boundsAjustadosRef.current = true;
            const { LatLngBounds } = await importLibrary('core');
            const bounds = new LatLngBounds();
            clusters.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }));
            if (clusters.length === 1) { mapa.setCenter({ lat: clusters[0].lat, lng: clusters[0].lng }); mapa.setZoom(10); }
            else {
              mapa.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 });
              const l = mapa.addListener('idle', () => { if (mapa.getZoom() > 12) mapa.setZoom(12); window.google.maps.event.removeListener(l); });
            }
          }
        } else {
          boundsAjustadosRef.current = false;
          mapa.setCenter(CENTRO_COLOMBIA);
          mapa.setZoom(ZOOM_INICIAL);
        }
      } catch (err) { console.error('Error renderizando mapa:', err); }
    };
    renderizarMapa();
  }, [puntosMapa]);

  /* KPIs y datos derivados */
  const kpis = datos?.kpis || {};
  const departamentos = filtrosDisponibles.departamentos || [];
  const tipos = filtrosDisponibles.tipos || [];
  const jornadas = filtrosDisponibles.jornadas || [];

  /* Interpretaciones IA específicas */
  const iaConflictos = interpretacionIA.find(i => i.dimension === 'conflictos');
  const iaPoliticas = interpretacionIA.find(i => i.dimension === 'politicas');

  /* Calcular top conflicto (fallback crudo) */
  const topConflicto = datos?.porConflictos?.[0]?.label || '—';
  const totalConflictos = (datos?.porConflictos || []).reduce((s, d) => s + d.count, 0);
  const topConflictoPct = totalConflictos > 0 && datos?.porConflictos?.[0]
    ? Math.round((datos.porConflictos[0].count / totalConflictos) * 100) : 0;

  const topPolitica = datos?.porPoliticas?.[0]?.label || '—';
  const topTema = datos?.porTemasCatedraPaz?.[0]?.label || '—';

  return (
    <div className="vista-publica">
      <div className="vp-app-container">

        {/* ── Top Bar ── */}
        <div className="vp-top-bar">
          <div className="vp-header-brand">
            <div className="vp-logo">UPN</div>
            <div className="vp-header-title">
              <h1>Observatorio de Prácticas</h1>
              <p>Paz, Memoria y Derechos Humanos — Colombia</p>
            </div>
          </div>
          <div className="vp-filtros">
            <select value={deptSel} onChange={e => setDeptSel(e.target.value)}>
              <option value="">Todos los departamentos</option>
              {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={tipoSel} onChange={e => setTipoSel(e.target.value)}>
              <option value="">Todas las instituciones</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={jornadaSel} onChange={e => setJornadaSel(e.target.value)}>
              <option value="">Todas las jornadas</option>
              {jornadas.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            {(deptSel || tipoSel || jornadaSel) && (
              <button className="vp-btn-limpiar" onClick={() => { setDeptSel(''); setTipoSel(''); setJornadaSel(''); }}>
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        {cargando && !datos && <div className="vp-loading">Cargando datos del observatorio...</div>}

        {datos && (
          <>
            {/* ── KPIs destacados ── */}
            <section className="vp-kpis-top">
              <div className="vp-kpi vp-kpi-1">
                <div className="vp-kpi-icon">📚</div>
                <div className="vp-kpi-val">{(kpis.total || 0).toLocaleString()}</div>
                <div className="vp-kpi-label">Prácticas Registradas</div>
              </div>
              <div className="vp-kpi vp-kpi-2">
                <div className="vp-kpi-icon">🗺️</div>
                <div className="vp-kpi-val">{kpis.departamentos || 0}</div>
                <div className="vp-kpi-label">Departamentos</div>
              </div>
              <div className="vp-kpi vp-kpi-3">
                <div className="vp-kpi-icon">🎓</div>
                <div className="vp-kpi-val">{kpis.conFormacion || 0}</div>
                <div className="vp-kpi-label">Con Formación Docente</div>
              </div>
              <div className="vp-kpi vp-kpi-4">
                <div className="vp-kpi-icon">📝</div>
                <div className="vp-kpi-val">{kpis.conMateriales || 0}</div>
                <div className="vp-kpi-label">Materiales Producidos</div>
              </div>
            </section>

            {/* ── Bento Grid Principal ── */}
            <div className="vp-bento-grid">

              {/* Mapa — celda grande */}
              <div className="vp-bento-card vp-bento-mapa">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">🗺 Distribución Geográfica</span>
                  <span className="vp-bento-badge">{puntosMapa.length} puntos</span>
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                  <div ref={mapaRef} style={{ width: '100%', height: '100%' }} />
                  {cargando && <div className="vp-mapa-overlay">Actualizando...</div>}
                </div>
              </div>

              {/* Conflictos — prominente (IA si existe, crudo como fallback) */}
              {iaConflictos ? (
                <div className="vp-bento-card vp-bento-conflictos" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF 100%)', borderColor: PALETA.naranja }}>
                  <div className="vp-bento-header" style={{ marginBottom: 8 }}>
                    <span className="vp-bento-title" style={{ color: PALETA.naranja }}>⚡ Conflictos Identificados</span>
                    <span className="vp-bento-badge" style={{ background: PALETA.naranja, color: 'white' }}>✨ IA</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flex: 1, alignItems: 'center' }}>
                    <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column' }}>
                      <div className="vp-highlight-stat" style={{ color: PALETA.naranja, fontSize: 36, display: 'flex', alignItems: 'baseline' }}>
                        {iaConflictos.categorias[0]?.porcentaje || 0}%
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginLeft: 8 }}>de {datos?.kpis?.total || 0} prácticas</span>
                      </div>
                      <div className="vp-highlight-label" style={{ marginBottom: 6, fontSize: 13 }} title={iaConflictos.categorias[0]?.descripcion}>
                        {iaConflictos.categorias[0]?.label || '—'}
                      </div>
                      <TextoExpandible texto={iaConflictos.resumen} color="#4B5563" />
                      <p style={{ fontSize: 9, color: '#9CA3AF', margin: 'auto 0 0 0', lineHeight: 1.3, fontStyle: 'italic' }}>
                        * Información basada en un algoritmo interno de IA, contrastar con fuente oficial.
                      </p>
                    </div>
                    <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {iaConflictos.categorias.slice(0, 5).map((c, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                            <span style={{ color: '#374151', fontWeight: 600, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.descripcion}>
                              {c.label}
                            </span>
                            <span style={{ color: PALETA.naranja, fontWeight: 700 }}>{c.porcentaje}%</span>
                          </div>
                          <div style={{ background: '#FFEDD5', borderRadius: 99, height: 6 }}>
                            <div style={{ width: `${c.porcentaje}%`, background: PALETA.naranja, height: '100%', borderRadius: 99 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vp-bento-card vp-bento-conflictos" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="vp-bento-header">
                    <span className="vp-bento-title" style={{ color: analizandoIA ? PALETA.naranja : 'inherit' }}>⚡ Conflictos Identificados</span>
                    {analizandoIA && <span className="vp-bento-badge" style={{ background: '#FFF7ED', color: PALETA.naranja }}>⏳ Analizando con IA...</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flex: 1, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="vp-highlight-stat" style={{ color: analizandoIA ? '#D1D5DB' : PALETA.naranja }}>
                        {topConflictoPct}%
                      </div>
                      <div className="vp-highlight-label">{topConflicto}</div>
                    </div>
                    <div style={{ flex: 1, marginTop: 12 }}>
                      <ListaProgreso datos={datos.porConflictos} max={5} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tipo institución — dona */}
              <div className="vp-bento-card">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">🏛 Tipo de Institución</span>
                </div>
                <GraficoDona datos={datos.porTipoInstitucion} height={180} />
              </div>

              {/* Distribución por departamento */}
              <div className="vp-bento-card">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">📍 Top Departamentos</span>
                </div>
                <ListaProgreso datos={datos.porDepartamento} max={6} />
              </div>

              {/* Jornada escolar — dona */}
              <div className="vp-bento-card">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">⏰ Jornada Escolar</span>
                </div>
                <GraficoDona datos={datos.porJornada} height={180} />
              </div>

              {/* Cátedra de Paz */}
              <div className="vp-bento-card">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">☮️ Cátedra de Paz</span>
                </div>
                <div className="vp-highlight-label" style={{ marginBottom: 10, color: PALETA.claro }}>{topTema}</div>
                <ListaProgreso datos={datos.porTemasCatedraPaz} max={5} />
              </div>

              {/* Políticas relacionadas (IA si existe, crudo como fallback) */}
              {iaPoliticas ? (
                <div className="vp-bento-card vp-bento-wide" style={{ borderColor: PALETA.lila, background: 'linear-gradient(135deg, #F5F3FF 0%, #FFF 100%)' }}>
                  <div className="vp-bento-header" style={{ marginBottom: 8 }}>
                    <span className="vp-bento-title" style={{ color: PALETA.lila }}>📜 Políticas Relacionadas</span>
                    <span className="vp-bento-badge" style={{ background: PALETA.lila, color: 'white' }}>✨ IA</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flex: 1, alignItems: 'center' }}>
                    <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column' }}>
                      <div className="vp-highlight-stat" style={{ color: PALETA.lila, fontSize: 36, display: 'flex', alignItems: 'baseline' }}>
                        {iaPoliticas.categorias[0]?.porcentaje || 0}%
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginLeft: 8 }}>de {datos?.kpis?.total || 0} prácticas</span>
                      </div>
                      <div className="vp-highlight-label" style={{ marginBottom: 6, fontSize: 13 }} title={iaPoliticas.categorias[0]?.descripcion}>
                        {iaPoliticas.categorias[0]?.label || '—'}
                      </div>
                      <TextoExpandible texto={iaPoliticas.resumen} color="#5B21B6" />
                      <p style={{ fontSize: 9, color: '#8B5CF6', margin: 'auto 0 0 0', lineHeight: 1.3, fontStyle: 'italic', opacity: 0.8 }}>
                        * Información basada en un algoritmo interno de IA, contrastar con fuente oficial.
                      </p>
                    </div>
                    <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {iaPoliticas.categorias.slice(0, 5).map((c, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                            <span style={{ color: '#374151', fontWeight: 600, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.descripcion}>
                              {c.label}
                            </span>
                            <span style={{ color: PALETA.lila, fontWeight: 700 }}>{c.porcentaje}%</span>
                          </div>
                          <div style={{ background: '#EDE9FE', borderRadius: 99, height: 6 }}>
                            <div style={{ width: `${c.porcentaje}%`, background: PALETA.lila, height: '100%', borderRadius: 99 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vp-bento-card vp-bento-wide" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="vp-bento-header">
                    <span className="vp-bento-title" style={{ color: analizandoIA ? PALETA.lila : 'inherit' }}>📜 Políticas Relacionadas</span>
                    {analizandoIA && <span className="vp-bento-badge" style={{ background: '#F5F3FF', color: PALETA.lila }}>⏳ Analizando con IA...</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flex: 1, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="vp-highlight-stat" style={{ color: analizandoIA ? '#D1D5DB' : PALETA.lila }}>
                        {datos?.porPoliticas?.[0]?.count ? Math.round((datos.porPoliticas[0].count / (datos.porPoliticas.reduce((s,d)=>s+d.count,0)||1))*100) : 0}%
                      </div>
                      <div className="vp-highlight-label" style={{ color: PALETA.lila, fontSize: 13 }}>{topPolitica}</div>
                    </div>
                    <div style={{ flex: 1, marginTop: 12 }}>
                      <ListaProgreso datos={datos.porPoliticas} max={5} />
                    </div>
                  </div>
                </div>
              )}

              {/* Lineamientos MEN — barras */}
              <div className="vp-bento-card vp-bento-wide">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">📊 Frecuencia de Lineamientos MEN</span>
                </div>
                <GraficoBarras datos={datos.porFrecuenciaLinea} height={130} />
              </div>

              {/* Formación y materiales */}
              <div className="vp-bento-card vp-bento-stats">
                <div className="vp-bento-header">
                  <span className="vp-bento-title">🔬 Producción Académica</span>
                </div>
                <div className="vp-stats-row">
                  {(datos.porFormacion || []).map((d, i) => (
                    <div key={i} className="vp-stat-chip" style={{ background: `${GRADIENTES[i]}22`, borderColor: GRADIENTES[i] }}>
                      <div style={{ color: GRADIENTES[i], fontWeight: 700, fontSize: 18 }}>{d.count}</div>
                      <div style={{ color: '#6B7280', fontSize: 10 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
                <div className="vp-bento-header" style={{ marginTop: 12 }}>
                  <span className="vp-bento-title" style={{ fontSize: 11 }}>Materiales Diseñados</span>
                </div>
                <div className="vp-stats-row">
                  {(datos.porMateriales || []).map((d, i) => (
                    <div key={i} className="vp-stat-chip" style={{ background: `${GRADIENTES[i + 2]}22`, borderColor: GRADIENTES[i + 2] }}>
                      <div style={{ color: GRADIENTES[i + 2], fontWeight: 700, fontSize: 18 }}>{d.count}</div>
                      <div style={{ color: '#6B7280', fontSize: 10 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Insights IA Adicionales (solo si hay análisis guardado) ── */}
              {interpretacionIA.filter(item => !['conflictos', 'politicas'].includes(item.dimension)).map((item) => {
                const ICONOS = { conflictos: '⚡', obstaculos: '🧱', politicas: '📜', general: '🤖' };
                const TITULOS = { conflictos: 'Análisis IA — Conflictos', obstaculos: 'Análisis IA — Obstáculos', politicas: 'Análisis IA — Políticas', general: 'Síntesis General (IA)' };
                const cats = item.categorias || [];
                return (
                  <div key={item.dimension} className={`vp-bento-card ${item.dimension === 'general' ? 'vp-bento-wide' : ''}`}
                    style={{ background: 'linear-gradient(135deg, #1E1B4B08 0%, #7C3AED08 100%)', borderColor: '#7C3AED33' }}>
                    <div className="vp-bento-header">
                      <span className="vp-bento-title" style={{ color: '#7C3AED' }}>
                        {ICONOS[item.dimension] || '🤖'} {TITULOS[item.dimension] || item.dimension}
                      </span>
                      <span className="vp-bento-badge" style={{ background: '#EDE9FE', color: '#7C3AED' }}>IA</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{item.resumen}</p>
                    {cats.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                          <span style={{ color: '#374151', fontWeight: 600, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                          <span style={{ color: '#7C3AED', fontWeight: 700 }}>{c.porcentaje}%</span>
                        </div>
                        <div style={{ background: '#EDE9FE', borderRadius: 99, height: 5 }}>
                          <div style={{ width: `${c.porcentaje}%`, background: '#7C3AED', height: '100%', borderRadius: 99, transition: 'width 0.8s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

            </div>
          </>
        )}

        {/* ── Footer ── */}
        <footer className="vp-footer">
          © {new Date().getFullYear()} Universidad Pedagógica Nacional — Observatorio de Prácticas · Paz, Memoria y DDHH
        </footer>
      </div>
    </div>
  );
}
