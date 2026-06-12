/**
 * Genera el Manual de Usuario en PDF usando Puppeteer
 * con diseño premium, capturas reales y contenido pedagógico detallado.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS = path.join(__dirname, 'screenshots');
const OUTPUT_PDF = path.join(__dirname, 'manual', 'Manual_Usuario_Observatorio_UPN.pdf');

// Asegurar que existe la carpeta manual
if (!fs.existsSync(path.join(__dirname, 'manual'))) {
  fs.mkdirSync(path.join(__dirname, 'manual'), { recursive: true });
}

// Convertir imagen a base64 para incrustarla en HTML
function imgBase64(filename) {
  const filePath = path.join(SCREENSHOTS, filename);
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filename).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Manual de Usuario — Observatorio de Prácticas Educativas UPN</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

  :root {
    --azul-upn: #003087;
    --azul-medio: #1a4fa0;
    --azul-claro: #2d6bc4;
    --naranja: #e85d04;
    --naranja-claro: #f4a261;
    --gris-fondo: #f4f6fb;
    --gris-borde: #dde3f0;
    --texto: #1a1a2e;
    --texto-claro: #4a5568;
    --blanco: #ffffff;
    --verde: #1a7a4a;
    --morado: #6b21a8;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--texto);
    background: var(--blanco);
    font-size: 11pt;
    line-height: 1.6;
  }

  /* ═══════════════════════════════
     PORTADA
  ═══════════════════════════════ */
  .portada {
    page-break-after: always;
    min-height: 100vh;
    background: linear-gradient(145deg, #001f5c 0%, #003087 40%, #1a4fa0 70%, #0a1628 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }

  .portada::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(232,93,4,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  .portada::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(45,107,196,0.2) 0%, transparent 70%);
    border-radius: 50%;
  }

  .portada-franja {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, #e85d04, #f4a261, #e85d04);
  }

  .portada-franja-bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, #e85d04, #f4a261, #e85d04);
  }

  .portada-logo-area {
    text-align: center;
    margin-bottom: 50px;
    position: relative; z-index: 1;
  }

  .portada-logo-circulo {
    width: 100px; height: 100px;
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-size: 36px;
  }

  .portada-institucion {
    color: rgba(255,255,255,0.8);
    font-size: 13pt;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .portada-facultad {
    color: rgba(255,255,255,0.5);
    font-size: 9pt;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .portada-divider {
    width: 80px; height: 3px;
    background: var(--naranja);
    margin: 30px auto;
    position: relative; z-index: 1;
  }

  .portada-badge {
    background: linear-gradient(135deg, rgba(232,93,4,0.2), rgba(244,162,97,0.15));
    border: 1px solid rgba(232,93,4,0.4);
    color: var(--naranja-claro);
    padding: 6px 20px;
    border-radius: 30px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 30px;
    position: relative; z-index: 1;
  }

  .portada-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 36pt;
    font-weight: 800;
    color: var(--blanco);
    text-align: center;
    line-height: 1.15;
    position: relative; z-index: 1;
    margin-bottom: 16px;
  }

  .portada-titulo span {
    color: var(--naranja-claro);
  }

  .portada-subtitulo {
    color: rgba(255,255,255,0.7);
    font-size: 13pt;
    text-align: center;
    font-weight: 300;
    letter-spacing: 1px;
    position: relative; z-index: 1;
    margin-bottom: 50px;
  }

  .portada-meta {
    display: flex;
    gap: 40px;
    position: relative; z-index: 1;
    margin-bottom: 60px;
  }

  .portada-meta-item {
    text-align: center;
    padding: 16px 24px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
  }

  .portada-meta-valor {
    font-size: 22pt;
    font-weight: 800;
    color: var(--naranja-claro);
    line-height: 1;
  }

  .portada-meta-label {
    font-size: 8pt;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .portada-footer {
    position: absolute;
    bottom: 30px;
    left: 0; right: 0;
    text-align: center;
    color: rgba(255,255,255,0.4);
    font-size: 8pt;
    letter-spacing: 1px;
    z-index: 1;
  }

  /* ═══════════════════════════════
     PÁGINAS INTERNAS
  ═══════════════════════════════ */
  .pagina {
    page-break-after: always;
    padding: 50px 60px;
    min-height: 100vh;
    background: var(--blanco);
    position: relative;
  }

  .pagina:last-child { page-break-after: auto; }

  .pagina-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 3px solid var(--azul-upn);
    margin-bottom: 36px;
  }

  .pagina-header-left {
    display: flex; align-items: center; gap: 12px;
  }

  .pagina-numero {
    background: var(--azul-upn);
    color: white;
    font-size: 8pt;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 1px;
  }

  .pagina-breadcrumb {
    color: var(--texto-claro);
    font-size: 8pt;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .pagina-logo {
    color: var(--azul-upn);
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  /* ═══════════════════════════════
     SECCIÓN INICIO / H1
  ═══════════════════════════════ */
  .seccion-titulo-grande {
    font-family: 'Playfair Display', serif;
    font-size: 26pt;
    font-weight: 800;
    color: var(--azul-upn);
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .seccion-titulo-grande span { color: var(--naranja); }

  .seccion-bajada {
    color: var(--texto-claro);
    font-size: 11pt;
    font-weight: 400;
    margin-bottom: 32px;
    max-width: 700px;
    line-height: 1.7;
  }

  /* Módulo título */
  .modulo-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px 28px;
    background: linear-gradient(135deg, var(--azul-upn), var(--azul-medio));
    border-radius: 16px;
    color: white;
  }

  .modulo-icono {
    font-size: 28px;
    width: 52px; height: 52px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .modulo-titulo {
    font-size: 18pt;
    font-weight: 700;
    line-height: 1.1;
  }

  .modulo-subtitulo {
    font-size: 9pt;
    opacity: 0.7;
    margin-top: 3px;
    font-weight: 400;
  }

  /* ═══════════════════════════════
     CAPTURAS
  ═══════════════════════════════ */
  .captura-bloque {
    margin: 24px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,48,135,0.15);
    border: 1px solid var(--gris-borde);
  }

  .captura-titulo {
    background: var(--azul-upn);
    color: white;
    padding: 10px 20px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 8px;
  }

  .captura-titulo-dot {
    width: 8px; height: 8px;
    background: var(--naranja);
    border-radius: 50%;
  }

  .captura-bloque img {
    width: 100%;
    display: block;
  }

  .captura-pie {
    background: var(--gris-fondo);
    border-top: 1px solid var(--gris-borde);
    padding: 10px 20px;
    font-size: 8.5pt;
    color: var(--texto-claro);
    font-style: italic;
  }

  /* ═══════════════════════════════
     PASOS
  ═══════════════════════════════ */
  .pasos {
    list-style: none;
    margin: 20px 0;
  }

  .paso {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .paso-numero {
    width: 32px; height: 32px;
    background: var(--azul-upn);
    color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11pt;
    font-weight: 800;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .paso-contenido {
    flex: 1;
  }

  .paso-label {
    font-weight: 700;
    color: var(--azul-upn);
    font-size: 10.5pt;
    margin-bottom: 3px;
  }

  .paso-desc {
    color: var(--texto-claro);
    font-size: 10pt;
    line-height: 1.6;
  }

  /* ═══════════════════════════════
     ALERTAS / NOTAS
  ═══════════════════════════════ */
  .alerta {
    padding: 14px 18px;
    border-radius: 10px;
    margin: 16px 0;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .alerta-info {
    background: #e8f0fe;
    border-left: 4px solid var(--azul-claro);
  }

  .alerta-tip {
    background: #fff3e0;
    border-left: 4px solid var(--naranja);
  }

  .alerta-exito {
    background: #e8f5e9;
    border-left: 4px solid var(--verde);
  }

  .alerta-icono { font-size: 16px; margin-top: 1px; }

  .alerta-texto {
    font-size: 9.5pt;
    line-height: 1.6;
    color: var(--texto);
  }

  .alerta-texto strong { display: block; margin-bottom: 3px; font-size: 10pt; }

  /* ═══════════════════════════════
     GRIDS / COLUMNAS
  ═══════════════════════════════ */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 20px 0;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin: 20px 0;
  }

  .card {
    background: var(--gris-fondo);
    border: 1px solid var(--gris-borde);
    border-radius: 12px;
    padding: 18px;
  }

  .card-titulo {
    font-weight: 700;
    font-size: 10pt;
    color: var(--azul-upn);
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }

  .card-texto {
    font-size: 9.5pt;
    color: var(--texto-claro);
    line-height: 1.6;
  }

  .tag {
    display: inline-block;
    background: var(--azul-upn);
    color: white;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    margin: 3px 2px;
    letter-spacing: 0.5px;
  }

  .tag-naranja { background: var(--naranja); }
  .tag-verde { background: var(--verde); }
  .tag-morado { background: var(--morado); }

  /* Tabla de contenido */
  .toc-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 6px;
    background: var(--gris-fondo);
    border: 1px solid var(--gris-borde);
    gap: 14px;
  }

  .toc-num {
    width: 28px; height: 28px;
    background: var(--azul-upn);
    color: white;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 9pt;
    font-weight: 700;
    flex-shrink: 0;
  }

  .toc-nombre {
    flex: 1;
    font-size: 10pt;
    font-weight: 500;
  }

  .toc-icono { font-size: 14px; }

  /* Línea separadora de sección */
  hr.seccion { border: none; border-top: 2px solid var(--gris-borde); margin: 28px 0; }

  /* Tabla de especificaciones */
  table.specs {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 16px 0;
  }

  table.specs th {
    background: var(--azul-upn);
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
  }

  table.specs td {
    padding: 9px 14px;
    border-bottom: 1px solid var(--gris-borde);
    color: var(--texto-claro);
  }

  table.specs tr:nth-child(even) td { background: var(--gris-fondo); }
  table.specs tr td:first-child { font-weight: 600; color: var(--texto); }

  /* Pie de página */
  .pie-pagina {
    position: fixed;
    bottom: 20px;
    left: 60px; right: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: var(--texto-claro);
    border-top: 1px solid var(--gris-borde);
    padding-top: 10px;
    opacity: 0.6;
  }

  /* Blockquote pedagógico */
  .cita-pedagogica {
    border-left: 4px solid var(--naranja);
    padding: 16px 24px;
    margin: 20px 0;
    background: linear-gradient(135deg, rgba(232,93,4,0.05), rgba(244,162,97,0.08));
    border-radius: 0 12px 12px 0;
  }

  .cita-texto {
    font-size: 12pt;
    font-style: italic;
    font-weight: 500;
    color: var(--azul-upn);
    line-height: 1.7;
    margin-bottom: 8px;
  }

  .cita-fuente {
    font-size: 8.5pt;
    color: var(--texto-claro);
    font-weight: 600;
  }

  /* Indicadores KPI */
  .kpi-row {
    display: flex;
    gap: 16px;
    margin: 20px 0;
  }

  .kpi {
    flex: 1;
    text-align: center;
    padding: 20px 12px;
    border-radius: 12px;
    border: 1px solid var(--gris-borde);
  }

  .kpi-valor {
    font-size: 26pt;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 6px;
  }

  .kpi-label {
    font-size: 8pt;
    color: var(--texto-claro);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }

  .kpi-azul { background: linear-gradient(135deg, #e8f0fe, #dbeafe); }
  .kpi-azul .kpi-valor { color: var(--azul-upn); }
  .kpi-naranja { background: linear-gradient(135deg, #fff3e0, #fed7aa); }
  .kpi-naranja .kpi-valor { color: var(--naranja); }
  .kpi-verde { background: linear-gradient(135deg, #e8f5e9, #d1fae5); }
  .kpi-verde .kpi-valor { color: var(--verde); }
  .kpi-morado { background: linear-gradient(135deg, #f3e8ff, #ede9fe); }
  .kpi-morado .kpi-valor { color: var(--morado); }

  @media print {
    .pagina, .portada { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════════
     PORTADA
══════════════════════════════════════════════ -->
<div class="portada">
  <div class="portada-franja"></div>
  <div class="portada-franja-bottom"></div>

  <div class="portada-logo-area">
    <div class="portada-logo-circulo">🏛️</div>
    <div class="portada-institucion">Universidad Pedagógica Nacional</div>
    <div class="portada-facultad">Facultad de Educación · Colombia</div>
  </div>

  <div class="portada-divider"></div>
  <div class="portada-badge">📖 Manual de Usuario · Versión 1.0 · 2026</div>

  <div class="portada-titulo">
    Observatorio de<br><span>Prácticas Educativas</span>
  </div>

  <div class="portada-subtitulo">
    Paz, Memoria y Derechos Humanos — Colombia<br>
    Guía Completa de Uso y Referencia Pedagógica
  </div>

  <div class="portada-meta">
    <div class="portada-meta-item">
      <div class="portada-meta-valor">300+</div>
      <div class="portada-meta-label">Prácticas Registradas</div>
    </div>
    <div class="portada-meta-item">
      <div class="portada-meta-valor">5</div>
      <div class="portada-meta-label">Departamentos</div>
    </div>
    <div class="portada-meta-item">
      <div class="portada-meta-valor">7</div>
      <div class="portada-meta-label">Módulos Activos</div>
    </div>
    <div class="portada-meta-item">
      <div class="portada-meta-valor">IA</div>
      <div class="portada-meta-label">Análisis Inteligente</div>
    </div>
  </div>

  <div class="portada-footer">
    Observatorio de Prácticas Educativas — Paz, Memoria y DDHH · UPN · Colombia · 2026 · Uso Institucional
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 2: PRESENTACIÓN Y VALOR PEDAGÓGICO
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">PRESENTACIÓN</span>
      <span class="pagina-breadcrumb">Propósito y Valor Pedagógico</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo-grande">¿Qué es el <span>Observatorio</span>?</div>
  <div class="seccion-bajada">
    Una plataforma tecnológica viva, construida desde y para los territorios colombianos, que centraliza, analiza y visibiliza las prácticas educativas de docentes comprometidos con la paz, la memoria y los derechos humanos.
  </div>

  <div class="cita-pedagogica">
    <div class="cita-texto">
      "La escuela no es ajena al conflicto. Es precisamente en los territorios marcados por la violencia donde las prácticas pedagógicas tienen el mayor poder transformador. Este Observatorio nace para ver, escuchar y potenciar esas voces."
    </div>
    <div class="cita-fuente">— Fundamento pedagógico del Observatorio de Prácticas Educativas · UPN 2026</div>
  </div>

  <div class="grid-2" style="margin-top: 28px;">
    <div>
      <div style="font-size:11.5pt; font-weight:700; color:var(--azul-upn); margin-bottom:14px;">🎯 ¿Para qué sirve?</div>
      <ul class="pasos">
        <li class="paso">
          <div class="paso-numero">1</div>
          <div class="paso-contenido">
            <div class="paso-label">Centralizar el conocimiento</div>
            <div class="paso-desc">Reúne en un solo lugar las prácticas educativas dispersas en colegios, veredas y municipios de Colombia.</div>
          </div>
        </li>
        <li class="paso">
          <div class="paso-numero">2</div>
          <div class="paso-contenido">
            <div class="paso-label">Visibilizar los territorios</div>
            <div class="paso-desc">Mapea geográficamente dónde ocurren estas experiencias, poniendo en el mapa pedagógico regiones invisibilizadas.</div>
          </div>
        </li>
        <li class="paso">
          <div class="paso-numero">3</div>
          <div class="paso-contenido">
            <div class="paso-label">Analizar con inteligencia artificial</div>
            <div class="paso-desc">Permite consultar los datos en lenguaje natural: "¿Cuántas prácticas abordan el conflicto armado en Bolívar?"</div>
          </div>
        </li>
        <li class="paso">
          <div class="paso-numero">4</div>
          <div class="paso-contenido">
            <div class="paso-label">Apoyar políticas educativas</div>
            <div class="paso-desc">Genera evidencia para la toma de decisiones del MEN, secretarías y la UPN sobre la Cátedra de Paz.</div>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div style="font-size:11.5pt; font-weight:700; color:var(--azul-upn); margin-bottom:14px;">🌿 Potencial pedagógico</div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-titulo">📚 Construcción colectiva del saber</div>
        <div class="card-texto">El sistema no solo almacena datos: construye un repositorio vivo de saberes pedagógicos producidos por docentes en contextos de vulnerabilidad y resistencia.</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-titulo">🗺️ Pedagogía del territorio</div>
        <div class="card-texto">El mapa de calor transforma datos en geografía pedagógica: permite ver qué regiones tienen más experiencias de paz y cuáles necesitan más acompañamiento.</div>
      </div>
      <div class="card">
        <div class="card-titulo">🤝 Redes de docentes</div>
        <div class="card-texto">Al registrar responsables, instituciones y municipios, el sistema facilita la conexión entre docentes que trabajan temas similares en diferentes regiones.</div>
      </div>
    </div>
  </div>

  <hr class="seccion">

  <div style="font-size:11.5pt; font-weight:700; color:var(--azul-upn); margin-bottom:16px;">📍 Contexto de implementación</div>
  <div class="grid-3">
    <div class="card" style="border-top: 3px solid var(--azul-upn);">
      <div class="card-titulo">🏫 Ya se usa</div>
      <div class="card-texto">El Observatorio está en producción y actualmente registra más de 300 prácticas educativas de instituciones de todo el país.</div>
    </div>
    <div class="card" style="border-top: 3px solid var(--naranja);">
      <div class="card-titulo">🌐 Acceso abierto</div>
      <div class="card-texto">Cuenta con una vista pública de acceso libre para que comunidades, familias y ciudadanos consulten las prácticas de su región.</div>
    </div>
    <div class="card" style="border-top: 3px solid var(--verde);">
      <div class="card-titulo">🤖 IA educativa</div>
      <div class="card-texto">Primer observatorio colombiano en integrar un asistente de inteligencia artificial para análisis pedagógico de base de datos documental.</div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 3: TABLA DE CONTENIDO
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">CONTENIDO</span>
      <span class="pagina-breadcrumb">Tabla de Contenido</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo-grande">Contenido del <span>Manual</span></div>
  <div class="seccion-bajada">Este manual guía paso a paso al usuario administrador en el uso completo del Observatorio de Prácticas Educativas.</div>

  <div style="margin-top: 10px;">
    <div class="toc-item"><div class="toc-num">1</div><div class="toc-nombre">Acceso al Sistema — Inicio de Sesión</div><div class="toc-icono">🔐</div></div>
    <div class="toc-item"><div class="toc-num">2</div><div class="toc-nombre">Vista Pública — El Observatorio para la ciudadanía</div><div class="toc-icono">🌍</div></div>
    <div class="toc-item"><div class="toc-num">3</div><div class="toc-nombre">Dashboard — Panel Principal de Analíticas</div><div class="toc-icono">📊</div></div>
    <div class="toc-item"><div class="toc-num">4</div><div class="toc-nombre">Conflictos y Políticas — Análisis documental</div><div class="toc-icono">📋</div></div>
    <div class="toc-item"><div class="toc-num">5</div><div class="toc-nombre">Tabla de Datos — Exploración del repositorio</div><div class="toc-icono">🗃️</div></div>
    <div class="toc-item"><div class="toc-num">6</div><div class="toc-nombre">Chat con IA — Análisis inteligente en lenguaje natural</div><div class="toc-icono">🤖</div></div>
    <div class="toc-item"><div class="toc-num">7</div><div class="toc-nombre">Cargar Archivo — Ingreso masivo de prácticas</div><div class="toc-icono">📤</div></div>
    <div class="toc-item"><div class="toc-num">8</div><div class="toc-nombre">Mapa de Calor — Geografía pedagógica</div><div class="toc-icono">🗺️</div></div>
    <div class="toc-item"><div class="toc-num">9</div><div class="toc-nombre">Histórico — Trazabilidad y auditoría de datos</div><div class="toc-icono">🕐</div></div>
    <div class="toc-item"><div class="toc-num">10</div><div class="toc-nombre">Cierre de Sesión</div><div class="toc-icono">🚪</div></div>
  </div>

  <hr class="seccion">

  <div style="font-size:11.5pt; font-weight:700; color:var(--azul-upn); margin-bottom:16px;">🛠️ Requisitos técnicos</div>
  <table class="specs">
    <tr><th>Componente</th><th>Especificación</th><th>Notas</th></tr>
    <tr><td>Navegador</td><td>Google Chrome, Firefox, Edge (versiones 2023+)</td><td>Recomendado Chrome</td></tr>
    <tr><td>Conexión</td><td>Internet o red local con acceso al servidor</td><td>Mínimo 2 Mbps</td></tr>
    <tr><td>Resolución</td><td>1280×720 px o superior</td><td>Óptimo 1440×900</td></tr>
    <tr><td>Credenciales</td><td>Usuario y contraseña asignados por el administrador</td><td>Acceso restringido</td></tr>
    <tr><td>Archivos de carga</td><td>Formato Excel (.xlsx) con columnas predefinidas</td><td>Plantilla disponible</td></tr>
  </table>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 4: MÓDULO 1 — LOGIN
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 1</span>
      <span class="pagina-breadcrumb">Acceso al Sistema</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header">
    <div class="modulo-icono">🔐</div>
    <div>
      <div class="modulo-titulo">Inicio de Sesión</div>
      <div class="modulo-subtitulo">Acceso seguro al Panel Administrativo del Observatorio</div>
    </div>
  </div>

  <div class="seccion-bajada">
    El acceso al panel administrativo está protegido mediante autenticación con usuario y contraseña. Una vez verificadas las credenciales, el sistema emite un token de seguridad JWT que garantiza la sesión durante 8 horas.
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 1.1 — Pantalla de inicio de sesión del Observatorio</div>
    <img src="${imgBase64('01_Login.png')}" alt="Pantalla de Login" />
    <div class="captura-pie">Vista de la pantalla de autenticación. Se observa el logo oficial de la Universidad Pedagógica Nacional y los campos de acceso restringido.</div>
  </div>

  <ul class="pasos" style="margin-top:24px;">
    <li class="paso"><div class="paso-numero">1</div><div class="paso-contenido"><div class="paso-label">Abrir la URL del Observatorio</div><div class="paso-desc">En la barra de direcciones del navegador, escriba la URL proporcionada por el administrador y diríjase a <strong>/login</strong>.</div></div></li>
    <li class="paso"><div class="paso-numero">2</div><div class="paso-contenido"><div class="paso-label">Ingresar el nombre de usuario</div><div class="paso-desc">En el campo <strong>"Usuario"</strong>, escriba el nombre de usuario asignado (ej. <code>admin</code> o <code>demo</code>).</div></div></li>
    <li class="paso"><div class="paso-numero">3</div><div class="paso-contenido"><div class="paso-label">Ingresar la contraseña</div><div class="paso-desc">En el campo <strong>"Contraseña"</strong>, escriba la clave de acceso. Los caracteres se ocultan por seguridad.</div></div></li>
    <li class="paso"><div class="paso-numero">4</div><div class="paso-contenido"><div class="paso-label">Hacer clic en "Ingresar al Panel"</div><div class="paso-desc">El sistema valida las credenciales. Si son correctas, lo redirige automáticamente al Dashboard principal.</div></div></li>
  </ul>

  <div class="alerta alerta-info" style="margin-top:16px;">
    <span class="alerta-icono">ℹ️</span>
    <div class="alerta-texto"><strong>Seguridad JWT</strong>El sistema utiliza JSON Web Tokens (JWT) para mantener la sesión activa durante 8 horas. Después de ese tiempo, deberá volver a iniciar sesión. No comparta sus credenciales con terceros.</div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 5: MÓDULO 2 — VISTA PÚBLICA
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 2</span>
      <span class="pagina-breadcrumb">Vista Pública</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #1a7a4a, #2d9e64);">
    <div class="modulo-icono">🌍</div>
    <div>
      <div class="modulo-titulo">Vista Pública del Observatorio</div>
      <div class="modulo-subtitulo">Acceso abierto para la ciudadanía, docentes y comunidades</div>
    </div>
  </div>

  <div class="seccion-bajada">
    La vista pública es el corazón social del Observatorio: un espacio de acceso libre donde cualquier persona — docente, familiar, investigador o ciudadano — puede explorar las prácticas educativas registradas sin necesidad de credenciales. Es el puente entre la academia y el territorio.
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 2.1 — Vista Pública del Observatorio con 300 prácticas y mapa interactivo de Colombia</div>
    <img src="${imgBase64('10_Vista_Publica.png')}" alt="Vista Pública" />
    <div class="captura-pie">Vista pública disponible sin autenticación. Muestra el mapa de distribución geográfica con 300 puntos activos, indicadores estadísticos, tipos de institución, jornadas escolares y producción académica.</div>
  </div>

  <div class="kpi-row">
    <div class="kpi kpi-azul"><div class="kpi-valor">300</div><div class="kpi-label">Prácticas visibles</div></div>
    <div class="kpi kpi-naranja"><div class="kpi-valor">5</div><div class="kpi-label">Departamentos</div></div>
    <div class="kpi kpi-verde"><div class="kpi-valor">61</div><div class="kpi-label">Materiales</div></div>
    <div class="kpi kpi-morado"><div class="kpi-valor">19%</div><div class="kpi-label">Conflictos ID</div></div>
  </div>

  <div class="alerta alerta-exito">
    <span class="alerta-icono">🌿</span>
    <div class="alerta-texto"><strong>Valor pedagógico — Transparencia territorial</strong>La vista pública democratiza el acceso al conocimiento pedagógico. Comunidades rurales y familias pueden ver si su municipio está representado y qué instituciones trabajan por la paz en su territorio.</div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 6: MÓDULO 3 — DASHBOARD
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 3</span>
      <span class="pagina-breadcrumb">Panel Principal</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header">
    <div class="modulo-icono">📊</div>
    <div>
      <div class="modulo-titulo">Dashboard — Panel de Analíticas</div>
      <div class="modulo-subtitulo">Centro de mando del Observatorio: métricas, gráficas y distribución nacional</div>
    </div>
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 3.1 — Dashboard principal con datos reales: 300 prácticas de 5 departamentos</div>
    <img src="${imgBase64('02_Dashboard.png')}" alt="Dashboard" />
    <div class="captura-pie">Vista del Dashboard administrativo tras la carga del archivo de datos. Se visualizan los KPIs en tiempo real, distribución por departamento, tipo de institución, jornada escolar y producción de materiales.</div>
  </div>

  <div class="grid-2" style="margin-top:20px;">
    <div>
      <div style="font-weight:700; color:var(--azul-upn); margin-bottom:10px; font-size:10.5pt;">📌 Elementos del Dashboard</div>
      <div class="card" style="margin-bottom:8px;"><div class="card-titulo">🔢 KPIs superiores</div><div class="card-texto">Muestra el total de prácticas, departamentos cubiertos, docentes con formación y materiales producidos. Se actualizan en tiempo real al cargar nuevos datos.</div></div>
      <div class="card" style="margin-bottom:8px;"><div class="card-titulo">📈 Distribución por departamento</div><div class="card-texto">Barras horizontales que clasifican las prácticas por departamento. Cundinamarca (69), Antioquia (68), Valle (57), Atlántico (55), Bolívar (51).</div></div>
      <div class="card"><div class="card-titulo">🍩 Gráficas circulares</div><div class="card-texto">Tipo de institución y jornada escolar mostrados como donut charts interactivos con leyenda de colores.</div></div>
    </div>
    <div>
      <div style="font-weight:700; color:var(--azul-upn); margin-bottom:10px; font-size:10.5pt;">✨ Función especial</div>
      <div class="alerta alerta-tip">
        <span class="alerta-icono">🧠</span>
        <div class="alerta-texto"><strong>Botón "Analizar con IA"</strong>En el Dashboard existe un botón que activa el análisis automático de todos los datos con Inteligencia Artificial, generando un resumen cualitativo de las tendencias del Observatorio.</div>
      </div>
      <div class="alerta alerta-info" style="margin-top:12px;">
        <span class="alerta-icono">🔄</span>
        <div class="alerta-texto"><strong>Actualización automática</strong>El Dashboard se refresca cada vez que se carga un nuevo archivo de prácticas. No es necesario hacer nada manualmente.</div>
      </div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 7: MÓDULO 4 — CONFLICTOS Y POLÍTICAS
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 4</span>
      <span class="pagina-breadcrumb">Análisis Documental</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #7c2d12, #c2410c);">
    <div class="modulo-icono">📋</div>
    <div>
      <div class="modulo-titulo">Conflictos y Políticas</div>
      <div class="modulo-subtitulo">Análisis de tensiones territoriales y marcos de política educativa</div>
    </div>
  </div>

  <div class="seccion-bajada">
    Este módulo permite analizar cómo las prácticas educativas del Observatorio se relacionan con los conflictos sociales del territorio y con las políticas públicas de paz y convivencia. Es el componente de mayor densidad analítica del sistema.
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 4.1 — Módulo de Análisis de Conflictos y Marco de Políticas</div>
    <img src="${imgBase64('03_Conflictos_Politicas.png')}" alt="Conflictos y Políticas" />
    <div class="captura-pie">El módulo organiza el análisis en cuatro dimensiones: tipos de conflicto asociados, políticas y apuestas institucionales, temáticas de Cátedra de Paz y entidades proveedoras de materiales pedagógicos.</div>
  </div>

  <div class="grid-2" style="margin-top:20px;">
    <div class="card"><div class="card-titulo">⚡ Tipos de conflicto</div><div class="card-texto">Distribución de las tensiones sociales, institucionales y territoriales que atraviesan el contexto de cada práctica registrada.</div></div>
    <div class="card"><div class="card-titulo">📜 Políticas institucionales</div><div class="card-texto">Alineación de las prácticas con marcos legales como la Ley de Cátedra de Paz, lineamientos del MEN y Secretarías de Educación.</div></div>
    <div class="card"><div class="card-titulo">☮️ Temáticas de Cátedra de Paz</div><div class="card-texto">Enfoques curriculares predominantes según el Decreto Reglamentario de la Ley de Cátedra de Paz.</div></div>
    <div class="card"><div class="card-titulo">📦 Entidades proveedoras</div><div class="card-texto">Fuentes de recursos y materiales didácticos utilizados por los docentes en sus prácticas educativas.</div></div>
  </div>

  <div class="alerta alerta-exito" style="margin-top:16px;">
    <span class="alerta-icono">🌿</span>
    <div class="alerta-texto"><strong>Valor pedagógico — Evidencia para la política pública</strong>Este módulo transforma respuestas de docentes en evidencia estadística que puede ser presentada ante el MEN, la UPN o los entes territoriales para fundamentar decisiones de política educativa en zonas de conflicto.</div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 8: MÓDULO 5 — TABLA DE DATOS
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 5</span>
      <span class="pagina-breadcrumb">Repositorio de Prácticas</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #1e40af, #3b82f6);">
    <div class="modulo-icono">🗃️</div>
    <div>
      <div class="modulo-titulo">Tabla de Datos</div>
      <div class="modulo-subtitulo">Exploración, búsqueda y filtrado del repositorio completo de prácticas educativas</div>
    </div>
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 5.1 — Tabla de Datos con 300 prácticas registradas, búsqueda y paginación</div>
    <img src="${imgBase64('04_Tabla_Datos.png')}" alt="Tabla de Datos" />
    <div class="captura-pie">Vista de la tabla con los 300 registros del instrumento de observación. Cada fila muestra institución, departamento, municipio, práctica educativa, tipo, jornada y estado de formación docente. Paginación de 15 registros por página (20 páginas).</div>
  </div>

  <div class="grid-2" style="margin-top:18px;">
    <div>
      <ul class="pasos">
        <li class="paso"><div class="paso-numero">1</div><div class="paso-contenido"><div class="paso-label">Buscar por palabra clave</div><div class="paso-desc">Escriba en la barra de búsqueda el nombre de una institución, municipio, práctica o responsable.</div></div></li>
        <li class="paso"><div class="paso-numero">2</div><div class="paso-contenido"><div class="paso-label">Filtrar por departamento</div><div class="paso-desc">Use el selector desplegable "Todos los departamentos" para ver solo registros de una región.</div></div></li>
        <li class="paso"><div class="paso-numero">3</div><div class="paso-contenido"><div class="paso-label">Ver el detalle</div><div class="paso-desc">Haga clic en <strong>"VER"</strong> en cualquier fila para acceder al registro completo de esa práctica.</div></div></li>
        <li class="paso"><div class="paso-numero">4</div><div class="paso-contenido"><div class="paso-label">Exportar a CSV</div><div class="paso-desc">Con el botón <strong>"↓ Exportar CSV"</strong> descarga todos los datos filtrados en formato de hoja de cálculo.</div></div></li>
      </ul>
    </div>
    <div>
      <div class="alerta alerta-tip">
        <span class="alerta-icono">💡</span>
        <div class="alerta-texto"><strong>Columnas disponibles</strong>Institución · Departamento · Municipio · Práctica Educativa · Tipo de institución · Jornada · Formación docente. Haga clic en los encabezados para ordenar la tabla.</div>
      </div>
      <div class="alerta alerta-info" style="margin-top:12px;">
        <span class="alerta-icono">📑</span>
        <div class="alerta-texto"><strong>Paginación inteligente</strong>La tabla muestra 15 registros por página. Con 300 prácticas, hay 20 páginas disponibles. Navegue con los controles inferiores.</div>
      </div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 9: MÓDULO 6 — CHAT CON IA
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 6</span>
      <span class="pagina-breadcrumb">Análisis con Inteligencia Artificial</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #4c1d95, #7c3aed);">
    <div class="modulo-icono">🤖</div>
    <div>
      <div class="modulo-titulo">Chat con Inteligencia Artificial</div>
      <div class="modulo-subtitulo">Consulta los datos del Observatorio en lenguaje natural. El primer chatbot pedagógico de Colombia.</div>
    </div>
  </div>

  <div class="seccion-bajada">
    El módulo de Chat con IA es la innovación más disruptiva del Observatorio: un asistente de inteligencia artificial conectado directamente a la base de datos que permite a investigadores y docentes hacer preguntas complejas sin conocer SQL ni estadística.
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 6.1 — Chat en funcionamiento: pregunta real y respuesta con datos del Observatorio</div>
    <img src="${imgBase64('05c_Chat_IA_Respuesta.png')}" alt="Chat con IA respondiendo" />
    <div class="captura-pie">El asistente responde en tiempo real la pregunta "¿Cuántas prácticas hay por departamento?" con datos exactos extraídos de la base de datos: Cundinamarca (69), Antioquia (68), Valle del Cauca (57), Atlántico (55), Bolívar (51).</div>
  </div>

  <div class="grid-2" style="margin-top:18px;">
    <div>
      <div style="font-weight:700; color:var(--azul-upn); margin-bottom:10px; font-size:10.5pt;">💬 Cómo usar el Chat</div>
      <ul class="pasos">
        <li class="paso"><div class="paso-numero">1</div><div class="paso-contenido"><div class="paso-label">Escribe tu consulta</div><div class="paso-desc">En la caja inferior escribe cualquier pregunta sobre las prácticas registradas, en español coloquial.</div></div></li>
        <li class="paso"><div class="paso-numero">2</div><div class="paso-contenido"><div class="paso-label">Usa las sugeridas</div><div class="paso-desc">El panel derecho ofrece preguntas predefinidas. Haz clic en una para usarla directamente.</div></div></li>
        <li class="paso"><div class="paso-numero">3</div><div class="paso-contenido"><div class="paso-label">Envía y espera</div><div class="paso-desc">Presiona Enter o el botón azul. La IA consulta la BD y responde en 2-5 segundos.</div></div></li>
      </ul>
    </div>
    <div>
      <div style="font-weight:700; color:var(--azul-upn); margin-bottom:10px; font-size:10.5pt;">🧠 Preguntas de ejemplo</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <span class="tag tag-morado">¿Cuántas prácticas hay en Antioquia?</span>
        <span class="tag tag-morado">¿Qué conflictos son más frecuentes?</span>
        <span class="tag tag-morado">Resume las prácticas más innovadoras</span>
        <span class="tag tag-morado">¿Qué regiones tienen mayor impacto en DDHH?</span>
        <span class="tag tag-morado">Compara conflicto rural vs urbano</span>
      </div>
      <div class="alerta alerta-exito">
        <span class="alerta-icono">🌟</span>
        <div class="alerta-texto"><strong>Innovación pedagógica única</strong>Es el primer observatorio educativo en Colombia que integra un modelo de lenguaje con datos pedagógicos reales, permitiendo que docentes sin formación técnica accedan a análisis complejos.</div>
      </div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 10: MÓDULO 7 — CARGAR ARCHIVO
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULO 7</span>
      <span class="pagina-breadcrumb">Ingreso Masivo de Datos</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #065f46, #059669);">
    <div class="modulo-icono">📤</div>
    <div>
      <div class="modulo-titulo">Cargar Archivo Excel</div>
      <div class="modulo-subtitulo">Ingreso masivo de prácticas educativas desde el instrumento de observación</div>
    </div>
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 7.1 — Pantalla de carga masiva de archivos Excel con columnas aceptadas</div>
    <img src="${imgBase64('06_Cargar_Archivo.png')}" alt="Cargar Archivo" />
    <div class="captura-pie">Módulo de carga con la zona de arrastre (drag & drop) y el listado de todas las columnas reconocidas automáticamente por el sistema desde el instrumento de observación.</div>
  </div>

  <ul class="pasos" style="margin-top:18px;">
    <li class="paso"><div class="paso-numero">1</div><div class="paso-contenido"><div class="paso-label">Preparar el archivo</div><div class="paso-desc">El archivo debe ser un <strong>.xlsx</strong> (Excel) con las columnas del instrumento de observación: fecha, institución, departamento, municipio, prácticas, responsables, conflictos, políticas, etc.</div></div></li>
    <li class="paso"><div class="paso-numero">2</div><div class="paso-contenido"><div class="paso-label">Seleccionar o arrastrar</div><div class="paso-desc">Arrastre el archivo a la zona punteada o haga clic en <strong>"Seleccionar archivo"</strong> para buscarlo en su computadora.</div></div></li>
    <li class="paso"><div class="paso-numero">3</div><div class="paso-contenido"><div class="paso-label">Confirmar la importación</div><div class="paso-desc">El sistema procesa el archivo, valida las columnas y muestra la cantidad de registros importados correctamente.</div></div></li>
    <li class="paso"><div class="paso-numero">4</div><div class="paso-contenido"><div class="paso-label">Verificar en el Histórico</div><div class="paso-desc">Diríjase al módulo <strong>"Histórico"</strong> para confirmar que el archivo fue procesado y cuántas prácticas se importaron.</div></div></li>
  </ul>

  <div class="alerta alerta-tip">
    <span class="alerta-icono">💡</span>
    <div class="alerta-texto"><strong>Columnas reconocidas automáticamente</strong>fecha · institución · sede · tipo de institución · nombre de la práctica · grados · áreas · responsables · departamento · municipio · jornada · conflictos · políticas relacionadas · temas cátedra de paz · recibió formación · diseñaron materiales · obstáculos · facilidades sostenibilidad</div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 11: MÓDULOS 8 Y 9 — MAPA E HISTÓRICO
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">MÓDULOS 8 · 9</span>
      <span class="pagina-breadcrumb">Geografía y Trazabilidad</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #0c4a6e, #0284c7); margin-bottom:18px;">
    <div class="modulo-icono">🗺️</div>
    <div>
      <div class="modulo-titulo">Mapa de Calor — Pedagogía del Territorio</div>
      <div class="modulo-subtitulo">Visualización geográfica interactiva de las prácticas educativas en Colombia</div>
    </div>
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 8.1 — Mapa de Calor con distribución georreferenciada de prácticas</div>
    <img src="${imgBase64('07_Mapa_Calor.png')}" alt="Mapa de Calor" />
    <div class="captura-pie">Mapa interactivo (Google Maps) que muestra la distribución geográfica de las prácticas educativas. Las prácticas se geocodifican automáticamente al cargar el archivo Excel, usando la API de Google Maps.</div>
  </div>

  <div class="alerta alerta-exito" style="margin-bottom:28px;">
    <span class="alerta-icono">🌿</span>
    <div class="alerta-texto"><strong>Pedagogía del territorio</strong>El mapa convierte datos abstractos en geografía pedagógica concreta: es posible ver exactamente en qué municipios y regiones están ocurriendo experiencias de paz, identificando tanto zonas activas como territorios que aún necesitan acompañamiento.</div>
  </div>

  <div class="modulo-header" style="background: linear-gradient(135deg, #374151, #6b7280); margin-bottom:18px;">
    <div class="modulo-icono">🕐</div>
    <div>
      <div class="modulo-titulo">Histórico de Archivos Cargados</div>
      <div class="modulo-subtitulo">Trazabilidad completa de todas las importaciones realizadas al sistema</div>
    </div>
  </div>

  <div class="captura-bloque">
    <div class="captura-titulo"><div class="captura-titulo-dot"></div> Figura 9.1 — Histórico con registro de la carga exitosa de 300 prácticas</div>
    <img src="${imgBase64('12_Historico_Carga_Exitosa.png')}" alt="Histórico de Cargas" />
    <div class="captura-pie">El módulo Histórico registra cada importación realizada: nombre del archivo original, cantidad de prácticas registradas, fecha y hora exacta de carga, y opciones de ver en tabla o eliminar.</div>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 12: CONCLUSIÓN Y VALOR INSTITUCIONAL
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div class="pagina-header-left">
      <span class="pagina-numero">CONCLUSIÓN</span>
      <span class="pagina-breadcrumb">Valor Institucional y Pedagógico</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo-grande">Un Observatorio <span>que transforma</span></div>
  <div class="seccion-bajada">
    El Observatorio de Prácticas Educativas no es un repositorio pasivo. Es una herramienta viva que crece con cada docente que registra su experiencia y que potencia la investigación educativa en contextos de paz y conflicto.
  </div>

  <div class="cita-pedagogica">
    <div class="cita-texto">
      "Las prácticas pedagógicas en zonas de conflicto son actos de resistencia, de construcción de futuro. Este software las hace visibles, las conecta entre sí y las convierte en política pública. Eso es innovación pedagógica con sentido social."
    </div>
    <div class="cita-fuente">— Reflexión sobre el Observatorio · Universidad Pedagógica Nacional · 2026</div>
  </div>

  <div class="grid-3" style="margin-top:24px;">
    <div class="card" style="border-top: 4px solid var(--azul-upn); text-align:center; padding: 24px 16px;">
      <div style="font-size:32px; margin-bottom:8px;">🏫</div>
      <div class="card-titulo" style="justify-content:center;">Para docentes</div>
      <div class="card-texto">Visibiliza su trabajo, conecta su práctica con la política pública y les muestra que no están solos en la construcción de paz desde la escuela.</div>
    </div>
    <div class="card" style="border-top: 4px solid var(--naranja); text-align:center; padding: 24px 16px;">
      <div style="font-size:32px; margin-bottom:8px;">🔬</div>
      <div class="card-titulo" style="justify-content:center;">Para investigadores</div>
      <div class="card-texto">Ofrece un corpus de datos cualitativos y cuantitativos sobre educación para la paz, listos para análisis académico con IA integrada.</div>
    </div>
    <div class="card" style="border-top: 4px solid var(--verde); text-align:center; padding: 24px 16px;">
      <div style="font-size:32px; margin-bottom:8px;">🏛️</div>
      <div class="card-titulo" style="justify-content:center;">Para la UPN</div>
      <div class="card-texto">Posiciona a la Universidad Pedagógica Nacional como líder en tecnología educativa aplicada a la paz, la memoria y los derechos humanos.</div>
    </div>
  </div>

  <hr class="seccion">

  <div style="font-size:11.5pt; font-weight:700; color:var(--azul-upn); margin-bottom:16px;">🛠️ Stack tecnológico</div>
  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;">
    <span class="tag">React 19</span>
    <span class="tag">Node.js</span>
    <span class="tag">Express.js</span>
    <span class="tag tag-verde">SQLite</span>
    <span class="tag tag-morado">JWT Auth</span>
    <span class="tag tag-naranja">Groq AI</span>
    <span class="tag">Google Maps API</span>
    <span class="tag">Recharts</span>
    <span class="tag tag-verde">Vite</span>
    <span class="tag tag-morado">Puppeteer</span>
  </div>

  <div class="alerta alerta-info">
    <span class="alerta-icono">📋</span>
    <div class="alerta-texto"><strong>Documentación generada automáticamente</strong>Este manual de usuario fue generado íntegramente con capturas de pantalla reales del sistema en funcionamiento, tomadas de forma automatizada mediante Puppeteer el 26 de mayo de 2026, con 300 prácticas educativas reales cargadas en la base de datos.</div>
  </div>

  <div style="margin-top:30px; text-align:center; padding: 20px; background: linear-gradient(135deg, var(--azul-upn), var(--azul-medio)); border-radius: 16px; color: white;">
    <div style="font-size:10pt; letter-spacing:2px; text-transform:uppercase; opacity:0.7; margin-bottom:6px;">Universidad Pedagógica Nacional</div>
    <div style="font-size:14pt; font-weight:700;">Observatorio de Prácticas Educativas</div>
    <div style="font-size:9.5pt; opacity:0.8; margin-top:4px;">Paz, Memoria y Derechos Humanos · Colombia · 2026</div>
  </div>
</div>

</body>
</html>`;

// Generar el PDF con Puppeteer
(async () => {
  console.log('Iniciando generación del PDF...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log(`✅ Manual PDF generado: ${OUTPUT_PDF}`);
  console.log(`📄 Tamaño: ${(require('fs').statSync(OUTPUT_PDF).size / 1024 / 1024).toFixed(2)} MB`);
})();
