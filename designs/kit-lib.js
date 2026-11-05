// Penpot kit helpers, run inside the Penpot MCP plugin. Paste the body into execute_code once per plugin session:
// they live in `storage` and read the kit (shell, group card, one row per control) from the file's plugin data `wpekit`.
storage.kit = JSON.parse(penpot.currentFile.getPluginData('wpekit'));
const C = (o) => JSON.parse(JSON.stringify(o));
const walk = (o, fn) => { fn(o); (o.kids || []).forEach((k) => walk(k, fn)); };
const find = (o, p) => { if (p(o)) return o; for (const k of o.kids || []) { const r = find(k, p); if (r) return r; } };
const texts = (o) => { const t = []; walk(o, (x) => { if (x.type === 'text') t.push(x); }); return t; };

// Serialise a live shape to JSON (styles, sizes, flex), so it can be rebuilt on any page.
storage.ser = function ser(s) {
  const o = { type: s.type, name: s.name, w: s.width, h: s.height, x: s.x - (s.parent?.x || 0), y: s.y - (s.parent?.y || 0), fills: s.fills, strokes: s.strokes, opacity: s.opacity, shadows: s.shadows,
    r: [s.borderRadiusTopLeft, s.borderRadiusTopRight, s.borderRadiusBottomRight, s.borderRadiusBottomLeft], hidden: s.hidden };
  if (s.layoutChild) o.lc = { h: s.layoutChild.horizontalSizing, v: s.layoutChild.verticalSizing, abs: s.layoutChild.absolute };
  if (s.type === 'text') Object.assign(o, { chars: s.characters, font: [s.fontId, s.fontFamily, s.fontVariantId, s.fontSize, s.fontWeight, s.fontStyle, s.lineHeight, s.letterSpacing, s.textTransform, s.align, s.verticalAlign, s.textDecoration], grow: s.growType });
  else if (s.type === 'path' || s.type === 'bool') o.d = s.d ?? s.content;
  else if (s.type === 'board' || s.type === 'group') {
    o.clip = s.clipContent;
    const f = s.flex; if (f) o.flex = [f.dir, f.rowGap, f.columnGap, f.topPadding, f.rightPadding, f.bottomPadding, f.leftPadding, f.alignItems, f.justifyContent, f.wrap, f.horizontalSizing, f.verticalSizing, f.alignContent];
    o.kids = (s.children || []).map(ser);
  }
  return o;
};

// Rebuild serialised JSON on the current page.
storage.de = function de(o, parent) {
  let s;
  if (o.type === 'text') { s = penpot.createText(o.chars || ' '); const keys = ['fontId', 'fontFamily', 'fontVariantId', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'align', 'verticalAlign', 'textDecoration']; keys.forEach((k, i) => { const v = o.font[i]; if (v != null && v !== 'mixed') try { s[k] = v; } catch {} }); s.growType = o.grow; if (o.grow !== 'auto-width') s.resize(o.w, o.h); }
  else if (o.type === 'path' || o.type === 'bool') { s = penpot.createPath(); try { s.content = o.d; } catch { try { s.d = o.d; } catch {} } }
  else if (o.type === 'rect') { s = penpot.createRectangle(); s.resize(o.w, o.h); }
  else if (o.type === 'ellipse') { s = penpot.createEllipse(); s.resize(o.w, o.h); }
  else { s = penpot.createBoard(); s.resize(o.w, o.h); s.clipContent = !!o.clip; }
  s.name = o.name; if (o.fills) s.fills = o.fills; if (o.strokes?.length) s.strokes = o.strokes; if (o.shadows?.length) s.shadows = o.shadows;
  if (o.opacity != null) s.opacity = o.opacity; if (o.hidden) s.hidden = true;
  if (o.type !== 'text' && o.r) { const [a, b, c, d] = o.r; if (a) s.borderRadiusTopLeft = a; if (b) s.borderRadiusTopRight = b; if (c) s.borderRadiusBottomRight = c; if (d) s.borderRadiusBottomLeft = d; }
  if (parent) { parent.appendChild(s); if (!parent.flex || o.lc?.abs) { s.parentX = o.x; s.parentY = o.y; } }
  if (o.flex) { const [dir, rg, cg, t, r, b, l, ai, jc, wr, hs, vs, ac] = o.flex; const f = s.addFlexLayout(); Object.assign(f, { dir, rowGap: rg, columnGap: cg, topPadding: t, rightPadding: r, bottomPadding: b, leftPadding: l, alignItems: ai, justifyContent: jc, wrap: wr }); if (ac) f.alignContent = ac; f.horizontalSizing = hs; f.verticalSizing = vs; }
  for (const k of o.kids || []) de(k, s);
  if (parent && s.layoutChild && o.lc) { s.layoutChild.horizontalSizing = o.lc.h; s.layoutChild.verticalSizing = o.lc.v; if (o.lc.abs) s.layoutChild.absolute = true; }
  return s;
};

// Row: [kind, label, help, values, active]; kinds are the keys of kit.rows (see designs/admin-columns.mjs).
storage.mkRow = function (spec, last) {
  let [kind, label, desc, vals = [], on] = spec;
  const r = C(storage.kit.rows[kind]); const opt = r.kids[0]; opt.name = 'Option / ' + label;
  const ctl = find(opt, (o) => o.name === 'ctl');
  const list = ctl && find(ctl, (o) => ['checks', 'chips', 'Segmented'].includes(o.name));
  if (list && vals.length && list.kids.length > vals.length && !kind.startsWith('chips')) list.kids = list.kids.slice(0, kind === 'seg3lock' ? 3 : vals.length);
  if (kind === 'checks4' && list) while (list.kids.length < vals.length) list.kids.push(C(list.kids[list.kids.length - 1]));
  if (kind.startsWith('chips')) { on = Array.isArray(on) ? on : []; const tOn = find(storage.kit.rows.chips4, (o) => o.name === 'Pill option / on'), tOff = find(storage.kit.rows.chips4, (o) => o.name === 'Pill option'); list.kids = vals.map((v, i) => { const n = C(on.includes(i) ? tOn : tOff); find(n, (o) => o.type === 'text').chars = v; return n; }); }
  texts(opt).forEach((t, i) => { const v = [label, desc, ...(kind.startsWith('chips') ? [] : vals)][i]; if (v != null) t.chars = v; });
  if (kind.startsWith('seg') && on != null) list.kids.forEach((s, i) => { const a = i === on; s.fills = a ? [{ fillColor: '#FFFFFF', fillOpacity: 1 }] : []; const t = s.kids.find((k) => k.type === 'text'); t.fills = [{ fillColor: a ? '#1F48A6' : '#33405C', fillOpacity: 1 }]; });
  if (last) r.kids = r.kids.filter((k) => k.name !== 'border');
  return r;
};
// Group: [title, tier, key, rows]. Extra JSON nodes (e.g. a table) can be passed as rows of kind 'raw': ['raw', jsonNode].
storage.mkGroup = function ([title, tier, key, rows]) {
  const g = C(storage.kit.group); g.name = 'Group / ' + title;
  const t = texts(g.kids[0]); [title, String(rows.length), tier, key, 'Collapse'].forEach((v, i) => { if (t[i]) t[i].chars = v; });
  g.kids = [g.kids[0], g.kids[1], ...rows.map((r, i) => (r[0] === 'raw' ? r[1] : storage.mkRow(r, i === rows.length - 1)))];
  return g;
};
storage.addGroup = (sectionsId, spec) => storage.de(storage.mkGroup(spec), penpot.currentPage.getShapeById(sectionsId)).id;
// Screen shell: breadcrumb, page header, left section nav (strings = headings, [label, count, active] = links).
storage.mkBoard = function (name, crumbs, title, desc, nav, x) {
  const K = storage.kit; const b = C(K.shell); b.name = name;
  const wrap = b.kids.find((k) => k.name === 'wrap.wpe-ui');
  const bc = wrap.kids.find((k) => k.name === 'Breadcrumb'); const sep = bc.kids[1], item = bc.kids[0], cur = bc.kids[bc.kids.length - 1];
  bc.kids = []; crumbs.forEach((c, i) => { const last = i === crumbs.length - 1; const t = C(last ? cur : item); t.chars = c; bc.kids.push(t); if (!last) bc.kids.push(C(sep)); });
  const ht = texts(wrap.kids.find((k) => k.name === 'Page header')); ht[0].chars = title; ht[1].chars = desc;
  const ed = wrap.kids.find((k) => k.name === 'Editor layout'); const nv = ed.kids.find((k) => k.name === 'Section nav');
  nv.kids = []; nav.forEach((it, i) => {
    if (typeof it === 'string') { if (i) nv.kids.push(C(K.navGap)); const h = C(K.navHead); h.chars = it; nv.kids.push(h); return; }
    const [label, count, on] = it; const l = C(on ? K.navOn : K.navOff); const tx = texts(l); tx[0].chars = label; tx[1].chars = String(count); nv.kids.push(l);
  });
  const s = storage.de(b, null); s.x = x; s.y = 0;
  const sec = s.children.find((k) => k.name === 'wrap.wpe-ui').children.find((k) => k.name === 'Editor layout').children.find((k) => k.name === 'Sections');
  return { board: s.id, sections: sec.id };
};
// Fit a screen board to its content after groups are added.
storage.fitF5 = (c) => { const wrap = c.children.find((x) => x.name === 'wrap.wpe-ui'), menu = c.children.find((x) => x.name === 'WP admin menu'); const h = Math.ceil(wrap.height); menu.resize(menu.width, h); c.resize(c.width, 32 + h); };
// Make lock notices grow with their text.
storage.fixNotices = (bid) => { (function w(s) { if (s.name === 'Notice / lock') { if (s.flex) s.flex.verticalSizing = 'auto'; if (s.layoutChild) s.layoutChild.verticalSizing = 'auto'; for (const k of s.children) if (k.type === 'text') { k.growType = 'auto-height'; if (k.layoutChild) k.layoutChild.horizontalSizing = 'fill'; } return; } (s.children || []).forEach(w); })(penpot.currentPage.getShapeById(bid)); };
return Object.keys(storage);
