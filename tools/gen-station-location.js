#!/usr/bin/env node
/**
 * NextMetro — station Location card.
 *
 * Splits the address out of Station Information into its own card, alongside a
 * map of the station and the line through it, and a Directions link.
 *
 * The map has two states:
 *   1. A poster drawn at build time as inline SVG from the coordinates and
 *      route order already in public/data/. No network request, no third
 *      party, no licensed tiles, and no layout shift — it ships in the HTML.
 *   2. On click, app.js swaps in the Google Maps embed for streets and
 *      satellite. Nothing reaches Google until the visitor asks for it, which
 *      keeps the site's "no third-party requests without consent" posture.
 *
 * The address text is read from the page rather than from stations.json: eight
 * stations carry a corrected address in their HTML that the data file has not
 * caught up with, and this must not silently overwrite them.
 *
 * Idempotent: reruns replace the marked block, reading the address back out of
 * it once Station Information no longer carries the row.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('./lib/nm-links.js');

const { ROOT, stations, lines, bySlug, esc, injectBlock } = L;

// ---- Mini map ----------------------------------------------------------
// Equirectangular projection around the station. Over a few kilometres the
// distortion is far below the width of the stroke.
const VIEW_W = 600;
const VIEW_H = 360;
const PAD = 40;
const WINDOW = 2; // stops either side
// A corridor that runs mostly north-south leaves a true-scale drawing as a
// thin stripe down the middle of the frame. Allow the axes to scale
// independently up to this ratio — the same licence a transit diagram takes —
// so the route fills the panel while its shape stays recognisable.
const MAX_STRETCH = 2.2;

function project(points) {
  const lat0 = points[0].lat;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const raw = points.map((p) => ({ ...p, x: p.lon * k, y: -p.lat }));
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  // Preserve aspect: one scale for both axes, centred in the viewBox.
  const spanX = maxX - minX || 1e-6;
  const spanY = maxY - minY || 1e-6;
  const fitX = (VIEW_W - PAD * 2) / spanX;
  const fitY = (VIEW_H - PAD * 2) / spanY;
  const base = Math.min(fitX, fitY);
  const scaleX = Math.min(fitX, base * MAX_STRETCH);
  const scaleY = Math.min(fitY, base * MAX_STRETCH);
  const offX = (VIEW_W - spanX * scaleX) / 2;
  const offY = (VIEW_H - spanY * scaleY) / 2;
  return raw.map((p) => ({
    ...p,
    px: +((p.x - minX) * scaleX + offX).toFixed(1),
    py: +((p.y - minY) * scaleY + offY).toFixed(1),
  }));
}

function miniMap(station) {
  // Collect the station and its neighbours on every line it serves.
  const seen = new Map();
  const paths = [];
  for (const line of station.lines) {
    const order = lines[line].order;
    const i = station.lineSequence[line];
    const slugs = [];
    for (let j = i - WINDOW; j <= i + WINDOW; j++) {
      if (j < 0 || j >= order.length) continue;
      slugs.push(order[j]);
      if (!seen.has(order[j])) seen.set(order[j], bySlug.get(order[j]));
    }
    if (slugs.length > 1) paths.push({ line, slugs });
  }

  // The station itself must be first so the projection centres on its latitude.
  const all = [station, ...[...seen.values()].filter((s) => s.slug !== station.slug)];
  const pts = project(all);
  const at = new Map(pts.map((p) => [p.slug, p]));

  const polylines = paths
    .map(({ line, slugs }) => {
      const d = slugs.map((s) => `${at.get(s).px},${at.get(s).py}`).join(' ');
      return `      <polyline points="${d}" fill="none" stroke="var(--nm-line-${line})" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter" opacity="0.9" />`;
    })
    .join('\n');

  const dots = pts
    .filter((p) => p.slug !== station.slug)
    .map((p) => `      <rect x="${(p.px - 4).toFixed(1)}" y="${(p.py - 4).toFixed(1)}" width="8" height="8" fill="var(--nm-surface)" stroke="var(--nm-text-muted)" stroke-width="2" />`)
    .join('\n');

  const me = at.get(station.slug);
  const labelAbove = me.py > VIEW_H / 2;
  const anchor = me.px > VIEW_W - 150 ? 'end' : me.px < 150 ? 'start' : 'middle';
  const dx = anchor === 'end' ? -14 : anchor === 'start' ? 14 : 0;
  const here =
    `      <rect x="${(me.px - 8).toFixed(1)}" y="${(me.py - 8).toFixed(1)}" width="16" height="16" fill="var(--nm-amber)" />\n` +
    `      <text class="location-map-here" x="${(me.px + dx).toFixed(1)}" y="${(me.py + (labelAbove ? -20 : 32)).toFixed(1)}" text-anchor="${anchor}">${esc(station.name)}</text>`;

  const neighbourNames = pts
    .filter((p) => p.slug !== station.slug)
    .map((p) => p.name)
    .join(', ');
  const label = `${station.name} and the nearby stations on ${station.lines.map((l) => lines[l].name).join(', ')}: ${neighbourNames}`;

  return (
    `    <svg class="location-map-poster" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-labelledby="location-map-title" preserveAspectRatio="xMidYMid meet">\n` +
    `      <title id="location-map-title">${esc(label)}</title>\n` +
    polylines + '\n' +
    dots + '\n' +
    here + '\n' +
    `    </svg>`
  );
}

// ---- Card ---------------------------------------------------------------
const ADDRESS_ROW = /\s*<div class="station-info-row">\s*<span class="station-info-icon">\s*<i class="ri-map-pin-line"[^>]*><\/i>\s*<\/span>\s*<span class="station-info-label">Address<\/span>\s*<span class="station-info-value">([\s\S]*?)<\/span>\s*<\/div>/;
const DIRECTIONS_LINK = /\s*<a href="https:\/\/www\.google\.com\/maps\/dir\/[^"]*" class="station-info-link"[^>]*>[\s\S]*?<\/a>/;

function locationCard(station, address) {
  const q = `${station.lat},${station.lon}`;
  const place = `https://www.google.com/maps/search/?api=1&amp;query=${q}`;
  const dir = `https://www.google.com/maps/dir/?api=1&amp;destination=${q}`;
  return (
    `      <section class="location-card grid-side animate-in d3" aria-labelledby="location-title">\n` +
    `        <div class="location-header">\n` +
    `          <h2 class="location-title" id="location-title">Location</h2>\n` +
    `        </div>\n` +
    `        <div class="location-body">\n` +
    `          <span class="location-label">Address</span>\n` +
    `          <a class="location-address" href="${place}" target="_blank" rel="noopener noreferrer" data-address>${address}</a>\n` +
    `        </div>\n` +
    `        <div class="location-map" data-map-lat="${station.lat}" data-map-lon="${station.lon}" data-map-name="${esc(station.name)}">\n` +
    `          <button type="button" class="location-map-load" data-map-load aria-label="Open the street map of ${esc(station.name)}. Loads Google Maps, which may set Google cookies.">\n` +
    miniMap(station) + '\n' +
    `            <span class="location-map-hint" aria-hidden="true">\n` +
    `              <span class="location-map-hint-text">Open the street map</span>\n` +
    `              <span class="location-map-hint-note">Loads Google Maps, which may set Google cookies</span>\n` +
    `            </span>\n` +
    `          </button>\n` +
    `        </div>\n` +
    `        <div class="location-actions">\n` +
    `          <a href="${dir}" class="location-link" target="_blank" rel="noopener noreferrer">\n` +
    `            <i class="ri-direction-line" aria-hidden="true"></i>\n` +
    `            Directions\n` +
    `          </a>\n` +
    `        </div>\n` +
    `      </section>`
  );
}

let changed = 0;
const problems = [];

for (const station of stations) {
  const file = path.join(ROOT, 'station', station.slug, 'index.html');
  const before = fs.readFileSync(file, 'utf8');
  let html = before;

  // Address: from the page's own row, or from the card a previous run wrote.
  let address = null;
  const row = html.match(ADDRESS_ROW);
  if (row) {
    address = row[1].trim().replace(/\s+/g, ' ');
  } else {
    const existing = html.match(/<a class="location-address"[^>]*data-address>([\s\S]*?)<\/a>/);
    if (existing) address = existing[1].trim().replace(/\s+/g, ' ');
  }
  if (!address) { problems.push(station.slug + ': no address found in page or generated card'); continue; }

  // Move it out of Station Information, and take the Directions link with it.
  html = html.replace(ADDRESS_ROW, '');
  html = html.replace(DIRECTIONS_LINK, '');

  const m = L.markers('location');
  const card = locationCard(station, address);
  if (html.includes(m.open)) {
    html = injectBlock(html, 'location', card);
  } else {
    // Immediately after the Station Information card.
    const idx = html.indexOf('<section class="station-info-card');
    if (idx < 0) { problems.push(station.slug + ': no station-info-card'); continue; }
    let depth = 0;
    const tag = /<(\/?)section\b[^>]*>/g;
    tag.lastIndex = idx;
    let t, end = -1;
    while ((t = tag.exec(html)) !== null) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end < 0) { problems.push(station.slug + ': unbalanced station-info-card'); continue; }
    html = html.slice(0, end) + `\n\n      ${m.open}\n${card}\n      ${m.close}` + html.slice(end);
  }

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}

if (problems.length) {
  console.error('problems:');
  for (const p of problems) console.error('  ' + p);
  process.exitCode = 1;
}
console.log(`location cards written: ${changed}/${stations.length}`);
