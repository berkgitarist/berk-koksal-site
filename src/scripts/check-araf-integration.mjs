import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const checks = [];
const read = path => existsSync(resolve(root,path)) ? readFileSync(resolve(root,path), 'utf8') : null;
function check(condition, name) { checks.push([Boolean(condition),name]); console.log(`${condition?'OK':'MISSING'}  ${name}`); }
for (const [path, lang] of [['src/pages/index.astro','en'],['src/pages/tr/index.astro','tr']]) {
  const src=read(path);
  check(src && src.includes('import ArafFeature from'), `${path} imports ArafFeature`);
  check(src && src.indexOf(`<ArafFeature lang="${lang}" />`) >= 0 && src.indexOf('<ArafFeature') < src.indexOf('<LaIlaheIllaAllahFeature'), `${path} shows ARAF above La Ilahe`);
}
for (const path of ['src/pages/biography.astro','src/pages/tr/biography.astro']) {
  const src=read(path);
  check(src && /ARAF\s*[—-]/.test(src), `${path} contains ARAF milestone`);
}
for (const path of ['src/data/albums.json', 'src/data/albums.tr.json']) {
  const src=read(path); if (!src) continue;
  try { const obj=JSON.parse(src); const arr=Array.isArray(obj)?obj:obj.albums;
    const i=arr.findIndex(x=>x.slug==='heavenn');
    check(i >= 0 && arr[i+1]?.slug==='araf', `${path} lists HELLL / HEAVENN / ARAF in sequence`);
  } catch { check(false, `${path} valid JSON`); }
}
check(existsSync(resolve(root,'src/components/araf-feature.astro')), 'ARAF homepage card component exists');
check(existsSync(resolve(root,'public/albums/araf.webp')), 'Final ARAF cover exists');
check(existsSync(resolve(root,'src/pages/albums/araf.astro')), 'English ARAF album page exists');
check(existsSync(resolve(root,'src/pages/tr/albums/araf.astro')), 'Turkish ARAF album page exists');
console.log(`\n${checks.filter(x=>x[0]).length}/${checks.length} checks passed`);
if (checks.some(x=>!x[0])) { console.log('Do not publish until missing items are reviewed.'); process.exitCode=1; }
