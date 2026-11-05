// Writes a screen described as a JSON tree into a Penpot file through the backend API,
// in batches, so no browser tab has to stay open. The editor lays out flex boards itself.
//
// Tree nodes (sizes in px; colours as #RRGGBB):
//   { type:'board', name, w, h, fill, radius, stroke, x, y,
//     layout:{ dir:'column'|'row', gap, pad:[t,r,b,l], align:'start'|'center'|'end'|'stretch', justify:'start'|'center'|'end'|'space-between' },
//     sizing:{ w:'fix'|'fill'|'auto', h:'fix'|'fill'|'auto' }, clip:false, children:[...] }
//   { type:'text', name, text, size, weight, color, font:'body'|'heading'|'mono', sizing:{w,h} }
//   { type:'rect', name, w, h, fill, radius, stroke, sizing:{w,h} }
// A file holds { page:'Page name', boards:[board, ...] }; top-level boards are placed left to right.

const ROOT = '00000000-0000-0000-0000-000000000000';
const ID = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
const FONTS = {
  body: { fontId: 'gfont-plus-jakarta-sans', fontFamily: 'Plus Jakarta Sans' },
  heading: { fontId: 'gfont-bricolage-grotesque', fontFamily: 'Bricolage Grotesque' },
  mono: { fontId: 'gfont-jetbrains-mono', fontFamily: 'JetBrains Mono' },
};

const geom = (x, y, w, h) => ({
  x, y, width: w, height: h,
  selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x + w, y2: y + h },
  points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }],
  transform: ID, transformInverse: ID,
});
const fills = (c) => (c ? [{ fillColor: c, fillOpacity: 1 }] : []);
const strokes = (s) => (s ? [{ strokeColor: s.color || s, strokeOpacity: 1, strokeWidth: s.width || 1, strokeAlignment: 'inner', strokeStyle: 'solid' }] : []);
const radius = (r = 0) => ({ r1: r, r2: r, r3: r, r4: r });
const sizing = (n) => ({ layoutItemHSizing: n.sizing?.w || 'fix', layoutItemVSizing: n.sizing?.h || 'fix' });

// Turns the tree into Penpot `add-obj` changes, parents before children.
export function treeToChanges(doc, pageId, newId = () => crypto.randomUUID()) {
  if (!doc || !Array.isArray(doc.boards)) throw new Error('The design file needs a "boards" list.');
  const out = [];
  const add = (n, parentId, frameId, x, y, inFlex) => {
    if (!['board', 'text', 'rect'].includes(n.type)) throw new Error(`Unknown node type "${n.type}" in "${n.name || '?'}".`);
    const sid = newId();
    const name = n.name || n.text || n.type;
    const base = { id: sid, name, parentId, frameId, ...(inFlex ? sizing(n) : {}) };
    let obj;
    if (n.type === 'text') {
      const leaf = { text: String(n.text ?? ''), fills: fills(n.color || '#0B1A3D'), ...(FONTS[n.font] || FONTS.body),
        fontSize: String(n.size || 14), fontWeight: String(n.weight || 400), fontStyle: 'normal', lineHeight: String(n.lineHeight || 1.4), letterSpacing: '0' };
      obj = { ...base, type: 'text', growType: n.sizing?.w === 'fill' ? 'auto-height' : 'auto-width',
        content: { type: 'root', children: [{ type: 'paragraph-set', children: [{ type: 'paragraph', children: [leaf] }] }] },
        ...geom(x, y, n.w || 100, n.h || Math.round((n.size || 14) * 1.4)) };
    } else if (n.type === 'rect') {
      obj = { ...base, type: 'rect', fills: fills(n.fill), strokes: strokes(n.stroke), ...radius(n.radius), ...geom(x, y, n.w || 100, n.h || 40) };
    } else {
      const l = n.layout;
      obj = { ...base, type: 'frame', shapes: [], fills: fills(n.fill), strokes: strokes(n.stroke), ...radius(n.radius),
        showContent: n.clip !== true, ...geom(x, y, n.w || 400, n.h || 100) };
      if (l) {
        const [t, r, b, lft] = l.pad ?? [0, 0, 0, 0];
        Object.assign(obj, { layout: 'flex', layoutFlexDir: l.dir || 'column', layoutGap: { rowGap: l.gap || 0, columnGap: l.gap || 0 },
          layoutPadding: { p1: t, p2: r, p3: b, p4: lft }, layoutPaddingType: 'multiple',
          layoutAlignItems: l.align || 'start', layoutJustifyContent: l.justify || 'start', layoutWrapType: 'nowrap',
          // A flex board's own fit-content lives in its layout-item sizing; default: fixed width, height fits content.
          layoutItemHSizing: n.sizing?.w || 'fix', layoutItemVSizing: n.sizing?.h || 'auto' });
      }
    }
    out.push({ type: 'add-obj', id: sid, pageId, parentId, frameId, obj });
    // The editor stacks flex children last-added first (spike 1), so flex children are sent in reverse.
    const kids = n.children || [];
    if (kids.length && n.type !== 'board') throw new Error(`Only boards can have children ("${name}").`);
    for (const k of n.layout ? [...kids].reverse() : kids) add(k, sid, sid, k.x ?? 0, k.y ?? 0, !!n.layout);
  };
  let x = 0;
  for (const b of doc.boards) { add(b, ROOT, ROOT, b.x ?? x, b.y ?? 0, false); x = (b.x ?? x) + (b.w || 400) + 120; }
  return out;
}

// Writes the design. `log` gets lines ("@@pct|label" for progress); `checkpoint` is awaited between batches (pause/cancel).
export async function writeDesign({ token, fileId, apiUrl = 'http://localhost:9001', design, batchSize = 40 }, log = console.log, checkpoint = async () => {}) {
  if (!token || !fileId) throw new Error('Access token and file id are both required.');
  const doc = typeof design === 'string' ? JSON.parse(design) : design;
  const api = apiUrl.replace(/\/$/, '') + '/api/rpc/command/';
  const rpc = async (cmd, body) => {
    const res = await fetch(api + cmd, { method: 'POST', body: JSON.stringify(body),
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' } });
    const raw = await res.text();
    if (!res.ok) throw new Error(`${cmd} failed with HTTP ${res.status}: ${raw.slice(0, 300)}`);
    return raw ? JSON.parse(raw) : {};
  };
  const step = async (pct, label) => { await checkpoint(); log(`@@${pct}|${label}`); };

  await step(2, 'Checking API access');
  await rpc('get-profile', {});
  await step(5, 'Reading the file');
  let file = await rpc('get-file', { id: fileId });
  const pageId = crypto.randomUUID();
  const pageName = doc.page || 'Design';
  const changes = treeToChanges(doc, pageId);
  const batches = [[{ type: 'add-page', id: pageId, name: pageName }]];
  for (let i = 0; i < changes.length; i += batchSize) batches.push(changes.slice(i, i + batchSize));
  log(`Writing ${changes.length} layers to page "${pageName}" in "${file.name}", ${batches.length} steps`);

  let { revn, vern = 0 } = file;
  const sessionId = crypto.randomUUID();
  for (const [i, batch] of batches.entries()) {
    const last = batch.at(-1);
    await step(5 + Math.round((i / batches.length) * 93), i === 0 ? `Creating page "${pageName}"` : `Writing ${last.obj.name} (${i}/${batches.length - 1})`);
    try {
      await rpc('update-file', { id: fileId, sessionId, revn, vern, changes: batch });
    } catch (e) {
      // Someone else edited the file meanwhile: re-read its revision once and retry this batch.
      if (!/revn|conflict|HTTP 409|HTTP 400/i.test(e.message)) throw e;
      file = await rpc('get-file', { id: fileId }); ({ revn, vern = 0 } = file);
      await rpc('update-file', { id: fileId, sessionId, revn, vern, changes: batch });
    }
    revn += 1;
  }
  log('@@100|Done');
  log(`Done. Open the "${pageName}" page in Penpot.`);
}

// Terminal use (lets Claude run it on your computer): node src/render.mjs <design.json> <file-id>
// The token is read from PENPOT_TOKEN or from the file .penpot-token next to this repo's README (never committed).
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { readFile } = await import('node:fs/promises');
  const [designPath, fileId] = process.argv.slice(2);
  const token = process.env.PENPOT_TOKEN || (await readFile(new URL('../.penpot-token', import.meta.url), 'utf8').catch(() => '')).trim();
  writeDesign({ token, fileId, apiUrl: process.env.PENPOT_API_URL, design: await readFile(designPath, 'utf8') },
    (l) => { const p = l.match(/^@@(\d+)\|(.*)$/); console.log(p ? `[${p[1].padStart(3)}%] ${p[2]}` : l); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
