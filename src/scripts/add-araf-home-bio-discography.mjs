import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

// Run from the root of berk-koksal-site.
// Default: preview only. Use --apply to write changes with backups.
const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const backupRoot = resolve(ROOT, '..', `${basename(ROOT)}-araf-backups`, new Date().toISOString().replace(/[:.]/g, '-')); // Outside Git working tree
const log = [];
let changes = 0;
let warnings = 0;

function note(status, path, detail) {
  log.push({ status, path, detail });
  const mark = status === 'CHANGED' ? 'OK' : status === 'WARN' ? '!' : '-';
  console.log(`${mark} ${path}: ${detail}`);
  if (status === 'WARN') warnings++;
}
function save(relative, initial, result) {
  if (initial === result) { note('SKIP', relative, 'No change needed'); return; }
  changes++;
  if (APPLY) {
    const backup = resolve(backupRoot, relative);
    mkdirSync(dirname(backup), { recursive: true });
    writeFileSync(backup, initial, 'utf8');
    writeFileSync(resolve(ROOT, relative), result, 'utf8');
  }
  note('CHANGED', relative, APPLY ? 'Updated; backup saved' : 'Will update with --apply');
}
function edit(relative, transform, optional = false) {
  const file = resolve(ROOT, relative);
  if (!existsSync(file)) {
    note(optional ? 'SKIP' : 'WARN', relative, 'File not found');
    return;
  }
  const initial = readFileSync(file, 'utf8');
  let result;
  try { result = transform(initial); }
  catch (err) { note('WARN', relative, `Not modified: ${err.message}`); return; }
  save(relative, initial, result);
}

function homePatch(source, lang) {
  const hasComponent = /<ArafFeature\b/.test(source);
  let updated = source;
  if (!/\bimport\s+ArafFeature\s+from\s+['"]/.test(updated)) {
    const m = updated.match(/import\s+LaIlaheIllaAllahFeature\s+from\s+(['"])([^'"\n]+)\1\s*;?/);
    if (!m) throw new Error('LaIlaheIllaAllahFeature import not found; project version differs');
    const arafPath = m[2].replace(/la-ilahe-illa-allah-feature\.astro$/i, 'araf-feature.astro');
    if (arafPath === m[2]) throw new Error('Unexpected feature import path');
    const importLine = `import ArafFeature from "${arafPath}";`;
    updated = updated.replace(m[0], `${m[0]}\n${importLine}`);
  }
  if (!hasComponent) {
    const m = updated.match(/^(\s*)<LaIlaheIllaAllahFeature\b([^>]*?)\s*\/>/m);
    if (!m) throw new Error('LaIlaheIllaAllahFeature tag not found');
    const featureLang = m[2].match(/\blang\s*=\s*['"](en|tr)['"]/)?.[1] ?? lang;
    const before = `${m[1]}<ArafFeature lang="${featureLang}" />\n`;
    updated = updated.replace(m[0], `${before}${m[0]}`);
  }
  return updated;
}
edit('src/pages/index.astro', source => homePatch(source, 'en'));
edit('src/pages/tr/index.astro', source => homePatch(source, 'tr'));

function biographyPatch(source, lang) {
  const m = source.match(/\bconst\s+milestones\s*=\s*\[/);
  if (!m) throw new Error('milestones array not found; send this file for exact patch');
  const from = m.index + m[0].length;
  const to = source.indexOf('\n];', from);
  if (to === -1) throw new Error('milestones ending not found');
  const section = source.slice(from, to);
  if (/\bARAF\b/.test(section)) return source;
  const rowTuple = /^\s*\[\s*['"][^'"\n]+['"]\s*,/m.test(section);
  const rowObjects = /^\s*\{\s*$/m.test(section);
  const tr = lang === 'tr';
  const title = tr ? 'ARAF — üçüncü QURANIC CONCEPTS dünyası' : 'ARAF — the third QURANIC CONCEPTS world';
  const desc = tr
    ? "HELLL ve HEAVENN'in ardından, KURAN 7:46–49 merkezindeki tanıma, dua, korku, umut ve rahmet temalarını ele alan 19 eserlik ARAF albümü üzerinde çalışmaya başladı. Albüm henüz geliştirme aşamasındadır."
    : 'Began developing ARAF, the third QURANIC CONCEPTS world after HELLL and HEAVENN. The nineteen-work album explores recognition, prayer, fear, hope and mercy around Quran 7:46–49; the project is still in development.';
  const item = rowTuple
    ? `  ${JSON.stringify(['2026', title, desc]).replace(/^\[/, '[').replace(/\]$/, ']')},`
    : rowObjects
      ? `  { year: '2026', title: ${JSON.stringify(title)}, description: ${JSON.stringify(desc)} },`
      : null;
  if (!item) throw new Error('Unknown milestone item format, not safe to modify automatically');
  // Insert after the existing final milestone, preserving all prior facts.
  return source.slice(0, to) + `\n${item}` + source.slice(to);
}
edit('src/pages/biography.astro', source => biographyPatch(source, 'en'));
edit('src/pages/tr/biography.astro', source => biographyPatch(source, 'tr'));

const trackTitles = [
  'MERCY', 'NOT AMONG THEM', 'THE HEIGHTS', 'BY THEIR SIGNS', 'PEACE FROM AFAR',
  'WITHIN SIGHT', 'BEYOND WISHING', 'WHEN EYES TURN', 'THE BARRIER',
  'THE FACE IN THE CROWD', 'YOUR GATHERING', 'THE HEIGHT OF PRIDE',
  'THE OATH', 'THOSE YOU CONDEMNED', 'WHO ASSIGNS MERCY',
  'FEAR AND HOPE', 'THE UNNAMED VOICE', 'ENTER', 'NO LONGER BETWEEN'
];
function modifyCatalogue(source, lang, path) {
  let data;
  try { data = JSON.parse(source); } catch { throw new Error('JSON parse error'); }
  const albums = Array.isArray(data) ? data : (Array.isArray(data.albums) ? data.albums : null);
  if (!albums) throw new Error('Unsupported catalog JSON shape (requires an array or {albums: []})');
  if (albums.some(x => x && x.slug === 'araf')) return source;
  const at = albums.findIndex(x => x?.slug === 'heavenn');
  if (at < 0) throw new Error('HEAVENN not found; cannot safely infer catalog schema');
  const heavenn = albums[at];
  const entry = structuredClone(heavenn);
  const tr = lang === 'tr';
  const description = tr
    ? 'HELLL ve HEAVENN sonrası üçüncü QURANIC CONCEPTS dünyası. KURAN 7:46–49 çevresinde tanıma, dua, korku, umut ve rahmeti konu alan 19 eserlik ARAF albümü; çalışma aşamasında.'
    : 'The third QURANIC CONCEPTS world after HELLL and HEAVENN. A nineteen-work concept album in development exploring recognition, prayer, fear, hope and mercy around Quran 7:46–49.';
  const story = tr
    ? 'İki taraf görünür. Selam duyulur. Bir dua yükselir. Son söz insana ait değildir.'
    : 'Two sides are visible. A greeting is heard. A prayer rises. The final word is not ours.';
  // Clone the entry type/grouping from HEAVENN, then replace all content-specific fields.
  // This deliberately removes HEAVENN streaming links and release metadata.
  const excluded = /spotify|appleMusic|youtube|tidal|deezer|isrc|upc|releaseDate|release_url|embed|credits|producer|manifesto|linerNotes|externalLinks|tracklistUrl|platformLinks|streamingLinks/i;
  for (const key of Object.keys(entry)) if (excluded.test(key)) delete entry[key];
  for (const [key, value] of Object.entries(entry)) {
    if (typeof value === 'string' && /HEAVENN|CENNETT|PARADISE/i.test(value) && !['universe', 'category', 'series'].includes(key)) {
      if (/^(href|url|path|page|pageUrl|link)$/i.test(key)) {
        entry[key] = value.replace(/heavenn/gi, 'araf'); // Keep internal album routing.
      } else if (/^shortDescription$/i.test(key)) {
        entry[key] = description;
      } else {
        delete entry[key]; // Do not leak HEAVENN-specific marketing copy.
      }
    }
  }
  entry.slug = 'araf';
  entry.title = 'ARAF';
  entry.year = typeof heavenn.year === 'number' ? 2026 : '2026';
  entry.cover = '/albums/araf.webp';
  if ('image' in heavenn) entry.image = '/albums/araf.webp';
  if ('artwork' in heavenn && typeof heavenn.artwork === 'string') entry.artwork = '/albums/araf.webp';
  if ('description' in heavenn) entry.description = description;
  else entry.description = description;
  if ('story' in heavenn) entry.story = story;
  if ('subtitle' in heavenn) entry.subtitle = story;
  if ('tagline' in heavenn) entry.tagline = tr ? 'TANIMAK HÜKÜM VERMEK DEĞİLDİR' : 'TO RECOGNIZE IS NOT TO JUDGE';
  if ('duration' in heavenn) entry.duration = tr ? 'Belirlenecek' : 'TBA';
  if ('tracksCount' in heavenn) entry.tracksCount = typeof heavenn.tracksCount === 'number' ? 19 : '19';
  if ('trackCount' in heavenn) entry.trackCount = typeof heavenn.trackCount === 'number' ? 19 : '19';
  if ('tracks' in heavenn) entry.tracks = trackTitles;
  if ('releaseStatus' in heavenn) entry.releaseStatus = 'upcoming';
  if ('status' in heavenn) entry.status = 'in-progress';
  if ('released' in heavenn) entry.released = false;
  if ('published' in heavenn && typeof heavenn.published === 'boolean') entry.published = false;
  if ('isReleased' in heavenn) entry.isReleased = false;
  if ('genre' in heavenn) entry.genre = 'QURANIC CONCEPTS / Symphonic Rock / Neoclassical Rock / Choral';
  if ('genres' in heavenn) entry.genres = Array.isArray(heavenn.genres) ? ['Symphonic Rock', 'Neoclassical Rock', 'Choral'] : 'Symphonic Rock / Neoclassical Rock / Choral';
  if ('tags' in heavenn) entry.tags = Array.isArray(heavenn.tags) ? ['QURANIC CONCEPTS', 'Symphonic Rock', 'Neoclassical'] : 'QURANIC CONCEPTS';
  if ('id' in heavenn) entry.id = 'araf';
  if ('accentColor' in heavenn) entry.accentColor = '#d8b469';
  if ('accent' in heavenn) entry.accent = '#d8b469';
  if ('themeColor' in heavenn) entry.themeColor = '#d8b469';
  // Prefer the exact grouping key(s) used for HEAVENN, rather than inventing a new category.
  // Avoid copied streaming metadata: the ARAF Spotify album URL is not available yet.
  albums.splice(at + 1, 0, entry);
  const indent = source.includes('\n    "slug"') ? 2 : 2;
  return JSON.stringify(data, null, indent) + '\n';
}
edit('src/data/albums.json', source => modifyCatalogue(source, 'en', 'src/data/albums.json'));
edit('src/data/albums.tr.json', source => modifyCatalogue(source, 'tr', 'src/data/albums.tr.json'), true);

const projectsFile = resolve(ROOT, 'src/components/projects.astro');
if (existsSync(projectsFile)) {
  const projects = readFileSync(projectsFile, 'utf8');
  if (/albums(?:\.tr)?\.json|data\/albums|\balbums\.filter\b|\balbums\.map\b/.test(projects)) {
    note('SKIP', 'src/components/projects.astro', 'Uses album data; ARAF should appear from the catalog');
  } else if (/\baraf\b/i.test(projects)) {
    note('SKIP', 'src/components/projects.astro', 'Already references ARAF');
  } else {
    note('WARN', 'src/components/projects.astro', 'It may contain a separate static album list. If ARAF does not appear, send this file for a precise edit. Not overwritten.');
  }
} else note('WARN', 'src/components/projects.astro', 'Not found; cannot verify discography rendering');

for (const rel of ['src/pages/albums/araf.astro', 'src/pages/tr/albums/araf.astro']) {
  if (existsSync(resolve(ROOT, rel))) note('SKIP', rel, 'Dedicated ARAF page found');
  else note('WARN', rel, 'Dedicated ARAF page missing; restore it from the earlier ARAF package');
}
for (const rel of ['src/pages/albums/[slug].astro', 'src/pages/tr/albums/[slug].astro']) {
  edit(rel, content => {
    if (!/\.filter\(\(album\)/.test(content)) return content;
    if (/\[([^\]]*?)['"]araf['"]([^\]]*?)\]\.includes\(album\.slug\)/s.test(content)) return content;
    return content.replace(/(\[\s*['"]heavenn['"]\s*,\s*['"]la-ilahe-illa-allah['"])(\s*\]\.includes\(album\.slug\))/, '$1, "araf"$2');
  }, true);
}
console.log(`\n${APPLY ? 'Applied' : 'Preview'}: ${changes} file(s) ${APPLY ? 'updated' : 'would change'}; ${warnings} warning(s).`);
if (!APPLY) console.log('To update with automatic backups: node scripts/add-araf-home-bio-discography.mjs --apply');
console.log('After updating, run: npm run build');
