#!/usr/bin/env node
/**
 * NextMetro — internal link graph audit.
 *
 * Crawls the static output in public/ and reports, per URL:
 *   - inbound links from distinct pages
 *   - inbound links excluding the site-wide nav/footer chrome
 *   - broken internal links
 *
 * Usage:
 *   node tools/link-audit.js                 # summary + broken links
 *   node tools/link-audit.js --page /fares/  # detail for one URL
 *   node tools/link-audit.js --json out.json
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.env.NM_PUBLIC_ROOT || path.join(__dirname, '..', 'public');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function urlForFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

// Strip the site-wide chrome so "contextual" links can be counted separately.
function stripChrome(html) {
  return html
    .replace(/<nav class="nm-nav[\s\S]*?<\/nav>/g, '')
    .replace(/<nav class="nm-mobile-menu[\s\S]*?<\/nav>/g, '')
    .replace(/<div class="nm-mobile-menu[\s\S]*?<\/div>/g, '')
    .replace(/<footer class="nm-footer"[\s\S]*?<\/footer>/g, '')
    .replace(/<nav class="nm-breadcrumb[\s\S]*?<\/nav>/g, '');
}

const ANCHOR = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

function extractLinks(html) {
  const links = [];
  let m;
  ANCHOR.lastIndex = 0;
  while ((m = ANCHOR.exec(html)) !== null) {
    const attrs = m[1];
    const href = (attrs.match(/\shref\s*=\s*"([^"]*)"/i) || [])[1];
    if (!href) continue;
    const text = m[2].replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    links.push({ href, text });
  }
  return links;
}

function isInternal(href) {
  if (!href) return false;
  if (/^(https?:)?\/\//i.test(href)) return href.startsWith('https://nextmetro.live');
  return href.startsWith('/');
}

function normalize(href) {
  let u = href.replace(/^https:\/\/nextmetro\.live/, '');
  u = u.split('#')[0].split('?')[0];
  if (u === '') u = '/';
  return u;
}

const files = walk(ROOT);
const pages = new Set(files.map(urlForFile));
// Static assets that legitimately exist without being .html pages.
const assetExists = (u) => fs.existsSync(path.join(ROOT, u.replace(/^\//, '')));

const inbound = new Map();   // url -> Set(source urls)
const inboundBody = new Map(); // url -> Set(source urls), chrome excluded
const anchorsFor = new Map();  // url -> [{from, text}]
const broken = [];

function add(map, key, val) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(val);
}

for (const file of files) {
  const from = urlForFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const body = stripChrome(html);
  const bodyHrefs = new Set(extractLinks(body).map((l) => normalize(l.href)));

  for (const link of extractLinks(html)) {
    if (!isInternal(link.href)) continue;
    const to = normalize(link.href);
    if (!to.startsWith('/')) continue;
    if (!pages.has(to) && !assetExists(to)) {
      broken.push({ from, to, text: link.text });
      continue;
    }
    if (to === from) continue;
    add(inbound, to, from);
    if (bodyHrefs.has(to)) {
      add(inboundBody, to, from);
      if (!anchorsFor.has(to)) anchorsFor.set(to, []);
      anchorsFor.get(to).push({ from, text: link.text });
    }
  }
}

const args = process.argv.slice(2);
const pageArg = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;
const jsonArg = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

const rows = [...pages].sort().map((u) => ({
  url: u,
  inbound: (inbound.get(u) || new Set()).size,
  contextual: (inboundBody.get(u) || new Set()).size,
}));

if (jsonArg) {
  fs.writeFileSync(jsonArg, JSON.stringify({ rows, broken, anchors: Object.fromEntries([...anchorsFor]) }, null, 2));
  console.log('wrote ' + jsonArg);
}

if (pageArg) {
  const u = pageArg.endsWith('/') || pageArg.includes('.') ? pageArg : pageArg + '/';
  const row = rows.find((r) => r.url === u);
  if (!row) { console.error('no such page: ' + u); process.exit(1); }
  console.log(`${u}  inbound=${row.inbound}  contextual=${row.contextual}`);
  for (const a of (anchorsFor.get(u) || [])) console.log(`  ${a.from}  "${a.text}"`);
  process.exit(0);
}

const bucket = (pred) => rows.filter(pred);
const stationRows = bucket((r) => r.url.startsWith('/station/'));
const lineRows = bucket((r) => r.url.startsWith('/lines/'));

const stat = (list) => {
  const c = list.map((r) => r.contextual).sort((a, b) => a - b);
  const sum = c.reduce((a, b) => a + b, 0);
  return { n: list.length, min: c[0] ?? 0, median: c[Math.floor(c.length / 2)] ?? 0, max: c[c.length - 1] ?? 0, mean: (sum / (c.length || 1)).toFixed(1) };
};

console.log('pages crawled: ' + files.length);
console.log('\ncontextual (non-chrome) inbound links, distinct source pages:');
console.log('  station pages: ' + JSON.stringify(stat(stationRows)));
console.log('  line pages:    ' + JSON.stringify(stat(lineRows)));
console.log('\nhubs:');
for (const u of ['/', '/fares/', '/hours/', '/stations/', '/alerts/', '/elevators/', '/transfers/']) {
  const r = rows.find((x) => x.url === u);
  if (r) console.log(`  ${u.padEnd(14)} inbound=${String(r.inbound).padStart(4)}  contextual=${String(r.contextual).padStart(4)}`);
}
console.log('\nline pages:');
for (const r of lineRows) console.log(`  ${r.url.padEnd(18)} inbound=${String(r.inbound).padStart(4)}  contextual=${String(r.contextual).padStart(4)}`);

const under5 = stationRows.filter((r) => r.contextual < 5);
console.log(`\nstation pages with <5 contextual inbound links: ${under5.length}/${stationRows.length}`);

console.log(`\nbroken internal links: ${broken.length}`);
for (const b of broken.slice(0, 40)) console.log(`  ${b.from} -> ${b.to}  "${b.text}"`);
