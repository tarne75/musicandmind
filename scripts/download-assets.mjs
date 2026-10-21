#!/usr/bin/env node
/**
 * Music & Mind — asset downloader (run locally; needs Node 18+).
 *
 *   node scripts/download-assets.mjs              # fetch images sized for the web (max 1400px)
 *   node scripts/download-assets.mjs --original   # fetch full-resolution originals
 *   node scripts/download-assets.mjs --blog       # ALSO export blog post text to content/blog/*.html
 *
 * The old Wix site lazy-loads its images, so this script:
 *   1. downloads every known image into the exact filenames the HTML expects
 *      (images/originals/media/mNN.ext, images/originals/blog/bNN.png);
 *   2. scans every old page for any other static.wixstatic.com/media/... URLs and saves
 *      them to images/extra/ so nothing is lost (check this folder for photos/logos);
 *   3. (--blog) extracts each blog post's text for Phase 2 migration.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINAL = process.argv.includes('--original');
const BLOG = process.argv.includes('--blog');
const BASE = 'https://static.wixstatic.com/media/';
const SITE = 'https://www.musicandmind.co.uk';

// [local path, wix media id]
const media = [
  'bf1d7b_d6331400807945efa7846052b2ff9862~mv2.jpg', 'bf1d7b_3c1925337dc74d2caa29202a4227088e~mv2.png',
  'bf1d7b_a541614464194bd4aab4b03b183889f5~mv2.png', 'bf1d7b_c89acb56911e46e79f63df912d9ab03a~mv2.png',
  'bf1d7b_d7238e15485b41ae85137d5bd317a11d~mv2.png', 'bf1d7b_9b898afe3fc34cddb60ba968ee2d2cd0~mv2.png',
  'bf1d7b_14c9bfa881a243ca833a3579416a5eea~mv2.png', 'bf1d7b_97fb73a797dc4181a9a30d62e7a8cae4~mv2.png',
  'bf1d7b_639dd60d009c496aa7b681100c4feb54~mv2.png', 'bf1d7b_86f9b8906c934b37be5a4af96d34cd21~mv2.png',
  'bf1d7b_90ed9ed67a1f420f9883e517f6d4afcf~mv2.png', 'bf1d7b_f0562589250f424a8dc36a87776239e0~mv2.png',
  'bf1d7b_3256313bdf5343689b6196ca606c3fa6~mv2.png', 'bf1d7b_d6b0bb104add41e0a28968e01d19951f~mv2.png',
  'bf1d7b_133dbd9cdc3a444aaa4a54765859d339~mv2.png', 'bf1d7b_34788e920bd54b668afb12c8f65087d0~mv2.png',
  'bf1d7b_58d7ccbace9d4a98947fd6347f8c6999~mv2.png', 'bf1d7b_fbd956a46bad4168a7e104a36c0a472b~mv2.png',
  'bf1d7b_2657e28ce82e464e8bc75b115f77c941~mv2.png', 'bf1d7b_4aea2e9b6e2f4b8b9fe1a5e1343bcdfd~mv2.png',
  'bf1d7b_aa5ad788f8bd4dff9fb68673f3c24147~mv2.png', 'bf1d7b_af382e262c9a43f7bb33378d5d66f7a9~mv2.png',
  'bf1d7b_57cc40b1daef47ddb24450283a544bee~mv2.jpg', 'bf1d7b_45b6f766bd5745dfaf343149710ddc3b~mv2.png',
  'bf1d7b_3959770a6c9a417a87b055977f0e510b~mv2.png', 'bf1d7b_5444a499b35e489f895729e51e6d5012~mv2.png',
].map((id, i) => [`images/originals/media/m${String(i + 1).padStart(2, '0')}.${id.split('.').pop()}`, id]);

const blog = [
  ['music-performance-anxiety-mpa', 'bf1d7b_65b06b2974fd4aa59c5d339293bd8725~mv2.png'],
  ['musicians-playing-and-self-awareness', 'bf1d7b_e356e64cce044b109af644711fabc053~mv2.png'],
  ['musicians-and-the-impact-of-playing', 'bf1d7b_91154b870cad4d639ca68f73d02d7e99~mv2.png'],
  ['musicians-and-their-sensitivity-to-music-listening', 'bf1d7b_a7a1ccee8c3c4f2e96b78f503b33dc63~mv2.png'],
  ['musicking-as-a-resource-for-musicians-emotional-colour', 'bf1d7b_ed01dd8ca21045b0a814406e2396491f~mv2.png'],
  ['are-musicians-more-narcissistic', 'bf1d7b_bfe4d28e56464323846af3ff92da4f5b~mv2.png'],
  ['musicians-and-personality', 'bf1d7b_233636a5c9f5445bb11ae6db8ea76191~mv2.png'],
  ['musicians-madness-and-mental-health', 'bf1d7b_bd3b038788e34e68b15241a422d0f397~mv2.png'],
  ['are-musicians-weird', 'bf1d7b_3bc8fc0918d64d9999722b7abf4c0385~mv2.png'],
  ['my-research-and-me', 'bf1d7b_840ddf967e574a9b9d9df34f43e13f56~mv2.png'],
];
const blogImgs = blog.map(([, id], i) => [`images/originals/blog/b${String(i + 1).padStart(2, '0')}.png`, id]);

const brand = [ // original logo + social icons, kept for reference only (site uses new SVG logo + inline icons)
  ['images/originals/brand/logo-original.png', 'bf1d7b_109332c6003f4a48915a7d1a560f7cad~mv2_d_4000_1837_s_2.png'],
  ['images/originals/brand/icon-youtube.png', 'a1b09fe8b7f04378a9fe076748ad4a6a.png'],
  ['images/originals/brand/icon-twitter.png', '9c4b521dd2404cd5a05ed6115f3a0dc8.png'],
  ['images/originals/brand/icon-facebook.png', 'e316f544f9094143b9eac01f1f19e697.png'],
  ['images/originals/brand/icon-instagram.png', '8d6893330740455c96d218258a458aa4.png'],
];

const exists = p => access(join(ROOT, p)).then(() => true, () => false);

async function save(rel, id) {
  if (await exists(rel)) return console.log('skip   ', rel);
  const ext = id.split('.').pop();
  const urls = ORIGINAL ? [BASE + id] : [`${BASE}${id}/v1/fit/w_1400,h_1400,al_c,q_85/file.${ext}`, BASE + id];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(join(ROOT, rel)), { recursive: true });
      await writeFile(join(ROOT, rel), buf);
      return console.log('saved  ', rel, `${(buf.length / 1024).toFixed(0)} KB`);
    } catch (e) { /* try next url */ }
  }
  console.warn('FAILED ', rel, id);
}

async function pool(items, fn, n = 5) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(...q.shift()); }));
}

const known = new Set([...media, ...blogImgs, ...brand].map(([, id]) => id.split('/')[0]));

async function discoverExtras() {
  const pages = ['', '/about-me', '/services', '/media', '/contact', '/blog', ...blog.map(([s]) => `/single-post/${s}`)];
  const found = new Map();
  for (const p of pages) {
    try {
      const html = await (await fetch(SITE + p, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
      for (const m of html.matchAll(/static\.wixstatic\.com\/media\/([A-Za-z0-9_~.\-]+?\.(?:png|jpe?g|gif|webp|svg))/gi))
        if (!known.has(m[1]) && !found.has(m[1])) found.set(m[1], p || '/');
    } catch (e) { console.warn('could not scan', p, e.message); }
  }
  console.log(`\nDiscovered ${found.size} extra image(s) not referenced by the new site.`);
  await pool([...found].map(([id]) => [`images/extra/${id.replace(/[~]/g, '-')}`, id]), save);
}

/** Best-effort text export of each blog post (Wix server-renders post copy). */
async function exportBlog() {
  await mkdir(join(ROOT, 'content/blog'), { recursive: true });
  for (const [slug] of blog) {
    try {
      const html = await (await fetch(`${SITE}/single-post/${slug}`, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
      const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '');
      const paras = [...body.matchAll(/<(p|h[1-4]|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
        .map(m => [m[1], m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/​/g, '').trim()])
        .filter(([, t]) => t.length > 1);
      await writeFile(join(ROOT, `content/blog/${slug}.html`), paras.map(([t, x]) => `<${t}>${x}</${t}>`).join('\n') + '\n');
      console.log('blog   ', slug, `${paras.length} blocks (review: nav/footer text may be included)`);
    } catch (e) { console.warn('blog failed', slug, e.message); }
  }
}

console.log(ORIGINAL ? 'Mode: full-resolution originals' : 'Mode: web-sized (max 1400px). Use --original for full size.');
await pool([...media, ...blogImgs, ...brand], save);
await discoverExtras();
if (BLOG) await exportBlog();
console.log('\nDone. Review images/extra/ for anything else worth using (e.g. team photos).');
