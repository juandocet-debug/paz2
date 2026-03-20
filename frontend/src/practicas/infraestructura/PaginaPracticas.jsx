/**
 * PaginaPracticas.jsx — Tabla con detalle slide-in (estilo UPN).
 *
 * Solo importa ServicioPracticas — nunca ApiPracticas directamente.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import servicioPracticas from '../aplicacion/ServicioPracticas.js';

function Insignia({ valor }) {
  if (!valor) return <span>—</span>;
  const v = valor.trim().toLowerCase();
  if (v === 'si' || v === 'sí') return <span className="badge badge-verde">Sí</span>;
  if (v === 'no') return <span className="badge badge-rojo">No</span>;
  return <span className="badge badge-amarillo">{valor}</span>;
}

function truncar(t, max = 50) { return !t ? '—' : t.length > max ? t.slice(0, max) + '…' : t; }

export default function PaginaPracticas({ idCargaFiltro }) {
  const [filas, setFilas] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState({ departamentos: [], tipos: [] });
  const [estado, setEstado] = useState({ search:'', departamento:'', tipo:'', formacion:'', page:1, pageSize:15, sortKey:'institucion', sortDir:'ASC' });
  const [detalle, setDetalle] = useState(null);
  const temporizador = useRef(null);

  const cargar = useCallback(async (est, idCarga) => {
    try {
      const params = { ...est };
      if (idCarga) params.uploadId = idCarga;
      const res = await servicioPracticas.buscarTodas(params);
      setFilas(res.filas); setTotal(res.total);
    } catch(err) { console.error(err); }
  }, []);

  useEffect(() => { cargar(estado, idCargaFiltro); }, [estado, idCargaFiltro, cargar]);
  useEffect(() => { servicioPracticas.obtenerFiltros().then(setFiltros).catch(() => {}); }, []);

  const buscar = (e) => {
    clearTimeout(temporizador.current);
    const val = e.target.value;
    temporizador.current = setTimeout(() => setEstado(s => ({ ...s, search: val, page: 1 })), 300);
  };

  const ordenar = (k) => setEstado(s => ({ ...s, sortKey: k, sortDir: s.sortKey === k && s.sortDir === 'ASC' ? 'DESC' : 'ASC', page: 1 }));

  const totalPaginas = Math.ceil(total / estado.pageSize);
  const pags = () => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const p = [1];
    if (estado.page > 3) p.push('…');
    for (let i = Math.max(2, estado.page - 1); i <= Math.min(totalPaginas - 1, estado.page + 1); i++) p.push(i);
    if (estado.page < totalPaginas - 2) p.push('…');
    p.push(totalPaginas);
    return p;
  };

  const exportarCSV = async () => {
    const res = await servicioPracticas.buscarTodas({ ...estado, page: 1, pageSize: 9999 });
    const cols = [
      ['id','id'],['fecha','fecha'],['institucion','institucion'],['sede','sede'],
      ['tipoInstitucion','tipo_institucion'],['nombrePractica','nombre_practica'],
      ['departamento','departamento'],['municipio','municipio'],['jornada','jornada'],
      ['recibioFormacion','recibio_formacion'],['disenaronMateriales','disenaron_materiales'],
      ['conflictosTipo','conflictos_tipo'],['politicasRelacionadas','politicas_relacionadas'],
      ['obstaculos','obstaculos'],
    ];
    const csv = [
      cols.map(c => c[1]).join(','),
      ...res.filas.map(r => cols.map(([campo, cabecera]) => `"${String(r[campo]||'').replace(/"/g,'""')}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'practicas_educativas.csv' }).click();
  };

  const verDetalle = async (id) => { try { setDetalle(await servicioPracticas.buscarPorId(id)); } catch(e) { console.error(e); } };

  return (
    <>
      <h1 className="page-title">Tabla de Datos de Prácticas</h1>
      <p className="page-sub">Explora y filtra el repositorio institucional de experiencias pedagógicas.</p>

      <div className="table-controls">
        <input className="search-input" placeholder="🔍 Institución, práctica o palabra clave..." onChange={buscar} />
        <select className="filter-select" onChange={e => setEstado(s => ({ ...s, departamento: e.target.value, page: 1 }))}>
          <option value="">Todos los departamentos</option>
          {filtros.departamentos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" onChange={e => setEstado(s => ({ ...s, tipo: e.target.value, page: 1 }))}>
          <option value="">Todos los tipos</option>
          {filtros.tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" onChange={e => setEstado(s => ({ ...s, formacion: e.target.value, page: 1 }))}>
          <option value="">Formación</option>
          <option value="Si">Sí recibió</option>
          <option value="No">No recibió</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-action" onClick={exportarCSV}>⬇ Exportar CSV</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[['institucion','Institución'],['departamento','Departamento'],['municipio','Municipio'],['nombrePractica','Práctica Educativa'],['tipoInstitucion','Tipo'],['jornada','Jornada'],['recibioFormacion','Formación']].map(([k,l]) =>
                <th key={k} onClick={() => ordenar(k)}>{l}</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr><td colSpan="8" className="empty-msg">No se encontraron prácticas con los filtros aplicados.</td></tr>
            ) : filas.map(r => (
              <tr key={r.id}>
                <td className="td-truncate" title={r.institucion}>{truncar(r.institucion)}</td>
                <td>{r.departamento || '—'}</td>
                <td>{r.municipio || '—'}</td>
                <td className="td-truncate" title={r.nombrePractica} style={{fontStyle:'italic', color:'var(--azul-inst)'}}>{truncar(r.nombrePractica)}</td>
                <td>{r.tipoInstitucion || '—'}</td>
                <td>{r.jornada || '—'}</td>
                <td><Insignia valor={r.recibioFormacion} /></td>
                <td><button className="btn-action secondary" onClick={() => verDetalle(r.id)}>VER</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span>Mostrando <strong>{(estado.page-1)*estado.pageSize+1}–{Math.min(estado.page*estado.pageSize,total)}</strong> de {total} prácticas registradas</span>
          <div className="page-btns">
            {pags().map((p, i) =>
              p === '…' ? <span key={`e${i}`} style={{ padding: '5px 4px', color: 'var(--gris-claro)' }}>…</span>
              : <button key={p} className={`page-btn${p === estado.page ? ' active' : ''}`} onClick={() => setEstado(s => ({ ...s, page: p }))}>{p}</button>
            )}
          </div>
        </div>
      </div>

      {/* Modal slide-in */}
      <div className={`modal-overlay${detalle ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setDetalle(null); }}>
        {detalle && (
          <div className="modal">
            <button className="modal-close" onClick={() => setDetalle(null)}>✕</button>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'var(--gris-claro)',marginBottom:4}}>Detalle de Práctica</div>
            <h2>{detalle.nombrePractica || 'Detalle'}</h2>
            <div style={{background:'var(--azul-palido)',borderRadius:8,padding:16,marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>🏫</span>
              <div>
                <div style={{fontWeight:600}}>{detalle.institucion}</div>
                <div style={{fontSize:12,color:'var(--gris-medio)'}}>{detalle.departamento}, {detalle.municipio}</div>
              </div>
            </div>
            <div className="modal-grid">
              <div className="modal-field"><label>Tipo de Práctica</label><p>{detalle.tipoInstitucion || '—'}</p></div>
              <div className="modal-field"><label>Año Inicio</label><p>{detalle.fecha || '—'}</p></div>
              <div className="modal-field"><label>Jornada</label><p>{detalle.jornada || '—'}</p></div>
              <div className="modal-field"><label>Responsables</label><p>{detalle.responsables || '—'}</p></div>
              <div className="modal-field full"><label>Grados</label><p>{detalle.grados || '—'}</p></div>
              <div className="modal-field full"><label>Áreas</label><p>{detalle.areas || '—'}</p></div>
              <div className="modal-field full"><label>Tipos de conflicto</label><p>{detalle.conflictosTipo || '—'}</p></div>
              <div className="modal-field full"><label>Políticas relacionadas</label><p>{detalle.politicasRelacionadas || '—'}</p></div>
              <div className="modal-field full"><label>Temas Cátedra de Paz</label><p>{detalle.temasCatedraPaz || '—'}</p></div>
              <div className="modal-field"><label>Recibió formación</label><p><Insignia valor={detalle.recibioFormacion} /></p></div>
              <div className="modal-field"><label>Diseñaron materiales</label><p><Insignia valor={detalle.disenaronMateriales} /></p></div>
            </div>
            <div style={{marginTop:20}}>
              <div className="modal-field full"><label>Obstáculos Superados</label><p style={{whiteSpace:'pre-line',fontSize:13,lineHeight:1.6,background:'var(--gris-fondo)',padding:12,borderRadius:8}}>{detalle.obstaculos || '—'}</p></div>
            </div>
            <div style={{marginTop:12}}>
              <div className="modal-field full"><label>Estrategia de Sostenibilidad</label><p style={{whiteSpace:'pre-line',fontSize:13,lineHeight:1.6,background:'var(--gris-fondo)',padding:12,borderRadius:8}}>{detalle.facilidadesSostenibilidad || '—'}</p></div>
            </div>
            <button className="btn-action" style={{width:'100%',marginTop:20,background:'var(--naranja)',justifyContent:'center'}}>Descargar PDF Completo</button>
          </div>
        )}
      </div>
    </>
  );
}
