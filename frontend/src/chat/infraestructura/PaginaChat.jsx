/**
 * PaginaChat.jsx — Chat con IA + panel de sugerencias + tarjeta reporte (estilo UPN).
 *
 * Solo importa ServicioChat — nunca ApiChat directamente.
 */
import { useState, useRef, useEffect } from 'react';
import servicioChat from '../aplicacion/ServicioChat.js';
import MensajeChat from '../dominio/MensajeChat.js';

const SUGERENCIAS = [
  '¿Cuáles son los obstáculos más comunes?',
  'Resume las prácticas más innovadoras',
  '¿Qué regiones tienen mayor impacto en DDHH?',
  'Compara el conflicto rural vs. urbano',
  '¿Cómo influyen las políticas de memoria?',
  'Identifica casos de éxito en reparación',
  '¿Cuál es la tendencia de inclusión este año?',
];

function renderTexto(texto) {
  return texto
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

export default function PaginaChat() {
  const [mensajes, setMensajes] = useState([
    MensajeChat.deAsistente('¡Hola! Estoy listo para ayudarte a analizar las prácticas educativas registradas. ¿Deseas explorar un conflicto específico o prefieres un resumen de las tendencias de este año?')
  ]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [mensajes, cargando]);

  const enviar = async (texto) => {
    const msg = texto ?? entrada.trim();
    if (!msg || cargando) return;
    setEntrada(''); setCargando(true);
    const nuevoMsgUsuario = MensajeChat.deUsuario(msg);
    const nuevosMsgs = [...mensajes, nuevoMsgUsuario];
    setMensajes(nuevosMsgs);
    try {
      const respuesta = await servicioChat.enviarMensaje(msg, nuevosMsgs);
      setMensajes(prev => [...prev, respuesta]);
    } catch (err) {
      setMensajes(prev => [...prev, MensajeChat.deAsistente(`⚠️ Error: ${err.message}`)]);
    }
    setCargando(false);
  };

  return (
    <>
      <h1 className="page-title">Análisis Inteligente de Datos</h1>
      <p className="page-sub">Consulta la base de datos del Observatorio mediante lenguaje natural. Nuestro asistente IA te ayudará a identificar patrones, retos y éxitos en las prácticas educativas colombianas.</p>

      <div className="ai-panel">
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-avatar">🌿</div>
            <div className="chat-header-info">
              <h3>Asistente de Análisis</h3>
              <p>Soporte pedagógico activo</p>
            </div>
          </div>

          <div className="chat-msgs" ref={msgsRef}>
            {mensajes.map((m, i) => (
              <div key={i} className={`msg msg-${m.esUsuario?'user':'ai'}`}
                dangerouslySetInnerHTML={{ __html: renderTexto(m.contenido) }} />
            ))}
            {cargando && <div className="msg-typing"><div className="typing-dots"><span></span><span></span><span></span></div></div>}
          </div>

          <div className="chat-input-area">
            <textarea className="chat-input" placeholder="Escribe tu consulta aqui..." value={entrada}
              onChange={e => setEntrada(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); enviar(); } }} />
            <button className="send-btn" disabled={cargando} onClick={() => enviar()}>➤</button>
          </div>
        </div>

        <div>
          <div className="suggestions-panel">
            <h3>💡 Preguntas sugeridas</h3>
            {SUGERENCIAS.map((s, i) => <button key={i} className="suggestion-btn" onClick={() => enviar(s)}>{s}</button>)}
          </div>
          <div className="report-card">
            <h4>✨ Reporte Generativo</h4>
            <p>Puedes pedirme que exporte este análisis a PDF o Excel una vez terminemos la sesión.</p>
            <button>Configurar Reporte</button>
          </div>
        </div>
      </div>
    </>
  );
}
