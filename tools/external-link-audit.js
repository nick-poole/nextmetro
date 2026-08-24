#!/usr/bin/env node
/**
 * NextMetro — external link audit.
 *
 * The companion to link-audit.js, which only checks links that resolve inside
 * public/. This one checks the links that leave the site: WMATA, Amtrak, MARC,
 * VRE, the crisis resources, everything.
 *
 * Every URL is requested once, however many pages use it, and the report is
 * grouped by URL with the pages that link to it. Redirects are followed and
 * the chain is reported, because a 301 to a live page is fine and a 301 that
 * lands on a soft 404 is not.
 *
 * Usage:
 *   node tools/external-link-audit.js                  # hrefs, human report
 *   node tools/external-link-audit.js --assets         # also og:image, link href, script src
 *   node tools/external-link-audit.js --json out.json  # machine-readable
 *   node tools/external-link-audit.js --only wmata.com # limit to matching URLs
 *   node tools/external-link-audit.js --dry-run        # inventory only, no requests
 *   node tools/external-link-audit.js --no-soft-404    # trust status codes alone
 *   node tools/external-link-audit.js --concurrency 4 --timeout 20000
 *
 * A 200 is not proof: a site that has been rebuilt often serves its "page not
 * found" screen with a 200 status, which is exactly how a dead link hides from
 * a status-code-only checker. Any HTML 200 is therefore fetched and scanned for
 * not-found wording and reported as a soft 404.
 *
 * Hosts that bot-block (Amtrak, Greyhound and friends commonly do) answer 403
 * or 429 to anything without a real browser. Those are reported separately
 * rather than as broken, because they need a human to look, not a fix.
 *
 * Exits 1 if any URL returned 4xx/5xx, looked like a soft 404, or could not be
 * reached. Bot-blocked URLs do not fail the run.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.env.NM_PUBLIC_ROOT || path.join(__dirname, '..', 'public');
const SELF = 'nextmetro.live';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const CONCURRENCY = Number(opt('--concurrency', 6));
const TIMEOUT = Number(opt('--timeout', 20000));
const ONLY = opt('--only', null);
const JSON_OUT = opt('--json', null);
const INCLUDE_ASSETS = flag('--assets');
const DRY_RUN = flag('--dry-run');
const SOFT_404 = !flag('--no-soft-404');
// Some hosts refuse anything that does not look like a browser. This is a
// link check, not a crawl, so it identifies itself and stays polite.
const UA = 'Mozilla/5.0 (compatible; NextMetroLinkAudit/1.0; +https://nextmetro.live/)';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function urlForFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// href on <a>, plus optionally the asset URLs that also break silently.
const PATTERNS = [/<a\b[^>]*?\shref\s*=\s*"([^"]+)"/gi];
const ASSET_PATTERNS = [
  /<link\b[^>]*?\shref\s*=\s*"([^"]+)"/gi,
  /<script\b[^>]*?\ssrc\s*=\s*"([^"]+)"/gi,
  /<meta\b[^>]*?\scontent\s*=\s*"(https?:\/\/[^"]+)"/gi,
  /<img\b[^>]*?\ssrc\s*=\s*"([^"]+)"/gi,
];

function extract(html, withAssets) {
  const found = [];
  for (const re of withAssets ? PATTERNS.concat(ASSET_PATTERNS) : PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) found.push(decode(m[1]));
  }
  return found;
}

function isExternal(href) {
  return /^https?:\/\//i.test(href);
}

// The fragment never reaches the server, so /x.cfm and /x.cfm#hours are one
// request. The fragment is kept alongside for the report.
function splitHash(href) {
  const i = href.indexOf('#');
  return i < 0 ? [href, ''] : [href.slice(0, i), href.slice(i)];
}

const files = walk(ROOT);
/** @type {Map<string, {pages: Set<string>, hashes: Set<string>, count: number}>} */
const targets = new Map();

for (const file of files) {
  const page = urlForFile(file);
  const html = fs.readFileSync(file, 'utf8');
  for (const href of extract(html, INCLUDE_ASSETS)) {
    if (!isExternal(href)) continue;
    const [base, hash] = splitHash(href);
    let host;
    try {
      host = new URL(base).hostname;
    } catch {
      continue;
    }
    // Self-referencing absolute URLs (canonical, og:url, JSON-LD) are the
    // internal auditor's job, not this one.
    if (host === SELF || host === 'www.' + SELF) continue;
    if (ONLY && !base.includes(ONLY)) continue;
    if (!targets.has(base)) targets.set(base, { pages: new Set(), hashes: new Set(), count: 0 });
    const t = targets.get(base);
    t.pages.add(page);
    t.count += 1;
    if (hash) t.hashes.add(hash);
  }
}

const urls = [...targets.keys()].sort();

// --dry-run answers "what does this site link out to, and from where" without
// touching the network. Useful on its own, and the only thing that works from
// a sandbox with no egress.
if (DRY_RUN) {
  const byHost = new Map();
  for (const url of urls) {
    const host = new URL(url).hostname;
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(url);
  }
  const hosts = [...byHost.entries()].sort((a, b) => {
    const ua = a[1].reduce((n, u) => n + targets.get(u).count, 0);
    const ub = b[1].reduce((n, u) => n + targets.get(u).count, 0);
    return ub - ua || a[0].localeCompare(b[0]);
  });
  process.stdout.write(`${urls.length} external URLs from ${files.length} pages\n`);
  for (const [host, list] of hosts) {
    const uses = list.reduce((n, u) => n + targets.get(u).count, 0);
    process.stdout.write(`\n${host}  (${list.length} URL${list.length === 1 ? '' : 's'}, ${uses} link${uses === 1 ? '' : 's'})\n`);
    for (const u of list.sort((a, b) => targets.get(b).count - targets.get(a).count || a.localeCompare(b))) {
      const t = targets.get(u);
      process.stdout.write(`  ${String(t.count).padStart(4)}x  ${u}${t.hashes.size ? '  [' + [...t.hashes].join(' ') + ']' : ''}\n`);
    }
  }
  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify(urls.map((u) => ({
      url: u, uses: targets.get(u).count, pages: [...targets.get(u).pages].sort(), fragments: [...targets.get(u).hashes].sort(),
    })), null, 2));
    process.stdout.write(`\nwrote ${JSON_OUT}\n`);
  }
  process.exit(0);
}

process.stderr.write(`checking ${urls.length} external URLs from ${files.length} pages\n`);

async function request(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: '*/*' },
    });
  } finally {
    clearTimeout(timer);
  }
}

// Wording that means "this page is gone" wherever it appears on a page that
// still answered 200. Kept deliberately narrow: these have to be phrases a
// live page would not carry.
const NOT_FOUND_MARKERS = [
  'page not found',
  'page cannot be found',
  "page you requested could not be found",
  "page you're looking for",
  'page you are looking for',
  'no longer available',
  'we could not find',
  "couldn't find that page",
  'error 404',
  '404 error',
];

function looksLikeSoftFound(html) {
  const head = html.slice(0, 65536).toLowerCase();
  const title = (head.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || '';
  for (const marker of NOT_FOUND_MARKERS) {
    if (title.includes(marker)) return `title: "${title.trim().slice(0, 80)}"`;
    if (head.includes(marker)) return `body contains "${marker}"`;
  }
  if (/^\s*404\b/.test(title)) return `title: "${title.trim().slice(0, 80)}"`;
  return null;
}

async function check(url) {
  // HEAD first: cheaper, and most hosts answer it honestly. Anything that
  // rejects HEAD (405/501) gets a GET before it is called broken.
  let res = null;
  let usedMethod = null;
  for (const method of ['HEAD', 'GET']) {
    try {
      res = await request(url, method);
      usedMethod = method;
      if (method === 'HEAD' && (res.status === 405 || res.status === 501)) continue;
      break;
    } catch (err) {
      if (method === 'GET') {
        return { status: 0, error: err.name === 'AbortError' ? 'timeout' : err.message };
      }
    }
  }
  if (!res) return { status: 0, error: 'unreachable' };

  const contentType = res.headers.get('content-type') || '';
  const out = {
    status: res.status,
    finalUrl: res.url,
    redirected: res.url !== url,
    contentType,
    blocked: res.status === 403 || res.status === 429,
  };

  // A 200 on an HTML page is the case worth a second look: a rebuilt site
  // often answers its own not-found screen with a 200.
  if (SOFT_404 && res.status >= 200 && res.status < 300 && /text\/html/i.test(contentType)) {
    try {
      // A HEAD response has no body to read, so the page has to be fetched
      // again before there is anything to scan.
      const withBody = usedMethod === 'GET' ? res : await request(url, 'GET');
      const why = looksLikeSoftFound(await withBody.text());
      if (why) out.softNotFound = why;
    } catch {
      /* the status code stands on its own */
    }
  }
  return out;
}

async function run() {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      const r = await check(url);
      const t = targets.get(url);
      results.push({
        url,
        ...r,
        uses: t.count,
        pages: [...t.pages].sort(),
        fragments: [...t.hashes].sort(),
      });
      process.stderr.write(`  ${String(r.status || 'ERR').padEnd(3)} ${url}\n`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
  results.sort((a, b) => a.url.localeCompare(b.url));

  const blocked = results.filter((r) => r.blocked);
  const broken = results.filter((r) => !r.blocked && (r.status === 0 || r.status >= 400 || r.softNotFound));
  const rest = results.filter((r) => !r.blocked && !broken.includes(r));
  const redirected = rest.filter((r) => r.redirected);
  const ok = rest.filter((r) => !r.redirected);

  const line = '-'.repeat(72);
  process.stdout.write(`\n${line}\nexternal links: ${results.length} URLs, ${files.length} pages crawled\n`);
  process.stdout.write(`  ok          ${ok.length}\n  redirected  ${redirected.length}\n  bot-blocked ${blocked.length}\n  broken      ${broken.length}\n${line}\n`);

  if (broken.length) {
    process.stdout.write('\nBROKEN\n');
    for (const r of broken) {
      const label = r.softNotFound ? `${r.status} SOFT-404` : `${r.status || 'ERR'}${r.error ? ' (' + r.error + ')' : ''}`;
      process.stdout.write(`\n  ${label}  ${r.url}\n`);
      if (r.softNotFound) process.stdout.write(`       answered 200 but ${r.softNotFound}\n`);
      if (r.redirected) process.stdout.write(`       redirected to ${r.finalUrl}\n`);
      process.stdout.write(`       ${r.uses} link${r.uses === 1 ? '' : 's'} across ${r.pages.length} page${r.pages.length === 1 ? '' : 's'}\n`);
      const shown = r.pages.slice(0, 6);
      for (const p of shown) process.stdout.write(`       ${p}\n`);
      if (r.pages.length > shown.length) process.stdout.write(`       ... and ${r.pages.length - shown.length} more\n`);
    }
  }

  if (blocked.length) {
    process.stdout.write('\nBOT-BLOCKED (the host refused an automated request; check these by hand)\n');
    for (const r of blocked) {
      process.stdout.write(`  ${r.status}  ${r.url}  (${r.uses} link${r.uses === 1 ? '' : 's'})\n`);
    }
  }

  if (redirected.length) {
    process.stdout.write('\nREDIRECTED (works, but the markup points at the old URL)\n');
    for (const r of redirected) {
      process.stdout.write(`\n  ${r.status}  ${r.url}\n       -> ${r.finalUrl}  (${r.uses} link${r.uses === 1 ? '' : 's'})\n`);
    }
  }

  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify(results, null, 2));
    process.stdout.write(`\nwrote ${JSON_OUT}\n`);
  }

  if (!broken.length) process.stdout.write('\nno broken external links\n');
  process.exit(broken.length ? 1 : 0);
}

run();
