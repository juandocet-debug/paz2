/**
 * PaginaMapa.jsx — Mapa de calor de prácticas educativas georeferenciadas.
 *
 * Usa @googlemaps/js-api-loader con la API funcional (setOptions + importLibrary).
 * Reemplaza HeatmapLayer (deprecado) con AdvancedMarkerElement + círculos HTML.
 */
import { useState, useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import servicioMapa from '../aplicacion/ServicioMapa.js';

const CENTRO_COLOMBIA = { lat: 4.5709, lng: -74.2973 };
const ZOOM_INICIAL = 6;
const RADIO_AGRUPACION = 0.01; // grados (~1.1 km)

/* Configurar Google Maps una sola vez al cargar el módulo */
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (apiKey) setOptions({ key: apiKey, version: 'weekly' });

function mejorNombre(p) {
  return p.institucion || p.sede || p.nombre_practica || '';
}

/**
 * Agrupa puntos cercanos (radio < RADIO_AGRUPACION grados).
 * Retorna clusters con { lat, lng, count, municipios, instituciones }.
 */
function agruparPuntos(puntos) {
  const clusters = [];
  const usado = new Set();

  for (let i = 0; i < puntos.length; i++) {
    if (usado.has(i)) continue;

    const grupo = [puntos[i]];
    usado.add(i);

    for (let j = i + 1; j < puntos.length; j++) {
      if (usado.has(j)) continue;
      const dLat = Math.abs(puntos[i].latitud - puntos[j].latitud);
      const dLng = Math.abs(puntos[i].longitud - puntos[j].longitud);
      if (dLat < RADIO_AGRUPACION && dLng < RADIO_AGRUPACION) {
        grupo.push(puntos[j]);
        usado.add(j);
      }
    }

    const lat = grupo.reduce((s, p) => s + p.latitud, 0) / grupo.length;
    const lng = grupo.reduce((s, p) => s + p.longitud, 0) / grupo.length;
    const municipios = [...new Set(grupo.map(p => p.municipio).filter(Boolean))];

    /* Contar cuántas prácticas aporta cada institución (sin colapsar duplicados) */
    const conteoInstituciones = {};
    for (const p of grupo) {
      const nombre = (p.institucion || '').trim();
      if (nombre) conteoInstituciones[nombre] = (conteoInstituciones[nombre] || 0) + 1;
    }
    const instituciones = Object.entries(conteoInstituciones)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, cant]) => ({ nombre, cant }));

    clusters.push({ lat, lng, count: grupo.length, municipios, instituciones });
  }

  return clusters;
}

/**
 * Crea el elemento HTML de un marcador circular.
 * Tamaño y opacidad proporcionales a la densidad de puntos.
 */
function crearCirculo(count, maxCount) {
  const minSize = 14;
  const maxSize = 48;
  const ratio = Math.min(count / Math.max(maxCount, 1), 1);
  const size = Math.round(minSize + (maxSize - minSize) * Math.sqrt(ratio));
  const opacity = 0.4 + 0.5 * ratio;

  // Gradiente de blue UPN → orange UPN según densidad
  const r = Math.round(0 + 242 * ratio);
  const g = Math.round(114 - 13 * ratio);
  const b = Math.round(206 - 172 * ratio);

  const div = document.createElement('div');
  div.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: rgba(${r}, ${g}, ${b}, ${opacity});
    border: 2px solid rgba(${r}, ${g}, ${b}, ${Math.min(opacity + 0.2, 1)});
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.max(10, size / 3.5)}px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    transition: transform 0.2s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;
  if (count > 1) div.textContent = count;

  div.addEventListener('mouseenter', () => { div.style.transform = 'scale(1.3)'; });
  div.addEventListener('mouseleave', () => { div.style.transform = 'scale(1)'; });

  return div;
}

export default function PaginaMapa() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const contenedorRef = useRef(null);
  const mapaInstanciaRef = useRef(null);
  const marcadoresRef = useRef([]);
  const infoWindowRef = useRef(null);
  const boundsAjustadosRef = useRef(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await servicioMapa.obtenerPuntos();
        setPuntos(datos);
      } catch (err) {
        console.error('Error cargando puntos del mapa:', err);
        setError('No se pudieron cargar los datos del mapa.');
      }
    };
    cargarDatos();
    const intervalId = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (error) { setCargando(false); return; }

    const apiKeyCfg = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKeyCfg) {
      setError('Clave de Google Maps no configurada (VITE_GOOGLE_MAPS_API_KEY).');
      setCargando(false);
      return;
    }

    const actualizarMapa = async () => {
      try {
        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');

        if (!mapaInstanciaRef.current) {
          mapaInstanciaRef.current = new Map(contenedorRef.current, {
            center: CENTRO_COLOMBIA,
            zoom: ZOOM_INICIAL,
            mapId: 'observatorio_mapa_calor',
            mapTypeId: 'terrain',
          });
        }
        const mapa = mapaInstanciaRef.current;

        /* Limpiar marcadores previos */
        marcadoresRef.current.forEach(m => (m.map = null));
        marcadoresRef.current = [];

        if (puntos.length > 0) {
          const clusters = agruparPuntos(puntos);
          const maxCount = Math.max(...clusters.map(c => c.count));

          for (const cluster of clusters) {
            const circulo = crearCirculo(cluster.count, maxCount);
            const marker = new AdvancedMarkerElement({
              map: mapa,
              position: { lat: cluster.lat, lng: cluster.lng },
              content: circulo,
              title: cluster.municipios.join(', '),
            });

            /* ── InfoWindow al hacer clic ── */
            marker.addListener('click', () => {
              if (infoWindowRef.current) infoWindowRef.current.close();

              const lista = cluster.instituciones.length
                ? cluster.instituciones.map(({ nombre, cant }) =>
                    `<li style="padding:3px 0;border-bottom:1px solid #f0f0f0">• ${nombre}${cant > 1 ? ` <span style="color:#F26522;font-weight:700">(${cant})</span>` : ''}</li>`
                  ).join('')
                : '<li style="color:#999">Sin información de institución</li>';

              const contenido = `
                <div style="font-family:Inter,sans-serif;max-width:300px;max-height:300px;overflow-y:auto">
                  <strong style="font-size:14px;color:#0D1B6F">
                    📍 ${cluster.municipios.join(' / ')} — ${cluster.count} práctica${cluster.count > 1 ? 's' : ''}
                  </strong>
                  <ul style="margin:8px 0 0;padding-left:4px;list-style:none;font-size:12px;color:#374151">
                    ${lista}
                  </ul>
                </div>`;

              const iw = new window.google.maps.InfoWindow({ content: contenido });
              iw.open({ anchor: marker, map: mapa });
              infoWindowRef.current = iw;
            });

            marcadoresRef.current.push(marker);
          }

          // Solo ajustar la vista la PRIMERA VEZ (o si se vaciaron los datos antes)
          if (!boundsAjustadosRef.current) {
            boundsAjustadosRef.current = true;
          }
        } else {
          boundsAjustadosRef.current = false;
        }

        setCargando(false);
      } catch (err) {
        console.error('Error cargando Google Maps:', err);
        setError('Error al cargar Google Maps.');
        setCargando(false);
      }
    };

    actualizarMapa();
  }, [puntos, error]);

  return (
    <>
      <h1 className="page-title">Mapa de Calor — Prácticas Educativas</h1>
      <p className="page-sub">
        Distribución geográfica de las experiencias pedagógicas registradas en el observatorio.
      </p>

      <div className="kpi-row" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Georeferenciadas</div>
            <div className="kpi-val">{puntos.length}</div>
          </div>
          <div className="kpi-icon">📍</div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Ubicaciones únicas</div>
            <div className="kpi-val">{agruparPuntos(puntos).length}</div>
          </div>
          <div className="kpi-icon">🗺️</div>
        </div>
      </div>

      {error && (
        <div className="upload-status error" style={{ marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {cargando && <div className="empty-msg">Cargando mapa…</div>}

      <div
        ref={contenedorRef}
        style={{
          width: '100%',
          height: '520px',
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid var(--borde-suave)',
          background: 'var(--gris-fondo)',
        }}
      />

      {puntos.length === 0 && !cargando && !error && (
        <div className="info-callout" style={{ marginTop: 16 }}>
          <div className="info-callout-icon">ℹ️</div>
          <div>
            <h4>Sin datos georeferenciados</h4>
            <p>
              Las prácticas se geocodifican automáticamente al cargar un archivo Excel.
              Asegúrate de tener configurada la variable <strong>GOOGLE_MAPS_API_KEY</strong> en el backend.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
