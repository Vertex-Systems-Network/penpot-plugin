// Run: node src/e2e.test.mjs — writes designs/01-overview.json to a fake Penpot and checks batching, revn and pause.
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { writeDesign } from './render.mjs';

const calls = [];
const fake = http.createServer(async (req, res) => {
  let raw = ''; for await (const c of req) raw += c;
  const cmd = req.url.split('/').pop(); const body = JSON.parse(raw);
  calls.push({ cmd, body, auth: req.headers.authorization });
  const out = cmd === 'get-file' ? { name: 'F', revn: 7, vern: 0 } : {};
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
}).listen(0);
const apiUrl = `http://127.0.0.1:${fake.address().port}`;

const design = await readFile(new URL('../designs/01-overview.json', import.meta.url), 'utf8');
let checks = 0;
await writeDesign({ token: 't', fileId: 'f', apiUrl, design, batchSize: 10 }, () => {}, async () => { checks++; });
fake.close();

const ups = calls.filter((c) => c.cmd === 'update-file');
assert.ok(ups.length > 2, 'written in several batches');
assert.deepEqual(ups.map((u) => u.body.revn), ups.map((_, i) => 7 + i), 'revn advances per batch');
assert.equal(ups[0].body.changes[0].type, 'add-page');
assert.ok(calls.every((c) => c.auth === 'Token t'));
assert.ok(checks >= ups.length, 'pause/cancel checkpoint before every batch');
const ids = new Set(); for (const u of ups) for (const ch of u.body.changes) { if (ch.parentId && ch.parentId !== '00000000-0000-0000-0000-000000000000') assert.ok(ids.has(ch.parentId), 'parent written first'); ids.add(ch.id); }
console.log(`e2e ok: ${ids.size - 1} layers in ${ups.length} batches`);
