/**
 * ServicioPracticas.js — Servicio de aplicación para el slice de Prácticas.
 *
 * Recibe el adaptador Api como dependencia inyectada.
 * Las páginas solo interactúan con este servicio, nunca con la Api directamente.
 */
import Practica from '../dominio/Practica.js';
import * as api from '../infraestructura/ApiPracticas.js';

class ServicioPracticas {
  /** @param {typeof api} apiPracticas — adaptador de infraestructura */
  constructor(apiPracticas) {
    this.api = apiPracticas;
  }

  /**
   * Busca prácticas con filtros, paginación y ordenamiento.
   * @returns {{ filas: Practica[], total: number }}
   */
  async buscarTodas(parametros = {}) {
    const respuesta = await this.api.obtenerPracticas(parametros);
    return {
      filas: (respuesta.registros ?? []).map(Practica.desdeApi),
      total: respuesta.total ?? 0,
    };
  }

  /**
   * Obtiene el detalle completo de una práctica por su ID.
   * @returns {Practica|null}
   */
  async buscarPorId(id) {
    const datos = await this.api.obtenerPracticaPorId(id);
    return datos ? Practica.desdeApi(datos) : null;
  }

  /**
   * Obtiene los valores disponibles para los filtros.
   * @returns {{ departamentos: string[], tipos: string[], jornadas: string[] }}
   */
  async obtenerFiltros() {
    return this.api.obtenerFiltros();
  }
}

/** Instancia singleton con la Api real inyectada */
const servicioPracticas = new ServicioPracticas(api);
export default servicioPracticas;
