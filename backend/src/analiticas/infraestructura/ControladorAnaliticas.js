/**
 * ControladorAnaliticas.js — Adaptador HTTP para el slice de analíticas.
 */
const express = require('express');
const db      = require('../../compartido/infraestructura/BaseDeDatos');
const RepositorioAnaliticasSqlite = require('./RepositorioAnaliticasSqlite');
const ManejadorConsultaDashboard  = require('../aplicacion/ManejadorConsultaDashboard');
const ManejadorAnalizarIA         = require('../aplicacion/ManejadorAnalizarIA');

const enrutador    = express.Router();
const repositorio  = new RepositorioAnaliticasSqlite(db);
const manejador    = new ManejadorConsultaDashboard(repositorio);
const groqApiKey   = process.env.GROQ_API_KEY || '';
const manejadorIA  = new ManejadorAnalizarIA(db, groqApiKey, repositorio);

function extraerFiltros(query) {
  return {
    departamento:    query.departamento    || '',
    municipio:       query.municipio       || '',
    tipoInstitucion: query.tipoInstitucion || '',
    jornada:         query.jornada         || '',
  };
}

/* ── GET /dashboard ── */
enrutador.get('/dashboard', async (req, res, next) => {
  try {
    res.json(await manejador.ejecutar(extraerFiltros(req.query)));
  } catch (err) { next(err); }
});

/* ── GET /mapa ── */
enrutador.get('/mapa', async (req, res, next) => {
  try {
    res.json(await repositorio.puntosMapa(extraerFiltros(req.query)));
  } catch (err) { next(err); }
});

/* ── POST /analizar — INTERNO: dispara análisis IA y persiste en SQLite ── */
enrutador.post('/analizar', async (req, res, next) => {
  try {
    if (!groqApiKey) {
      return res.status(503).json({ error: 'GROQ_API_KEY no configurada en el backend.' });
    }
    const resultados = await manejadorIA.ejecutar();
    res.json({ ok: true, dimensiones: resultados.map(r => r.dimension) });
  } catch (err) { next(err); }
});

/* ── GET /interpretacion — PÚBLICO: devuelve análisis IA guardados ── */
enrutador.get('/interpretacion', async (req, res, next) => {
  try {
    res.json(await manejadorIA.obtenerInterpretacion());
  } catch (err) { next(err); }
});

/* ── POST /interpretacion-dinamica — PÚBLICO: devuelve análisis IA al vuelo ── */
enrutador.post('/interpretacion-dinamica', async (req, res, next) => {
  try {
    if (!groqApiKey) {
      return res.status(503).json({ error: 'GROQ_API_KEY no configurada en el backend.', fallback: true });
    }
    // Requiere los filtros en el body: { departamento, municipio, tipoInstitucion, jornada }
    const filtros = extraerFiltros(req.body);
    const resultados = await manejadorIA.ejecutarDinamico(filtros);
    res.json(resultados);
  } catch (err) { next(err); }
});

module.exports = enrutador;
