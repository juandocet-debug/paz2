const crypto = require('crypto');
const express = require('express');
const auditoria = require('./RepositorioAuditoria');

const enrutador = express.Router();

function claveValida(recibida) {
  const esperada = process.env.AUDIT_KEY || '';
  if (!esperada || !recibida) return false;
  const a = Buffer.from(String(recibida));
  const b = Buffer.from(esperada);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

enrutador.post('/access-audit', async (req, res, next) => {
  const clave = req.headers['x-audit-key'] || req.body?.clave;
  if (!claveValida(clave)) return res.status(404).json({ error: 'Recurso no encontrado.' });

  try {
    const accesos = await auditoria.listar(500);
    const sesiones = await auditoria.listarSesiones(200);
    res.set('Cache-Control', 'no-store');
    res.json({ accesos, sesiones });
  } catch (error) {
    next(error);
  }
});

module.exports = enrutador;
