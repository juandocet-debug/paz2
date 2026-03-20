/**
 * PaginaHistorico.jsx — Histórico de archivos cargados (estilo UPN).
 *
 * Solo importa ServicioCargas — nunca ApiCargas directamente.
 */
import { useState, useEffect } from 'react';
import servicioCargas from '../aplicacion/ServicioCargas.js';

export default function PaginaHistorico({ onVerEnTabla, onCambio }) {
  const [cargas, setCargas] = useState([]);

  const cargar = async () => {
    try { setCargas(await servicioCargas.listarCargas()); } catch (err) { console.error(err); }
  };

  useEffect(() => { cargar(); }, []);

  const borrar = async (id) => {
    if (!confirm('¿Eliminar esta carga y todas sus prácticas?')) return;
    try { await servicioCargas.eliminarCarga(id); await cargar(); if (onCambio) onCambio(); } catch (err) { alert(err.message); }
  };

  return (
    <>
      <h1 className="page-title">Histórico de archivos cargados</h1>
      <p className="page-sub">Registro cronológico de las importaciones realizadas al repositorio institucional de prácticas educativas.</p>

      {cargas.length === 0 ? (
        <p className="empty-msg">Aún no se ha cargado ningún archivo. Ve a la pestaña "Cargar Archivo".</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Archivo Original</th><th>Prácticas Importadas</th><th>Fecha de Carga</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {cargas.map((u, i) => (
                <tr key={u.id}>
                  <td style={{fontWeight:600, color:'var(--gris-claro)'}}>{String(i+1).padStart(2,'0')}</td>
                  <td style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{fontSize:18}}>📄</span>
                    <span style={{fontWeight:500}}>{u.nombreOriginal}</span>
                  </td>
                  <td><span className="badge badge-verde">{u.cantidadRegistros} registradas</span></td>
                  <td>{u.fechaFormateada}</td>
                  <td style={{display:'flex', gap:8}}>
                    <button className="btn-action secondary" onClick={() => onVerEnTabla && onVerEnTabla(u.id)}>Ver en tabla</button>
                    <button className="btn-action danger" onClick={() => borrar(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span>Mostrando {cargas.length} de {cargas.length} registros</span>
            <div className="page-btns">
              <button className="page-btn">‹</button>
              <button className="page-btn">›</button>
            </div>
          </div>
        </div>
      )}

      <div className="info-callout">
        <div className="info-callout-icon">ℹ️</div>
        <div>
          <h4>Nota importante sobre la eliminación</h4>
          <p>Eliminar un registro del historial borrará permanentemente la carga y TODAS sus prácticas asociadas de la base de datos global. Esta acción no se puede deshacer y los datos desaparecerán inmediatamente de todos los mapas y tableros.</p>
        </div>
      </div>
    </>
  );
}
