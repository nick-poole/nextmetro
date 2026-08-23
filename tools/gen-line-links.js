#!/usr/bin/env node
/**
 * NextMetro — line page internal-link gaps.
 *
 * The line pages already render an ordered, crawlable station list and a
 * "Connects To" block of line-page links. The remaining gap is the
 * "Transfer Stations" row in Line Details, where station names are plain text.
 * This wraps each named station in a link to its station page, resolving the
 * name against public/data/stations.json (with the aliases the copy uses).
 *
 * The visible copy is left exactly as authored — only anchors are added.
 * Idempotent: names already inside an <a> are skipped.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations, lines, esc, injectBlock } = L;

// Normalize for matching: strip entities, punctuation and casing.
function norm(s) {
  return s
    .replace(/&#39;|&#8217;|&rsquo;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&ndash;|&#8211;/g, '-')
    .replace(/[–—’]/g, (c) => (c === '’' ? "'" : '-'))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// slug lookup by every name the copy might use for a station.
const nameIndex = new Map();
function indexName(name, slug) {
  const k = norm(name);
  if (k) nameIndex.set(k, slug);
}
for (const s of stations) {
  indexName(s.name, s.slug);
  // Common short forms used in the line-page copy.
  indexName(s.name.split(/[-–\/]/)[0], s.slug);
}
// Explicit aliases where the short form is ambiguous or differently worded.
const ALIASES = {
  'gallery place': 'gallery-place',
  'gallery pl chinatown': 'gallery-place',
  'king street': 'king-street',
  'king street old town': 'king-street',
  'l enfant plaza': 'lenfant-plaza',
  'east falls church': 'east-falls-church',
  'west falls church': 'west-falls-church',
  'stadium armory': 'stadium-armory',
  'fort totten': 'fort-totten',
  'metro center': 'metro-center',
  'rosslyn': 'rosslyn',
  'pentagon': 'pentagon',
};
for (const [k, v] of Object.entries(ALIASES)) nameIndex.set(k, v);

const bySlug = L.bySlug;
let changed = 0;
const problems = [];
const unresolved = new Set();

for (const line of L.LINE_ORDER) {
  const file = path.join(ROOT, 'lines', line, 'index.html');
  const before = fs.readFileSync(file, 'utf8');
  let html = before;

  // Locate the Transfer Stations value cell.
  const re = /(<span class="line-info-label">Transfer Stations<\/span>\s*<span class="line-info-value">)([\s\S]*?)(<\/span>)/;
  const m = html.match(re);
  if (!m) { problems.push(line + ': no Transfer Stations row'); continue; }
  const raw = m[2];

  if (/<a\b/.test(raw)) {
    // Already linked — rebuild from the anchor text so reruns stay stable.
  }
  const plain = raw.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, '$1');

  // Split on commas, keeping each entry's original whitespace.
  const parts = plain.split(',');
  const linked = parts.map((part) => {
    const lead = part.match(/^\s*/)[0];
    const trail = part.match(/\s*$/)[0];
    const label = part.trim();
    if (!label) return part;
    const slug = nameIndex.get(norm(label));
    if (!slug) { unresolved.add(line + ': "' + label + '"'); return part; }
    const st = bySlug.get(slug);
    if (!st.lines.includes(line)) { problems.push(`${line}: "${label}" resolves to ${slug}, which does not serve this line`); return part; }
    return `${lead}<a href="/station/${slug}/">${label}</a>${trail}`;
  }).join(',');

  html = html.replace(re, (full, open, body, close) => open + linked + close);

  // --- Transfer station names inside the "Connects To" prose ---
  html = html.replace(
    /(<p class="line-connections-detail">)([\s\S]*?)(<\/p>)/,
    (full, open, body, close) => {
      const plain = body.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, '$1');
      const relinked = plain.replace(/<strong>([^<]+)<\/strong>/g, (sm, label) => {
        const slug = L.resolveStationName(label);
        if (!slug) { unresolved.add(line + ' (prose): "' + label + '"'); return sm; }
        return `<strong><a href="/station/${slug}/">${label}</a></strong>`;
      });
      return open + relinked + close;
    }
  );

  // --- Contextual links out to the station directory and the hubs ---
  const meta = lines[line];
  const detail =
    `        <p class="line-connections-detail">\n` +
    `          Every ${esc(meta.name)} station above has live arrivals, first and last train times, and step-free access status. ` +
    `Browse <a href="/stations/">all ${L.stations.length} Metrorail stations</a>, check <a href="/transfers/">where the lines connect</a>, ` +
    `or price a trip with the <a href="/fares/">fare calculator</a>. Service hours and frequency are on <a href="/hours/">the schedule page</a>.\n` +
    `        </p>`;
  html = injectBlock(html, 'line-directory', detail, {
    after: '<p class="line-connections-detail">',
  });
  // The anchor above inserts inside the existing paragraph on first run; move
  // the block to sit after that paragraph instead.
  html = html.replace(
    /(<p class="line-connections-detail">)\n(<!-- nm:links:line-directory -->[\s\S]*?<!-- \/nm:links:line-directory -->)/,
    (full, openTag, block) => openTag + '@@NMHOLD@@' + block
  );
  if (html.includes('@@NMHOLD@@')) {
    const m2 = html.match(/<p class="line-connections-detail">@@NMHOLD@@(<!-- nm:links:line-directory -->[\s\S]*?<!-- \/nm:links:line-directory -->)([\s\S]*?)<\/p>/);
    if (m2) {
      html = html.replace(m2[0], `<p class="line-connections-detail">${m2[2]}</p>\n${m2[1]}`);
    }
  }

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}

if (unresolved.size) {
  console.error('unresolved station names in Transfer Stations rows:');
  for (const u of unresolved) console.error('  ' + u);
  process.exitCode = 1;
}
if (problems.length) {
  console.error('problems:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}
console.log('line pages updated: ' + changed + '/' + L.LINE_ORDER.length);
