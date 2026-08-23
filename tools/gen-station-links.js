#!/usr/bin/env node
/**
 * NextMetro — station page internal-link modules.
 *
 * Regenerates, on all 98 station pages, from public/data/stations.json +
 * public/data/lines.json (never by hand):
 *   1. hero line pills  -> crawlable <a> to each line page
 *   2. adjacency badges -> crawlable <a> to the line page
 *   3. a "Connections" card: every line served, both termini, nearest
 *      transfer station, and contextual hub links
 *
 * Idempotent: reruns replace the marked blocks in place.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations, lines, bySlug, esc, pick, stationLink, lineLink, nearestTransfer, injectBlock } = L;

const MAX_STATION_LINKS = 4;

function heroPills(station) {
  const pills = station.lines.map((line) =>
    lineLink(line, {
      className: `line-pill line-pill--${line}`,
      text: `<span class="line-pill-dot" aria-hidden="true"></span>${esc(lines[line].name)}`,
      ariaLabel: `${lines[line].name} — stations and status`,
    })
  );
  return '      ' + pills.join('\n      ');
}

function connectionsCard(station) {
  const used = new Set([station.slug]);
  const rows = [];

  // Which lines call here.
  const lineChips = station.lines
    .map((line) => lineLink(line, { className: `connections-line connections-line--${line}` }))
    .join('\n            ');
  rows.push(
    `          <div class="connections-row">\n` +
    `            <span class="connections-label">${station.lines.length > 1 ? 'Lines' : 'Line'}</span>\n` +
    `            <span class="connections-values">\n            ${lineChips}\n            </span>\n` +
    `          </div>`
  );

  // Route ends, per line. Terminus links concentrate authority on the ends of
  // the network. Interchanges already carry a per-line adjacency card each, so
  // this row is reserved for stations served by one or two lines — it keeps the
  // busiest pages from turning into a list.
  for (const line of station.lines.length > 2 ? [] : station.lines) {
    const meta = lines[line];
    const ends = [meta.order[0], meta.order[meta.order.length - 1]]
      .filter((slug) => !used.has(slug) && used.size < MAX_STATION_LINKS + 1);
    if (!ends.length) continue;
    ends.forEach((s) => used.add(s));
    const value = ends.length === 2
      ? `${stationLink(ends[0])} to ${stationLink(ends[1])}`
      : `${stationLink(ends[0])}`;
    rows.push(
      `          <div class="connections-row">\n` +
      `            <span class="connections-label">${esc(meta.name)} runs</span>\n` +
      `            <span class="connections-values">${value}</span>\n` +
      `          </div>`
    );
  }

  // Nearby stations along the line, two and three stops out. The adjacency
  // card already covers the immediate neighbours, so this extends the corridor
  // without repeating it. Symmetric by construction: if A lists B two stops
  // away, B lists A.
  const NEARBY_CAP = 8;
  const NEARBY_STOPS = [2, 3, 4];
  const nearby = [];
  for (const d of NEARBY_STOPS) {
    for (const line of station.lines) {
      const meta = lines[line];
      const i = station.lineSequence[line];
      for (const j of [i - d, i + d]) {
        if (nearby.length >= NEARBY_CAP) break;
        if (j < 0 || j >= meta.order.length) continue;
        const slug = meta.order[j];
        if (slug === station.slug || used.has(slug) || nearby.some((n) => n.slug === slug)) continue;
        nearby.push({ slug, stops: d, line });
      }
    }
  }
  if (nearby.length) {
    nearby.sort((a, b) => a.stops - b.stops);
    const value = nearby
      .map((n) => `<span class="connections-nearby">${stationLink(n.slug)}<span class="connections-stops">${n.stops} stops</span></span>`)
      .join('\n              ');
    rows.push(
      `          <div class="connections-row">\n` +
      `            <span class="connections-label">Nearby on the line</span>\n` +
      `            <span class="connections-values">\n              ${value}\n            </span>\n` +
      `          </div>`
    );
    nearby.forEach((n) => used.add(n.slug));
  }

  // Nearest interchange on each line served.
  const transfers = [];
  for (const line of station.lines) {
    const t = nearestTransfer(station, line);
    if (!t || used.has(t.slug) || used.size >= MAX_STATION_LINKS + 1) continue;
    used.add(t.slug);
    transfers.push(`${stationLink(t.slug)} &middot; ${t.stops} stop${t.stops === 1 ? '' : 's'} toward ${esc(t.toward)}`);
  }
  if (transfers.length) {
    rows.push(
      `          <div class="connections-row">\n` +
      `            <span class="connections-label">${transfers.length > 1 ? 'Nearest transfers' : 'Nearest transfer'}</span>\n` +
      `            <span class="connections-values">\n              ${transfers.join('<br />\n              ')}\n            </span>\n` +
      `          </div>`
    );
  }

  const name = esc(station.name);
  const hubs = [
    `<a href="/fares/">${pick([`Fares from ${name}`, `${name} fare calculator`, 'Metro fare calculator'], station.slug)}</a>`,
    `<a href="/hours/">${pick([`${name} first &amp; last train`, 'First and last train times', 'Metro hours &amp; schedule'], station.slug + 'h')}</a>`,
    `<a href="/transfers/">${pick(['Metro transfer stations', 'Where the lines connect', 'All transfer stations'], station.slug + 't')}</a>`,
    `<a href="/stations/">${pick(['All 98 Metro stations', 'Every Metrorail station', 'Metro station directory'], station.slug + 's')}</a>`,
  ];

  return (
    `      <section class="connections-card grid-side animate-in d4" aria-labelledby="connections-title">\n` +
    `        <div class="connections-header">\n` +
    `          <h2 class="connections-title" id="connections-title">Connections</h2>\n` +
    `        </div>\n` +
    `        <div class="connections-body">\n` +
    rows.join('\n') + '\n' +
    `        </div>\n` +
    `        <p class="connections-links">\n          ` +
    hubs.join('\n          <span class="connections-sep" aria-hidden="true">&middot;</span>\n          ') + '\n' +
    `        </p>\n` +
    `      </section>`
  );
}

// Find the end of the last <section class="adjacent-card ...> ... </section>.
function endOfLastAdjacentCard(html) {
  let last = -1;
  const open = /<section class="adjacent-card\b/g;
  let m;
  while ((m = open.exec(html)) !== null) last = m.index;
  if (last < 0) return -1;
  // Walk forward balancing <section> tags.
  let depth = 0;
  const tag = /<(\/?)section\b[^>]*>/g;
  tag.lastIndex = last;
  let t;
  while ((t = tag.exec(html)) !== null) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return t.index + t[0].length;
  }
  return -1;
}

let changed = 0;
const problems = [];

for (const station of stations) {
  const file = path.join(ROOT, 'station', station.slug, 'index.html');
  if (!fs.existsSync(file)) { problems.push('no page for ' + station.slug); continue; }
  const before = fs.readFileSync(file, 'utf8');
  let html = before;

  // --- 1. Hero line pills: static, crawlable anchors ---
  const pillsRe = /<div class="line-pills" id="line-pills"([^>]*)>([\s\S]*?)<\/div>/;
  if (!pillsRe.test(html)) { problems.push(station.slug + ': no line-pills container'); continue; }
  html = html.replace(pillsRe, (full, attrs) => {
    const cleaned = attrs.replace(/\s*data-static="true"/, '');
    return `<div class="line-pills" id="line-pills"${cleaned} data-static="true">\n` +
      `<!-- nm:links:line-pills -->\n${heroPills(station)}\n<!-- /nm:links:line-pills -->\n    </div>`;
  });

  // --- 2. Adjacency line badges become line-page links ---
  html = html.replace(
    /<span class="adjacent-line-badge adjacent-line-badge--([a-z]+)">([^<]*)<\/span>/g,
    (full, line, text) => {
      if (!lines[line]) { problems.push(station.slug + ': unknown badge line ' + line); return full; }
      return `<a href="/lines/${line}/" class="adjacent-line-badge adjacent-line-badge--${line}" aria-label="${lines[line].name} — stations and status">${text}</a>`;
    }
  );

  // --- 3. Connections card ---
  const insertAt = endOfLastAdjacentCard(html);
  if (insertAt < 0) { problems.push(station.slug + ': could not locate adjacent-card'); continue; }
  const m = L.markers('connections');
  if (html.includes(m.open)) {
    html = injectBlock(html, 'connections', connectionsCard(station));
  } else {
    const block = `\n\n      ${m.open}\n${connectionsCard(station)}\n      ${m.close}`;
    html = html.slice(0, insertAt) + block + html.slice(insertAt);
  }

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}

if (problems.length) {
  console.error('problems:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}
console.log(`station pages updated: ${changed}/${stations.length}`);
