/**
 * GeocodificadorGoogle.js — Adaptador de infraestructura para la API de
 * Google Geocoding.
 *
 * Si el campo sede tiene formato "Latitud: X Longitud: Y", parsea con
 * regex sin llamar a la API. En caso contrario usa Google Geocoding.
 */
const Geocodificador = require('../dominio/Geocodificador');

class GeocodificadorGoogle extends Geocodificador {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  /**
   * @param {string} municipio
   * @param {string} departamento
   * @param {string} [sede] — campo sede que puede contener coordenadas embebidas
   * @returns {Promise<{lat: number, lng: number}|null>}
   */
  async geocodificar(municipio, departamento, sede) {
    /* Intentar parsear coordenadas del campo sede */
    if (sede) {
      const regex = /Latitud:\s*([-\d.]+)\s*Longitud:\s*([-\d.]+)/i;
      const match = sede.match(regex);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`📍 Coordenadas parseadas de sede: ${lat}, ${lng} (${municipio}, ${departamento})`);
          return { lat, lng };
        }
      }
    }

    /* Geocodificar vía API de Google */
    if (!this.apiKey) {
      console.log(`⚠️ Sin GOOGLE_MAPS_API_KEY — omitiendo geocodificación de ${municipio}, ${departamento}`);
      return null;
    }

    try {
      const direccion = encodeURIComponent(`${municipio}, ${departamento}, Colombia`);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${direccion}&key=${this.apiKey}`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos.status === 'OK' && datos.results.length > 0) {
        const { lat, lng } = datos.results[0].geometry.location;
        console.log(`📍 Geocodificado: ${municipio}, ${departamento} → ${lat}, ${lng}`);
        return { lat, lng };
      }

      console.log(`⚠️ Sin resultados para: ${municipio}, ${departamento} (status: ${datos.status})`);
      return null;
    } catch (err) {
      console.error(`❌ Error geocodificando ${municipio}, ${departamento}:`, err.message);
      return null;
    }
  }
}

module.exports = GeocodificadorGoogle;
