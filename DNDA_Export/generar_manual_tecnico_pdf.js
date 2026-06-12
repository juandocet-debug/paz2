/**
 * Genera el Manual Técnico de Software en PDF usando Puppeteer
 * con diseño premium, diagramas, esquemas SQL y referencias de la API.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_PDF = path.join(__dirname, 'manual', 'Manual_Tecnico_Observatorio_UPN.pdf');

// Asegurar que existe la carpeta manual
if (!fs.existsSync(path.join(__dirname, 'manual'))) {
  fs.mkdirSync(path.join(__dirname, 'manual'), { recursive: true });
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Manual Técnico — Observatorio de Prácticas Educativas UPN</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

  :root {
    --azul-upn: #003087;
    --azul-medio: #0f2e6b;
    --azul-oscuro: #071633;
    --naranja: #e85d04;
    --naranja-claro: #f4a261;
    --gris-fondo: #f8fafc;
    --gris-borde: #e2e8f0;
    --texto: #0f172a;
    --texto-claro: #475569;
    --blanco: #ffffff;
    --verde: #16a34a;
    --morado: #7c3aed;
    --codigo-fondo: #0f172a;
    --codigo-texto: #38bdf8;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--texto);
    background: var(--blanco);
    font-size: 10.5pt;
    line-height: 1.6;
  }

  /* ═══════════════════════════════
     PORTADA
     Aislada en su propia página.
  ═══════════════════════════════ */
  .portada {
    page-break-after: always;
    min-height: 100vh;
    background: linear-gradient(135deg, #071633 0%, #003087 50%, #0f2e6b 100%);
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
    top: -120px; right: -120px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(232,93,4,0.12) 0%, transparent 60%);
    border-radius: 50%;
  }

  .portada-franja {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, #e85d04, #f4a261, #e85d04);
  }

  .portada-logo-area {
    text-align: center;
    margin-bottom: 40px;
  }

  .portada-logo-circulo {
    width: 90px; height: 90px;
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-size: 32px;
  }

  .portada-institucion {
    color: rgba(255,255,255,0.9);
    font-size: 12pt;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .portada-facultad {
    color: rgba(255,255,255,0.5);
    font-size: 8.5pt;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .portada-divider {
    width: 60px; height: 3px;
    background: var(--naranja);
    margin: 25px auto;
  }

  .portada-badge {
    background: linear-gradient(135deg, rgba(232,93,4,0.25), rgba(244,162,97,0.15));
    border: 1px solid rgba(232,93,4,0.5);
    color: var(--naranja-claro);
    padding: 6px 18px;
    border-radius: 20px;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 25px;
  }

  .portada-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 32pt;
    font-weight: 800;
    color: var(--blanco);
    text-align: center;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .portada-titulo span {
    color: var(--naranja-claro);
  }

  .portada-subtitulo {
    color: rgba(255,255,255,0.7);
    font-size: 12pt;
    text-align: center;
    font-weight: 300;
    letter-spacing: 1px;
    max-width: 650px;
    margin-bottom: 45px;
  }

  .portada-meta {
    display: flex;
    gap: 30px;
    margin-bottom: 50px;
  }

  .portada-meta-item {
    text-align: center;
    padding: 12px 20px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    min-width: 140px;
  }

  .portada-meta-valor {
    font-size: 16pt;
    font-weight: 700;
    color: var(--naranja-claro);
  }

  .portada-meta-label {
    font-size: 7.5pt;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .portada-footer {
    position: absolute;
    bottom: 30px;
    left: 0; right: 0;
    text-align: center;
    color: rgba(255,255,255,0.3);
    font-size: 7.5pt;
    letter-spacing: 1px;
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
    padding-bottom: 14px;
    border-bottom: 2px solid var(--azul-upn);
    margin-bottom: 30px;
  }

  .pagina-numero {
    background: var(--azul-upn);
    color: white;
    font-size: 8pt;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: 1px;
  }

  .pagina-breadcrumb {
    color: var(--texto-claro);
    font-size: 8pt;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-left: 10px;
  }

  .pagina-logo {
    color: var(--azul-upn);
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .seccion-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 22pt;
    font-weight: 800;
    color: var(--azul-upn);
    margin-bottom: 16px;
  }

  .seccion-titulo span { color: var(--naranja); }

  .seccion-subtitulo {
    color: var(--texto-claro);
    font-size: 10pt;
    font-weight: 400;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  /* ═══════════════════════════════
     ELEMENTOS TÉCNICOS
  ═══════════════════════════════ */
  code {
    font-family: 'Fira Code', monospace;
    font-size: 9pt;
    background: var(--gris-fondo);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--gris-borde);
    color: #0f172a;
  }

  pre {
    background: var(--codigo-fondo);
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Fira Code', monospace;
    font-size: 8.5pt;
    line-height: 1.5;
    margin: 16px 0;
    border: 1px solid #1e293b;
  }

  .keyword { color: #f43f5e; }
  .string { color: #10b981; }
  .comment { color: #64748b; font-style: italic; }
  .type { color: #38bdf8; }

  /* Tablas de la base de datos */
  table.db-schema {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 16px 0 24px;
  }

  table.db-schema th {
    background: var(--azul-upn);
    color: white;
    padding: 8px 12px;
    text-align: left;
    font-weight: 600;
    border: 1px solid var(--azul-medio);
  }

  table.db-schema td {
    padding: 7px 12px;
    border: 1px solid var(--gris-borde);
    vertical-align: top;
  }

  table.db-schema tr:nth-child(even) td { background: var(--gris-fondo); }
  table.db-schema td.field-name { font-weight: 600; font-family: 'Fira Code', monospace; color: #0f172a; }
  table.db-schema td.field-type { font-family: 'Fira Code', monospace; color: var(--morado); }

  /* Diagramas de arquitectura */
  .diagrama-container {
    background: var(--gris-fondo);
    border: 1px solid var(--gris-borde);
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
    text-align: center;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 20px 0;
  }

  .card {
    background: var(--gris-fondo);
    border: 1px solid var(--gris-borde);
    border-radius: 10px;
    padding: 16px;
  }

  .card-titulo {
    font-weight: 700;
    font-size: 9.5pt;
    color: var(--azul-upn);
    margin-bottom: 6px;
  }

  .card-texto {
    font-size: 9pt;
    color: var(--texto-claro);
    line-height: 1.5;
  }

  .alerta {
    padding: 12px 16px;
    border-radius: 8px;
    margin: 16px 0;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .alerta-info {
    background: #e0f2fe;
    border-left: 4px solid var(--codigo-texto);
  }

  .alerta-texto {
    font-size: 9pt;
    line-height: 1.5;
  }

  .pie-pagina {
    position: absolute;
    bottom: 20px;
    left: 60px; right: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.5pt;
    color: var(--texto-claro);
    border-top: 1px solid var(--gris-borde);
    padding-top: 8px;
    opacity: 0.6;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed var(--gris-borde);
    font-size: 9.5pt;
  }

  .toc-nombre { font-weight: 500; color: var(--azul-upn); }
  .toc-pagina { font-weight: 600; color: var(--texto-claro); }

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

  <div class="portada-logo-area">
    <div class="portada-logo-circulo">🛠️</div>
    <div class="portada-institucion">Universidad Pedagógica Nacional</div>
    <div class="portada-facultad">Facultad de Educación · Colombia</div>
  </div>

  <div class="portada-divider"></div>
  <div class="portada-badge">Manual Técnico · Arquitectura & Código</div>

  <div class="portada-titulo">
    Observatorio de<br><span>Prácticas Educativas</span>
  </div>

  <div class="portada-subtitulo">
    Paz, Memoria y Derechos Humanos — Colombia<br>
    Guía de Arquitectura de Software, Modelo de Datos Relacional local e Integración Inteligente
  </div>

  <div class="portada-meta">
    <div class="portada-meta-item">
      <div class="portada-meta-valor">Node.js / React</div>
      <div class="portada-meta-label">Tecnología Base</div>
    </div>
    <div class="portada-meta-item">
      <div class="portada-meta-valor">SQLite 3</div>
      <div class="portada-meta-label">Persistencia Local</div>
    </div>
    <div class="portada-meta-item">
      <div class="portada-meta-valor">Llama 3.3</div>
      <div class="portada-meta-label">Motor de IA</div>
    </div>
  </div>

  <div class="portada-footer">
    Documentación de Ingeniería · UPN Colombia · Versión 1.0 · Mayo 2026
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 2: TABLA DE CONTENIDO Y ARQUITECTURA
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 2</span>
      <span class="pagina-breadcrumb">Índice & Arquitectura</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">Tabla de <span>Contenido</span> y Resumen</div>
  
  <div style="margin-bottom: 24px;">
    <div class="toc-item"><span class="toc-nombre">1. Arquitectura General y Patrones de Diseño</span><span class="toc-pagina">Pág 2</span></div>
    <div class="toc-item"><span class="toc-nombre">2. Modelo de Datos Relacional Local (SQLite Schema)</span><span class="toc-pagina">Pág 3</span></div>
    <div class="toc-item"><span class="toc-nombre">3. Especificación de Endpoints de la API REST</span><span class="toc-pagina">Pág 4</span></div>
    <div class="toc-item"><span class="toc-nombre">4. Integración del Motor de Inteligencia Artificial (Groq - Llama 3.3)</span><span class="toc-pagina">Pág 5</span></div>
    <div class="toc-item"><span class="toc-nombre">5. Frontend SPA: Componentes y Visualización Interactiva</span><span class="toc-pagina">Pág 6</span></div>
    <div class="toc-item"><span class="toc-nombre">6. Instalación, Configuración de Entorno y Despliegue</span><span class="toc-pagina">Pág 7</span></div>
  </div>

  <hr style="border: none; border-top: 1px solid var(--gris-borde); margin: 20px 0;">

  <div class="seccion-titulo" style="font-size: 16pt;">1. Arquitectura General y <span>Patrones de Diseño</span></div>
  <div class="seccion-subtitulo">
    El Observatorio está diseñado bajo el patrón **Cliente-Servidor desacoplado** utilizando React como SPA (Single Page Application) en el cliente y Node.js con Express en el servidor. El Backend sigue principios de **Arquitectura Hexagonal (Puertos y Adaptadores)** para modularizar las funcionalidades y desacoplar la base de datos de las reglas del negocio.
  </div>

  <div class="diagrama-container" style="padding: 16px;">
    <div style="font-weight: 700; font-size: 9pt; margin-bottom: 12px; color: var(--azul-upn);">FLUJO DE DATOS Y LÍMITES ARQUITECTÓNICOS</div>
    <div style="display: flex; justify-content: space-around; align-items: center; font-size: 8.5pt; font-family: monospace;">
      <div style="border: 2px solid var(--azul-upn); padding: 8px 12px; border-radius: 6px; background: white;">
        <strong>React Client (5174)</strong><br>Vite · Google Maps API
      </div>
      <div style="font-size: 14pt;">⇄</div>
      <div style="border: 2px solid var(--naranja); padding: 8px 12px; border-radius: 6px; background: white; text-align: left;">
        <strong>Express API (3000)</strong><br>
        • Adaptadores HTTP (Controller)<br>
        • Casos de Uso (Aplicación)<br>
        • Puertos y Entidades (Dominio)
      </div>
      <div style="font-size: 14pt;">⇄</div>
      <div style="border: 2px solid var(--verde); padding: 8px 12px; border-radius: 6px; background: white;">
        <strong>better-sqlite3</strong><br>Base local (.sqlite)
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-titulo">Slices del Sistema</div>
      <div class="card-texto">
        El código del backend está dividido en sub-dominios o *slices* funcionales: <strong>practicas</strong>, <strong>cargas</strong> (uploads), <strong>analiticas</strong>, <strong>auth</strong> y <strong>chat</strong>. Cada slice contiene su propio dominio, capa de aplicación e infraestructura.
      </div>
    </div>
    <div class="card">
      <div class="card-titulo">Persistencia en SQLite</div>
      <div class="card-texto">
        Diseñado para funcionar 100% en entornos locales o servidores ligeros sin dependencias externas. Utiliza SQLite (vía <code>better-sqlite3</code>) habilitando el modo de escritura rápida <strong>WAL (Write-Ahead Logging)</strong>.
      </div>
    </div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 2</span>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 3: MODELO DE DATOS
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 3</span>
      <span class="pagina-breadcrumb">Esquema de Datos SQL</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">2. Modelo de Datos Relacional Local <span>(SQLite)</span></div>
  <div class="seccion-subtitulo">
    La base de datos se guarda en un solo archivo físico en la raíz del backend (<code>proyecto_paz.sqlite</code>). A continuación, se detallan las estructuras de las tablas principales que almacenan el conocimiento pedagógico.
  </div>

  <!-- TABLA UPLOADS -->
  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px;">Tabla 1: <code>uploads</code> (Control de Cargas Masivas)</div>
  <table class="db-schema">
    <thead>
      <tr>
        <th style="width: 25%;">Campo</th>
        <th style="width: 20%;">Tipo</th>
        <th style="width: 15%;">Restricciones</th>
        <th style="width: 40%;">Descripción</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="field-name">id</td>
        <td class="field-type">INTEGER</td>
        <td>PK AUTOINCREMENT</td>
        <td>Identificador único correlativo.</td>
      </tr>
      <tr>
        <td class="field-name">original_name</td>
        <td class="field-type">TEXT</td>
        <td>NOT NULL</td>
        <td>Nombre original del archivo Excel/CSV subido por el usuario.</td>
      </tr>
      <tr>
        <td class="field-name">stored_name</td>
        <td class="field-type">TEXT</td>
        <td>NOT NULL</td>
        <td>Nombre físico con el que se almacena en el servidor.</td>
      </tr>
      <tr>
        <td class="field-name">records_count</td>
        <td class="field-type">INTEGER</td>
        <td>DEFAULT 0</td>
        <td>Cantidad de prácticas educativas válidas procesadas.</td>
      </tr>
      <tr>
        <td class="field-name">uploaded_at</td>
        <td class="field-type">DATETIME</td>
        <td>CURRENT_TIMESTAMP</td>
        <td>Fecha y hora del procesamiento de la carga.</td>
      </tr>
    </tbody>
  </table>

  <!-- TABLA PRACTICES -->
  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px;">Tabla 2: <code>practices</code> (Registros Pedagógicos de los Territorios)</div>
  <table class="db-schema">
    <thead>
      <tr>
        <th style="width: 25%;">Campo</th>
        <th style="width: 20%;">Tipo</th>
        <th style="width: 15%;">Restricciones</th>
        <th style="width: 40%;">Descripción del Dato Pedagógico</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="field-name">id</td>
        <td class="field-type">INTEGER</td>
        <td>PK AUTOINCREMENT</td>
        <td>Identificador de la práctica educativa.</td>
      </tr>
      <tr>
        <td class="field-name">upload_id</td>
        <td class="field-type">INTEGER</td>
        <td>FK ON DELETE CASCADE</td>
        <td>Relación con la carga del archivo Excel correspondiente.</td>
      </tr>
      <tr>
        <td class="field-name">institucion / sede</td>
        <td class="field-type">TEXT</td>
        <td>-</td>
        <td>Nombre del establecimiento y la sede educativa territorial.</td>
      </tr>
      <tr>
        <td class="field-name">nombre_practica</td>
        <td class="field-type">TEXT</td>
        <td>-</td>
        <td>Título de la iniciativa o proyecto pedagógico.</td>
      </tr>
      <tr>
        <td class="field-name">departamento / municipio</td>
        <td class="field-type">TEXT</td>
        <td>-</td>
        <td>Ubicación geográfica del territorio.</td>
      </tr>
      <tr>
        <td class="field-name">conflictos_tipo</td>
        <td class="field-type">TEXT</td>
        <td>-</td>
        <td>Contexto del conflicto abordado (ej. memoria, víctimas).</td>
      </tr>
      <tr>
        <td class="field-name">politicas_relacionadas</td>
        <td class="field-type">TEXT</td>
        <td>-</td>
        <td>Políticas educativas/normas estatales vinculadas.</td>
      </tr>
      <tr>
        <td class="field-name">latitud / longitud</td>
        <td class="field-type">REAL</td>
        <td>-</td>
        <td>Coordenadas para el posicionamiento en el mapa interactivo.</td>
      </tr>
    </tbody>
  </table>

  <div class="alerta alerta-info">
    <span class="alerta-icono">💡</span>
    <div class="alerta-texto">
      <strong>Restricciones de Integridad:</strong> La tabla de prácticas contiene una clave foránea (<code>FOREIGN KEY(upload_id) REFERENCES uploads(id)</code>) configurada con borrado en cascada (<code>ON DELETE CASCADE</code>) lo que garantiza la integridad si se elimina una carga errónea del histórico.
    </div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 3</span>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 4: API REST ENDPOINTS
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 4</span>
      <span class="pagina-breadcrumb">API REST Reference</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">3. Especificación de Endpoints de la <span>API REST</span></div>
  <div class="seccion-subtitulo">
    La comunicación entre el Frontend y el Backend se realiza mediante peticiones HTTP. Todas las respuestas se entregan bajo el formato estándar de intercambio <code>application/json</code>.
  </div>

  <!-- CONTROL DE ENDPOINTS -->
  <table class="db-schema" style="margin-top: 10px;">
    <thead>
      <tr>
        <th style="width: 15%;">Método</th>
        <th style="width: 30%;">Ruta</th>
        <th style="width: 20%;">Headers / Auth</th>
        <th style="width: 35%;">Efecto / Respuesta JSON</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong style="color:var(--naranja);">POST</strong></td>
        <td><code>/api/auth/login</code></td>
        <td>Ninguno (Público)</td>
        <td>Valida credenciales. Retorna: <br><code>{ token: "JWT...", user: {...} }</code></td>
      </tr>
      <tr>
        <td><strong style="color:var(--verde);">GET</strong></td>
        <td><code>/api/practices</code></td>
        <td>Ninguno (Público)</td>
        <td>Lista de prácticas con paginación, filtros de texto, departamento y tipo de conflicto.</td>
      </tr>
      <tr>
        <td><strong style="color:var(--naranja);">POST</strong></td>
        <td><code>/api/uploads/upload</code></td>
        <td>JWT Bearer Token</td>
        <td>Carga archivo masivo de Excel/CSV a través de Multipart/form-data. Retorna id de la carga.</td>
      </tr>
      <tr>
        <td><strong style="color:var(--verde);">GET</strong></td>
        <td><code>/api/analytics/dashboard</code></td>
        <td>Ninguno (Público)</td>
        <td>Cálculo dinámico de estadísticas agrupadas por departamentos, conflictos y KPIs principales.</td>
      </tr>
      <tr>
        <td><strong style="color:var(--naranja);">POST</strong></td>
        <td><code>/api/chat</code></td>
        <td>Ninguno (Público)</td>
        <td>Petición al asistente inteligente. Recibe <code>message</code> y <code>history</code>. Retorna <code>reply</code>.</td>
      </tr>
    </tbody>
  </table>

  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px;">Ejemplo de Estructura de Respuesta del Servidor (Dashboard Analytics)</div>
  <pre>{
  <span class="keyword">"totalPracticas"</span>: 300,
  <span class="keyword">"totalDepartamentos"</span>: 5,
  <span class="keyword">"distribucionDepto"</span>: [
    { <span class="keyword">"departamento"</span>: <span class="string">"Antioquia"</span>, <span class="keyword">"cantidad"</span>: 120 },
    { <span class="keyword">"departamento"</span>: <span class="string">"Bolívar"</span>, <span class="keyword">"cantidad"</span>: 80 }
  ],
  <span class="keyword">"conflictosFrecuentes"</span>: [
    { <span class="keyword">"tipo"</span>: <span class="string">"Conflicto Armado y Memoria"</span>, <span class="keyword">"porcentaje"</span>: 45.2 }
  ]
}</pre>

  <div class="alerta alerta-info">
    <span class="alerta-icono">🔑</span>
    <div class="alerta-texto">
      <strong>Esquema de Autenticación:</strong> Las rutas protegidas (ej. carga de archivos) requieren un encabezado de autorización HTTP: <code>Authorization: Bearer [TOKEN_JWT]</code>. El token contiene los permisos y el rol del administrador y expira en 24 horas.
    </div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 4</span>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 5: CHAT IA E INTEGRACIÓN DE MODELO
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 5</span>
      <span class="pagina-breadcrumb">Asistente IA - Groq</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">4. Integración del Asistente de <span>Inteligencia Artificial</span></div>
  <div class="seccion-subtitulo">
    El chat conversacional del observatorio no depende de entrenamientos estáticos costosos. Utiliza la arquitectura <strong>RAG (Retrieval-Augmented Generation)</strong> en combinación con el modelo de lenguaje de alto rendimiento <code>llama-3.3-70b-versatile</code> provisto por Groq.
  </div>

  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px;">Algoritmo de Generación de Contexto (Backend)</div>
  <pre><span class="comment">// 1. Se recolecta el estado consolidado de la base de datos (dashboard + muestra)</span>
<span class="keyword">const</span> analiticas = <span class="keyword">await</span> this.proveedorContexto.obtenerAnaliticas();
<span class="keyword">const</span> muestra = <span class="keyword">await</span> this.proveedorContexto.obtenerMuestraPracticas(10);

<span class="comment">// 2. Se inyecta al prompt del sistema un marco metodológico contextualizado</span>
<span class="keyword">const</span> promptSistema = {
  role: <span class="string">"system"</span>,
  content: <span class="string">\`Eres el asistente inteligente del Observatorio de la UPN. 
  Aquí tienes los datos reales consolidados de la base de datos para responder:
  - Total de prácticas: \${analiticas.totalPracticas}
  - Departamentos: \${JSON.stringify(analiticas.distribucionDepto)}
  - Muestra representativa de prácticas: \${JSON.stringify(muestra)}
  Responde con lenguaje pedagógico, claro, y apoya siempre tus respuestas con los datos.\`</span>
};</pre>

  <div class="grid-2" style="margin-top: 15px;">
    <div class="card">
      <div class="card-titulo">Flujo RAG local</div>
      <div class="card-texto">
        Cuando el usuario escribe una consulta (ej. "¿En qué regiones hay más experiencias de paz?"), el backend consulta las métricas consolidadas en SQLite y una muestra de prácticas. Estos datos se inyectan en el prompt para dar una respuesta veraz, eliminando alucinaciones del modelo.
      </div>
    </div>
    <div class="card">
      <div class="card-titulo">Motor Llama 3.3 70B</div>
      <div class="card-texto">
        El backend procesa la petición de forma rápida a través de HTTP/REST hacia la API de Groq con un tiempo de respuesta menor a 800ms. La respuesta se retorna formateada en Markdown para que el Frontend la renderice fluidamente.
      </div>
    </div>
  </div>

  <div class="alerta alerta-info" style="margin-top: 15px;">
    <span class="alerta-icono">🤖</span>
    <div class="alerta-texto">
      <strong>Manejo del Historial:</strong> El endpoint <code>/api/chat</code> acepta un arreglo <code>history</code> con los mensajes previos de la sesión del chat, lo que permite al modelo mantener coherencia y recordar el hilo conversacional durante las preguntas de seguimiento de los docentes.
    </div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 5</span>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 6: FRONTEND SPA Y COMPONENTES
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 6</span>
      <span class="pagina-breadcrumb">Frontend React SPA</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">5. Frontend SPA: Componentes y <span>Visualización Interactiva</span></div>
  <div class="seccion-subtitulo">
    El frontend está implementado en React 19 empaquetado bajo Vite, logrando una interfaz responsiva, ligera y veloz. Utiliza un menú de navegación dinámico que cambia de forma interna las vistas de la Single Page Application sin necesidad de refrescar el navegador.
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-titulo">Visualizaciones Gráficas (Recharts)</div>
      <div class="card-texto">
        Para representar las estadísticas territoriales de forma interactiva y atractiva, se implementan gráficos de barras y tortas mediante la librería <code>recharts</code>. Los componentes se ajustan en tiempo real según el volumen de prácticas cargadas en el backend.
      </div>
    </div>
    <div class="card">
      <div class="card-titulo">Mapa de Calor (Google Maps API)</div>
      <div class="card-texto">
        Las coordenadas espaciales (latitud y longitud) guardadas por cada práctica educativa se renderizan en un mapa interactivo utilizando la API de Google Maps, superponiendo una capa de calor de densidad en base a la concentración geográfica.
      </div>
    </div>
  </div>

  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px; margin-top: 15px;">Estructura de Directorios del Frontend</div>
  <pre>frontend/
├── src/
│   ├── components/            <span class="comment">// Componentes comunes (Sidebar, Header, Layout)</span>
│   ├── views/                 <span class="comment">// Vistas del Sistema (Dashboard, Mapa, ChatIA, Upload)</span>
│   ├── context/               <span class="comment">// Contexto global (Autenticación del Administrador)</span>
│   ├── App.jsx                <span class="comment">// Enrutador SPA Principal</span>
│   ├── index.css              <span class="comment">// Sistema de diseño CSS global</span>
│   └── main.jsx               <span class="comment">// Inicialización de React</span>
├── vite.config.js             <span class="comment">// Configuración del empaquetador (Puerto 5174)</span>
└── package.json</pre>

  <div class="alerta alerta-info">
    <span class="alerta-icono">🎨</span>
    <div class="alerta-texto">
      <strong>Estilos y Diseño Premium:</strong> La interfaz cuenta con una paleta de colores limpia (azul marino institucional UPN, tonos grises claros y toques naranja de contraste), apoyada de tipografías legibles como Inter y Outfit para brindar una experiencia de usuario institucional y moderna.
    </div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 6</span>
  </div>
</div>


<!-- ══════════════════════════════════════════════
     PÁGINA 7: INSTALACIÓN Y INSTALACIÓN
══════════════════════════════════════════════ -->
<div class="pagina">
  <div class="pagina-header">
    <div>
      <span class="pagina-numero">PÁG 7</span>
      <span class="pagina-breadcrumb">Instalación y Despliegue</span>
    </div>
    <span class="pagina-logo">Observatorio UPN</span>
  </div>

  <div class="seccion-titulo">6. Instalación, Configuración de Entorno y <span>Despliegue</span></div>
  <div class="seccion-subtitulo">
    Para desplegar y ejecutar el Observatorio de forma local en entornos Windows o Linux, siga las siguientes instrucciones de configuración.
  </div>

  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px;">Archivo de Configuración Global (<code>backend/.env</code>)</div>
  <pre><span class="comment"># Puerto de escucha del backend</span>
PORT=3000

<span class="comment"># Clave secreta para codificación y firma de tokens JWT</span>
JWT_SECRET=demo_jwt_secret_key_observatorio_upn

<span class="comment"># Credenciales por defecto para ingreso administrativo</span>
DEFAULT_ADMIN_USER=demo
DEFAULT_ADMIN_PASSWORD=demo123

<span class="comment"># Proveedor de Inteligencia Artificial (API Key de Groq)</span>
GROQ_API_KEY=gsk_observatorio_paz_key_production_upn</pre>

  <div style="font-weight: 700; font-size: 10pt; color: var(--azul-upn); margin-bottom: 6px; margin-top: 15px;">Pasos de Ejecución Local</div>
  <ul style="list-style: none; padding-left: 0; font-size: 9.5pt;">
    <li style="margin-bottom: 8px;"><strong>1. Clonar e Instalar Backend:</strong><br>Acceda a la carpeta <code>/backend</code>, ejecute <code>npm install</code> para descargar las dependencias principales (Express, better-sqlite3, dotenv, JWT).</li>
    <li style="margin-bottom: 8px;"><strong>2. Instalar Frontend:</strong><br>Acceda a la carpeta <code>/frontend</code>, ejecute <code>npm install</code> para descargar las librerías cliente (React, Lucide, Recharts).</li>
    <li style="margin-bottom: 8px;"><strong>3. Iniciar Backend:</strong><br>Ejecute <code>node src/app.js</code>. En el primer inicio, se creará el archivo <code>proyecto_paz.sqlite</code> y las tablas de forma automática.</li>
    <li style="margin-bottom: 8px;"><strong>4. Iniciar Frontend:</strong><br>Ejecute <code>npm run dev</code> para levantar el servidor de desarrollo Vite expuesto en <code>http://localhost:5174</code>.</li>
  </ul>

  <div class="alerta alerta-info" style="margin-top: 15px;">
    <span class="alerta-icono">💾</span>
    <div class="alerta-texto">
      <strong>Mantenimiento y Copias de Seguridad:</strong> Al utilizar SQLite, el respaldo de la base de datos es trivial. Solo es necesario copiar el archivo físico <code>proyecto_paz.sqlite</code> de la raíz a un medio de almacenamiento externo para conservar las copias de seguridad de las prácticas de forma íntegra.
    </div>
  </div>

  <div style="margin-top:20px; text-align:center; padding: 18px; background: linear-gradient(135deg, var(--azul-upn), var(--azul-medio)); border-radius: 12px; color: white;">
    <div style="font-size:9.5pt; font-weight:700;">Universidad Pedagógica Nacional</div>
    <div style="font-size:8.5pt; opacity:0.8; margin-top:3px;">Manual Técnico Fin de Documento · 2026</div>
  </div>

  <div class="pie-pagina">
    <span>Universidad Pedagógica Nacional · Observatorio UPN</span>
    <span>Pág 7</span>
  </div>
</div>

</body>
</html>`;

// Generar el PDF con Puppeteer
(async () => {
  console.log('Iniciando generación del PDF Técnico...');
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
  console.log(`✅ Manual Técnico PDF generado: ${OUTPUT_PDF}`);
  console.log(`📄 Tamaño: ${(fs.statSync(OUTPUT_PDF).size / 1024 / 1024).toFixed(2)} MB`);
})();
