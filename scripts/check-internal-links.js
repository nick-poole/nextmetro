#!/usr/bin/env node
/*
 * NextMetro — Internal Link Graph QA
 * ----------------------------------
 * Crawls the static build output (public/) and verifies the internal-linking
 * acceptance criteria:
 *   1. Every station and line page has >= MIN_INBOUND inbound links from
 *      distinct pages (the page-2 bank is a subset of these).
 *   2. Each page-2 line page links to every station on its line, and every
 *      station links back to each line page it serves.
 *   3. No broken internal links anywhere in the build.
 *   4. The generated link blocks introduce no inline styles or border-radius.
 *
 * Exit code is non-zero if any check fails.
 *
 * Usage: node scripts/check-internal-links.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const MIN_INBOUND = 5;

const PRIORITY = [
  '/lines/orange/', '/lines/green/', '/lines/silver/', '/lines/red/',
  '/station/foggy-bottom/', '/station/new-carrollton/', '/station/dupont-circle/',
  '/station/farragut-north/', '/station/metro-center/', '/station/brookland-cua/',
  '/station/smithsonian/', '/station/farragut-west/', '/station/shaw-howard-u/',
  '/station/vienna/',
];

// ---------------------------------------------------------------------------
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// Map a file path to its canonical URL.
function urlForFile(file) {
  let rel = '/' + path.relative(PUBLIC, file).split(path.sep).join('/');
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return rel;
}

// Resolve an href to the file that should serve it (or null if external/non-page).
function resolveHref(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return null; // external / protocol-relative / mailto
  if (clean.startsWith('//')) return null;
  if (clean.endsWith('/')) return path.join(PUBLIC, clean, 'index.html');
  if (/\.[a-z0-9]+$/i.test(clean)) return path.join(PUBLIC, clean); // has extension
  return path.join(PUBLIC, clean, 'index.html'); // extensionless page
}

function normalizeTarget(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean.endsWith('/index.html')) return clean.slice(0, -'index.html'.length);
  return clean;
}

// ---------------------------------------------------------------------------
const files = walk(PUBLIC, []);
const inbound = new Map();   // target url -> Set(source url)
const broken = [];           // {source, href}
let totalLinks = 0;

const linkRe = /href="([^"]+)"/g;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const src = urlForFile(file);
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const target = resolveHref(href);
    if (target === null) continue;
    totalLinks++;
    if (!fs.existsSync(target)) {
      broken.push({ source: src, href });
      continue;
    }
    const turl = normalizeTarget(href);
    if (turl === src) continue; // ignore self-links
    if (!inbound.has(turl)) inbound.set(turl, new Set());
    inbound.get(turl).add(src);
  }
}

function inboundCount(url) {
  return inbound.has(url) ? inbound.get(url).size : 0;
}

// ---------------------------------------------------------------------------
let failures = 0;
const note = (ok, msg) => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + msg);
  if (!ok) failures++;
};

console.log('\n== Inbound link coverage (>= ' + MIN_INBOUND + ' distinct sources) ==');
const stationUrls = files
  .map(urlForFile)
  .filter((u) => u.startsWith('/station/') && u.endsWith('/'));
const lineUrls = ['red', 'orange', 'blue', 'yellow', 'green', 'silver'].map((s) => '/lines/' + s + '/');

let lowStations = stationUrls.filter((u) => inboundCount(u) < MIN_INBOUND);
let lowLines = lineUrls.filter((u) => inboundCount(u) < MIN_INBOUND);
note(lowStations.length === 0, stationUrls.length + ' station pages, ' + lowStations.length + ' below threshold' +
  (lowStations.length ? ': ' + lowStations.map((u) => u + '(' + inboundCount(u) + ')').join(', ') : ''));
note(lowLines.length === 0, lineUrls.length + ' line pages, ' + lowLines.length + ' below threshold' +
  (lowLines.length ? ': ' + lowLines.map((u) => u + '(' + inboundCount(u) + ')').join(', ') : ''));

console.log('\n== Priority page-2 targets ==');
for (const u of PRIORITY) {
  note(inboundCount(u) >= MIN_INBOUND, u + ' — ' + inboundCount(u) + ' inbound');
}

console.log('\n== Line <-> station reciprocity ==');
const lines = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'data', 'lines.json'), 'utf8'));
for (const slug of Object.keys(lines)) {
  const lineUrl = '/lines/' + slug + '/';
  const lineHtml = fs.readFileSync(path.join(PUBLIC, 'lines', slug, 'index.html'), 'utf8');
  let missingFromLine = 0;
  let missingBack = 0;
  for (const st of lines[slug].stations) {
    if (!lineHtml.includes('href="/station/' + st + '/"')) missingFromLine++;
    const stFile = path.join(PUBLIC, 'station', st, 'index.html');
    if (fs.existsSync(stFile)) {
      const stHtml = fs.readFileSync(stFile, 'utf8');
      // a real in-content anchor to the line page (not only the footer chip)
      const count = (stHtml.match(new RegExp('href="' + lineUrl + '"', 'g')) || []).length;
      if (count < 2) missingBack++; // footer chip is 1; station-links pill makes 2+
    }
  }
  note(missingFromLine === 0 && missingBack === 0,
    slug + ' line: ' + lines[slug].stations.length + ' stations, ' +
    missingFromLine + ' not linked from line page, ' + missingBack + ' missing in-content backlink');
}

console.log('\n== Broken internal links ==');
note(broken.length === 0, broken.length + ' broken' +
  (broken.length ? ': ' + broken.slice(0, 10).map((b) => b.href + ' in ' + b.source).join('; ') : ''));

console.log('\n== Generated blocks: no inline style / border-radius ==');
let styleViolations = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('INTERNAL-LINKS:START');
  if (start === -1) continue;
  const end = html.indexOf('INTERNAL-LINKS:END', start);
  const block = html.slice(start, end);
  if (/style=|border-radius/i.test(block)) styleViolations++;
}
note(styleViolations === 0, styleViolations + ' generated blocks with inline style/border-radius');

console.log('\n== Summary ==');
console.log('  Files crawled:      ' + files.length);
console.log('  Internal links:     ' + totalLinks);
console.log('  Distinct targets:   ' + inbound.size);
console.log('  Result: ' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
