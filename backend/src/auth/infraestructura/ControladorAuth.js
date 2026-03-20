/**
 * ControladorAuth.js — Endpoints de autenticación.
 *
 * POST /api/auth/login   → valida credenciales y emite JWT
 * GET  /api/auth/validar → comprueba si el token sigue vigente
 */
const express = require('express');
const jwt     = require('jsonwebtoken');

const enrutador   = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || 'paz-upn-secreto-dev';
const ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASSWORD || 'adminPaz2026';

/* ── POST /api/auth/login ── */
enrutador.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Campos requeridos: usuario y contrasena.' });
  }

  if (usuario !== ADMIN_USER || contrasena !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const token = jwt.sign(
    { usuario, rol: 'admin' },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  res.json({ token, usuario, rol: 'admin' });
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
