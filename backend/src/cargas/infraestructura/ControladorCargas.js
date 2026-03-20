/**
 * ControladorCargas.js — Adaptador HTTP (Express Router) para el slice de cargas.
 *
 * Configura multer para la recepción de archivos y conecta los handlers
 * con las implementaciones concretas.
 */
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const db = require('../../compartido/infraestructura/BaseDeDatos');
const RepositorioCargasSqlite       = require('./RepositorioCargasSqlite');
const AnalizadorExcelXlsx           = require('./AnalizadorExcelXlsx');
const GeocodificadorGoogle          = require('./GeocodificadorGoogle');
const RepositorioPracticasSqlite    = require('../../practicas/infraestructura/RepositorioPracticasSqlite');
const RepositorioAnaliticasSqlite   = require('../../analiticas/infraestructura/RepositorioAnaliticasSqlite');
const ComandoCargarArchivo          = require('../aplicacion/ComandoCargarArchivo');
const ManejadorCargarArchivo        = require('../aplicacion/ManejadorCargarArchivo');
const ManejadorEliminarCarga        = require('../aplicacion/ManejadorEliminarCarga');
const ManejadorPublicarCarga        = require('../aplicacion/ManejadorPublicarCarga');
const ManejadorAnalizarIA           = require('../../analiticas/aplicacion/ManejadorAnalizarIA');

const enrutador = express.Router();

/* ── Directorio de archivos subidos ── */
const DIRECTORIO_UPLOADS = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(DIRECTORIO_UPLOADS)) {
  fs.mkdirSync(DIRECTORIO_UPLOADS, { recursive: true });
}

/* ── Configuración de Multer ── */
const almacenamiento = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRECTORIO_UPLOADS),
  filename:    (_req,  file, cb) => {
    const marca = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `carga_${marca}${ext}`);
  },
});

const upload = multer({
  storage: almacenamiento,
  fileFilter: (_req, file, cb) => {
    const permitidas = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (permitidas.includes(ext)) return cb(null, true);
    cb(Object.assign(new Error('Solo se permiten archivos .xlsx o .xls'), { status: 400 }));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

/* ── Inyección de dependencias ── */
const repositorioCargas    = new RepositorioCargasSqlite(db);
const analizadorExcel      = new AnalizadorExcelXlsx();
const repositorioPracticas = new RepositorioPracticasSqlite(db);
const repositorioAnaliticas = new RepositorioAnaliticasSqlite(db);
const geocodificador       = new GeocodificadorGoogle(process.env.GOOGLE_MAPS_API_KEY);
const manejadorCargar      = new ManejadorCargarArchivo(repositorioCargas, analizadorExcel, repositorioPracticas, geocodificador);
const manejadorEliminar    = new ManejadorEliminarCarga(repositorioCargas, repositorioPracticas);
const manejadorPublicar    = new ManejadorPublicarCarga(repositorioCargas);
const manejadorIA          = new ManejadorAnalizarIA(db, process.env.GROQ_API_KEY, repositorioAnaliticas);

/* ── GET / — listar historial de cargas ── */
enrutador.get('/', async (_req, res, next) => {
  try {
    res.json(await repositorioCargas.buscarTodas());
  } catch (err) {
    next(err);
  }
});

/* ── GET /:id — detalle de una carga ── */
enrutador.get('/:id', async (req, res, next) => {
  try {
    const carga = await repositorioCargas.buscarPorId(parseInt(req.params.id, 10));
    if (!carga) return res.status(404).json({ error: 'Carga no encontrada' });
    res.json(carga);
  } catch (err) {
    next(err);
  }
});

/* ── POST / — subir y procesar un nuevo archivo Excel ── */
enrutador.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }
  try {
    const comando = new ComandoCargarArchivo({
      rutaArchivo:    req.file.path,
      nombreOriginal: req.file.originalname,
      nombreGuardado: req.file.filename,
    });

    const resultado = await manejadorCargar.ejecutar(comando);

    /* Anlisis IA automático en segundo plano (no bloquea la respuesta) */
    if (process.env.GROQ_API_KEY) {
      manejadorIA.ejecutar().catch(err =>
        console.warn('[IA] Análisis automático fallido:', err.message)
      );
    }

    res.status(201).json({
      upload_id:     resultado.idCarga,
      records_count: resultado.cantidadRegistros,
      message:       `Se importaron ${resultado.cantidadRegistros} prácticas correctamente.`,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
});

/* ── DELETE /:id — eliminar una carga y sus prácticas ── */
enrutador.delete('/:id', async (req, res, next) => {
  try {
    const resultado = await manejadorEliminar.ejecutar(parseInt(req.params.id, 10));
    res.json({ message: resultado.mensaje });
  } catch (err) {
    next(err);
  }
});

/* ── PATCH /:id/publicar — marcar carga como pública ── */
enrutador.patch('/:id/publicar', async (req, res, next) => {
  try {
    const resultado = await manejadorPublicar.ejecutar(parseInt(req.params.id, 10));
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

module.exports = enrutador;
