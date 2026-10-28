// shared helpers for check.mjs and export.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function findChrome() {
  const c = [process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  for (const base of [join(homedir(), 'Library/Caches/ms-playwright'), join(homedir(), '.cache/ms-playwright')]) {
    if (!existsSync(base)) continue;
    for (const d of readdirSync(base).filter(d => d.startsWith('chromium')).sort().reverse()) {
      for (const sub of ['chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell',
                         'chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome']) c.push(join(base, d, sub));
    }
  }
  const found = c.find(p => p && existsSync(p));
  if (!found) { console.error('no Chrome/Chromium found — set CHROME=/path/to/chrome'); process.exit(2); }
  return found;
}

export const BASE_FLAGS = ['--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check'];
export const fileUrl = p => pathToFileURL(resolve(p)).href;

export function runChrome(chrome, args) {
  return execFileSync(chrome, [...BASE_FLAGS, ...args],
    { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'], timeout: 90000 });
}

const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// loads the page in ?check mode and returns the engine's self-check: {width, height, issues, warnings}
export function readDiag(chrome, htmlPath) {
  const dom = runChrome(chrome, ['--force-device-scale-factor=1', '--virtual-time-budget=2500', '--window-size=1400,1000',
    '--dump-dom', fileUrl(htmlPath) + '?check']);
  const m = /<pre id="__diag"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) { console.error('engine did not finish — open the file in a browser and check the console for a script error'); process.exit(2); }
  return JSON.parse(unesc(m[1]));
}

// the spec embedded in a built diagram
export function readSpec(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const m = /<script id="spec" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  if (!m) { console.error(`${htmlPath} has no embedded spec — build it with build.mjs first`); process.exit(2); }
  return JSON.parse(m[1]);
}

// body padding is 16px left/right and 24px top/bottom
export const pageSize = d => ({ W: d.width + 32, H: d.height + 48 });
