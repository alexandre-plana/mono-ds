// Serveur local du catalogue : node scripts/serve.mjs [port]   (8080 par défaut)
// Aucune dépendance. Il interdit au navigateur de garder les fichiers en cache : pendant qu'on
// travaille, une feuille de style périmée à côté d'un script à jour donne des écrans faux.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let path = resolve(join(root, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end('Interdit'); return; }
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': TYPES[extname(path).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}).listen(port, () => console.log(`MONO — http://localhost:${port}/catalogue/`))
  .on('error', (error) => { console.error(`Impossible d'écouter sur le port ${port} (${error.message}).`); process.exitCode = 1; });
