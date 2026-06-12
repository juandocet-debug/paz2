const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5174';
const USUARIO = 'demo';
const PASSWORD = 'demo123';
const DIR_CAPTURAS = path.join(__dirname, 'screenshots');

if (!fs.existsSync(DIR_CAPTURAS)) fs.mkdirSync(DIR_CAPTURAS, { recursive: true });

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log('Iniciando navegador automático...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Limpiar localStorage por si hay sesión vieja
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());

    // ── 1. Pantalla de Login ──
    console.log('Navegando a /login...');
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(1000);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '01_Login.png'), fullPage: true });
    console.log('✔ 01_Login.png');

    // Buscar inputs de usuario y contraseña
    await page.waitForSelector('input', { timeout: 5000 });
    const inputs = await page.$$('input');
    console.log(`   Encontrados ${inputs.length} inputs`);
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type(USUARIO, { delay: 60 });
    if (inputs[1]) {
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type(PASSWORD, { delay: 60 });
    }
    await delay(500);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '01b_Login_Formulario_Relleno.png'), fullPage: true });
    console.log('✔ 01b_Login_Formulario_Relleno.png');

    // Click en botón de login
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => /ingresar|entrar|iniciar|acceder|login|sesión/i.test(b.textContent)) || btns[btns.length - 1];
      if (btn) btn.click();
    });

    // Esperar redirección al app
    await page.waitForFunction(() => window.location.pathname.includes('/app'), { timeout: 8000 });
    await delay(2000);

    // ── 2. Dashboard ──
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '02_Dashboard.png'), fullPage: true });
    console.log('✔ 02_Dashboard.png');

    // Función para navegar por el sidebar
    const clickNav = async (textoBtn, archivo) => {
      try {
        const encontrado = await page.evaluate((txt) => {
          const btns = [...document.querySelectorAll('button')];
          const btn = btns.find(b => b.textContent.trim().includes(txt));
          if (btn) { btn.click(); return true; }
          return false;
        }, textoBtn);

        if (!encontrado) { console.log(`⚠ No se encontró botón: "${textoBtn}"`); return; }
        await delay(2000);
        await page.screenshot({ path: path.join(DIR_CAPTURAS, archivo), fullPage: true });
        console.log(`✔ ${archivo}`);
      } catch(e) {
        console.log(`⚠ Error en "${textoBtn}": ${e.message}`);
      }
    };

    // ── 3. Recorrer cada módulo del sidebar ──
    await clickNav('Conflictos',   '03_Conflictos_Politicas.png');
    await clickNav('Tabla',        '04_Tabla_Datos.png');
    await clickNav('Chat',         '05_Chat_IA.png');
    await clickNav('Cargar',       '06_Cargar_Archivo.png');
    await clickNav('Mapa',         '07_Mapa_Calor.png');
    await clickNav('Histórico',    '08_Historico.png');

    // ── 4. Volver al Dashboard para captura final ──
    await clickNav('Dashboard',    '09_Dashboard_Final.png');

    console.log('\n✅ ¡Todas las capturas guardadas en /screenshots!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, 'ERROR_estado_actual.png'), fullPage: true });
    console.log('Captura de error guardada: ERROR_estado_actual.png');
  } finally {
    await browser.close();
  }
})();
