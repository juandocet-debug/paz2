/**
 * ControladorChat.js — Adaptador HTTP (Express Router) para el chat con IA.
 *
 * Ensambla todas las dependencias: ProveedorIAGroq + ProveedorContextoObservatorio
 * + repositorios necesarios. Este es el composition root del slice chat.
 */
const express = require('express');
const db = require('../../compartido/infraestructura/BaseDeDatos');

const ProveedorIAGroq = require('./ProveedorIAGroq');
const ProveedorContextoObservatorio = require('./ProveedorContextoObservatorio');

const RepositorioAnaliticasSqlite = require('../../analiticas/infraestructura/RepositorioAnaliticasSqlite');
const ManejadorConsultaDashboard  = require('../../analiticas/aplicacion/ManejadorConsultaDashboard');
const RepositorioPracticasSqlite  = require('../../practicas/infraestructura/RepositorioPracticasSqlite');

const ComandoEnviarMensaje    = require('../aplicacion/ComandoEnviarMensaje');
const ManejadorEnviarMensaje  = require('../aplicacion/ManejadorEnviarMensaje');

const enrutador = express.Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ── Inyección de dependencias ── */
const repositorioPracticas = new RepositorioPracticasSqlite(db);
const repositorioAnaliticas = new RepositorioAnaliticasSqlite(db);
const manejadorDashboard = new ManejadorConsultaDashboard(repositorioAnaliticas);

const proveedorIA       = new ProveedorIAGroq(GROQ_API_KEY);
const proveedorContexto = new ProveedorContextoObservatorio(manejadorDashboard, repositorioPracticas);
const manejador         = new ManejadorEnviarMensaje(proveedorIA, proveedorContexto);

/* ── POST / — enviar mensaje al chat ── */
enrutador.post('/', async (req, res, next) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(503).json({ error: 'Clave de IA no configurada en el servidor.' });
    }

    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    const comando = new ComandoEnviarMensaje({
      mensaje:   message,
      historial: history,
    });

    const respuesta = await manejador.ejecutar(comando);
    res.json({ reply: respuesta });

  } catch (err) {
    next(err);
  }
});

module.exports = enrutador;
