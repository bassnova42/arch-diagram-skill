#!/usr/bin/env node
// usage: node export.mjs <diagram.html> <out> [<out> …] [--seconds N] [--scale K]
// The output type follows each extension:
//   .png        static image (default 2x), no moving packets
//   .mp4        video, default 20s: records one seamless 4s animation cycle, then repeats it to --seconds
//   .gif        animated GIF of one 4s cycle that loops forever
//   .mmd / .md  Mermaid flowchart: editable, renders in GitHub / Notion / Typora / Feishu (.md wraps it in a fence)
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { findChrome, runChrome, readDiag, readSpec, fileUrl, pageSize } from './lib.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return +v; };
const SECONDS = opt('--seconds', null), SCALE = opt('--scale', 2);
const [htmlPath, ...outs] = argv;
if (!htmlPath || !outs.length) {
  console.error('usage: node export.mjs <diagram.html> <out.png|.mp4|.gif|.mmd|.md> … [--seconds N] [--scale K]');
  process.exit(2);
}
const LOOP = 4;   // must match the .loop periods in style.css
const sleep = ms => new Promise(r => setTimeout(r, ms));

let chrome, diag;
const need = () => { chrome ||= findChrome(); diag ||= readDiag(chrome, htmlPath); return pageSize(diag); };

for (const out of outs) {
  const ext = extname(out).toLowerCase();
  if (ext === '.png') png(out);
  else if (ext === '.mp4') await video(out, SECONDS || 20);
  else if (ext === '.gif') await video(out, LOOP);   // one cycle; GIFs loop forever on their own
  else if (ext === '.mmd' || ext === '.md') mermaid(out, ext === '.md');
  else { console.error(`✗ ${out}: unsupported type (png, mp4, gif, mmd, md)`); process.exitCode = 1; }
}

// ---------- PNG ----------
function png(out) {
  const { W, H } = need();
  runChrome(chrome, [`--force-device-scale-factor=${SCALE}`, '--virtual-time-budget=2500',
    `--window-size=${W},${H}`, `--screenshot=${resolve(out)}`, fileUrl(htmlPath) + '?check']);
  console.log(`✓ ${out}  (${W * SCALE}×${H * SCALE})`);
}

// ---------- MP4 / GIF ----------
async function video(out, seconds) {
  const { W, H } = need();
  const frames = await capture(W, H, LOOP + 0.6);
  const t0 = frames[0].t;
  const cycle = frames.filter(f => f.t - t0 < LOOP);
  // seam check: the frame one period later should match the first one
  const after = frames.reduce((b, f) => Math.abs(f.t - t0 - LOOP) < Math.abs(b.t - t0 - LOOP) ? f : b);
  const dir = mkdtempSync(join(tmpdir(), 'archexp-'));
  cycle.forEach((f, i) => writeFileSync(join(dir, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(f.data, 'base64')));
  writeFileSync(join(dir, 'a.jpg'), Buffer.from(frames[0].data, 'base64'));
  writeFileSync(join(dir, 'b.jpg'), Buffer.from(after.data, 'base64'));
  const r = spawnSync('ffmpeg', ['-i', join(dir, 'a.jpg'), '-i', join(dir, 'b.jpg'), '-lavfi', 'psnr', '-f', 'null', '-'], { encoding: 'utf8' });
  const psnr = /average:(\S+)/.exec(r.stderr || '')?.[1] || '?';

  // one cycle as a concat list (real frame timings), repeated until the requested length
  const reps = Math.ceil(seconds / LOOP);
  const lines = [];
  for (let r = 0; r < reps; r++) cycle.forEach((f, i) => {
    const next = cycle[i + 1] ? cycle[i + 1].t : t0 + LOOP;
    lines.push(`file '${join(dir, `f${String(i).padStart(4, '0')}.jpg`)}'`, `duration ${(next - f.t).toFixed(4)}`);
  });
  lines.push(lines[lines.length - 2]);
  writeFileSync(join(dir, 'list.txt'), lines.join('\n'));
  const input = ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-t', String(seconds)];
  if (extname(out).toLowerCase() === '.gif') {
    // GIFs get big fast: half the capture scale, 15fps, shared palette
    execFileSync('ffmpeg', [...input, '-vf',
      `fps=15,scale=iw/${SCALE}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
      '-loop', '0', resolve(out)], { stdio: 'inherit' });
  } else {
    execFileSync('ffmpeg', [...input, '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', resolve(out)], { stdio: 'inherit' });
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`✓ ${out}  (${seconds}s = ${LOOP}s cycle × ${reps}, ${cycle.length} frames/cycle, seam PSNR ${psnr} dB)`);
}

async function capture(W, H, seconds) {
  const profile = mkdtempSync(join(tmpdir(), 'archrec-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--mute-audio',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--force-device-scale-factor=${SCALE}`,
    `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); }
      catch { await sleep(200); }
    }
    if (!target) throw new Error('could not reach Chrome DevTools');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    let id = 0; const pending = new Map(), frames = [];
    let recording = false;
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
      else if (msg.method === 'Page.screencastFrame') {
        if (recording) frames.push({ t: msg.params.metadata.timestamp, data: msg.params.data });
        send('Page.screencastFrameAck', { sessionId: msg.params.sessionId });
      }
    });
    await send('Page.enable');
    // without this the headless screen clamps tall pages
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false, screenWidth: W, screenHeight: H });
    await send('Page.navigate', { url: fileUrl(htmlPath) + `?loop=${LOOP}` });
    await sleep(2200 + LOOP * 1000);   // every packet has started (begin ≤ 1.5s), fonts have settled and a live log has run one full cycle
    await send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1, maxWidth: W * SCALE, maxHeight: H * SCALE });
    await sleep(300);
    recording = true;
    await sleep(seconds * 1000);
    recording = false;
    await send('Page.stopScreencast');
    ws.close();
    if (frames.length < 20) throw new Error(`only ${frames.length} frames captured`);
    return frames;
  } finally {
    const exited = new Promise(r => proc.once('exit', r));
    proc.kill();
    await Promise.race([exited, sleep(3000)]);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

// ---------- Mermaid ----------
function mermaid(out, fenced) {
  const S = readSpec(htmlPath);
  const HEX = { blue: '#79a8ff', cyan: '#5ad1e6', green: '#6fdc8c', amber: '#e8b25d', purple: '#b48cff', red: '#ff7b72',
                orange: '#ff9e3d', text: '#c9d1d9', dim: '#7d8590', faint: '#3a4450' };
  const SHORT = { bl: 'blue', cy: 'cyan', gr: 'green', am: 'amber', pu: 'purple', rd: 'red', or: 'orange' };
  const hex = c => HEX[SHORT[c] || c] || HEX.faint;
  const sid = s => String(s).replace(/[^A-Za-z0-9_]/g, '_');
  const plain = s => String(s ?? '').replace(/\{\w+:([^{}]*)\}/g, '$1').replace(/\{\w+:([^{}]*)\}/g, '$1');
  const q = s => plain(s).replace(/"/g, '#quot;').replace(/\n/g, '<br/>');
  const layerColor = id => ((S.layers || []).find(l => l.id === id) || {}).color;
  const nodes = S.nodes || [];

  // anchor → node id: rows resolve to their box; raw points cannot be expressed in Mermaid
  const owner = {};
  for (const n of nodes) { owner[n.id] = n.id; for (const r of n.rows || []) if (r.id) owner[r.id] = n.id; }
  for (const g of S.groups || []) if (g.id) owner[g.id] = g.id;
  for (const n of S.notes || []) if (n.id) owner[n.id] = n.id;
  const endOf = a => Array.isArray(a) ? null : owner[String(a).split(/[.@]/)[0]] || null;

  // direction: mostly-horizontal wiring reads better left→right
  const center = id => { const n = nodes.find(x => x.id === id); return n ? [n.x + n.w / 2, n.y + (n.h || 80) / 2] : null; };
  let dx = 0, dy = 0;
  for (const e of S.edges || []) {
    const a = center(endOf(e.from)), b = center(endOf(e.to));
    if (a && b) { dx += Math.abs(a[0] - b[0]); dy += Math.abs(a[1] - b[1]); }
  }
  const L = [`flowchart ${S.direction || (dx > dy * 1.3 ? 'LR' : 'TB')}`];
  if (S.title) L.push(`  %% ${plain(S.title)}`);

  const label = n => {
    const parts = [`<b>${q(n.title || n.id)}</b>`];
    if (n.sub) parts.push(q(n.sub));
    if (n.text) parts.push(q(n.text));
    for (const r of n.rows || []) parts.push(q(`${plain(r.name)}${r.desc ? ' · ' + plain(r.desc) : ''}`));
    if (n.pipeline) parts.push(q(n.pipeline.map(s => String(s).replace(/^~/, '')).join(' → ')));
    for (const l of [].concat(n.lines || [])) parts.push(q(l));
    for (const it of n.items || []) parts.push(q(`◇ ${plain(it.title || '')} ${plain(it.lines || '')}`.trim()));
    if (n.footer) parts.push(q(n.footer));
    return parts.join('<br/>');
  };
  const nodeLine = (n, pad) => `${pad}${sid(n.id)}["${label(n)}"]:::${sid(n.layer || 'none')}`;

  // groups become subgraphs holding the nodes whose boxes sit inside them
  const inside = (n, g) => n.x >= g.x && n.y >= g.y && n.x + n.w <= g.x + g.w && n.y + (n.h || 0) <= g.y + g.h;
  const placed = new Set();
  for (const g of S.groups || []) {
    const members = nodes.filter(n => !placed.has(n.id) && inside(n, g));
    if (!members.length) continue;
    L.push(`  subgraph ${sid(g.id || 'g' + L.length)}["${q(g.label || '')}"]`);
    for (const n of members) { L.push(nodeLine(n, '    ')); placed.add(n.id); }
    L.push('  end');
  }
  for (const n of nodes) if (!placed.has(n.id)) L.push(nodeLine(n, '  '));

  const FLOW = {}; for (const f of S.flows || []) FLOW[f.id] = f;
  const styles = []; let k = 0, dropped = 0;
  for (const e of S.edges || []) {
    const a = endOf(e.from), b = endOf(e.to);
    if (!a || !b || a === b) { dropped++; continue; }
    const f = FLOW[e.flow] || {};
    const dash = e.dash ?? f.dash, arrow = e.arrow !== false;
    const op = dash ? (arrow ? '-.->' : '-.-') : (arrow ? '-->' : '---');
    const lb = e.label ? `|"${q(String(e.label).replace(/\n/g, ' '))}"|` : '';
    L.push(`  ${sid(a)} ${op}${lb} ${sid(b)}`);
    styles.push(`  linkStyle ${k++} stroke:${hex(e.color || f.color || 'dim')},stroke-width:1.5px`);
  }
  L.push(...styles);
  for (const l of S.layers || []) L.push(`  classDef ${sid(l.id)} fill:#0e141b,stroke:${hex(l.color)},color:#c9d1d9`);
  L.push('  classDef none fill:#0e141b,stroke:#3a4450,color:#c9d1d9');
  for (const g of S.groups || []) if (g.id) L.push(`  style ${sid(g.id)} fill:transparent,stroke:${hex(g.color)},stroke-dasharray:${g.solid ? '0' : '5 4'},color:${hex(g.color)}`);

  let body = L.join('\n') + '\n';
  if (fenced) {
    const legend = [
      (S.layers || []).length ? `元素：${S.layers.map(l => plain(l.label)).join(' ｜ ')}` : '',
      (S.flows || []).length ? `流向：${S.flows.map(f => `${plain(f.label)}${f.dash ? '（虚线）' : ''}`).join(' ｜ ')}` : '',
    ].filter(Boolean).join('  \n');
    body = `# ${plain(S.pageTitle || S.title || 'Architecture')}\n\n${legend ? legend + '\n\n' : ''}\`\`\`mermaid\n${body}\`\`\`\n`;
  }
  writeFileSync(out, body);
  console.log(`✓ ${out}  (${nodes.length} nodes, ${k} edges${dropped ? `, ${dropped} point-anchored wires omitted` : ''})`);
}
