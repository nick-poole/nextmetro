#!/usr/bin/env node
/**
 * NextMetro — WMATA station page links.
 *
 * Every station page carries two outbound links to WMATA's own page for that
 * station ("First & Last Trains", which is the same URL plus #hours, and
 * "WMATA Station Page"), plus a schema.org sameAs pointing at it.
 *
 * WMATA's URL is not derivable from ours. They abbreviate unpredictably
 * (navy-yd-ballpark, federal-ctr-sw, hyattsville-xing, van-dorn-st), they
 * renamed stations without renaming pages, and the six Silver Line Phase 2
 * stations are not under /rider-guide/stations/ at all but under
 * /rider-guide/silver-line-extension/ with title-case filenames. Nothing about
 * that can be computed, so the whole URL is stored rather than a slug:
 *
 *   public/data/stations.json -> wmataUrl
 *
 * Correct a URL there, re-run, and all three references on that page follow.
 * Setting wmataUrl to null drops the two links and the sameAs from that page
 * entirely, for a station WMATA has no page for.
 *
 * Idempotent: reruns produce byte-identical output.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations } = L;

const ACTIONS = /<div class="station-info-actions">[\s\S]*?<\/div>/;
const SAME_AS = /^(\s*)"sameAs": "[^"]*",$/m;

function actionsBlock(url) {
  if (!url) return '<div class="station-info-actions"></div>';
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
  after = after.replace(ACTIONS, actionsBlock(station.wmataUrl));

  // The sameAs sits in the station's JSON-LD and has to agree with the links.
  // Dropping it entirely is wrong: an empty string is not a URL, so the whole
  // line goes when there is no WMATA page.
  if (station.wmataUrl) {
    after = after.replace(SAME_AS, `$1"sameAs": "${station.wmataUrl}",`);
  } else {
    after = after.replace(/^\s*"sameAs": "[^"]*",\n/m, '');
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    if (!station.wmataUrl) dropped += 1;
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
