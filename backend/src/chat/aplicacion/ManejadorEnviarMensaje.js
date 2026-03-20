/**
 * ManejadorEnviarMensaje.js — Caso de uso: procesar un mensaje del usuario
 * y obtener la respuesta de la IA.
 *
 * Depende SOLO de puertos (ProveedorIA, ProveedorContexto), nunca de
 * implementaciones concretas ni de otros slices.
 */

class ManejadorEnviarMensaje {
  /**
   * @param {import('../dominio/ProveedorIA')} proveedorIA
   * @param {import('../dominio/ProveedorContexto')} proveedorContexto
   */
  constructor(proveedorIA, proveedorContexto) {
    this.proveedorIA       = proveedorIA;
    this.proveedorContexto = proveedorContexto;
  }

  /**
   * @param {import('./ComandoEnviarMensaje')} comando
   * @returns {Promise<string>} Respuesta de la IA
   */
  async ejecutar(comando) {
    const analiticas = this.proveedorContexto.obtenerAnaliticas();
    const muestras   = this.proveedorContexto.obtenerMuestraPracticas(10);

    const promptSistema = this._construirPromptSistema(analiticas, muestras);

    const historialReciente = comando.historial.slice(-6);
    const mensajes = [
      { role: 'system', content: promptSistema },
      ...historialReciente,
      { role: 'user', content: comando.mensaje },
    ];

    return this.proveedorIA.enviarMensaje(mensajes);
  }

  _construirPromptSistema(analiticas, muestras) {
    const { kpis, porDepartamento, porConflictos, porPoliticas, porTemasCatedraPaz, porEntidades, porFormacion, porMateriales } = analiticas;

    const fmt = (arr, n = 8) =>
      arr.slice(0, n).map(r => `  - ${r.label}: ${r.count}`).join('\n');

    const ejemplos = muestras.slice(0, 6).map(p =>
      `  • "${p.nombre_practica}" — ${p.institucion} (${p.municipio}, ${p.departamento}). Obstáculos: ${(p.obstaculos || '').slice(0, 120)}`
    ).join('\n');

    return `Eres un asistente experto en análisis de prácticas educativas sobre paz, memoria y derechos humanos en Colombia.
Tienes acceso a los datos reales del Observatorio de Prácticas Educativas.

== DATOS DEL OBSERVATORIO ==

RESUMEN GENERAL:
- Total prácticas: ${kpis.total}
- Departamentos cubiertos: ${kpis.departamentos}
- Recibieron formación específica: ${kpis.conFormacion}
- Diseñaron materiales propios: ${kpis.conMateriales}

TOP DEPARTAMENTOS:
${fmt(porDepartamento)}

TIPOS DE CONFLICTO:
${fmt(porConflictos)}

POLÍTICAS RELACIONADAS:
${fmt(porPoliticas)}

TEMÁTICAS CÁTEDRA DE PAZ:
${fmt(porTemasCatedraPaz)}

ENTIDADES PROVEEDORAS DE MATERIALES:
${fmt(porEntidades)}

FORMACIÓN RECIBIDA:
${fmt(porFormacion)}

MATERIALES DISEÑADOS:
${fmt(porMateriales)}

MUESTRA DE PRÁCTICAS:
${ejemplos}

== INSTRUCCIONES ==
- Responde siempre en español, de forma clara y estructurada.
- Usa los datos reales del observatorio para fundamentar tus respuestas.
- Si la pregunta no tiene relación con los datos, redirígela al análisis educativo.
- Usa listas y negritas (**texto**) para estructurar cuando sea útil.
- Sé conciso pero completo. Máximo 350 palabras por respuesta.`;
  }
}

module.exports = ManejadorEnviarMensaje;
