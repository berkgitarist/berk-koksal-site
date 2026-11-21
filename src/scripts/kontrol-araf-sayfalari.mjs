import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=process.cwd();
let warns=0;
function check(path, label, verify, required=true) {
  const full=resolve(root,path);
  if (!existsSync(full)) { console.log(`${required?'UYARI':'BİLGİ'} ${label}: ${path} bulunamadı`); if(required)warns++;return; }
  const txt=readFileSync(full,'utf8');
  if(verify && !verify(txt)){console.log(`UYARI ${label}: ARAF kaydı beklenen biçimde görünmüyor`);warns++;}
  else console.log(`OK ${label}: ${path}`);
}
check('src/pages/index.astro','EN ana sayfa',s=>s.includes('ArafFeature lang="en"')&&s.indexOf('<ArafFeature')<s.indexOf('<LaIlaheIllaAllahFeature'));
check('src/pages/tr/index.astro','TR ana sayfa',s=>/<ArafFeature\b/.test(s)&&s.indexOf('<ArafFeature')<s.indexOf('<LaIlaheIllaAllahFeature'));
check('src/pages/biography.astro','EN biyografi',s=>s.includes('ARAF — third QURANIC CONCEPTS world')&&s.includes('/albums/araf/'));
check('src/pages/tr/biography.astro','TR biyografi',s=>s.includes('ARAF')&&s.includes('/tr/albums/araf/'));
check('src/pages/full-biography.astro','EN tam biyografi',s=>s.includes('Third QURANIC CONCEPTS Album')&&s.includes('/albums/araf/'));
check('src/pages/tr/full-biography.astro','TR tam biyografi',s=>s.includes('data-araf-full-bio-card'),false);
check('src/components/araf-feature.astro','Ortak iki dilli tanıtım',s=>s.includes("'tr'")&&s.includes("'en'")&&s.includes('/albums/araf.webp'));
if(!existsSync(resolve(root,'public/albums/araf.webp'))) {console.log('UYARI Kapak: public/albums/araf.webp eksik');warns++;} else console.log('OK Kapak: public/albums/araf.webp');
for(const path of ['src/data/albums.json','src/data/albums.tr.json']) {
 const full=resolve(root,path); if(!existsSync(full))continue;
 try {const src=JSON.parse(readFileSync(full,'utf8'));const a=Array.isArray(src)?src:src.albums;const count=a.filter(x=>x.slug==='araf').length;console.log(`${count===1?'OK':'UYARI'} Katalog ${path}: ${count} ARAF kaydı`);if(count!==1) warns++;}
 catch(err){console.log(`UYARI ${path}: ${err.message}`); warns++;}
}
console.log(`\nToplam: ${warns} uyarı. Not: Buradaki doğrulama Astro derlemesi yerine geçmez. npm run build çalıştırın.`);
