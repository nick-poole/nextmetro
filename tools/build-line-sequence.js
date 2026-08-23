#!/usr/bin/env node
/**
 * NextMetro — populate per-line route sequence in the station data model.
 *
 * Route order is NOT authored here. It is read out of the ordered station rows
 * already rendered on each line page (public/lines/{color}/index.html), which is
 * the repo's existing source of truth for route sequence. This script only lifts
 * that ordering into public/data/stations.json so templates can derive prev/next
 * without re-parsing HTML.
 *
 * Writes, per station:
 *   "lineSequence": { "red": 12, "orange": 3 }   // 0-based index along the route
 *
 * Writes public/data/lines.json:
 *   { "red": { "name", "slug", "color", "order": [slug, ...], "termini": [a, b] } }
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const LINES = ['red', 'orange', 'blue', 'green', 'yellow', 'silver'];

const LINE_META = {
  red:    { name: 'Red Line',    abbr: 'Rd', color: '#D41140' },
  orange: { name: 'Orange Line', abbr: 'Or', color: '#F09500' },
  blue:   { name: 'Blue Line',   abbr: 'Bl', color: '#00A8E8' },
  green:  { name: 'Green Line',  abbr: 'Gr', color: '#00BD45' },
  yellow: { name: 'Yellow Line', abbr: 'Yl', color: '#FFD400' },
  silver: { name: 'Silver Line', abbr: 'Sv', color: '#9BA5A5' },
};

// Pull the ordered station rows out of a line page in document order.
function readLineOrder(line) {
  const file = path.join(ROOT, 'lines', line, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const listMatch = html.match(/<div class="line-stations-list"[^>]*>([\s\S]*?)<\/div>\s*<\/section>/);
  if (!listMatch) throw new Error('no line-stations-list found on /lines/' + line + '/');
  const rows = [...listMatch[1].matchAll(/<a\s+href="\/station\/([a-z0-9-]+)\/"\s+class="line-station-row[^"]*"\s+data-code="([A-Z0-9]+)"/g)];
  if (!rows.length) throw new Error('no station rows parsed on /lines/' + line + '/');
  return rows.map((m) => ({ slug: m[1], code: m[2] }));
}

const stations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stations.json'), 'utf8'));
const bySlug = new Map(stations.map((s) => [s.slug, s]));

const lines = {};
const problems = [];

for (const line of LINES) {
  const order = readLineOrder(line);
  const slugs = [];
  order.forEach((row, i) => {
    const station = bySlug.get(row.slug);
    if (!station) { problems.push(`/lines/${line}/ row ${row.slug} has no entry in stations.json`); return; }
    if (!station.lines.includes(line)) problems.push(`${row.slug} appears on /lines/${line}/ but its data lists [${station.lines}]`);
    station.lineSequence = station.lineSequence || {};
    station.lineSequence[line] = i;
    slugs.push(row.slug);
  });
  lines[line] = {
    name: LINE_META[line].name,
    slug: line,
    abbr: LINE_META[line].abbr,
    color: LINE_META[line].color,
    order: slugs,
    termini: [bySlug.get(slugs[0]).name, bySlug.get(slugs[slugs.length - 1]).name],
  };
}

// Every station's declared lines must have landed a sequence index.
for (const s of stations) {
  for (const line of s.lines) {
    if (!s.lineSequence || s.lineSequence[line] === undefined) {
      problems.push(`${s.slug} declares line "${line}" but does not appear on /lines/${line}/`);
    }
  }
  // Keep key order stable for a clean diff.
  if (s.lineSequence) {
    const ordered = {};
    for (const line of s.lines) if (s.lineSequence[line] !== undefined) ordered[line] = s.lineSequence[line];
    for (const line of Object.keys(s.lineSequence)) if (ordered[line] === undefined) ordered[line] = s.lineSequence[line];
    s.lineSequence = ordered;
  }
}

if (problems.length) {
  console.error('data/route-order inconsistencies:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}

fs.writeFileSync(path.join(ROOT, 'data', 'stations.json'), JSON.stringify(stations, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data', 'lines.json'), JSON.stringify(lines, null, 2) + '\n');

console.log('stations.json: lineSequence populated for ' + stations.filter((s) => s.lineSequence).length + '/' + stations.length + ' stations');
for (const line of LINES) console.log(`  ${line.padEnd(7)} ${String(lines[line].order.length).padStart(2)} stations  ${lines[line].termini[0]} -> ${lines[line].termini[1]}`);
