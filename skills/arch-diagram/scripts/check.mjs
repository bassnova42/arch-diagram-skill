#!/usr/bin/env node
// usage: node check.mjs <diagram.html> [screenshot.png]
// Opens the diagram in headless Chrome with ?check, prints the engine's layout issues
// (overlaps, overflowing text, wires through boxes, labels on boxes) and saves a full-page screenshot.
// Exit code: 0 clean, 1 issues found, 2 could not run.
import { resolve } from 'node:path';
import { findChrome, runChrome, readDiag, fileUrl } from './lib.mjs';

const [htmlPath, pngArg] = process.argv.slice(2);
if (!htmlPath) { console.error('usage: node check.mjs <diagram.html> [screenshot.png]'); process.exit(2); }
const chrome = findChrome();
const diag = readDiag(chrome, htmlPath);
const url = fileUrl(htmlPath) + '?check';
const png = resolve(pngArg || htmlPath.replace(/\.html?$/i, '') + '.check.png');
try { runChrome(chrome, ['--force-device-scale-factor=1', '--virtual-time-budget=2500', `--window-size=${diag.width + 32},${diag.height + 48}`, `--screenshot=${png}`, url]); }
catch (e) { console.error('screenshot failed: ' + e.message); }

console.log(`canvas ${diag.width}×${diag.height}`);
for (const w of diag.warnings) console.log('△ ' + w);
for (const i of diag.issues) console.log('✗ ' + i);
console.log(diag.issues.length ? `${diag.issues.length} issue(s)` : '✓ no layout issues');
console.log(`screenshot: ${png}`);
process.exit(diag.issues.length ? 1 : 0);
