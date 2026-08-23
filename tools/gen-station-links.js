#!/usr/bin/env node
/**
 * NextMetro — station page internal-link modules.
 *
 * Regenerates, on all 98 station pages, from public/data/stations.json +
 * public/data/lines.json (never by hand):
 *   1. hero line pills            -> crawlable <a> to each line page
 *   2. adjacency line badges      -> crawlable <a> to the line page
 *   3. an extension folded into the LAST "Adjacent Stations" card: any line
 *      the badges do not already name in full, the ends of the line, nearby
 *      stations two to four stops out, the nearest interchange, and
 *      contextual hub links
 *
 * There is deliberately no second card. The line and network links live inside
 * Adjacent Stations because they are the same idea at a wider radius, and a
 * separate card next to it left both stretched and half empty on desktop.
 *
 * Idempotent: reruns replace the marked blocks in place.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations, lines, bySlug, esc, pick, stationLink, lineLink, nearestTransfer, injectBlock } = L;

// How many station links the folded block may add, and how far along the route
// "nearby" reaches. The stop window is symmetric by construction: if A lists B
// three stops away, B lists A.
const MAX_STATION_LINKS = 4;
const NEARBY_CAP = 8;
const NEARBY_STOPS = [2, 3, 4];

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

// Lines already named in full by an adjacency badge need no second link.
// Cards that badge several lines abbreviate them ("Or", "Bl"), which is fine
// visually but is not anchor text, so those lines are listed in the block.
function linesNamedByBadges(html) {
  const named = new Set();
  const re = /<a href="\/lines\/([a-z]+)\/" class="adjacent-line-badge[^"]*"[^>]*>([^<]*)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[2].trim() === lines[m[1]].name) named.add(m[1]);
  }
  return named;
}

function adjacentExtra(station, html) {
  const used = new Set([station.slug]);
  const rows = [];

  // Any line the badges do not already name in full.
  const named = linesNamedByBadges(html);
  const unnamed = station.lines.filter((line) => !named.has(line));
  if (unnamed.length) {
    const chips = unnamed
      .map((line) => lineLink(line, { className: `adjacent-line-link adjacent-line-link--${line}` }))
      .join('\n              ');
    rows.push(
      `          <div class="adjacent-extra-row">\n` +
      `            <span class="adjacent-extra-label">${unnamed.length > 1 ? 'Also serves' : 'Also serves'}</span>\n` +
      `            <span class="adjacent-extra-values">\n              ${chips}\n            </span>\n` +
      `          </div>`
    );
  }

  // Ends of the route. Interchanges carry an adjacency card per line already,
  // so this row is reserved for stations served by one or two lines.
  for (const line of station.lines.length > 2 ? [] : station.lines) {
    const meta = lines[line];
    const ends = [meta.order[0], meta.order[meta.order.length - 1]];
    // Both ends always, even where two lines share a terminus — "Green Line
    // runs Branch Ave station" on its own reads like a mistake.
    if (ends.includes(station.slug)) continue;
    const value = `${stationLink(ends[0])} to ${stationLink(ends[1])}`;
    ends.forEach((s) => used.add(s));
    rows.push(
      `          <div class="adjacent-extra-row">\n` +
      `            <span class="adjacent-extra-label">Ends of the ${esc(meta.name)}</span>\n` +
      `            <span class="adjacent-extra-values">${value}</span>\n` +
      `          </div>`
    );
  }

  // Further along the route than the immediate neighbours above.
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
        nearby.push({ slug, stops: d });
      }
    }
  }
  if (nearby.length) {
    const value = nearby
      .map((n) => `<span class="adjacent-extra-item">${stationLink(n.slug)}<span class="adjacent-extra-stops">${n.stops} stops</span></span>`)
      .join('\n              ');
    rows.push(
      `          <div class="adjacent-extra-row">\n` +
      `            <span class="adjacent-extra-label">Further along</span>\n` +
      `            <span class="adjacent-extra-values">\n              ${value}\n            </span>\n` +
      `          </div>`
    );
    nearby.forEach((n) => used.add(n.slug));
  }

  // Nearest interchange on each line served.
  const transfers = [];
  for (const line of station.lines) {
    const t = nearestTransfer(station, line);
    if (!t || used.has(t.slug) || used.size >= MAX_STATION_LINKS + nearby.length + 1) continue;
    used.add(t.slug);
    transfers.push(`<span class="adjacent-extra-item">${stationLink(t.slug)}<span class="adjacent-extra-stops">${t.stops} stop${t.stops === 1 ? '' : 's'} toward ${esc(t.toward)}</span></span>`);
  }
  if (transfers.length) {
    rows.push(
      `          <div class="adjacent-extra-row">\n` +
      `            <span class="adjacent-extra-label">${transfers.length > 1 ? 'Nearest transfers' : 'Nearest transfer'}</span>\n` +
      `            <span class="adjacent-extra-values">\n              ${transfers.join('\n              ')}\n            </span>\n` +
      `          </div>`
    );
  }

  const name = esc(station.name);
  // The station's own fare calculator is already on this page, preselected, so
  // this link points at the fares page as a whole rather than at a lookup the
  // rider can do without leaving.
  const hubs = [
    `<a href="/fares/">${pick(['Fares &amp; passes', 'Metro fares and passes', 'Fare structure &amp; passes'], station.slug)}</a>`,
    `<a href="/hours/">${pick([`${name} first &amp; last train`, 'First and last train times', 'Metro hours &amp; schedule'], station.slug + 'h')}</a>`,
    `<a href="/transfers/">${pick(['Metro transfer stations', 'Where the lines connect', 'All transfer stations'], station.slug + 't')}</a>`,
    `<a href="/stations/">${pick(['All 98 Metro stations', 'Every Metrorail station', 'Metro station directory'], station.slug + 's')}</a>`,
  ];

  return (
    `        <div class="adjacent-extra">\n` +
    rows.join('\n') + '\n' +
    `          <p class="adjacent-extra-links">\n            ` +
    hubs.join('\n            ') + '\n' +
    `          </p>\n` +
    `        </div>`
  );
}

// End of the last <section class="adjacent-card ...> ... </section>, and the
// offset of its closing tag so content can be folded inside it.
function lastAdjacentCard(html) {
  let last = -1;
  const open = /<section class="adjacent-card\b/g;
  let m;
  while ((m = open.exec(html)) !== null) last = m.index;
  if (last < 0) return null;
  let depth = 0;
  const tag = /<(\/?)section\b[^>]*>/g;
  tag.lastIndex = last;
  let t;
  while ((t = tag.exec(html)) !== null) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return { start: last, closeAt: t.index, end: t.index + t[0].length };
  }
  return null;
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

  // --- 3. Retire the separate Connections card, if a previous build left one ---
  html = html.replace(/\s*<!-- nm:links:connections -->[\s\S]*?<!-- \/nm:links:connections -->/g, '');

  // --- 4. Fold the line and network links into the last adjacency card ---
  const card = lastAdjacentCard(html);
  if (!card) { problems.push(station.slug + ': could not locate adjacent-card'); continue; }
  const m = L.markers('adjacent-extra');
  if (html.includes(m.open)) {
    html = injectBlock(html, 'adjacent-extra', adjacentExtra(station, html));
  } else {
    const block = `\n        ${m.open}\n${adjacentExtra(station, html)}\n        ${m.close}\n      `;
    html = html.slice(0, card.closeAt) + block + html.slice(card.closeAt);
  }

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}

if (problems.length) {
  console.error('problems:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}
console.log(`station pages updated: ${changed}/${stations.length}`);
