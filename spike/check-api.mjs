#!/usr/bin/env node
// Spike: answers three questions before the real plugin is built.
//  1. Does design.penpot.app accept access-token API calls (or does Cloudflare block them)?
//  2. Does text created through the API render without editor-computed position data?
//  3. Does a board created with flex layout get laid out by the editor, or keep our raw x/y?
// Used by the UI (spike/ui/server.mjs) and from a terminal:
//   PENPOT_TOKEN=... PENPOT_FILE_ID=... node spike/check-api.mjs
// Zero dependencies: Node 18+ (global fetch, crypto.randomUUID).

import { pathToFileURL } from 'node:url';

const ROOT = '00000000-0000-0000-0000-000000000000';
const id = () => crypto.randomUUID();

const geom = (x, y, w, h) => ({
  x, y, width: w, height: h,
  selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x + w, y2: y + h },
  points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }],
  transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
  transformInverse: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
});

const fill = (c) => [{ fillColor: c, fillOpacity: 1 }];

function text(parent, pageId, chars, x, y) {
  const t = { text: chars, fills: fill('#0B1A3D'), fontId: 'gfont-plus-jakarta-sans', fontFamily: 'Plus Jakarta Sans', fontSize: '16', fontWeight: '600', fontStyle: 'normal', lineHeight: '1.4', letterSpacing: '0' };
  const sid = id();
  return {
    type: 'add-obj', id: sid, pageId, parentId: parent, frameId: parent,
    obj: {
      id: sid, type: 'text', name: chars, parentId: parent, frameId: parent, growType: 'auto-width',
      content: { type: 'root', children: [{ type: 'paragraph-set', children: [{ type: 'paragraph', children: [t] }] }] },
      ...geom(x, y, 160, 22),
    },
  };
}

function rect(parent, pageId, name, color, x, y) {
  const sid = id();
  return { type: 'add-obj', id: sid, pageId, parentId: parent, frameId: parent, obj: { id: sid, type: 'rect', name, parentId: parent, frameId: parent, fills: fill(color), r1: 10, r2: 10, r3: 10, r4: 10, ...geom(x, y, 200, 40) } };
}

// Runs the spike. `log(line)` receives progress lines. Throws on failure.
// `checkpoint()` is awaited between steps: it can wait (pause) or throw (cancel). A single API write is never interrupted.
export async function runSpike({ token, fileId, apiUrl = 'https://design.penpot.app' }, log = console.log, checkpoint = async () => {}) {
  if (!token || !fileId) throw new Error('Access token and file id are both required.');
  const api = apiUrl.replace(/\/$/, '') + '/api/rpc/command/';

  async function rpc(cmd, body) {
    const res = await fetch(api + cmd, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    if (!res.ok) {
      const hint = res.status === 403 && /cloudflare|cf-ray|<html/i.test(raw) ? ' (looks like Cloudflare blocked the request; a self-hosted Penpot will be needed)' : '';
      throw new Error(`${cmd} failed with HTTP ${res.status}${hint}: ${raw.slice(0, 200)}`);
    }
    return JSON.parse(raw);
  }

  // Progress lines: "@@<percent>|<what is being worked on>". The UI turns them into a progress bar.
  const progress = async (pct, label) => { await checkpoint(); log(`@@${pct}|${label}`); };

  await progress(5, 'Checking API access');
  log('1. Checking API access');
  const profile = await rpc('get-profile', {});
  log(`   Signed in as ${profile.email || profile.fullname || profile.id}`);

  await progress(25, 'Reading the file');
  const file = await rpc('get-file', { id: fileId });
  const pageId = id();
  const board = id();
  // Children are placed at 0,0 on purpose: if the editor applies flex layout they will appear stacked.
  const changes = [
    { type: 'add-page', id: pageId, name: 'API spike' },
    {
      type: 'add-obj', id: board, pageId, parentId: ROOT, frameId: ROOT,
      obj: {
        id: board, type: 'frame', name: 'Spike board (flex column)', parentId: ROOT, frameId: ROOT, shapes: [],
        fills: fill('#F3F6FC'), r1: 14, r2: 14, r3: 14, r4: 14,
        layout: 'flex', layoutFlexDir: 'column', layoutGap: { rowGap: 12, columnGap: 12 },
        layoutPadding: { p1: 24, p2: 24, p3: 24, p4: 24 }, layoutPaddingType: 'multiple',
        layoutAlignItems: 'start', layoutJustifyContent: 'start', layoutWrapType: 'nowrap',
        ...geom(0, 0, 400, 120),
      },
    },
    text(board, pageId, 'Text made by the API', 0, 0),
    rect(board, pageId, 'Orange block', '#EC7D1A', 0, 0),
    rect(board, pageId, 'Indigo block', '#1F48A6', 0, 0),
  ];

  for (const [i, c] of changes.entries()) await progress(35 + Math.round((i / changes.length) * 40), `Preparing: ${c.obj?.name || c.name}`);

  await progress(80, `Writing ${changes.length} items into "${file.name}"`);
  log(`2. Writing the "API spike" page into "${file.name}"`);
  await rpc('update-file', { id: fileId, sessionId: id(), revn: file.revn, vern: file.vern ?? 0, changes });
  log('@@100|Done');
  log('   Done. Open the "API spike" page in Penpot and answer the three questions.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSpike({ token: process.env.PENPOT_TOKEN, fileId: process.env.PENPOT_FILE_ID, apiUrl: process.env.PENPOT_API_URL },
    (line) => { const p = line.match(/^@@(\d+)\|(.*)$/); console.log(p ? `[${p[1].padStart(3)}%] ${p[2]}` : line); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
