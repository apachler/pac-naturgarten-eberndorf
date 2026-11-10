// Minimaler statischer Server für die Browser-Tests (wie GitHub Pages: Dateien aus dem Repo).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const typen = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.yaml': 'text/yaml; charset=utf-8', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

createServer(async (req, res) => {
  try {
    let pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pfad.endsWith('/')) pfad += 'index.html';
    const datei = normalize(join(root, pfad));
    if (!datei.startsWith(root)) throw new Error('außerhalb');
    if (!(await stat(datei)).isFile()) throw new Error('kein File');
    res.writeHead(200, { 'content-type': typen[extname(datei)] || 'application/octet-stream' });
    res.end(await readFile(datei));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404');
  }
}).listen(port, () => console.log(`Beetplaner auf http://localhost:${port}`));
