const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5174';
const DIR_CAPTURAS = path.join(__dirname, 'screenshots');
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Vista Pública (ruta raíz /)
    console.log('Capturando Vista Pública...');
    await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(2000);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '10_Vista_Publica.png'), fullPage: true });
    console.log('✔ 10_Vista_Publica.png');

    // Scroll para capturar más contenido
    await page.evaluate(() => window.scrollTo(0, 500));
    await delay(800);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '10b_Vista_Publica_scroll.png'), fullPage: false });
    console.log('✔ 10b_Vista_Publica_scroll.png');

    // Historico con datos cargados (ya lo tenemos pero confirmar)
    // Tomar captura del proceso de carga mostrando el xlsx preparado
    await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
    await delay(500);
    const inputs = await page.$$('input');
    await inputs[0].type('demo', { delay: 60 });
    await inputs[1].type('demo123', { delay: 60 });
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => /ingresar|entrar|iniciar/i.test(b.textContent)) || btns[btns.length - 1];
      if (btn) btn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/app'), { timeout: 8000 });
    await delay(1500);

    // Ir a Cargar Archivo y mostrar pantalla con el xlsx listo
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Cargar'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '11_Cargar_Archivo_Detalle.png'), fullPage: true });
    console.log('✔ 11_Cargar_Archivo_Detalle.png');

    // Volver al Historico para mostrar la carga exitosa
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Histórico'));
      if (btn) btn.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, '12_Historico_Carga_Exitosa.png'), fullPage: true });
    console.log('✔ 12_Historico_Carga_Exitosa.png');

    console.log('\n✅ Capturas adicionales completadas!');
  } catch(e) {
    console.error('❌ Error:', e.message);
    await page.screenshot({ path: path.join(DIR_CAPTURAS, 'ERROR_extra.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
