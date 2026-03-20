/**
 * ManejadorErrores.js — Middleware centralizado de errores para Express.
 */
function manejadorErrores(err, _req, res, _next) {
  console.error(err);
  const estado = err.status || 500;
  res.status(estado).json({
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = manejadorErrores;
