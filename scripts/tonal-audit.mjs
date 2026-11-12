#!/usr/bin/env node
// Audit des masses tonales d'un écran.
// Mesure, sur une capture, la part de sombre / moyen / clair / signal, le vide,
// et la présence de noir ou de blanc purs — puis compare aux règles de docs/composition.md.
//
// Usage : node scripts/tonal-audit.mjs <url ou fichier.html> [--width 1440] [--height 900] [--json]
// Requiert Playwright (npm i -D playwright && npx playwright install chromium).
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const target = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true) ?? args[0];
if (!target) { console.error('Usage : node scripts/tonal-audit.mjs <url ou fichier.html> [--width 1440] [--height 900] [--json]'); process.exit(2); }
const width = +opt('width', 1440), height = +opt('height', 900);
const url = /^https?:/.test(target) ? target : existsSync(target) ? pathToFileURL(resolve(target)).href : target;

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright est introuvable. Installer : npm i -D playwright && npx playwright install chromium'); process.exit(2); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(url);
await page.waitForTimeout(400);
const theme = await page.evaluate(() => document.documentElement.dataset.theme || 'encre');
const png = (await page.screenshot()).toString('base64');

// Le décodage se fait dans le navigateur : aucune dépendance d'image côté Node.
const blank = await browser.newPage();
const m = await blank.evaluate(async ({ png, CELL }) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + png;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lstar = (r, g, b) => { const y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y; };
  const n = c.width * c.height;
  const count = { sombre: 0, moyen: 0, clair: 0, signal: 0, noirPur: 0, blancPur: 0 };
  const hist = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = (r << 16) | (g << 8) | b;
    hist.set(key, (hist.get(key) || 0) + 1);
    if (r < 6 && g < 6 && b < 6) count.noirPur++;
    if (r > 249 && g > 249 && b > 249) count.blancPur++;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 48) { count.signal++; continue; }
    const L = lstar(r, g, b);
    if (L < 26) count.sombre++; else if (L <= 72) count.moyen++; else count.clair++;
  }
  const [bgKey] = [...hist.entries()].sort((a, b) => b[1] - a[1])[0];
  const bg = [(bgKey >> 16) & 255, (bgKey >> 8) & 255, bgKey & 255];
  // Vide : part des cellules de CELL px dont tous les pixels sont du fond dominant.
  let empty = 0, cells = 0;
  for (let cy = 0; cy + CELL <= c.height; cy += CELL) for (let cx = 0; cx + CELL <= c.width; cx += CELL) {
    cells++;
    let ok = true;
    for (let y = cy; ok && y < cy + CELL; y += 2) for (let x = cx; x < cx + CELL; x += 2) {
      const i = (y * c.width + x) * 4;
      if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 12) { ok = false; break; }
    }
    if (ok) empty++;
  }
  const pct = (v) => (100 * v) / n;
  return { sombre: pct(count.sombre), moyen: pct(count.moyen), clair: pct(count.clair), signal: pct(count.signal), noirPur: pct(count.noirPur), blancPur: pct(count.blancPur), vide: (100 * empty) / cells, fond: '#' + bg.map((v) => v.toString(16).padStart(2, '0')).join('') };
}, { png, CELL: 24 });
await browser.close();

// Sur un écran encre, le fond est la masse sombre et l'éclat la masse claire ; l'inverse en papier.
const encre = theme !== 'papier';
const fond = encre ? m.sombre : m.clair, eclat = encre ? m.clair : m.sombre;
// Un « éclat » supérieur à 5 % ne peut venir que d'un bloc inversé (panneau du thème opposé).
const inverse = eclat > 5;
const checks = [
  ['Fond dominant', fond, inverse ? '≥ 60 %' : '≥ 88 %', fond >= (inverse ? 60 : 88)],
  ['Trame (gris moyens)', m.moyen, '≤ 10 %', m.moyen <= 10],
  ['Éclat (ton opposé)', eclat, inverse ? '≤ 35 % (bloc inversé)' : '≤ 3 %', eclat <= (inverse ? 35 : 3)],
  ['Signal', m.signal, '≤ 1 %', m.signal <= 1],
  ['Vide (cellules de 24 px)', m.vide, '≥ 33 %', m.vide >= 33],
  ['Noir pur', m.noirPur, '= 0', m.noirPur < 0.01],
  ['Blanc pur', m.blancPur, '= 0', m.blancPur < 0.01],
];
if (args.includes('--json')) { console.log(JSON.stringify({ url, theme, width, height, ...m, ok: checks.every((c) => c[3]) }, null, 2)); }
else {
  console.log(`\n${url}\nthème ${theme} · ${width}×${height} · fond ${m.fond}\n`);
  for (const [name, v, rule, ok] of checks) console.log(`  ${ok ? 'ok  ' : 'HORS'} ${name.padEnd(26)} ${v.toFixed(2).padStart(6)} %   ${rule}`);
  if (inverse) console.log('\n  Bloc inversé détecté : vérifier qu\'il est unique sur la vue.');
  console.log('');
}
process.exit(checks.every((c) => c[3]) ? 0 : 1);
