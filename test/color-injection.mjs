#!/usr/bin/env node
// Regression test for #1: a color field must never break out of its HTML/SVG attribute.
// Builds specs whose colors carry markup, renders them in headless Chrome and checks that
// no injected element or handler appears, that the self-check reports the bad colors,
// and that the shipped examples still render with no unknown-color issues.
// usage: node test/color-injection.mjs   (needs Chrome/Chromium; set CHROME=/path if not found)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, runChrome, fileUrl, readDiag } from '../skills/arch-diagram/scripts/lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'arch-diagram');
const BUILD = join(ROOT, 'scripts', 'build.mjs');
const tmp = mkdtempSync(join(tmpdir(), 'arch-diagram-test-'));
const chrome = findChrome();
const EVIL = 'blue)" onmouseover="pwned()" data-x="<img src=x onerror=pwned()>';
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? '✓ ' : '✗ ') + msg); if (!cond) failed++; };

function render(name, spec) {
  const specPath = join(tmp, name + '.json'), html = join(tmp, name + '.html');
  writeFileSync(specPath, JSON.stringify(spec));
  execFileSync(process.execPath, [BUILD, specPath, html], { stdio: 'ignore' });
  const dom = runChrome(chrome, ['--virtual-time-budget=2500', '--window-size=1400,1000', '--dump-dom', fileUrl(html) + '?check'])
    // the embedded spec and the self-check report (plain text) legitimately contain the payload text
    .replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<pre id="__diag"[\s\S]*?<\/pre>/, '');
  return { dom, diag: readDiag(chrome, html) };
}

const base = {
  lang: 'en', width: 600, title: 't',
  layers: [{ id: 'a', label: 'layer', color: EVIL }],
  flows: [{ id: 'f', label: 'flow', color: EVIL }],
  nodes: [{ id: 'n1', x: 20, y: 120, w: 160, title: 'one', layer: 'a' },
          { id: 'n2', x: 380, y: 120, w: 160, title: 'two', layer: 'a' }],
  edges: [{ from: 'n1', to: 'n2', flow: 'f', log: { color: EVIL, what: 'x' } }],
};
const cases = {
  'layers + flows + static log': { ...base, log: { title: 'log', rows: [['t0', 'who', EVIL, 'what', 'detail']] } },
  'live log': { ...base, log: { title: 'log', live: true } },
};
for (const [name, spec] of Object.entries(cases)) {
  const { dom, diag } = render(name.replace(/\W+/g, '-'), spec);
  ok(!/onmouseover|onerror|data-x=|<img/i.test(dom), `${name}: no injected attributes or elements`);
  ok(!dom.includes('pwned'), `${name}: payload text never reaches the rendered DOM`);
  ok(diag.issues.some(i => i.startsWith('unknown color')), `${name}: self-check reports the unknown color`);
}

for (const f of readdirSync(join(ROOT, 'examples')).filter(f => f.endsWith('.json'))) {
  const specPath = join(ROOT, 'examples', f), html = join(tmp, f.replace(/json$/, 'html'));
  execFileSync(process.execPath, [BUILD, specPath, html], { stdio: 'ignore' });
  const bad = readDiag(chrome, html).issues.filter(i => i.startsWith('unknown color'));
  ok(!bad.length, `example ${f}: palette names and short aliases still accepted${bad.length ? ' — ' + bad.join('; ') : ''}`);
}
console.log(failed ? `${failed} check(s) failed` : 'all checks passed');
process.exit(failed ? 1 : 0);
