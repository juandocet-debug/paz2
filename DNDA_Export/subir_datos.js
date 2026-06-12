/**
 * Script para:
 * 1. Convertir datos_colombia_300.csv → datos_colombia_300.xlsx
 * 2. Subirlo a la API local del Observatorio (/api/uploads)
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

const CSV_PATH = 'C:\\Users\\SOPORTE\\Documents\\datos\\datos_colombia_300.csv';
const XLSX_PATH = path.join(__dirname, 'datos_colombia_300.xlsx');
const API_URL = 'http://localhost:3000/api/uploads';

// --- Paso 1: Convertir CSV → XLSX ---
console.log('Convirtiendo CSV a XLSX...');
const wb = XLSX.readFile(CSV_PATH);
XLSX.writeFile(wb, XLSX_PATH);
console.log(`✅ Archivo XLSX generado: ${XLSX_PATH}`);

// --- Paso 2: Obtener token (login) ---
async function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ usuario: 'demo', contrasena: 'demo123' });
    const req = http.request({
      hostname: 'localhost', port: 3000,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.token) { console.log('✅ Login exitoso'); resolve(parsed.token); }
        else reject(new Error('Login fallido: ' + data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// --- Paso 3: Subir el XLSX ---
async function subirArchivo(token) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(XLSX_PATH), {
      filename: 'datos_colombia_300.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const headers = {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`
    };

    const req = http.request({
      hostname: 'localhost', port: 3000,
      path: '/api/uploads', method: 'POST',
      headers
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log(`✅ Respuesta del servidor (${res.statusCode}):`, data);
        resolve(data);
      });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

(async () => {
  try {
    const token = await login();
    await subirArchivo(token);
    console.log('\n🎉 ¡Archivo cargado exitosamente en el Observatorio!');
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
})();
