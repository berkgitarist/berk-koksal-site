import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const en = JSON.parse(read('src/data/araf-lyrics.json'));
const tr = JSON.parse(read('src/data/araf-translations.tr.json'));
const astro = read('src/components/concepts/ArafPage.astro');
assert.equal(en.length, 19);
assert.equal(tr.length, 19);
for (let i=0; i<19; i++) {
  assert.equal(en[i].number,i+1);
  assert.equal(tr[i].number,i+1);
  assert.equal(en[i].title,tr[i].title);
  assert.equal(en[i].sections.length,tr[i].sections.length);
  for (let j=0; j<en[i].sections.length; j++) {
    assert.equal(en[i].sections[j].lines.length,tr[i].sections[j].lines.length);
    assert(en[i].sections[j].lines.length>0);
  }
}
assert.equal(en[0].title, 'MERCY');
assert.equal(en[1].title,'NOT AMONG THEM');
assert.equal(en[18].title,'NO LONGER BETWEEN');
assert(astro.includes('<details class="bk-araf__lyric-track"'));
assert(!astro.includes('open={song.number === 1}'));
assert(!astro.includes('<details class="bk-araf__lyric-track" id=') || !astro.includes(' open={'));
console.log(`OK: ${en.length} tracks; ${en.reduce((n,x)=>n+x.sections.length,0)} bilingual sections; all accordions closed by default`);
