#!/usr/bin/env node
// Local UI for the API spike: serves a form on http://127.0.0.1:4410 and runs the spike from Node,
// because a browser page cannot call the Penpot API directly (CORS).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { runSpike } from '../check-api.mjs';

const PORT = Number(process.env.PORT) || 4410;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const page = await readFile(new URL('./index.html', import.meta.url));

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(page);
  }
  if (req.method === 'POST' && req.url === '/run') {
    // Only this page may trigger a run: stops other websites from posting to the local server.
    if (req.headers.origin !== ORIGIN) { res.writeHead(403); return res.end('Forbidden'); }
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 10_000) { res.writeHead(413); return res.end(); } }
    let input;
    try { input = JSON.parse(body); } catch { res.writeHead(400); return res.end('Bad request'); }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    try {
      await runSpike({ token: String(input.token || '').trim(), fileId: String(input.fileId || '').trim(), apiUrl: String(input.apiUrl || '').trim() || undefined }, (line) => res.write(line + '\n'));
      res.end('OK\n');
    } catch (e) {
      res.end('ERROR: ' + e.message + '\n');
    }
    return;
  }
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Penpot API spike is running at ${ORIGIN}`);
  console.log('Keep this window open while you use it. Close it to stop.');
  const opener = process.platform === 'win32' ? `start "" "${ORIGIN}"` : process.platform === 'darwin' ? `open "${ORIGIN}"` : `xdg-open "${ORIGIN}"`;
  exec(opener, () => {});
});
