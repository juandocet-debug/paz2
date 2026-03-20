/**
 * Practica.js — Modelo de dominio para una práctica educativa.
 *
 * Sin imports externos — lógica pura de dominio.
 * Mapea los campos de la API al modelo interno con nombres en español.
 */
export default class Practica {
  constructor({
    id, fecha, institucion, sede, tipoInstitucion, nombrePractica,
    grados, areas, responsables, departamento, municipio, jornada,
    edadEstudiantes, edadDocentes, edadComunidad, redesSociales, web,
    conflictosTipo, politicasRelacionadas, temasCatedraPaz,
    frecuenciaLineamientos, documentosMen, recibioFormacion,
    entidadesCajas, criteriosMateriales, disenaronMateriales,
    obstaculos, facilidadesSostenibilidad,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.institucion = institucion;
    this.sede = sede;
    this.tipoInstitucion = tipoInstitucion;
    this.nombrePractica = nombrePractica;
    this.grados = grados;
    this.areas = areas;
    this.responsables = responsables;
    this.departamento = departamento;
    this.municipio = municipio;
    this.jornada = jornada;
    this.edadEstudiantes = edadEstudiantes;
    this.edadDocentes = edadDocentes;
    this.edadComunidad = edadComunidad;
    this.redesSociales = redesSociales;
    this.web = web;
    this.conflictosTipo = conflictosTipo;
    this.politicasRelacionadas = politicasRelacionadas;
    this.temasCatedraPaz = temasCatedraPaz;
    this.frecuenciaLineamientos = frecuenciaLineamientos;
    this.documentosMen = documentosMen;
    this.recibioFormacion = recibioFormacion;
    this.entidadesCajas = entidadesCajas;
    this.criteriosMateriales = criteriosMateriales;
    this.disenaronMateriales = disenaronMateriales;
    this.obstaculos = obstaculos;
    this.facilidadesSostenibilidad = facilidadesSostenibilidad;
  }

  /**
   * Crea una instancia de Practica a partir de los datos crudos de la API.
   * @param {Object} datos — Objeto JSON devuelto por el backend.
   * @returns {Practica}
   */
  static desdeApi(datos) {
    return new Practica({
      id:                        datos.id,
      fecha:                     datos.fecha ?? null,
      institucion:               datos.institucion ?? null,
      sede:                      datos.sede ?? null,
      tipoInstitucion:           datos.tipo_institucion ?? null,
      nombrePractica:            datos.nombre_practica ?? null,
      grados:                    datos.grados ?? null,
      areas:                     datos.areas ?? null,
      responsables:              datos.responsables ?? null,
      departamento:              datos.departamento ?? null,
      municipio:                 datos.municipio ?? null,
      jornada:                   datos.jornada ?? null,
      edadEstudiantes:           datos.edad_estudiantes ?? null,
      edadDocentes:              datos.edad_docentes ?? null,
      edadComunidad:             datos.edad_comunidad ?? null,
      redesSociales:             datos.redes_sociales ?? null,
      web:                       datos.web ?? null,
      conflictosTipo:            datos.conflictos_tipo ?? null,
      politicasRelacionadas:     datos.politicas_relacionadas ?? null,
      temasCatedraPaz:           datos.temas_catedra_paz ?? null,
      frecuenciaLineamientos:    datos.frecuencia_lineamientos ?? null,
      documentosMen:             datos.documentos_men ?? null,
      recibioFormacion:          datos.recibio_formacion ?? null,
      entidadesCajas:            datos.entidades_cajas ?? null,
      criteriosMateriales:       datos.criterios_materiales ?? null,
      disenaronMateriales:       datos.disenaron_materiales ?? null,
      obstaculos:                datos.obstaculos ?? null,
      facilidadesSostenibilidad: datos.facilidades_sostenibilidad ?? null,
    });
  }
}
