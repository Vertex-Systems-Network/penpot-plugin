// Run: node src/render.test.mjs
import assert from 'node:assert/strict';
import { treeToChanges } from './render.mjs';

let n = 0;
const ch = treeToChanges({ boards: [{ type: 'board', name: 'B', layout: { dir: 'column' }, children: [
  { type: 'text', name: 'first', text: 'A' }, { type: 'rect', name: 'second' },
] }] }, 'p', () => `id${n++}`);

assert.equal(ch.length, 3);
assert.equal(ch[0].obj.type, 'frame');
assert.equal(ch[0].obj.layoutItemVSizing, 'auto');
assert.deepEqual(ch.slice(1).map((c) => c.obj.name), ['second', 'first'], 'flex children are sent in reverse');
assert.ok(ch.slice(1).every((c) => c.parentId === 'id0'));
assert.throws(() => treeToChanges({ boards: [{ type: 'circle' }] }, 'p'), /Unknown node type/);
assert.throws(() => treeToChanges({}, 'p'), /boards/);
console.log('render ok');
