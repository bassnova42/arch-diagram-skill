#!/usr/bin/env node
// Every theme must render every shipped example with a clean self-check, the default theme must stay
// the terminal look, and an unknown theme must be refused at build time.
// usage: node test/themes.mjs   (needs Chrome/Chromium; set CHROME=/path if not found)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, readDiag } from '../skills/arch-diagram/scripts/lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'arch-diagram');
const BUILD = join(ROOT, 'scripts', 'build.mjs');
const tmp = mkdtempSync(join(tmpdir(), 'arch-diagram-themes-'));
const chrome = findChrome();
const themes = ['terminal', ...readdirSync(join(ROOT, 'assets', 'themes')).filter(f => f.endsWith('.css')).map(f => f.slice(0, -4))];
const examples = readdirSync(join(ROOT, 'examples')).filter(f => f.endsWith('.json'));
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? '✓ ' : '✗ ') + msg); if (!cond) failed++; };

for (const theme of themes) {
  for (const f of examples) {
    const html = join(tmp, `${f.replace(/\.json$/, '')}-${theme}.html`);
    execFileSync(process.execPath, [BUILD, join(ROOT, 'examples', f), html, '--theme', theme], { stdio: 'ignore' });
    ok(readFileSync(html, 'utf8').includes(`data-theme="${theme}"`), `${theme}/${f}: page carries the theme`);
    const { issues } = readDiag(chrome, html);
    ok(!issues.length, `${theme}/${f}: self-check clean${issues.length ? ' — ' + issues.join('; ') : ''}`);
  }
}
const plain = join(tmp, 'default.html');
execFileSync(process.execPath, [BUILD, join(ROOT, 'examples', examples[0]), plain], { stdio: 'ignore' });
ok(readFileSync(plain, 'utf8').includes('data-theme="terminal"'), 'no theme given → terminal');
const bad = spawnSync(process.execPath, [BUILD, join(ROOT, 'examples', examples[0]), join(tmp, 'bad.html'), '--theme', 'nope"><script>'], { encoding: 'utf8' });
ok(bad.status === 1 && /unknown theme/.test(bad.stderr), 'unknown theme is refused');
console.log(failed ? `${failed} check(s) failed` : 'all checks passed');
process.exit(failed ? 1 : 0);
