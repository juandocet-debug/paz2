/**
 * app.js — Punto de entrada del backend.
 *
 * Registra los controladores de cada slice y configura Express.
 * La base de datos se inicializa de forma async antes de arrancar.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const db = require('./compartido/infraestructura/BaseDeDatos');

async function iniciar() {
  /* ── Esperar a que sql.js cargue el WASM y la BD ── */
  await db.init();
  console.log('✔ Base de datos inicializada');

  /* ── Controladores de cada slice ── */
  const controladorAuth       = require('./auth/infraestructura/ControladorAuth');
  const controladorPracticas  = require('./practicas/infraestructura/ControladorPracticas');
  const controladorCargas     = require('./cargas/infraestructura/ControladorCargas');
  const controladorAnaliticas = require('./analiticas/infraestructura/ControladorAnaliticas');
  const controladorChat       = require('./chat/infraestructura/ControladorChat');
  const manejadorErrores      = require('./compartido/infraestructura/ManejadorErrores');

  const app  = express();
  const PORT = process.env.PORT || 3000;

  /* ── Middleware global ── */
  app.use(cors());
  app.use(express.json());

  // El frontend ahora está desplegado de manera independiente (Static Site en Render).

  /* ── Rutas de la API ── */
  app.use('/api/auth',      controladorAuth);
  app.use('/api/practices', controladorPracticas);
  app.use('/api/uploads',   controladorCargas);
  app.use('/api/analytics', controladorAnaliticas);
  app.use('/api/chat',      controladorChat);

  app.use(manejadorErrores);

  app.listen(PORT, () => {
    console.log(`✔ Observatorio corriendo en http://localhost:${PORT}`);
  });
}

iniciar().catch(err => {
  console.error('Error fatal al iniciar:', err);
  process.exit(1);
});
