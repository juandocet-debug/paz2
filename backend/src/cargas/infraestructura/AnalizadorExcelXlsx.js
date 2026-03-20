/**
 * AnalizadorExcelXlsx.js — Implementación concreta del puerto AnalizadorExcel
 * usando la librería 'xlsx'.
 *
 * Contiene el mapeo flexible de encabezados de Excel a campos de la BD.
 */
const XLSX = require('xlsx');
const AnalizadorExcel = require('../dominio/AnalizadorExcel');

/**
 * Mapea campos de la BD a posibles variantes de encabezado del Excel.
 * Las claves son los nombres de columna en la BD; los valores son arrays
 * de posibles encabezados (case-insensitive, coincidencia por .includes).
 */
const MAPA_COLUMNAS = {
  fecha:                      ['fecha', 'date', 'marca temporal', 'marca de tiempo'],
  institucion:                [
    'nombre de la institución educativa',   // ← EXACTO del formulario del usuario
    'nombre de la institucion educativa',
    'institución educativa',
    'institucion educativa',
    'nombre institución',
    'nombre institucion',
    'institución',
    'institucion',
    'nombre ie',
    'i.e.',
  ],
  sede:                       ['sede', 'nombre de la sede'],
  tipo_institucion:           ['tipo de institución', 'tipo institucion', 'tipo_institucion', 'naturaleza'],
  nombre_practica:            ['nombre de la práctica', 'nombre practica', 'práctica educativa', 'nombre_practica', 'nombre de su práctica', 'nombre de la práctica educativa'],
  grados:                     ['grados', 'grado', '¿con qué grados'],
  areas:                      ['áreas', 'areas', 'área', '¿qué área'],
  responsables:               ['responsables', 'responsable', 'docente responsable', 'nombre del docente', 'nombre y apellido'],
  departamento:               ['departamento', '¿a qué departamento pertenece', 'a qué departamento'],
  municipio:                  ['municipio', 'ciudad', '¿en qué municipio'],
  jornada:                    ['jornada'],
  edad_estudiantes:           ['edad estudiantes', 'edad_estudiantes', 'edades aproximadas', 'persona de la comunidad', 'actores y de qué edades'],
  edad_docentes:              ['edad docentes', 'edad_docentes', '[docente]', 'docentes ]'],
  edad_comunidad:             ['edad comunidad', 'edad_comunidad', 'persona de la comunidad', 'comunidad'],
  redes_sociales:             ['redes sociales', 'redes_sociales'],
  web:                        ['web', 'sitio web'],
  conflictos_tipo:            [
    'señale cuál', 'conflictos que más se relaciona',   // ← EXACTO del formulario
    'tipos de conflicto', 'conflictos_tipo', 'tipo de conflicto',
    'conflictos sociales',
  ],
  politicas_relacionadas:     ['políticas', 'politicas_relacionadas', 'políticas relacionadas'],
  temas_catedra_paz:          ['temas cátedra de paz', 'temas_catedra_paz', 'cátedra de paz'],
  frecuencia_lineamientos:    ['frecuencia lineamientos', 'frecuencia_lineamientos', '¿con qué frecuencia'],
  documentos_men:             ['documentos men', 'documentos_men'],
  recibio_formacion:          ['recibió formación', 'recibio_formacion', 'formación recibida', '¿ha recibido formación'],
  entidades_cajas:            ['entidades', 'entidades_cajas', 'cajas de herramientas'],
  criterios_materiales:       ['criterios materiales', 'criterios_materiales'],
  disenaron_materiales:       ['diseñaron materiales', 'disenaron_materiales', '¿han diseñado'],
  obstaculos:                 ['obstáculos', 'obstaculos', 'problemáticas', 'tensiones', '¿qué problemáticas', 'problemáticas, tensiones'],
  facilidades_sostenibilidad: ['facilidades', 'facilidades_sostenibilidad', 'condiciones de sostenibilidad'],
};

function normalizarEncabezado(h) {
  return String(h).toLowerCase().trim().replace(/\s+/g, ' ');
}

function construirIndiceEncabezados(encabezados) {
  const indice = {};
  for (const [campo, variantes] of Object.entries(MAPA_COLUMNAS)) {
    for (let i = 0; i < encabezados.length; i++) {
      const h = normalizarEncabezado(encabezados[i] || '');
      if (variantes.some(v => h.includes(v.toLowerCase()))) {
        indice[campo] = i;
        break;
      }
    }
  }
  return indice;
}

function valorCelda(fila, indice) {
  if (indice === undefined || fila[indice] == null) return '';
  return String(fila[indice]).trim();
}

class AnalizadorExcelXlsx extends AnalizadorExcel {
  parsear(rutaArchivo) {
    const libro = XLSX.readFile(rutaArchivo, { cellDates: true });
    const nombreHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombreHoja];

    const crudo = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' });

    if (crudo.length < 2) {
      const error = new Error(
        'El archivo no tiene datos suficientes (mínimo: fila de encabezados + 1 fila de datos).'
      );
      error.status = 422;
      throw error;
    }

    const encabezados = crudo[0].map(String);

    /* Log para diagnosticar encabezados cuando hay columnas no mapeadas */
    const indice = construirIndiceEncabezados(encabezados);
    const noMapeados = encabezados.filter((h, i) =>
      !Object.values(indice).includes(i) && String(h).trim() !== ''
    );
    if (noMapeados.length > 0) {
      console.log('⚠️  Columnas del Excel sin mapear:', noMapeados);
    }

    const filasDatos = crudo.slice(1);
    const practicas = filasDatos
      .filter(fila => fila.some(celda => String(celda).trim() !== ''))
      .map(fila => {
        const obj = {};
        for (const campo of Object.keys(MAPA_COLUMNAS)) {
          obj[campo] = valorCelda(fila, indice[campo]);
        }
        return obj;
      });

    return { practicas, nombreHoja };
  }
}

module.exports = AnalizadorExcelXlsx;
