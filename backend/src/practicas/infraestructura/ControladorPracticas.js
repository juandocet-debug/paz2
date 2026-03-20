/**
 * ControladorPracticas.js — Adaptador HTTP (Express Router).
 *
 * Instancia los handlers con el repositorio concreto y expone las rutas.
 * Este es el único lugar del slice donde se acoplan implementaciones
 * concretas con las abstracciones.
 */
const express = require('express');
const db = require('../../compartido/infraestructura/BaseDeDatos');
const RepositorioPracticasSqlite = require('./RepositorioPracticasSqlite');
const ConsultaPracticas = require('../aplicacion/ConsultaPracticas');
const ManejadorConsultaPracticas = require('../aplicacion/ManejadorConsultaPracticas');
const ManejadorConsultaPracticaPorId = require('../aplicacion/ManejadorConsultaPracticaPorId');
const ManejadorConsultaFiltros = require('../aplicacion/ManejadorConsultaFiltros');

const enrutador = express.Router();

/* ── Inyección de dependencias ── */
const repositorio = new RepositorioPracticasSqlite(db);
const manejadorLista   = new ManejadorConsultaPracticas(repositorio);
const manejadorDetalle = new ManejadorConsultaPracticaPorId(repositorio);
const manejadorFiltros = new ManejadorConsultaFiltros(repositorio);

/* ── GET / — lista paginada con filtros ── */
enrutador.get('/', async (req, res, next) => {
  try {
    const consulta = new ConsultaPracticas({
      busqueda:       req.query.search       || '',
      departamento:   req.query.departamento || '',
      tipo:           req.query.tipo         || '',
      formacion:      req.query.formacion    || '',
      pagina:         req.query.page         || '1',
      tamanioPagina:  req.query.pageSize     || '15',
      campoOrden:     req.query.sortKey      || 'institucion',
      direccionOrden: req.query.sortDir      || 'ASC',
      idCarga:        req.query.uploadId     || null,
    });
    res.json(await manejadorLista.ejecutar(consulta));
  } catch (err) {
    next(err);
  }
});

/* ── GET /filters — valores para dropdowns ── */
enrutador.get('/filters', async (_req, res, next) => {
  try {
    res.json(await manejadorFiltros.ejecutar());
  } catch (err) {
    next(err);
  }
});

/* ── GET /:id — detalle de una práctica ── */
enrutador.get('/:id', async (req, res, next) => {
  try {
    const practica = await manejadorDetalle.ejecutar(parseInt(req.params.id, 10));
    if (!practica) {
      return res.status(404).json({ error: 'Práctica no encontrada' });
    }
    res.json(practica);
  } catch (err) {
    next(err);
  }
});

module.exports = enrutador;
