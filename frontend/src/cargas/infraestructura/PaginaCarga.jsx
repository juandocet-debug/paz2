/**
 * PaginaCarga.jsx — Componente React para la pestaña "Cargar Archivo".
 *
 * Solo importa ServicioCargas — nunca ApiCargas directamente.
 */
import { useState, useRef } from 'react';
import servicioCargas from '../aplicacion/ServicioCargas.js';

export default function PaginaCarga({ onCargaExitosa }) {
  const [estado, setEstado] = useState(null); // { msg, tipo }
  const fileRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);

  const procesar = async (archivo) => {
    if (!archivo) return;
    const ext = archivo.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setEstado({ msg: 'Solo se admiten archivos .xlsx o .xls', tipo: 'error' });
      return;
    }
    setEstado({ msg: '⏳ Procesando archivo…', tipo: 'success' });
    try {
      const res = await servicioCargas.subirArchivo(archivo);
      setEstado({ msg: `✅ ${res.message}`, tipo: 'success' });
      if (onCargaExitosa) onCargaExitosa();
    } catch (err) {
      setEstado({ msg: `❌ Error: ${err.message}`, tipo: 'error' });
    }
  };

  const COLUMNAS = ['fecha','institución','sede','tipo de institución','nombre de la práctica','grados','áreas','responsables','departamento','municipio','jornada','conflictos','políticas relacionadas','temas cátedra de paz','frecuencia lineamientos','recibió formación','entidades','diseñaron materiales','obstáculos','facilidades sostenibilidad'];

  return (
    <>
      <div
        className={`upload-zone${arrastrando ? ' drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={e => { e.preventDefault(); setArrastrando(false); procesar(e.dataTransfer.files[0]); }}
      >
        <div className="upload-icon">📊</div>
        <h3>Cargar nuevo archivo Excel</h3>
        <p>Arrastra aquí tu archivo <strong>.xlsx</strong> del instrumento de observación<br/>o haz clic para seleccionarlo</p>
        <button className="upload-btn" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>Seleccionar archivo</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => { procesar(e.target.files[0]); e.target.value = ''; }} />
      </div>

      {estado && <div className={`upload-status ${estado.tipo}`}>{estado.msg}</div>}

      <div className="chart-box" style={{ marginTop: 16 }}>
        <div className="chart-title">📋 Formato esperado del Excel</div>
        <div className="chart-sub">El sistema reconoce las siguientes columnas (el orden no importa)</div>
        <div className="columns-grid">
          {COLUMNAS.map(c => <span className="col-tag" key={c}>{c}</span>)}
        </div>
      </div>
    </>
  );
}
