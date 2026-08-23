'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'public');

const stations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stations.json'), 'utf8'));
const lines = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lines.json'), 'utf8'));
const bySlug = new Map(stations.map((s) => [s.slug, s]));
const byCode = new Map(stations.map((s) => [s.code, s]));

const LINE_ORDER = ['red', 'orange', 'blue', 'green', 'yellow', 'silver'];

// Station names in stations.json already carry HTML entities where needed
// (e.g. "Downtown Largo"). Escape only what is definitely raw.
function esc(str) {
  return String(str)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Deterministic per-slug pick so anchor text varies across the site
// without being random between builds.
function pick(list, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

// "Union Station station" reads badly — only append the word where the name
// does not already carry it.
function stationAnchorText(name) {
  return /\bstation\b/i.test(name) ? esc(name) : esc(name) + ' station';
}

function stationLink(slug, opts = {}) {
  const s = bySlug.get(slug);
  if (!s) throw new Error('unknown station slug: ' + slug);
  const text = opts.text || stationAnchorText(s.name);
  const cls = opts.className ? ` class="${opts.className}"` : '';
  return `<a href="/station/${s.slug}/"${cls}>${text}</a>`;
}

function lineLink(line, opts = {}) {
  const l = lines[line];
  const text = opts.text || esc(l.name);
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const aria = opts.ariaLabel ? ` aria-label="${esc(opts.ariaLabel)}"` : '';
  return `<a href="/lines/${line}/"${cls}${aria}>${text}</a>`;
}

// Real interchanges — see isInterchange() below. Shared-track stations where
// two lines run the identical corridor are not transfer points.
const transferSlugs = new Set();

// Nearest transfer station to `station` along `line`, excluding itself.
function nearestTransfer(station, line) {
  const order = lines[line].order;
  const i = station.lineSequence[line];
  for (let d = 1; d < order.length; d++) {
    for (const j of [i - d, i + d]) {
      if (j < 0 || j >= order.length) continue;
      const slug = order[j];
      if (slug === station.slug) continue;
      if (transferSlugs.has(slug)) return { slug, stops: d, toward: j > i ? lines[line].termini[1] : lines[line].termini[0] };
    }
  }
  return null;
}

// ---- Marker-based idempotent injection ----
function markers(id, style) {
  if (style === 'js') return { open: `/* nm:links:${id} */`, close: `/* /nm:links:${id} */` };
  if (style === 'css') return { open: `/* nm:links:${id} */`, close: `/* /nm:links:${id} */` };
  return { open: `<!-- nm:links:${id} -->`, close: `<!-- /nm:links:${id} -->` };
}

/**
 * Replace the content between markers, or insert a fresh marked block.
 * `anchor` describes where to insert on first run:
 *   { after: <string|RegExp> } or { before: <string|RegExp> }
 */
function injectBlock(html, id, content, anchor, style) {
  const m = markers(id, style);
  const block = `${m.open}\n${content}\n${m.close}`;
  const existing = new RegExp(
    m.open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + m.close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  if (existing.test(html)) return html.replace(existing, block);
  if (!anchor) throw new Error('block ' + id + ' not present and no anchor given');
  if (anchor.after) {
    const idx = typeof anchor.after === 'string' ? html.indexOf(anchor.after) : (html.match(anchor.after) || {}).index;
    if (idx === undefined || idx < 0) throw new Error('anchor not found for ' + id);
    const len = typeof anchor.after === 'string' ? anchor.after.length : html.match(anchor.after)[0].length;
    return html.slice(0, idx + len) + '\n' + block + html.slice(idx + len);
  }
  const idx = typeof anchor.before === 'string' ? html.indexOf(anchor.before) : (html.match(anchor.before) || {}).index;
  if (idx === undefined || idx < 0) throw new Error('anchor not found for ' + id);
  return html.slice(0, idx) + block + '\n' + html.slice(idx);
}


// ---- Resolving station names as written in page copy ----
function normName(s) {
  return String(s)
    .replace(/&#39;|&#8217;|&rsquo;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&ndash;|&#8211;|&mdash;/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2019]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const nameIndex = new Map();
for (const s of stations) {
  nameIndex.set(normName(s.name), s.slug);
  const short = s.name.split(/[-\u2013\/]/)[0];
  if (!nameIndex.has(normName(short))) nameIndex.set(normName(short), s.slug);
}
// Short forms the hand-written copy uses.
for (const [alias, slug] of Object.entries({
  'gallery place': 'gallery-place',
  'gallery pl chinatown': 'gallery-place',
  'gallery place chinatown': 'gallery-place',
  'king street': 'king-street',
  'king street old town': 'king-street',
  'l enfant plaza': 'lenfant-plaza',
  'east falls church': 'east-falls-church',
  'west falls church': 'west-falls-church',
  'stadium armory': 'stadium-armory',
  'fort totten': 'fort-totten',
  'metro center': 'metro-center',
  'largo': 'downtown-largo',
  'downtown largo': 'downtown-largo',
  'vienna': 'vienna',
  'vienna fairfax gmu': 'vienna',
  'dulles airport': 'washington-dulles',
  'washington dulles': 'washington-dulles',
  'branch ave': 'branch-ave',
  'huntington': 'huntington',
  'greenbelt': 'greenbelt',
  'franconia springfield': 'franconia-springfield',
  'shady grove': 'shady-grove',
  'glenmont': 'glenmont',
  'new carrollton': 'new-carrollton',
  'ashburn': 'ashburn',
})) nameIndex.set(alias, slug);

function resolveStationName(label) {
  const key = normName(label);
  if (!key) return null;
  const exact = nameIndex.get(key);
  if (exact) return exact;
  // Copy often shortens a station name ("Mt Vernon Sq" for
  // "Mt Vernon Sq 7th St-Convention Center"). Accept a prefix only when it
  // matches exactly one station, so a shortening can never point at the
  // wrong page.
  const prefixed = stations.filter((st) => normName(st.name).startsWith(key + ' '));
  return prefixed.length === 1 ? prefixed[0].slug : null;
}


// A station is a real interchange when the lines it serves do not share the
// same neighbours — i.e. the routes actually diverge there, as opposed to
// shared-track stations where two lines run the identical corridor.
function neighbours(station, line) {
  const order = lines[line].order;
  const i = station.lineSequence[line];
  return [order[i - 1] || null, order[i + 1] || null];
}

function isInterchange(station) {
  if (station.lines.length < 2) return false;
  const sigs = station.lines.map((line) => neighbours(station, line).join('|'));
  return new Set(sigs).size > 1;
}

for (const s of stations) if (isInterchange(s)) transferSlugs.add(s.slug);

module.exports = {
  ROOT, stations, lines, bySlug, byCode, LINE_ORDER,
  esc, pick, stationLink, stationAnchorText, lineLink, transferSlugs, nearestTransfer,
  injectBlock, markers, normName, resolveStationName, nameIndex, neighbours, isInterchange,
};
