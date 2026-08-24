#!/usr/bin/env node
/**
 * NextMetro — run every internal-linking generator, in order.
 *
 *   node tools/build-links.js
 *
 * Order matters: the sequence data must exist before the page generators run.
 * Every step is idempotent, so this is safe to re-run after any content edit.
 * Finish with `node tools/link-audit.js` to check the resulting link graph.
 */
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const steps = [
  'build-line-sequence.js',
  'gen-station-links.js',
  'gen-station-location.js',
  'gen-station-wmata-links.js',
  'gen-line-links.js',
  'gen-fares-links.js',
  'gen-hours-links.js',
];

for (const step of steps) {
  process.stdout.write(`\n--- ${step}\n`);
  execFileSync(process.execPath, [path.join(__dirname, step)], { stdio: 'inherit' });
}
process.stdout.write('\n--- link-audit.js\n');
execFileSync(process.execPath, [path.join(__dirname, 'link-audit.js')], { stdio: 'inherit' });
