#!/usr/bin/env node
// Rendu de la présentation animée : docs/video/presentation.html → docs/video/mono-presentation.mp4
//
// La page expose MONO_FILM.seek(t) : on avance image par image (30 i/s), on capture, et ffmpeg
// assemble. Rien n'est enregistré en temps réel : le rendu est régulier et identique d'une fois
// sur l'autre. Aucune image intermédiaire n'est écrite dans le dépôt.
//
// Usage :
//   node scripts/render-video.mjs                      vidéo H.264 (et WebM avec --webm)
//   node scripts/render-video.mjs --stills 3,12.5 --dir /tmp/images    images fixes, sans vidéo
//   node scripts/render-video.mjs --audit 30,38,47     masses tonales de quelques instants (vue 1280 × 720)
// Options : --out <fichier.mp4>  --from <s>  --to <s>  --webm
// Requiert Playwright et ffmpeg (FFMPEG=/chemin/vers/ffmpeg pour un autre binaire).
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const has = (name) => args.includes('--' + name);
const out = resolve(opt('out', join(root, 'docs/video/mono-presentation.mp4')));
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright est introuvable.'); process.exit(2); }

// Petit serveur de fichiers, le temps du rendu (les polices et les feuilles importées demandent http).
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(join(root, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/docs/video/presentation.html?render`;

const browser = await chromium.launch();
const audit = opt('audit');
// La vue de composition est 1280 × 720 ; rendue à 1,5 ×, elle donne 1920 × 1080 sans rien recomposer.
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: audit ? 1 : 1.5 });
page.on('pageerror', (e) => { console.error('Erreur dans la page :', e.message); process.exitCode = 1; });
await page.goto(base);
const { DURATION, FPS } = await page.evaluate(async () => { await window.MONO_FILM.ready; return { DURATION: MONO_FILM.DURATION, FPS: MONO_FILM.FPS }; });
const seek = (t) => page.evaluate((t) => window.MONO_FILM.seek(t), t);
const shot = () => page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });

try {
  if (audit) {
    // Même mesure que scripts/tonal-audit.mjs : part de signal, d'éclat, de gris moyens, et vide (cellules de 24 px).
    const probe = await browser.newPage();
    for (const t of audit.split(',').map(Number)) {
      await seek(t);
      const png = (await shot()).toString('base64');
      const m = await probe.evaluate(async (png) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, c.width, c.height);
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const lstar = (r, g, b) => { const y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y; };
        const n = c.width * c.height, k = { sombre: 0, moyen: 0, clair: 0, signal: 0 }, hist = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], key = (r << 16) | (g << 8) | b;
          hist.set(key, (hist.get(key) || 0) + 1);
          if (Math.max(r, g, b) - Math.min(r, g, b) > 48) { k.signal++; continue; }
          const L = lstar(r, g, b); if (L < 26) k.sombre++; else if (L <= 72) k.moyen++; else k.clair++;
        }
        const [bgKey] = [...hist.entries()].sort((a, b) => b[1] - a[1])[0], bg = [(bgKey >> 16) & 255, (bgKey >> 8) & 255, bgKey & 255];
        let empty = 0, cells = 0;
        for (let cy = 0; cy + 24 <= c.height; cy += 24) for (let cx = 0; cx + 24 <= c.width; cx += 24) {
          cells++; let ok = true;
          for (let y = cy; ok && y < cy + 24; y += 2) for (let x = cx; x < cx + 24; x += 2) { const i = (y * c.width + x) * 4; if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 12) { ok = false; break; } }
          if (ok) empty++;
        }
        const p = (v) => (100 * v / n).toFixed(2);
        return { signal: p(k.signal), clair: p(k.clair), moyen: p(k.moyen), sombre: p(k.sombre), vide: (100 * empty / cells).toFixed(1) };
      }, png);
      console.log(`t = ${String(t).padStart(5)} s   signal ${m.signal} %   clair ${m.clair} %   moyen ${m.moyen} %   sombre ${m.sombre} %   vide ${m.vide} %`);
    }
  } else if (opt('stills')) {
    const dir = resolve(opt('dir', '.'));
    await mkdir(dir, { recursive: true });
    for (const t of opt('stills').split(',').map(Number)) {
      await seek(t);
      const file = join(dir, `mono-${t.toFixed(2).padStart(6, '0')}s.png`);
      await writeFile(file, await shot());
      console.log(file);
    }
  } else {
    const from = +opt('from', 0), to = Math.min(DURATION, +opt('to', DURATION));
    const first = Math.round(from * FPS), last = Math.round(to * FPS);
    await mkdir(dirname(out), { recursive: true });
    const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
      '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg : code ' + c)))));
    const t0 = Date.now();
    for (let i = first; i < last; i++) {
      await seek(i / FPS);
      const buf = await shot();
      if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
      if (i % FPS === 0) process.stdout.write(`\r${(i / FPS).toFixed(0).padStart(3)} / ${to} s   (${((Date.now() - t0) / 1000).toFixed(0)} s écoulées)`);
    }
    ff.stdin.end(); await done;
    console.log(`\n${out}`);
    if (has('webm')) {
      const webm = out.replace(/\.mp4$/, '.webm');
      await new Promise((ok, ko) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-i', out, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', webm], { stdio: 'inherit' })
        .on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg (WebM) : code ' + c)))));
      console.log(webm);
    }
  }
} finally {
  await browser.close();
  server.close();
}
