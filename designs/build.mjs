// Builds the design files in this folder. Run: node designs/build.mjs
// Colours and fonts are WPEssential's tokens (admin-ui/src/ui/_tokens.scss).
import { writeFile } from 'node:fs/promises';

const C = { ink: '#0B1A3D', orange: '#EC7D1A', indigo: '#1F48A6', blue: '#2F6BE0', surface: '#F3F6FC', surface2: '#E8EEF8',
  line: '#DDE4F0', muted: '#5D6780', text2: '#33405C', white: '#FFFFFF', success: '#1E9E62', successTint: '#E3F5EC' };

const T = (text, o = {}) => ({ type: 'text', text, size: 14, color: C.text2, ...o });
const box = (name, layout, children, o = {}) => ({ type: 'board', name, layout, children, ...o });
const row = (gap = 12, o = {}) => ({ dir: 'row', gap, align: 'center', ...o });
const col = (gap = 12, o = {}) => ({ dir: 'column', gap, ...o });
const fillW = { w: 'fill', h: 'auto' };

const btn = (label, primary) => box(`Button / ${label}`, row(8, { pad: [10, 16, 10, 16] }),
  [T(label, { weight: 600, color: primary ? C.white : C.ink })],
  { fill: primary ? C.orange : C.white, stroke: primary ? null : C.line, radius: 8, sizing: { w: 'auto', h: 'auto' } });

const stat = (label, value, note) => box(`Stat / ${label}`, col(6, { pad: [20, 20, 20, 20] }), [
  T(label, { color: C.muted, size: 13, weight: 500 }),
  T(value, { font: 'heading', size: 30, weight: 700, color: C.ink }),
  T(note, { color: C.muted, size: 12 }),
], { fill: C.white, stroke: C.line, radius: 12, sizing: fillW });

const navItem = (label, active) => box(`Nav / ${label}`, row(10, { pad: [9, 12, 9, 12] }),
  [T(label, { weight: active ? 600 : 500, color: active ? C.white : '#C9D3EA' })],
  { fill: active ? C.indigo : null, radius: 8, sizing: fillW });

const moduleRow = (name, desc, on) => box(`Module / ${name}`, row(16, { pad: [16, 20, 16, 20], justify: 'space-between' }), [
  box('Text', col(4), [T(name, { weight: 600, color: C.ink }), T(desc, { size: 13, color: C.muted })], { sizing: { w: 'auto', h: 'auto' } }),
  box(`Badge / ${on ? 'Active' : 'Off'}`, row(0, { pad: [4, 10, 4, 10] }), [T(on ? 'Active' : 'Off', { size: 12, weight: 600, color: on ? C.success : C.muted })],
    { fill: on ? C.successTint : C.surface2, radius: 999, sizing: { w: 'auto', h: 'auto' } }),
], { fill: C.white, stroke: C.line, radius: 10, sizing: fillW });

const overview = {
  page: '01 · Overview (writer)',
  boards: [box('Overview / Desktop 1440', row(0, { align: 'stretch' }), [
    box('Sidebar', col(4, { pad: [24, 16, 24, 16] }), [
      T('WPEssential', { font: 'heading', size: 20, weight: 700, color: C.white }),
      ...['Overview', 'Modules', 'Post types', 'Taxonomies', 'Relations', 'Custom fields', 'Settings'].map((l, i) => navItem(l, i === 0)),
    ], { w: 248, fill: C.ink, sizing: { w: 'fix', h: 'fill' } }),
    box('Main', col(24, { pad: [32, 40, 40, 40] }), [
      box('Top bar', row(16, { justify: 'space-between' }), [
        box('Heading', col(4), [T('Overview', { font: 'heading', size: 28, weight: 700, color: C.ink }), T('What is running on this site, and what needs attention.', { color: C.muted })], { sizing: { w: 'auto', h: 'auto' } }),
        box('Actions', row(8), [btn('Browse modules'), btn('Create post type', true)], { sizing: { w: 'auto', h: 'auto' } }),
      ], { sizing: fillW }),
      box('Stats', row(16, { align: 'stretch' }), [
        stat('Active modules', '12', 'of 31 available'), stat('Post types', '5', '2 with custom fields'),
        stat('Field groups', '18', '612 options in use'), stat('Relations', '4', 'all in sync'),
      ], { sizing: fillW }),
      box('Modules card', col(12, { pad: [24, 24, 24, 24] }), [
        T('Recently changed modules', { font: 'heading', size: 18, weight: 700, color: C.ink }),
        moduleRow('Custom post types', 'Register and manage content types.', true),
        moduleRow('Taxonomies', 'Group content with categories and tags.', true),
        moduleRow('Relations', 'Link posts, terms and users to each other.', true),
        moduleRow('Admin columns', 'Choose which columns list screens show.', false),
      ], { fill: C.surface, radius: 14, sizing: fillW }),
    ], { fill: C.white, sizing: { w: 'fill', h: 'auto' } }),
  ], { w: 1440, h: 900, fill: C.white, sizing: { w: 'fix', h: 'auto' } })],
};

await writeFile(new URL('./01-overview.json', import.meta.url), JSON.stringify(overview, null, 1));
console.log('Wrote designs/01-overview.json');
