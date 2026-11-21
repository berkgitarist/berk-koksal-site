import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Run this from the Astro repository root (berk-koksal-site).
// Surgical footer-only changes; leaves all other pages untouched.
for (const [relativePath, href] of [
  ['src/pages/quranic-concepts.astro', '/albums/araf/'],
  ['src/pages/tr/quranic-concepts.astro', '/tr/albums/araf/'],
]) {
  const file = resolve(process.cwd(), relativePath);
  if (!existsSync(file)) {
    console.log(`Skipped (not found): ${relativePath}`);
    continue;
  }
  const original = readFileSync(file, 'utf8');
  const footerAt = original.indexOf('<footer class="qci-closing"');
  if (footerAt < 0) {
    console.warn(`Not changed (qci-closing footer missing): ${relativePath}`);
    continue;
  }
  const navAt = original.indexOf('<nav', footerAt);
  const endAt = original.indexOf('</nav>', navAt);
  if (navAt < 0 || endAt < 0) {
    console.warn(`Not changed (footer nav missing): ${relativePath}`);
    continue;
  }
  const fragment = original.slice(navAt, endAt);
  if (/\/albums\/araf\//.test(fragment)) {
    console.log(`Already contains ARAF: ${relativePath}`);
    continue;
  }
  const anchor = `<a href="${href}">ARAF <span aria-hidden="true">↗</span></a>`;
  const inserted = original.slice(0, endAt) + anchor + original.slice(endAt);
  writeFileSync(file, inserted, 'utf8');
  console.log(`Added ARAF link to footer: ${relativePath}`);
}
