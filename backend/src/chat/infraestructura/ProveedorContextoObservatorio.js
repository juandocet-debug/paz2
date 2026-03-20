/**
 * ProveedorContextoObservatorio.js — Implementación concreta del puerto
 * ProveedorContexto que obtiene datos reales del observatorio.
 *
 * Este es el ÚNICO punto de acoplamiento entre el slice de chat y
 * los slices de analíticas/prácticas — y ocurre en infraestructura,
 * nunca en dominio ni aplicación.
 */
const ProveedorContexto = require('../dominio/ProveedorContexto');

class ProveedorContextoObservatorio extends ProveedorContexto {
  /**
   * @param {import('../../analiticas/aplicacion/ManejadorConsultaDashboard')} manejadorDashboard
   * @param {import('../../practicas/dominio/RepositorioPracticas')} repositorioPracticas
   */
  constructor(manejadorDashboard, repositorioPracticas) {
    super();
    this.manejadorDashboard   = manejadorDashboard;
    this.repositorioPracticas = repositorioPracticas;
  }

  async obtenerAnaliticas() {
    return await this.manejadorDashboard.ejecutar();
  }

  async obtenerMuestraPracticas(cantidad = 10) {
    const consulta = {
      busqueda: '', departamento: '', tipo: '', formacion: '',
      pagina: 1, tamanioPagina: cantidad,
      campoOrden: 'institucion', direccionOrden: 'ASC', idCarga: null,
    };
    const { registros } = await this.repositorioPracticas.buscarTodas(consulta);
    return registros;
  }
}

module.exports = ProveedorContextoObservatorio;
