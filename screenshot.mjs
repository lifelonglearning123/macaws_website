import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('./node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

// Force-reveal all animated elements for accurate screenshot
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 300));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(outPath);
