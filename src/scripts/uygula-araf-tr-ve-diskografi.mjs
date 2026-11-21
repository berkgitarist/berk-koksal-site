/**
 * ARAF bilingual integration for the user's EXISTING Astro project.
 * Preview: node scripts/uygula-araf-tr-ve-diskografi.mjs
 * Apply:   node scripts/uygula-araf-tr-ve-diskografi.mjs --apply
 * Existing files are backed up outside the Git working tree before modification.
 * The script does NOT generate guessed Turkish pages and does NOT touch unrelated sections.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';

const root = process.cwd();
const apply = process.argv.includes('--apply');
const backupRoot = resolve(root, '..', `${basename(root)}-araf-yedekleri`, new Date().toISOString().replace(/[:.]/g, '-'));
const changes = [];
const warnings = [];

function report(label, file, info) { console.log(`${label} ${file} — ${info}`); }
function change(file, transform) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) {
    warnings.push(file);
    report('UYARI', file, 'Bulunamadı. Dosya oluşturulmadı.');
    return;
  }
  const old = readFileSync(absolute, 'utf8');
  let next;
  try { next = transform(old); }
  catch (err) {
    warnings.push(file);
    report('UYARI', file, `Değiştirilmedi: ${err.message}`);
    return;
  }
  if (old === next) { report('ATLANDI', file, 'Zaten güncel veya değişiklik gerekmiyor'); return; }
  changes.push(file);
  if (apply) {
    const backup = resolve(backupRoot, file);
    mkdirSync(dirname(backup), { recursive: true });
    writeFileSync(backup, old, 'utf8');
    writeFileSync(absolute, next, 'utf8');
  }
  report(apply ? 'GÜNCELLENDİ' : 'ÖN İZLEME', file, apply ? 'Yedek alındı ve düzenlendi' : 'Düzenlenecek (--apply)');
}

function patchTrIndex(source) {
  let out = source;
  if (!/import\s+ArafFeature\s+from\s+['"]/.test(out)) {
    const importMatch = out.match(/(import\s+LaIlaheIllaAllahFeature\s+from\s+)(['"])([^'"\r\n]+)\2\s*;?/);
    if (!importMatch) throw Error('LaIlaheIllaAllahFeature importu bulunamadı; Türkçe index.astro dosyasını gönderin');
    const path = importMatch[3].replace(/la-ilahe-illa-allah-feature\.astro$/, 'araf-feature.astro');
    if (path === importMatch[3]) throw Error('Beklenmeyen bileşen import yolu');
    out = out.replace(importMatch[0], `${importMatch[0]}\nimport ArafFeature from ${importMatch[2]}${path}${importMatch[2]};`);
  }
  if (!/<ArafFeature\b/.test(out)) {
    const tag = out.match(/^(\s*)<LaIlaheIllaAllahFeature\b[^>]*\/>/m);
    if (!tag) throw Error('LaIlaheIllaAllahFeature etiketi bulunamadı; sayfa yapısını kontrol edin');
    out = out.replace(tag[0], `${tag[1]}<ArafFeature lang="tr" />\n${tag[0]}`);
  }
  return out;
}
change('src/pages/tr/index.astro', patchTrIndex);

const trMilestone = ['2026', 'ARAF — QURANIC CONCEPTS üçüncü dünya',
  'HELLL ve HEAVENN sonrasında KURAN 7:46–49 bağlamında tanıma, selam, korku, umut, dua ve rahmet temalarını işleyen 19 eserlik ARAF albümünü geliştirmeye başladı. Albüm henüz çalışma aşamasındadır.'];
const arafBioCardTr = `        <!-- ARAF: Türkçe biyografi sayfası için ayrı tanıtım -->
        <section data-araf-bio-card class="grid gap-6 overflow-hidden rounded-[2rem] border border-[#e2bd7a]/30 bg-gradient-to-br from-[#0e1727] to-[#1f3142] p-6 md:grid-cols-[200px_1fr] md:items-center md:p-9">
          <a href="/tr/albums/araf/" aria-label="ARAF albümünü keşfet">
            <img src="/albums/araf.webp" alt="ARAF — Berk Köksal albüm kapağı" loading="lazy" width="360" height="360" class="w-full rounded-2xl border border-[#e2bd7a]/30 object-cover" />
          </a>
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.26em] text-[#e7bc7a]">2026 · QURANIC CONCEPTS III · HAZIRLIK AŞAMASINDA</p>
            <h2 class="mt-3 font-heading text-3xl font-bold text-white md:text-5xl">ARAF</h2>
            <p class="mt-4 leading-8 text-white/80">HELLL ve HEAVENN'den sonraki üçüncü dünya. KURAN 7:46–49 çerçevesinde tanıma, selam, korku, umut, dua ve rahmet üzerine kurulan 19 eserlik konsept albüm.</p>
            <a href="/tr/albums/araf/" class="mt-5 inline-flex rounded-full border border-[#e7bc7a]/55 bg-[#d6a354]/15 px-6 py-3 text-sm font-bold text-white hover:bg-[#d6a354]/25">ARAF albümünü ve manifestosunu keşfet →</a>
          </div>
        </section>

`;

function addMilestone(source) {
  const m = source.match(/(const\s+milestones\s*=\s*\[)([\s\S]*?)(\r?\n\s*\];)/);
  if (!m) return { output: source, success: false };
  if (/\bARAF\b/.test(m[2])) return { output: source, success: true };
  const tupleFormat = /\[\s*['"](?:19\d\d|20\d\d)/.test(m[2]);
  const objectFormat = /\{\s*(?:year|date|period)\s*:/.test(m[2]);
  const tuple = `  ${JSON.stringify(trMilestone)},`;
  const obj = `  { year: ${JSON.stringify(trMilestone[0])}, title: ${JSON.stringify(trMilestone[1])}, description: ${JSON.stringify(trMilestone[2])} },`;
  if (!tupleFormat && !objectFormat) return { output: source, success: false };
  const newValue = `${m[1]}${m[2]}\n${tupleFormat ? tuple : obj}${m[3]}`;
  return { output: source.replace(m[0], newValue), success: true };
}

function patchTrBiography(source) {
  let out = source;
  const milestone = addMilestone(out);
  out = milestone.output;
  if (!/data-araf-bio-card/.test(out)) {
    // Preserve the existing TR page: insert a self-contained panel between the Quranic section and family section.
    const family = out.match(/^[\t ]*<!--\s*(?:FAMILY|AILE|AİLE)\s*-->/m);
    if (family) {
      out = out.replace(family[0], `${arafBioCardTr}${family[0]}`);
    } else if (!milestone.success) {
      throw Error('Ne kilometre taşı ne de güvenli kart konumu bulundu; Türkçe biyografi dosyasını ayrıca gönderin');
    }
  }
  return out;
}
change('src/pages/tr/biography.astro', patchTrBiography);

function patchTrFullBiography(source) {
  if (/data-araf-full-bio-card/.test(source)) return source;
  const panel = `      <!-- ARAF · Third QURANIC CONCEPTS world -->
      <section data-araf-full-bio-card class="grid gap-6 overflow-hidden rounded-[2rem] border border-[#e2bd7a]/30 bg-gradient-to-br from-[#0e1727] to-[#1f3142] p-6 md:grid-cols-[200px_1fr] md:items-center md:p-9">
        <a href="/tr/albums/araf/" aria-label="ARAF albümünü keşfet"><img src="/albums/araf.webp" alt="ARAF albüm kapağı" loading="lazy" width="360" height="360" class="w-full rounded-2xl border border-[#e2bd7a]/30 object-cover" /></a>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.26em] text-[#e7bc7a]">2026 · QURANIC CONCEPTS III · HAZIRLIK AŞAMASINDA</p>
          <h2 class="mt-3 font-heading text-3xl font-bold text-white md:text-5xl">ARAF</h2>
          <p class="mt-4 leading-8 text-white/80">KURAN 7:46–49 bağlamında tanıma, selam, korku, umut, dua ve rahmet etrafında şekillenen 19 eserlik konsept albüm. HELLL ve HEAVENN'in ardından üçüncü dünya; henüz hazırlık aşamasında.</p>
          <a href="/tr/albums/araf/" class="mt-5 inline-flex rounded-full border border-[#e7bc7a]/55 bg-[#d6a354]/15 px-6 py-3 text-sm font-bold text-white hover:bg-[#d6a354]/25">Albümü ve manifestoyu keşfet →</a>
        </div>
      </section>

`;
  // In the matching English source, the next chapter is marked <!-- XX -->.
  const match = source.match(/^[\t ]*<!--\s*XX\s*-->/m);
  if (!match) throw Error('XX. bölüm işareti bulunamadı; mevcut tam biyografi yapısı farklı. Değiştirilmedi');
  return source.replace(match[0], `${panel}${match[0]}`);
}
// Optional: some deployments only have /tr/biography/.
if (existsSync(resolve(root, 'src/pages/tr/full-biography.astro'))) {
  change('src/pages/tr/full-biography.astro', patchTrFullBiography);
} else {
  report('ATLANDI', 'src/pages/tr/full-biography.astro', 'Bu projede ayrı Türkçe tam biyografi bulunmuyor');
}

const names = ['MERCY','NOT AMONG THEM','THE HEIGHTS','BY THEIR SIGNS','PEACE FROM AFAR',
  'WITHIN SIGHT','BEYOND WISHING','WHEN EYES TURN','THE BARRIER','THE FACE IN THE CROWD',
  'YOUR GATHERING','THE HEIGHT OF PRIDE','THE OATH','THOSE YOU CONDEMNED',
  'WHO ASSIGNS MERCY','FEAR AND HOPE','THE UNNAMED VOICE','ENTER','NO LONGER BETWEEN'];
function patchCatalog(source, tr) {
  const json = JSON.parse(source);
  const albums = Array.isArray(json) ? json : Array.isArray(json.albums) ? json.albums : null;
  if (!albums) throw Error('Albümler JSON listesi biçiminde değil; dosyayı paylaşın');
  if (albums.some((album) => album && album.slug === 'araf')) return source;
  const where = albums.findIndex(album => album && album.slug === 'heavenn');
  if (where < 0) throw Error('HEAVENN kaydı bulunamadı. Albüm verisinin şeması kontrol edilmeli');
  const model = albums[where];
  const entry = structuredClone(model);
  // Remove release-only / third party metadata copied from HEAVENN.
  for (const key of Object.keys(entry)) {
    if (/spotify|apple|youtube|deezer|tidal|amazon|releaseDate|dateReleased|isrc|upc|embed|distribution|streaming|platform|externalLinks|credits|duration/i.test(key)) delete entry[key];
  }
  const description = tr
    ? 'HELLL ve HEAVENN ardından QURANIC CONCEPTS serisinin üçüncü dünyası. KURAN 7:46–49 çevresindeki tanıma, selam, dua, korku, umut ve rahmet üzerine 19 eserlik ARAF albümü; hazırlık aşamasında.'
    : 'The third QURANIC CONCEPTS world after HELLL and HEAVENN. A nineteen-work album in development exploring recognition, greeting, prayer, fear, hope and mercy around Quran 7:46–49.';
  entry.slug = 'araf';
  if ('id' in entry) entry.id = 'araf';
  entry.title = 'ARAF';
  if ('name' in entry) entry.name = 'ARAF';
  if ('artist' in entry && typeof entry.artist === 'string') entry.artist = 'Berk KÖKSAL';
  if ('cover' in entry) entry.cover = '/albums/araf.webp';
  if ('image' in entry) entry.image = '/albums/araf.webp';
  if ('thumbnail' in entry) entry.thumbnail = '/albums/araf.webp';
  if ('artwork' in entry) entry.artwork = '/albums/araf.webp';
  entry.cover = '/albums/araf.webp';
  entry.description = description;
  if ('shortDescription' in entry) entry.shortDescription = description;
  if ('story' in entry) entry.story = tr ? 'Tanımak hüküm vermek değildir.' : 'To recognize is not to judge.';
  if ('tagline' in entry) entry.tagline = tr ? 'TANIMAK, HÜKÜM VERMEK DEĞİLDİR.' : 'TO RECOGNIZE IS NOT TO JUDGE.';
  if ('subtitle' in entry) entry.subtitle = tr ? 'QURANIC CONCEPTS III · ARAF' : 'QURANIC CONCEPTS III · ARAF';
  if ('year' in entry) entry.year = typeof entry.year === 'number' ? 2026 : '2026';
  if ('tracksCount' in entry) entry.tracksCount = typeof entry.tracksCount === 'number' ? 19 : '19';
  if ('trackCount' in entry) entry.trackCount = typeof entry.trackCount === 'number' ? 19 : '19';
  if ('tracks' in entry) {
    entry.tracks = Array.isArray(entry.tracks) && entry.tracks.length && typeof entry.tracks[0] === 'string'
      ? names
      : names.map((title, i) => ({ number: i + 1, title }));
  }
  if ('genre' in entry) entry.genre = 'QURANIC CONCEPTS / Symphonic Rock / Neoclassical Rock / Choir';
  if ('genres' in entry) entry.genres = Array.isArray(entry.genres) ? ['Symphonic Rock','Neoclassical Rock','Choir'] : 'Symphonic Rock / Neoclassical Rock / Choir';
  if ('status' in entry) entry.status = 'in-development';
  if ('releaseStatus' in entry) entry.releaseStatus = 'upcoming';
  if ('released' in entry) entry.released = false;
  if ('isReleased' in entry) entry.isReleased = false;
  if ('published' in entry) entry.published = true; // Album page exists; NOT a claim of streaming release.
  for (const field of ['url','href','path','link']) if (field in entry) entry[field] = tr ? '/tr/albums/araf/' : '/albums/araf/';
  // Remove irrelevant copied Heavenn copy from fields not covered by the catalog shape.
  for (const [k,v] of Object.entries(entry)) {
    if (typeof v === 'string' && /HEAVENN/i.test(v) && !['description','shortDescription'].includes(k)) {
      // A narrative context may mention HEAVENN legitimately. Otherwise avoid copying its branded text.
      if (!['group','universe','series','category','collection'].includes(k)) delete entry[k];
    }
  }
  albums.splice(where+1, 0, entry);
  return JSON.stringify(json, null, 2) + '\n';
}
change('src/data/albums.json', content => patchCatalog(content, false));
if (existsSync(resolve(root, 'src/data/albums.tr.json'))) {
  change('src/data/albums.tr.json', content => patchCatalog(content, true));
} else report('ATLANDI', 'src/data/albums.tr.json', 'Yok; İngilizce katalog ortak kullanılıyor olabilir');

// The catalog is not necessarily the only source used by Discography.
const projects = resolve(root, 'src/components/projects.astro');
if (existsSync(projects)) {
  const src = readFileSync(projects, 'utf8');
  if (/albums\.json|albums\.tr\.json|data\/albums/.test(src)) {
    report('KONTROL', 'src/components/projects.astro', 'Albüm verisiyle ilişkili; ARAF kartını yerel sayfada doğrulayın');
  } else {
    warnings.push('src/components/projects.astro');
    report('UYARI', 'src/components/projects.astro', 'Diskografi sabit veri kullanıyor olabilir; otomatik değiştirilmedi. Bu dosyayı paylaşın');
  }
} else {
  warnings.push('src/components/projects.astro');
  report('UYARI', 'src/components/projects.astro', 'Dosya bulunamadı; diskografi görünümü doğrulanamadı');
}
console.log(`\n${apply ? 'UYGULANDI' : 'ÖN İZLEME'}: ${changes.length} değişiklik, ${warnings.length} uyarı.`);
if (!apply) console.log('Değişiklikleri uygulamak için: node scripts/uygula-araf-tr-ve-diskografi.mjs --apply');
console.log('Son kontrol: npm run build');
