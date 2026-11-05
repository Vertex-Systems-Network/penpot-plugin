#!/usr/bin/env node
// Spike: answers three questions before the real plugin is built.
//  1. Does design.penpot.app accept access-token API calls (or does Cloudflare block them)?
//  2. Does text created through the API render without editor-computed position data?
//  3. Does a board created with flex layout get laid out by the editor, or keep our raw x/y?
// Usage: PENPOT_TOKEN=... PENPOT_FILE_ID=... node spike/check-api.mjs
// Zero dependencies: Node 18+ (global fetch, crypto.randomUUID).

const API = (process.env.PENPOT_API_URL || 'https://design.penpot.app') + '/api/rpc/command/';
const TOKEN = process.env.PENPOT_TOKEN;
const FILE_ID = process.env.PENPOT_FILE_ID;
if (!TOKEN || !FILE_ID) {
  console.error('Set PENPOT_TOKEN (Settings > Access tokens) and PENPOT_FILE_ID.');
  process.exit(1);
}

const ROOT = '00000000-0000-0000-0000-000000000000';
const id = () => crypto.randomUUID();

async function rpc(cmd, body) {
  const res = await fetch(API + cmd, {
    method: 'POST',
    headers: { Authorization: `Token ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${cmd} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

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

console.log('1. Checking API access ...');
const profile = await rpc('get-profile', {});
console.log(`   OK, signed in as ${profile.email || profile.fullname || profile.id}`);

const file = await rpc('get-file', { id: FILE_ID });
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

console.log('2. Writing the spike page ...');
await rpc('update-file', { id: FILE_ID, sessionId: id(), revn: file.revn, vern: file.vern ?? 0, changes });
console.log('   OK, page "API spike" created.\n');
console.log('Now open the file in Penpot, go to the "API spike" page, and report:');
console.log('  a) Is the text "Text made by the API" visible?');
console.log('  b) Are the text and two blocks stacked with gaps (flex applied), or piled on top of each other at the corner?');
console.log('  c) Does the board grow to fit, or stay 400 x 120?');
