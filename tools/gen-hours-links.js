#!/usr/bin/env node
/**
 * NextMetro — /hours/ internal links.
 *
 * The page already links each line page from its accordion ("See all Red Line
 * stations"). What it lacked was crawlable links into station pages, on the
 * page where "first and last train varies by station" is the whole point.
 *
 * Adds, from public/data/stations.json + lines.json:
 *   1. line names in the frequency tables -> line pages
 *   2. terminus names in the first/last-train direction headings -> station pages
 *   3. a "First & last train at the transfer stations" block
 *
 * Idempotent: reruns replace the marked block and re-link already-linked names.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations, lines, esc, injectBlock, LINE_ORDER, resolveStationName, bySlug } = L;

const file = path.join(ROOT, 'hours', 'index.html');
const before = fs.readFileSync(file, 'utf8');
let html = before;
const problems = [];

// --- 1. Frequency table line names become line-page links ---
html = html.replace(
  /(<span class="hours-line-dot hours-line-dot--([a-z]+)" aria-hidden="true"><\/span> )<strong>(?:<a[^>]*>)?([^<]+?)(?:<\/a>)?<\/strong>/g,
  (full, lead, line, label) => {
    if (!lines[line]) { problems.push('unknown line in frequency table: ' + line); return full; }
    return `${lead}<strong><a href="/lines/${line}/">${label}</a></strong>`;
  }
);

// --- 2. Terminus names in first/last-train direction headings ---
html = html.replace(
  /<h4 class="hours-direction-label">([\s\S]*?)<\/h4>/g,
  (full, inner) => {
    const plain = inner.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, '$1');
    // Headings read "A &rarr; B", sometimes "A / B" for a branching terminus,
    // and may carry a trailing note span. Split on the separators, keep the
    // note and all surrounding whitespace untouched.
    const parts = plain.split(/(&rarr;|&harr;|\u2192|\s\/\s)/);
    let touched = false;
    const rebuilt = parts.map((part) => {
      if (/^(&rarr;|&harr;|\u2192|\s\/\s)$/.test(part)) return part;
      const noteMatch = part.match(/<span class="hours-direction-note">[\s\S]*?<\/span>\s*$/);
      const note = noteMatch ? noteMatch[0] : '';
      const body = note ? part.slice(0, part.length - note.length) : part;
      const lead = body.match(/^\s*/)[0];
      const trail = body.match(/\s*$/)[0];
      const label = body.trim();
      if (!label) return part;
      const slug = resolveStationName(label);
      if (!slug) { problems.push('unresolved terminus heading: "' + label + '"'); return part; }
      touched = true;
      return `${lead}<a href="/station/${slug}/">${label}</a>${trail}${note}`;
    }).join('');
    return touched ? `<h4 class="hours-direction-label">${rebuilt}</h4>` : full;
  }
);

// --- 3. Transfer-station first/last train block ---
// Stations served by more than one line, in a stable order (most lines first,
// then route order on their first line).
const transfers = stations
  .filter((s) => L.isInterchange(s))
  .sort((a, b) => b.lines.length - a.lines.length || a.name.localeCompare(b.name));

// Route-order station index. "First and last train varies by station" is this
// page's own premise, so the per-station times live one click away.
function stationIndex() {
  return LINE_ORDER.map((line) => {
    const meta = lines[line];
    const links = meta.order
      .map((slug) => {
        const st = bySlug.get(slug);
        return `          <a href="/station/${slug}/" class="hours-line-station">${esc(st.name)}</a>`;
      })
      .join('\n');
    return (
      `      <details class="hours-line-stations hours-line-stations--${line}">\n` +
      `        <summary class="hours-line-stations-header">\n` +
      `          <span class="hours-line-dot hours-line-dot--${line}" aria-hidden="true"></span>\n` +
      `          <span>${esc(meta.name)} &mdash; ${meta.order.length} stations, ${esc(meta.termini[0])} to ${esc(meta.termini[1])}</span>\n` +
      `        </summary>\n` +
      `        <div class="hours-line-stations-body">\n` +
      links + '\n' +
      `        </div>\n` +
      `      </details>`
    );
  }).join('\n');
}

function transferBlock() {
  const rows = transfers.map((s) => {
    // Line markers are decoration: /hours/ already links every line page from
    // the frequency tables and the first/last-train accordions, so making these
    // 8px bars into links would add tap targets without adding destinations.
    // The colour bars are decorative; the line list is real (visually hidden)
    // text, since aria-label is not valid on a plain span.
    const chips = s.lines
      .map((line) => `<span class="hours-station-line hours-station-line--${line}" title="${esc(lines[line].name)}"></span>`)
      .join('');
    const lineNames = s.lines.map((line) => esc(lines[line].name)).join(', ');
    return (
      `        <div class="hours-station-row">\n` +
      `          <a href="/station/${s.slug}/" class="hours-station-link">${esc(s.name)} first &amp; last train</a>\n` +
      `          <span class="hours-station-lines"><span class="visually-hidden">Lines: ${lineNames}</span>${chips}</span>\n` +
      `        </div>`
    );
  }).join('\n');

  return (
    `    <div class="hours-section animate-in d5">\n` +
    `      <h2 class="hours-section-heading">First &amp; Last Train at Transfer Stations</h2>\n` +
    `      <p class="hours-text">\n` +
    `        Last trains matter most where you change lines — miss the connection and the rest of the trip is gone. Each station page carries its own first and last train times alongside live arrivals.\n` +
    `      </p>\n` +
    `      <div class="hours-station-grid">\n` +
    rows + '\n' +
    `      </div>\n` +
    `      <p class="hours-text" style="margin-top:var(--nm-space-md)">\n` +
    `        For any other station, see <a href="/stations/">the full station directory</a> or <a href="/transfers/">the transfer station guide</a>. Trip costs are on the <a href="/fares/">fare calculator</a>.\n` +
    `      </p>\n` +
    `    </div>\n\n` +
    `    <div class="hours-section animate-in d5">\n` +
    `      <h2 class="hours-section-heading">First &amp; Last Train by Station</h2>\n` +
    `      <p class="hours-text">\n` +
    `        Terminal departure times are above; the times at your own station sit somewhere between them. Open a line to jump to any station on it, in route order.\n` +
    `      </p>\n` +
    stationIndex() + '\n' +
    `    </div>`
  );
}

html = injectBlock(html, 'hours-transfer-stations', transferBlock(), {
  before: '    <!-- Late Night Service -->',
});

if (problems.length) {
  console.error('problems:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}
if (html !== before) fs.writeFileSync(file, html);
console.log(`/hours/: ${LINE_ORDER.length} line links in frequency tables, terminus headings linked, ${transfers.length} transfer stations linked`);
