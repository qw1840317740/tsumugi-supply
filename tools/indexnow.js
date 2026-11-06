#!/usr/bin/env node
/*
 * Tell Bing / Yandex / Seznam etc. (IndexNow) which pages changed, right after a deploy is live.
 *
 *   npm run indexnow            URLs changed since the last notified commit (first run: whole sitemap)
 *   npm run indexnow -- <ref>   URLs changed between <ref> and HEAD
 *   npm run indexnow -- --all   every URL in sitemap.xml
 *   add --dry-run to only print what would be sent
 *
 * The last notified commit is kept in .git/indexnow-last (not committed).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const HOST = 'www.japanitem.com';
const SITE = `https://${HOST}`;
const keyFile = fs.readdirSync(root).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file (<32 hex>.txt) missing in the site root');
const key = keyFile.slice(0, 32);
const stateFile = path.join(root, '.git', 'indexnow-last');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const all = args.includes('--all');
const refArg = args.find(a => !a.startsWith('--'));
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const head = git('rev-parse', 'HEAD');

const sitemapUrls = () => {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
};
// Repo file -> public URL (same shape as the sitemap: .html kept, index.html -> folder root).
const fileToUrl = file => {
  if (!file.endsWith('.html') || file.startsWith('_')) return null;
  if (file === 'index.html') return `${SITE}/`;
  const m = file.match(/^(zh|ja)\/index\.html$/);
  if (m) return `${SITE}/${m[1]}`;
  return `${SITE}/${file}`;
};

let from = refArg || (fs.existsSync(stateFile) ? fs.readFileSync(stateFile, 'utf8').trim() : null);
let urls;
if (all || !from) {
  urls = sitemapUrls();
  from = all ? '--all' : '(first run: whole sitemap)';
} else {
  const changed = git('diff', '--name-only', '--diff-filter=AMR', `${from}..${head}`).split('\n').filter(Boolean);
  const inSitemap = new Set(sitemapUrls());
  urls = [...new Set(changed.map(fileToUrl).filter(u => u && inSitemap.has(u)))];
}
console.log(`IndexNow: ${urls.length} URLs (${from} -> ${head.slice(0, 9)})`);
if (!urls.length) process.exit(0);
if (dryRun) { console.log(urls.slice(0, 20).join('\n'), urls.length > 20 ? `\n… +${urls.length - 20} more` : ''); process.exit(0); }

(async () => {
  // Only ping once the deploy that contains the key file is live.
  const live = await fetch(`${SITE}/${keyFile}`).then(r => (r.ok ? r.text() : '')).catch(() => '');
  if (live.trim() !== key) throw new Error(`${SITE}/${keyFile} is not live yet - push and wait for the Vercel deploy first`);
  for (let i = 0; i < urls.length; i += 10000) {
    const urlList = urls.slice(i, i + 10000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList }),
    });
    console.log(`  batch ${i / 10000 + 1}: HTTP ${res.status} ${res.status === 200 || res.status === 202 ? 'accepted' : await res.text()}`);
    if (res.status !== 200 && res.status !== 202) process.exit(1);
  }
  fs.writeFileSync(stateFile, head);
})().catch(e => { console.error(e.message); process.exit(1); });
