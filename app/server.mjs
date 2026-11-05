#!/usr/bin/env node
// Design Writer: serves a page on http://127.0.0.1:4410 and writes designs into Penpot from Node,
// because a browser page cannot call the Penpot API directly (CORS).
// One job at a time, which can be paused, resumed, cancelled, scheduled for later and rescheduled.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { writeDesign } from '../src/render.mjs';

const PORT = Number(process.env.PORT) || 4410;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const page = await readFile(new URL('./index.html', import.meta.url));

class Cancelled extends Error {}

// status: idle | scheduled | running | paused | done | failed | cancelled
// The token lives only in memory, and only until the job ends.
let job = { status: 'idle', pct: 0, label: '', log: [], at: null };
let input = null;
let timer = null;
let resumeWaiter = null;

const publicJob = () => ({ status: job.status, pct: job.pct, label: job.label, log: job.log, at: job.at });

function onLine(line) {
  const p = line.match(/^@@(\d+)\|(.*)$/);
  if (p) { job.pct = +p[1]; job.label = p[2]; } else job.log.push(line);
}

async function checkpoint() {
  if (job.status === 'cancelled') throw new Cancelled();
  while (job.status === 'paused') await new Promise((r) => (resumeWaiter = r));
  if (job.status === 'cancelled') throw new Cancelled();
}

async function start() {
  timer = null;
  job = { status: 'running', pct: 0, label: 'Starting', log: [], at: null };
  try {
    await writeDesign(input, onLine, checkpoint);
    job.status = 'done';
  } catch (e) {
    if (e instanceof Cancelled) { job.status = 'cancelled'; job.label = `Cancelled at ${job.pct}%`; }
    else { job.status = 'failed'; job.log.push('ERROR: ' + e.message); job.label = `Stopped at ${job.pct}%`; }
  } finally {
    input = null;
  }
}

function schedule(at) {
  clearTimeout(timer);
  const ms = new Date(at).getTime() - Date.now();
  if (!Number.isFinite(ms)) throw new Error('Invalid time.');
  job = { status: 'scheduled', pct: 0, label: 'Waiting for its time', log: [], at: new Date(at).toISOString() };
  // setTimeout caps at about 24.8 days; plenty for "later today" or "tomorrow".
  timer = setTimeout(start, Math.max(0, Math.min(ms, 2 ** 31 - 1)));
}

const busy = () => ['running', 'paused'].includes(job.status);

const actions = {
  async run(body) {
    if (busy()) throw new Error('A job is already running.');
    if (typeof body.design !== 'string' || !body.design.trim()) throw new Error('Choose a design file first.');
    try { JSON.parse(body.design); } catch { throw new Error('The design file is not valid JSON.'); }
    input = { token: String(body.token || '').trim(), fileId: String(body.fileId || '').trim(), apiUrl: String(body.apiUrl || '').trim() || undefined, design: body.design };
    if (body.at) schedule(body.at); else start();
  },
  async pause() { if (job.status === 'running') { job.status = 'paused'; job.label = `Paused at ${job.pct}%, after the current step`; } },
  async resume() { if (job.status === 'paused') { job.status = 'running'; resumeWaiter?.(); } },
  async cancel() {
    if (job.status === 'scheduled') { clearTimeout(timer); input = null; job.status = 'cancelled'; job.label = 'Scheduled run cancelled'; }
    else if (busy()) { job.status = 'cancelled'; resumeWaiter?.(); }
  },
  async reschedule(body) { if (job.status !== 'scheduled') throw new Error('Only a scheduled run can be rescheduled.'); schedule(body.at); },
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(page);
  }
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(publicJob()));
  }
  const action = req.method === 'POST' && actions[req.url.slice(1)];
  if (action) {
    // Only this page may control jobs: stops other websites from posting to the local server.
    if (req.headers.origin !== ORIGIN) { res.writeHead(403); return res.end('Forbidden'); }
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 5_000_000) { res.writeHead(413); return res.end(); } }
    try {
      await action(raw ? JSON.parse(raw) : {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(publicJob()));
    } catch (e) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Design Writer is running at ${ORIGIN}`);
  console.log('Keep this window open while you use it (and until a scheduled run has finished). Close it to stop.');
  const opener = process.platform === 'win32' ? `start "" "${ORIGIN}"` : process.platform === 'darwin' ? `open "${ORIGIN}"` : `xdg-open "${ORIGIN}"`;
  exec(opener, () => {});
});
