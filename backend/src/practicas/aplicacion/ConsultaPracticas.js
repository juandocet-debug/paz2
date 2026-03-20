/**
 * ConsultaPracticas.js — DTO para los parámetros de consulta de prácticas.
 *
 * Normaliza y valida los datos que llegan del controlador antes de
 * pasarlos al handler.
 */

class ConsultaPracticas {
  constructor({
    busqueda   = '',
    departamento = '',
    tipo       = '',
    formacion  = '',
    pagina     = 1,
    tamanioPagina = 15,
    campoOrden = 'institucion',
    direccionOrden = 'ASC',
    idCarga    = null,
  } = {}) {
    this.busqueda       = busqueda;
    this.departamento   = departamento;
    this.tipo           = tipo;
    this.formacion      = formacion;
    this.pagina         = Math.max(1, parseInt(pagina, 10) || 1);
    this.tamanioPagina  = Math.max(1, parseInt(tamanioPagina, 10) || 15);
    this.campoOrden     = campoOrden;
    this.direccionOrden = direccionOrden === 'DESC' ? 'DESC' : 'ASC';
    this.idCarga        = idCarga ? parseInt(idCarga, 10) : null;
  }
}

module.exports = ConsultaPracticas;
