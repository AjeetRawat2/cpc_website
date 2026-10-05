import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'Content-Type':'application/json; charset=utf-8' }); return res.end(JSON.stringify({ error:'Forms are handled by Google Forms.' })); }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method not allowed'); }
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const path = normalize(join(root, requested)); if (!path.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    const content = await readFile(path); res.writeHead(200, { 'Content-Type':mime[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff' }); if (req.method === 'HEAD') return res.end(); res.end(content);
  } catch (error) { if (error.code === 'ENOENT') { res.writeHead(404); return res.end('Not found'); } res.writeHead(500); res.end('Internal server error'); }
});
const requestedPort = Number(process.env.PORT || 4173);
function listen(port) {
  server.once('error', (error) => { if (error.code === 'EADDRINUSE' && !process.env.PORT) return listen(port + 1); console.error(`Could not start the Campus Pulse Club server: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '0.0.0.0', () => console.log(`Campus Pulse Club running at http://localhost:${port}`));
}
listen(requestedPort);
