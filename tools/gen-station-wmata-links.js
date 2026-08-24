#!/usr/bin/env node
/**
 * NextMetro — WMATA station page links.
 *
 * Every station page carries two outbound links to WMATA's own page for that
 * station ("First & Last Trains", which is the same URL plus #hours, and
 * "WMATA Station Page"), plus a schema.org sameAs pointing at it.
 *
 * WMATA's slug is not always ours: they abbreviate ("judiciary-sq"), they
 * renamed stations without renaming pages ("white-flint"), and one is
 * mixed-case ("NoMa"). That mapping used to live as literal strings in 98
 * HTML files, three copies each, which is how it silently rotted when WMATA
 * rebuilt wmata.com in May 2026. It now lives in one place:
 *
 *   public/data/stations.json -> wmataSlug
 *
 * Correct a slug there, re-run, and all three references on that page follow.
 * Setting wmataSlug to null drops the two links and the sameAs from that page
 * entirely, for a station WMATA has no page for.
 *
 * Idempotent: reruns produce byte-identical output.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations } = L;

const BASE = 'https://www.wmata.com/rider-guide/stations/';
const ACTIONS = /<div class="station-info-actions">[\s\S]*?<\/div>/;
const SAME_AS = /^(\s*)"sameAs": "[^"]*",$/m;

function actionsBlock(wmataSlug) {
  if (!wmataSlug) return '<div class="station-info-actions"></div>';
  const url = BASE + wmataSlug + '.cfm';
  return (
    `<div class="station-info-actions">\n` +
    `          <a href="${url}#hours" class="station-info-link" target="_blank" rel="noopener noreferrer">\n` +
    `            <i class="ri-time-fill" aria-hidden="true"></i>\n` +
    `            First &amp; Last Trains\n` +
    `          </a>\n` +
    `          <a href="${url}" class="station-info-link" target="_blank" rel="noopener noreferrer">\n` +
    `            <i class="ri-external-link-line" aria-hidden="true"></i>\n` +
    `            WMATA Station Page\n` +
    `          </a>\n` +
    `        </div>`
  );
}

let changed = 0;
let dropped = 0;
const missing = [];

for (const station of stations) {
  const file = path.join(ROOT, 'station', station.slug, 'index.html');
  if (!fs.existsSync(file)) {
    missing.push(station.slug);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  if (!ACTIONS.test(after)) {
    missing.push(station.slug + ' (no station-info-actions block)');
    continue;
  }
  after = after.replace(ACTIONS, actionsBlock(station.wmataSlug));

  // The sameAs sits in the station's JSON-LD and has to agree with the links.
  // Dropping it entirely is wrong: an empty string is not a URL, so the whole
  // line goes when there is no WMATA page.
  if (station.wmataSlug) {
    after = after.replace(SAME_AS, `$1"sameAs": "${BASE + station.wmataSlug}.cfm",`);
  } else {
    after = after.replace(/^\s*"sameAs": "[^"]*",\n/m, '');
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    if (!station.wmataSlug) dropped += 1;
  }
}

if (missing.length) {
  console.error('stations skipped: ' + missing.join(', '));
  process.exitCode = 1;
}
console.log(
  `station WMATA links: ${changed}/${stations.length} pages updated` +
    (dropped ? ` (${dropped} had their WMATA links removed)` : '')
);
