/**
 * ControladorAuth.js — Endpoints de autenticación.
 *
 * POST /api/auth/login   → valida credenciales y emite JWT
 * GET  /api/auth/validar → comprueba si el token sigue vigente
 */
const express = require('express');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const auditoria = require('./RepositorioAuditoria');

const enrutador   = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || 'paz-upn-secreto-dev';
const ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASSWORD || 'adminPaz2026';

/* ── POST /api/auth/login ── */
enrutador.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Campos requeridos: usuario y contrasena.' });
  }

  const exitoso = usuario === ADMIN_USER && contrasena === ADMIN_PASS;
  const ip = req.ip || req.socket?.remoteAddress || '';
  const navegador = String(req.headers['user-agent'] || '').slice(0, 500);

  // Se ejecuta en segundo plano: una demora o fallo de auditoria no afecta el login.
  void auditoria.registrar({
    usuario: String(usuario).slice(0, 120),
    exitoso,
    ip: String(ip).slice(0, 120),
    navegador,
  }).catch((error) => {
    console.error('No fue posible registrar el intento de acceso:', error.message);
  });

  if (!exitoso) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const token = jwt.sign(
    { usuario, rol: 'admin' },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  const sesionId = crypto.randomUUID();
  await auditoria.iniciarSesion({
    id: sesionId,
    usuario: String(usuario).slice(0, 120),
    ip: String(ip).slice(0, 120),
    navegador,
  }).catch((error) => {
    console.error('No fue posible iniciar la auditoría de sesión:', error.message);
  });

  res.json({ token, usuario, rol: 'admin', sesionId });
});

/* ── POST /api/auth/activity ── */
enrutador.post('/activity', (req, res) => {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado.' });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const sesionId = String(req.body?.sesionId || '').slice(0, 80);
  const seccion = String(req.body?.seccion || 'Aplicación').slice(0, 120);
  const tipoPermitido = ['navegacion', 'inicio', 'latido', 'cierre'];
  const tipo = tipoPermitido.includes(req.body?.tipo) ? req.body.tipo : 'navegacion';
  if (!sesionId) return res.status(400).json({ error: 'Sesión requerida.' });

  void auditoria.registrarActividad({ sesionId, seccion, tipo }).catch((error) => {
    console.error('No fue posible registrar actividad:', error.message);
  });
  res.status(202).json({ registrado: true });
});

/* ── GET /api/auth/validar ── */
enrutador.get('/validar', (req, res) => {
  const cabecera = req.headers.authorization || '';
  const token    = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;

  if (!token) return res.status(401).json({ valido: false });

  try {
    const datos = jwt.verify(token, JWT_SECRET);
    res.json({ valido: true, usuario: datos.usuario, rol: datos.rol });
  } catch {
    res.status(401).json({ valido: false });
  }
});

module.exports = enrutador;
