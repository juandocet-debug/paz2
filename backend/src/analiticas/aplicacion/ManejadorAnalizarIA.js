/**
 * ManejadorAnalizarIA.js — Caso de uso: analizar prácticas con IA
 * y persistir interpretaciones por dimensión en la tabla analisis_ia.
 *
 * Dimensiones analizadas:
 *  - conflictos   → campo conflictos_tipo
 *  - obstaculos   → campo obstaculos
 *  - politicas    → campo politicas_relacionadas
 *  - general      → resumen integral del observatorio
 */

const URL_GROQ  = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO    = 'llama-3.3-70b-versatile';

class ManejadorAnalizarIA {
  /**
   * @param {object} db             — Instancia síncrona de BaseDeDatos (SQLite)
   * @param {string} groqApiKey     — API key de Groq
   * @param {object} repositorioAnaliticas — para leer KPIs generales
   */
  constructor(db, groqApiKey, repositorioAnaliticas) {
    this.db      = db;
    this.apiKey  = groqApiKey;
    this.repo    = repositorioAnaliticas;
    this.cacheDinamico = new Map();
  }

  async ejecutar() {
    const practicas = await this._leerPracticas();
    if (!practicas.length) {
      throw Object.assign(new Error('No hay prácticas cargadas para analizar.'), { status: 422 });
    }

    const resultados = [];
    const dimensiones = [
      { id: 'conflictos', prompt: this._promptConflictos(practicas) },
      { id: 'obstaculos', prompt: this._promptObstaculos(practicas) },
      { id: 'politicas',  prompt: this._promptPoliticas(practicas) },
      { id: 'general',    prompt: this._promptGeneral(practicas) },
    ];

    for (const d of dimensiones) {
      try {
        const res = await this._analizarDimension(d.id, practicas, d.prompt);
        resultados.push(res);
        // Pequeño delay para no saturar TPM en tier gratuito
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[IA] Error analizando dimensión ${d.id}:`, err.message);
      }
    }

    /* Guardar / reemplazar en PostgreSQL */
    for (const { dimension, resumen, categorias } of resultados) {
      await this.db.query('DELETE FROM analisis_ia WHERE dimension = $1', [dimension]);
      await this.db.query(`
        INSERT INTO analisis_ia (dimension, resumen, categorias)
        VALUES ($1, $2, $3)
      `, [dimension, resumen, JSON.stringify(categorias)]);
    }

    return resultados;
  }

  async obtenerInterpretacion() {
    const res = await this.db.query('SELECT dimension, resumen, categorias, generado_at FROM analisis_ia');
    return res.rows.map(f => ({
      ...f,
      categorias: f.categorias ? JSON.parse(f.categorias) : [],
    }));
  }

  async ejecutarDinamico(filtros) {
    if (!this.apiKey) return [];

    const claveCache = JSON.stringify(filtros || {});
    if (this.cacheDinamico.has(claveCache)) {
      return this.cacheDinamico.get(claveCache);
    }

    const practicas = await this.repo.obtenerTextosParaIA(filtros);
    if (!practicas.length) return [];

    const resultados = [];
    const dimensiones = [
      { id: 'conflictos', prompt: this._promptConflictos(practicas, filtros) },
      { id: 'obstaculos', prompt: this._promptObstaculos(practicas, filtros) },
      { id: 'politicas',  prompt: this._promptPoliticas(practicas, filtros) },
    ];

    for (const d of dimensiones) {
      try {
        const res = await this._analizarDimension(d.id, practicas, d.prompt);
        resultados.push(res);
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.warn(`[IA] Error analizando dimensión dinámica ${d.id}:`, err.message);
      }
    }

    this.cacheDinamico.set(claveCache, resultados);
    return resultados;
  }

  /* ── Helpers privados ── */

  async _leerPracticas() {
    const res = await this.db.query(`
      SELECT conflictos_tipo, obstaculos, politicas_relacionadas,
             temas_catedra_paz, facilidades_sostenibilidad,
             nombre_practica, institucion, municipio, departamento
      FROM practices WHERE upload_id IN (SELECT id FROM uploads)
    `);
    return res.rows;
  }

  async _analizarDimension(dimension, practicas, prompt) {
    const respuestaTexto = await this._llamarGroq(prompt);
    const parsed = this._extraerJSON(respuestaTexto);
    return {
      dimension,
      resumen:    parsed.resumen    || respuestaTexto.slice(0, 500),
      categorias: parsed.categorias || [],
    };
  }

  async _llamarGroq(userPrompt) {
    const res = await fetch(URL_GROQ, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       MODELO,
        messages:    [{ role: 'user', content: userPrompt }],
        max_tokens:  800,
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw Object.assign(new Error(d.error?.message || `Groq ${res.status}`), { status: 502 });
    }
    const json = await res.json();
    return json.choices?.[0]?.message?.content || '';
  }

  _extraerJSON(texto) {
    try {
      const match = texto.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : {};
    } catch { return {}; }
  }

  _textos(practicas, campo, max = 30) {
    return practicas
      .map(p => (p[campo] || '').trim())
      .filter(Boolean)
      .slice(0, max)
      .join('\n');
  }

  _ubicacion(filtros) {
    if (!filtros) return 'Colombia';
    if (filtros.municipio) return `${filtros.municipio}, ${filtros.departamento}`;
    if (filtros.departamento) return filtros.departamento;
    return 'Colombia';
  }

  _promptConflictos(practicas, filtros = null) {
    const ubicacion = this._ubicacion(filtros);
    const n = practicas.length;
    const textos = this._textos(practicas, 'conflictos_tipo');
    return `Eres un experto en educación para la paz.
Analiza los siguientes tipos de conflicto reportados por docentes en sus prácticas educativas en ${ubicacion} (basado en una muestra de ${n} registros):

${textos}

Devuelve ÚNICAMENTE un JSON con esta estructura exacta (sin texto fuera del JSON):
{
  "resumen": "Párrafo de máximo 3 oraciones que interprete el patrón de conflictos identificados en ${ubicacion}.",
  "categorias": [
    { "label": "Nombre del conflicto o grupo", "porcentaje": 35, "descripcion": "Explicación breve de por qué aparece este conflicto en contexto educativo colombiano." }
  ]
}
Incluye entre 3 y 6 categorías. Los porcentajes deben sumar 100.`;
  }

  _promptObstaculos(practicas, filtros = null) {
    const ubicacion = this._ubicacion(filtros);
    const textos = this._textos(practicas, 'obstaculos');
    return `Eres un experto en políticas educativas.
Analiza las siguientes respuestas de docentes sobre obstáculos y problemáticas en sus prácticas de paz en ${ubicacion}:

${textos}

Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "resumen": "Párrafo de máximo 3 oraciones que identifique los obstáculos estructurales comunes en ${ubicacion}.",
  "categorias": [
    { "label": "Nombre del obstáculo", "porcentaje": 30, "descripcion": "Explicación contextualizada." }
  ]
}
Incluye entre 3 y 5 categorías. Los porcentajes deben sumar 100.`;
  }

  _promptPoliticas(practicas, filtros = null) {
    const ubicacion = this._ubicacion(filtros);
    const textos = this._textos(practicas, 'politicas_relacionadas');
    return `Eres un experto en políticas públicas de educación para la paz.
Analiza las siguientes políticas y enfoques que los docentes relacionan con sus prácticas en ${ubicacion}:

${textos}

Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "resumen": "Párrafo de máximo 3 oraciones que explique qué marcos políticos predominan en ${ubicacion}.",
  "categorias": [
    { "label": "Política o enfoque", "porcentaje": 40, "descripcion": "Contexto educativo de esta política." }
  ]
}
Incluye entre 3 y 5 categorías. Los porcentajes deben sumar 100.`;
  }

  _promptGeneral(practicas) {
    const n = practicas.length;
    const depts = [...new Set(practicas.map(p => p.departamento).filter(Boolean))].join(', ');
    return `Eres un investigador del Observatorio de Prácticas Educativas de la UPN Colombia.
Tienes ${n} prácticas registradas de los departamentos: ${depts}.

Genera un análisis general del observatorio como síntesis académica.

Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "resumen": "Párrafo de máximo 4 oraciones que sintetice el estado de las prácticas educativas para la paz en Colombia según estos datos.",
  "categorias": [
    { "label": "Fortaleza o hallazgo clave", "porcentaje": 25, "descripcion": "Explicación académica." }
  ]
}
Incluye entre 3 y 5 categorías representando los hallazgos más relevantes.`;
  }
}

module.exports = ManejadorAnalizarIA;
