const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');

const BASE = 'http://localhost:5174';
const DIR_CAPTURAS = path.join(__dirname, 'screenshots');
const delay = ms => new Promise(res => setTimeout(res, ms));

// Primero probar si la API de chat responde
function probarChat(token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ mensaje: '¿Cuántas prácticas educativas hay registradas por departamento?' });
    const req = http.request({
      hostname: 'localhost', port: 3000,
      path: '/api/chat', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${token}`
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log(`\n📡 Respuesta del Chat API (${res.statusCode}):`);
        console.log(data.substring(0, 500));
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ usuario: 'demo', contrasena: 'demo123' });
    const req = http.request({
      hostname: 'localhost', port: 3000,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data).token));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  // 1. Probar API del chat directamente
  console.log('🔐 Haciendo login...');
  const token = await login();
  console.log('🤖 Probando API de Chat directamente...');
  const chatResult = await probarChat(token);

  // 2. Abrir navegador e interactuar con el chat visualmente
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
    await delay(500);
    const inputs = await page.$$('input');
    await inputs[0].type('demo', { delay: 50 });
    await inputs[1].type('demo123', { delay: 50 });
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => /ingresar|iniciar/i.test(b.textContent));
      if (btn) btn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/app'), { timeout: 8000 });
    await delay(1000);

    // Ir al Chat con IA
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Chat'));
      if (btn) btn.click();
    });
    await delay(1500);

    // Captura del chat vacío (estado inicial)
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '05_Chat_IA.png'), fullPage: true });
    console.log('✔ 05_Chat_IA.png (estado inicial)');

    // Escribir una pregunta en el chat
    const textarea = await page.$('textarea, input[placeholder*="consulta"], input[placeholder*="escribe"]');
    if (textarea) {
      await textarea.click();
      await textarea.type('¿Cuántas prácticas hay por departamento?', { delay: 40 });
      await delay(500);

      // Captura con la pregunta escrita
      await page.screenshot({ path: path.join(DIR_CAPTURAS, '05b_Chat_IA_Pregunta.png'), fullPage: true });
      console.log('✔ 05b_Chat_IA_Pregunta.png');

      // Enviar la pregunta (Enter o botón)
      await page.keyboard.press('Enter');
      console.log('⏳ Esperando respuesta de la IA...');
      await delay(8000); // Esperar hasta 8 segundos la respuesta de Groq

      await page.screenshot({ path: path.join(DIR_CAPTURAS, '05c_Chat_IA_Respuesta.png'), fullPage: true });
      console.log('✔ 05c_Chat_IA_Respuesta.png');
    } else {
      console.log('⚠ No se encontró el campo de texto del chat');
    }

    console.log('\n✅ Capturas del Chat completadas!');
  } catch(e) {
    console.error('❌ Error:', e.message);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, 'ERROR_chat.png') });
  } finally {
    await browser.close();
  }
})();
