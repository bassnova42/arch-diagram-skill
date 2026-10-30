// arch-diagram engine: renders the JSON spec in #spec into a terminal-blueprint diagram,
// draws orthogonal wires, then self-checks the layout (?check writes results to #__diag).
(function () {
  const S = JSON.parse(document.getElementById('spec').textContent);
  const CHECK = /[?&]check\b/.test(location.search);
  if (CHECK) document.documentElement.classList.add('check');
  const STILL = CHECK || matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ?loop=P makes every animation periodic in P seconds, so a P-second recording repeats seamlessly
  const LOOP = +(new URLSearchParams(location.search).get('loop') || 0);
  if (LOOP) document.documentElement.classList.add('loop');
  const W = S.width || 1080;
  const NS = 'http://www.w3.org/2000/svg';
  const SHORT = { bl: 'blue', cy: 'cyan', gr: 'green', am: 'amber', pu: 'purple', rd: 'red', or: 'orange' };
  // only palette names ever reach markup or CSS: an unknown color (or one carrying quotes/markup) falls back to faint
  const COLORS = new Set(['blue', 'cyan', 'green', 'amber', 'purple', 'red', 'orange', 'text', 'dim', 'faint']);
  const badColors = new Set();
  const col = c => {
    if (c == null || c === '') return 'faint';
    const k = Object.prototype.hasOwnProperty.call(SHORT, c) ? SHORT[c] : c;
    if (typeof k === 'string' && COLORS.has(k)) return k;
    badColors.add(String(c));
    return 'faint';
  };
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim();
  // UI words follow spec.lang (zh, en, ja, ko, es, th; anything else falls back to English)
  const UI = {
    zh: { elements: '元素：', flows: '流向：', status: '状态：', wires: '连线：── 同步 ╌╌ 异步', live: 'live trace · 模块之间的数据交换',
      st: { ok: '运行正常', warn: '运行异常', dev: '开发中', off: '已关闭', none: '未创建', done: '已完成' } },
    en: { elements: 'elements: ', flows: 'flows: ', status: 'status: ', wires: 'wires: ── sync ╌╌ async', live: 'live trace · data moving between modules',
      st: { ok: 'running', warn: 'degraded', dev: 'in progress', off: 'stopped', none: 'not built', done: 'done' } },
    ja: { elements: '要素：', flows: 'フロー：', status: '状態：', wires: '線：── 同期 ╌╌ 非同期', live: 'live trace · モジュール間のデータ交換',
      st: { ok: '稼働中', warn: '異常あり', dev: '開発中', off: '停止中', none: '未作成', done: '完了' } },
    ko: { elements: '요소: ', flows: '흐름: ', status: '상태: ', wires: '연결: ── 동기 ╌╌ 비동기', live: 'live trace · 모듈 간 데이터 교환',
      st: { ok: '정상 동작', warn: '이상 발생', dev: '개발 중', off: '중지됨', none: '미생성', done: '완료' } },
    es: { elements: 'elementos: ', flows: 'flujos: ', status: 'estado: ', wires: 'líneas: ── síncrono ╌╌ asíncrono', live: 'live trace · datos entre módulos',
      st: { ok: 'en marcha', warn: 'con fallos', dev: 'en desarrollo', off: 'detenido', none: 'sin crear', done: 'hecho' } },
    th: { elements: 'องค์ประกอบ: ', flows: 'การไหล: ', status: 'สถานะ: ', wires: 'เส้น: ── ซิงก์ ╌╌ อะซิงก์', live: 'live trace · ข้อมูลที่ไหลระหว่างโมดูล',
      st: { ok: 'ทำงานปกติ', warn: 'ผิดปกติ', dev: 'กำลังพัฒนา', off: 'หยุดแล้ว', none: 'ยังไม่สร้าง', done: 'เสร็จแล้ว' } },
  };
  const T = UI[String(S.lang || 'zh-CN').slice(0, 2).toLowerCase()] || UI.en;
  const LABEL = Object.assign({}, T.st, S.statusLabels || {});
  const issues = [], warnings = [];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // inline markup: {cy:text} colors, {b:text} bold, {w:text} bright, {dim:text}; \n breaks the line
  function fmt(s) {
    if (s == null) return '';
    if (Array.isArray(s)) return s.map(fmt).join('<br>');
    let h = esc(s), prev;
    do { prev = h; h = h.replace(/\{(bl|cy|gr|am|pu|rd|dim|b|w):([^{}]*)\}/g, '<span class="$1">$2</span>'); } while (h !== prev);
    return h.replace(/\n/g, '<br>');
  }
  const plain = s => String(s == null ? '' : s).replace(/\{\w+:([^{}]*)\}/g, '$1');
  function el(tag, cls, html, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function place(e, o) {
    if (o.x != null) e.style.left = o.x + 'px';
    if (o.y != null) e.style.top = o.y + 'px';
    if (o.w != null) e.style.width = o.w + 'px';
    if (o.h != null) e.style.height = o.h + 'px';
  }
  const tint = (e, c) => e.style.setProperty('--c', `var(--${col(c)})`);

  // ---------- stage ----------
  const fit = el('div', null, null, document.body); fit.id = 'fit'; fit.style.maxWidth = W + 'px';
  const stage = el('div', null, null, fit); stage.id = 'stage'; stage.style.width = W + 'px';
  const svg = document.createElementNS(NS, 'svg'); svg.id = 'wires'; stage.appendChild(svg);

  // ---------- header ----------
  const head = el('div', 'abs', null, stage); head.id = 'head';
  el('div', 't', fmt(S.title || ''), head);
  if (S.subtitle) el('div', 'dim', fmt(S.subtitle), head);
  el('div', 'rule', null, head);
  // flows: typed wires ({id, label, color, dash}); an edge with "flow" inherits its color and dash
  const FLOW = {};
  for (const f of S.flows || []) FLOW[f.id] = f;
  const hasFlows = (S.flows || []).length > 0;
  const lgLine = (title, html) => {
    const d = el('div', null, (title ? `<span class="dim">${title}</span>` : '') + html, head);
    d.style.marginTop = '6px';
  };
  if (S.layers && S.layers.length) {
    lgLine(hasFlows ? T.elements : '', S.layers.map(l =>
      `<span class="lg"><span class="sq" style="background:var(--${col(l.color)})"></span>${fmt(l.label)}</span>`).join(''));
  }
  if (hasFlows) {
    lgLine(T.flows, S.flows.map(f =>
      `<span class="lg"><svg width="28" height="8" style="vertical-align:1px;margin-right:6px"><line x1="0" y1="4" x2="28" y2="4" stroke="var(--${col(f.color)})" stroke-width="1.6"${f.dash ? ' stroke-dasharray="5 4"' : ''}/></svg>${fmt(f.label)}</span>`).join(''));
  }
  const used = ['ok', 'warn', 'dev', 'off', 'none', 'done'].filter(s => (S.nodes || []).some(n => n.status === s));
  const lineLg = [];
  if (used.length) lineLg.push(`<span class="dim">${T.status}</span>` +
    used.map(s => `<span class="st stl ${s}">${esc(LABEL[s])}</span>`).join(''));
  if (!hasFlows && S.wireLegend !== false) lineLg.push(`<span class="dim">${T.wires}</span>`);
  if (lineLg.length) lgLine('', lineLg.join('&nbsp;&nbsp;&nbsp;'));

  // ---------- groups (drawn first, underneath) ----------
  for (const g of S.groups || []) {
    const d = el('div', 'group' + (g.solid ? ' solid' : ''), null, stage);
    if (g.id) d.id = g.id;
    tint(d, g.color); place(d, g);
    if (g.label) {
      const lg = el('div', 'glg', fmt(g.label), d);
      if (g.labelRight) { lg.style.left = 'auto'; lg.style.right = '16px'; }
    }
  }

  // ---------- nodes ----------
  const layerColor = id => ((S.layers || []).find(l => l.id === id) || {}).color;
  const rails = [];
  for (const n of S.nodes || []) {
    const d = el('div', 'box' + (n.dashed ? ' dash' : '') + (n.status ? ' is-' + n.status : '') + (n.kind === 'rail' ? ' rail' : ''), null, stage);
    d.id = n.id;
    tint(d, n.color || layerColor(n.layer)); place(d, n);
    if (n.status) el('span', 'st ' + n.status, fmt(n.statusText || LABEL[n.status] || n.status), d);
    if (n.title) el('div', 'ttl', fmt(n.title), d);
    if (n.sub) el('div', 'sub', fmt(n.sub), d);
    if (n.text) el('div', 'c', fmt(n.text), d);
    if (n.rows) {
      const t = el('table', 'mods', null, d), refs = n.rows.some(r => r.ref);
      for (const r of n.rows) {
        const tr = el('tr', null, null, t);
        if (r.id) tr.id = r.id;
        const nm = el('td', 'n', fmt(r.name), tr);
        if (r.color) nm.style.color = `var(--${col(r.color)})`;
        if (refs) el('td', 'p', fmt(r.ref || ''), tr);
        el('td', 'd' + (r.bright ? '' : ' dim'),
          (r.bar ? `<span class="bar" style="width:${+r.bar}px;background:var(--c)"></span>` : '') +
          fmt(r.desc || '') + (r.tag ? ` <span class="tag">${fmt(r.tag)}</span>` : ''), tr);
      }
    }
    if (n.pipeline) {
      const p = el('div', 'pipe', null, d);
      n.pipeline.forEach((s, i) => {
        if (i) el('span', 'arr', '→', p);
        const q = String(s).startsWith('~');
        el('span', 'chip' + (q ? ' q' : ''), fmt(q ? s.slice(1) : s), p);
      });
    }
    if (n.lines) for (const l of [].concat(n.lines)) el('div', 'c dim', fmt(l), d);
    if (n.footer) { el('div', 'hr', null, d); el('div', 'c', fmt(n.footer), d); }
    if (n.kind === 'rail') {
      el('div', 'vl', null, d);
      const items = (n.items || []).map(it => {
        const e = el('div', 'item', null, d);
        e.innerHTML = (it.title ? `<div class="${it.hl ? 'hl' : ''}"><span class="dia">${esc(it.icon || '◇')}</span> ${fmt(it.title)}</div>` : '') +
          (it.lines ? `<div class="dim ind">${fmt(it.lines)}</div>` : '');
        return { e, it };
      });
      rails.push({ d, n, items });
    }
  }

  // ---------- free notes ----------
  for (const n of S.notes || []) {
    const d = el('div', 'abs note' + (n.dim ? ' dim' : ''), fmt(n.text), stage);
    if (n.id) d.id = n.id;
    place(d, n);
    d.style.textAlign = n.align || 'center';
    if (n.color) d.style.color = `var(--${col(n.color)})`;
  }

  // ---------- geometry (stage coordinates, measured before scaling) ----------
  function R(e) {
    const s = stage.getBoundingClientRect(), b = e.getBoundingClientRect();
    const r = { l: b.left - s.left, t: b.top - s.top, r: b.right - s.left, b: b.bottom - s.top };
    r.cx = (r.l + r.r) / 2; r.cy = (r.t + r.b) / 2;
    return r;
  }
  const byId = id => document.getElementById(id);

  // rail items: align to a row (alignTo), sit at a fixed top, or stack under the previous item
  for (const { d, n, items } of rails) {
    const dr = R(d);
    let next = 64;
    for (const { e, it } of items) {
      let top = it.top != null ? it.top : next;
      if (it.alignTo) {
        const row = byId(it.alignTo);
        if (row) top = R(row).cy - dr.t - 11;
        else issues.push(`rail ${n.id}: alignTo "${it.alignTo}" not found`);
      }
      e.style.top = top + 'px';
      next = top + e.offsetHeight + 18;
    }
    if (n.h == null) d.style.height = (next + 2) + 'px';
  }

  const bottomOf = () => Math.max(0, ...[...stage.children].filter(c => c !== svg).map(c => R(c).b));

  // ---------- session log + terminal footer ----------
  // live: the log streams one row per packet arrival instead of showing fixed rows
  let LIVE = null;
  if (S.log) {
    const lg = el('div', 'abs', null, stage); lg.id = 'log';
    lg.style.left = '16px'; lg.style.right = '16px';
    lg.style.top = (S.log.y != null ? S.log.y : bottomOf() + 44) + 'px';
    const live = S.log.live;
    const title = S.log.title || (live ? T.live : 'session log');
    el('div', 'legend', '─┤ ' + fmt(title) + (live ? ' <span class="livedot">●</span> <span class="gr">live</span>' : ''), lg);
    const cols = S.log.cols || (live ? '96px 64px 380px 1fr' : '80px 90px 300px 1fr');
    if (live) {
      const max = (live === true ? 0 : live.rows) || 7;
      const box = el('div', 'live', null, lg);
      box.style.height = (max * 20) + 'px';
      LIVE = { box, max, cols };
    }
    for (const r of live ? [] : S.log.rows || []) {
      const row = el('div', 'row', null, lg);
      row.style.gridTemplateColumns = cols;
      const [t, who, c, what, detail] = Array.isArray(r) ? r : [r.t, r.who, r.color, r.what, r.detail];
      row.innerHTML = `<span class="dim">${fmt(t)}</span><span class="b" style="color:var(--${col(c || 'text')})">${fmt(who)}</span>` +
        `<span>${fmt(what)}</span><span class="dim">${fmt(detail)}</span>`;
    }
  }
  if (S.footer) {
    const f = el('div', 'abs', null, stage); f.id = 'status';
    f.style.left = '16px'; f.style.right = '16px';
    f.style.top = (bottomOf() + 24) + 'px';
    if (S.footer.cmd) el('div', null, `<span class="gr">${fmt(S.footer.cwd || '~')}</span> $ ${fmt(S.footer.cmd)} <span class="cursor"></span>`, f);
    if (S.footer.note) el('div', 'dim', fmt(S.footer.note), f).style.marginTop = '4px';
  }

  const H = Math.ceil(bottomOf() + 24);
  stage.style.height = H + 'px';
  svg.setAttribute('width', W); svg.setAttribute('height', H);

  // ---------- wires ----------
  const defs = document.createElementNS(NS, 'defs');
  const markers = new Set();
  function marker(k) {
    if (markers.has(k)) return; markers.add(k);
    const m = document.createElementNS(NS, 'marker');
    m.setAttribute('id', 'a-' + k); m.setAttribute('viewBox', '0 0 10 10');
    m.setAttribute('refX', 9); m.setAttribute('refY', 5);
    m.setAttribute('markerWidth', 7); m.setAttribute('markerHeight', 7); m.setAttribute('orient', 'auto-start-reverse');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M0,0 L10,5 L0,10 z'); p.setAttribute('fill', cssv(k));
    m.appendChild(p); defs.appendChild(m);
  }
  svg.appendChild(defs);

  // anchor syntax: "id", "id.side", "id.side@0.3" (fraction along the side), "id.side@40px" / "@-22px" (from start / end),
  // or a raw point [x, y] / [x, y, side]. Row ids (table rows) anchor on their box's left/right edge.
  function centerOf(ref) {
    if (Array.isArray(ref)) return { cx: ref[0], cy: ref[1] };
    const e = byId(String(ref).split(/[.@]/)[0]);
    return e ? R(e) : null;
  }
  function anchor(ref, other, label) {
    if (Array.isArray(ref)) return { x: ref[0], y: ref[1], side: ref[2] || null, box: null };
    const m = /^([\w-]+)(?:\.([tblr]))?(?:@(-?[\d.]+)(px)?)?$/.exec(String(ref));
    if (!m) { issues.push(`${label}: bad anchor "${ref}"`); return null; }
    const e = byId(m[1]);
    if (!e) { issues.push(`${label}: anchor id "${m[1]}" not found`); return null; }
    const own = e.classList.contains('box') ? e : (e.closest('.box') || e);
    const b = R(e), ob = R(own);
    let side = m[2];
    if (!side) {
      const o = other || { cx: b.cx, cy: b.b + 1 };
      const dx = o.cx - b.cx, dy = o.cy - b.cy;
      side = Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'b' : 't') : (dx > 0 ? 'r' : 'l');
    }
    const v = m[3] != null ? +m[3] : null, px = !!m[4];
    const along = (lo, hi) => v == null ? (lo + hi) / 2 : px ? (v >= 0 ? lo + v : hi + v) : lo + v * (hi - lo);
    let x, y;
    if (side === 'l' || side === 'r') { x = side === 'l' ? ob.l : ob.r; y = along(b.t, b.b); }
    else { y = side === 't' ? b.t : b.b; x = along(b.l, b.r); }
    return { x, y, side, box: own };
  }
  const V = s => s === 't' || s === 'b';
  function route(a, z, e) {
    const A = [a.x, a.y], Z = [z.x, z.y];
    if (e.via) {
      const pts = [A, ...e.via, Z], out = [A];
      let vert = a.side ? V(a.side) : true;
      for (let i = 1; i < pts.length; i++) {
        const p = out[out.length - 1], q = pts[i];
        if (Math.abs(p[0] - q[0]) > .5 && Math.abs(p[1] - q[1]) > .5) out.push(vert ? [p[0], q[1]] : [q[0], p[1]]);
        out.push(q);
        const s0 = out[out.length - 2], s1 = out[out.length - 1];
        vert = !(Math.abs(s0[0] - s1[0]) < .5);
      }
      return out;
    }
    if (e.rail != null) {
      const [k, v] = String(e.rail).split(':'), n = +v;
      return k === 'x' ? [A, [n, A[1]], [n, Z[1]], Z] : [A, [A[0], n], [Z[0], n], Z];
    }
    const va = a.side ? V(a.side) : V(z.side || 't'), vz = z.side ? V(z.side) : va;
    if (va && vz) {
      if (Math.abs(A[0] - Z[0]) < 1.5) return [A, [A[0], Z[1]]];
      const y = e.mid != null ? e.mid : (A[1] + Z[1]) / 2;
      return [A, [A[0], y], [Z[0], y], Z];
    }
    if (!va && !vz) {
      if (Math.abs(A[1] - Z[1]) < 1.5) return [A, [Z[0], A[1]]];
      const x = e.mid != null ? e.mid : (A[0] + Z[0]) / 2;
      return [A, [x, A[1]], [x, Z[1]], Z];
    }
    return va ? [A, [A[0], Z[1]], Z] : [A, [Z[0], A[1]], Z];
  }
  function dot(x, y, k, hollow) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', hollow ? 4 : 3.5);
    c.setAttribute('fill', hollow ? cssv('bg') : cssv(k));
    c.setAttribute('stroke', cssv(k)); c.setAttribute('stroke-width', 1.5);
    svg.appendChild(c);
  }
  // a small glowing packet travelling along each wire
  function packet(pts, k) {
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 2.6); c.setAttribute('fill', cssv(k)); c.style.filter = `drop-shadow(0 0 3px ${cssv(k)})`;
    const m = document.createElementNS(NS, 'animateMotion');
    m.setAttribute('path', 'M' + pts.map(q => q.join(',')).join(' L'));
    let dur = Math.max(0.8, len / 110);
    if (LOOP) dur = LOOP / Math.max(1, Math.round(LOOP / dur));
    m.setAttribute('dur', dur.toFixed(4) + 's');
    const begin = +(Math.random() * 1.5).toFixed(2);
    m.setAttribute('begin', begin + 's');
    m.setAttribute('repeatCount', 'indefinite');
    c.setAttribute('opacity', 0);
    const on = document.createElementNS(NS, 'set');
    on.setAttribute('attributeName', 'opacity'); on.setAttribute('to', 1);
    on.setAttribute('begin', m.getAttribute('begin')); on.setAttribute('fill', 'freeze');
    c.appendChild(m); c.appendChild(on); svg.appendChild(c);
    // arrivals happen at begin + n·dur on the SVG timeline; the live log keys off this
    return { begin, dur: +dur.toFixed(4) };
  }
  const labels = [], segs = [];
  function label(pts, e, k, name) {
    let bi = 1, best = -1;
    for (let i = 1; i < pts.length; i++) {
      const L = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
      if (L > best) { best = L; bi = i; }
    }
    if (e.labelSeg != null) bi = Math.min(pts.length - 1, Math.max(1, e.labelSeg));
    const p = pts[bi - 1], q = pts[bi], horiz = Math.abs(p[1] - q[1]) < .5;
    const lines = String(e.label).split('\n').map(plain);
    const side = e.labelSide || (horiz ? 'above' : 'right');
    let x = (p[0] + q[0]) / 2, y = (p[1] + q[1]) / 2, anchorTo = 'middle';
    if (side === 'above') y -= 7 + (lines.length - 1) * 15;
    else if (side === 'below') y += 15;
    else { x += side === 'left' ? -7 : 7; anchorTo = side === 'left' ? 'end' : 'start'; y += 4 - (lines.length - 1) * 7.5; }
    if (e.labelPos) [x, y] = e.labelPos;
    if (e.labelOffset) { x += e.labelOffset[0]; y += e.labelOffset[1]; }
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('class', 'lbl'); t.setAttribute('text-anchor', e.labelAnchor || anchorTo);
    t.setAttribute('fill', cssv(col(e.labelColor || 'dim')));
    lines.forEach((s, i) => {
      const sp = document.createElementNS(NS, 'tspan');
      sp.setAttribute('x', x); sp.setAttribute('y', y + i * 15); sp.textContent = s;
      t.appendChild(sp);
    });
    svg.appendChild(t);
    labels.push({ t, name });
  }

  // ---------- live trace: one log row each time a packet reaches the end of its wire ----------
  const NAMES = {};
  for (const n of S.nodes || []) {
    NAMES[n.id] = n.short || plain(n.title || n.id).split(' · ')[0];
    for (const r of n.rows || []) if (r.id) NAMES[r.id] = plain(r.name);
  }
  for (const g of S.groups || []) NAMES[g.id] = g.short || plain(g.label || g.id).split(' · ')[0];
  const nameOf = ref => Array.isArray(ref) ? null : NAMES[String(ref).split(/[.@]/)[0]];
  const liveEdges = [];
  function liveEntry(e, k, timing) {
    if (e.log === false) return;
    const o = typeof e.log === 'string' ? { detail: e.log } : e.log || {};
    const A = nameOf(e.from), Z = nameOf(e.to);
    if (!o.what && (!A || !Z)) return;
    const f = FLOW[e.flow] || {};
    liveEdges.push({
      who: o.who || e.flow || '·', color: col(o.color || k),
      what: o.what || `${A} ${e.arrow === 'both' ? '⇄' : '→'} ${Z}`,
      detail: o.detail || (e.label ? plain(e.label).replace(/\n/g, ' ') : plain(f.label || '')),
      timing,
    });
  }
  function startLive() {
    const { box, max, cols } = LIVE;
    const add = (t, x, fresh) => {
      const row = el('div', 'row' + (fresh ? ' new' : ''), null, box);
      row.style.gridTemplateColumns = cols;
      row.innerHTML = `<span class="dim">${esc(t)}</span><span class="b" style="color:var(--${x.color})">${fmt(x.who)}</span>` +
        `<span>${fmt(x.what)}</span><span class="dim">${fmt(x.detail)}</span>`;
      while (box.children.length > max) box.firstChild.remove();
    };
    const timed = liveEdges.filter(x => x.timing);
    // a still render (check / PNG / reduced motion) shows the first rows as a static sample
    if (STILL || !timed.length) { liveEdges.slice(0, max).forEach((x, i) => add(`t+${(i * 0.4).toFixed(2)}s`, x)); return; }
    const t0 = Date.now();
    const clock = tt => {
      if (LOOP) return `t+${(tt % LOOP).toFixed(2)}s`;
      const d = new Date(t0 + tt * 1000);
      return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    };
    const next = timed.map(x => x.timing.begin + x.timing.dur);
    // each wire logs one arrival per period P, the one nearest its own slot, so rows come
    // evenly spaced and readable; with ?loop the pattern repeats exactly every P seconds
    const P = LOOP || 4, n = timed.length;
    const logs = (tt, i, d) => {
      const off = Math.abs((tt % P) - (i + 0.5) / n * P);
      return Math.min(off, P - off) < d / 2;
    };
    (function tick() {
      const now = svg.getCurrentTime(), due = [];
      timed.forEach((x, i) => {
        while (next[i] <= now) {
          if (logs(next[i], i, x.timing.dur)) due.push([next[i], x]);
          next[i] += x.timing.dur;
        }
      });
      // a background tab catching up only shows the latest rows
      due.sort((p, q) => p[0] - q[0]).slice(-max).forEach(([tt, x]) => add(clock(tt), x, true));
      requestAnimationFrame(tick);
    })();
  }

  (S.edges || []).forEach((e0, i) => {
    const f = FLOW[e0.flow] || {};
    if (e0.flow && !FLOW[e0.flow]) issues.push(`edge#${i}: unknown flow "${e0.flow}"`);
    const e = Object.assign({ color: f.color, dash: f.dash }, e0);
    if (e0.color == null) e.color = f.color;
    if (e0.dash == null) e.dash = f.dash;
    const name = e.id || `edge#${i} ${Array.isArray(e.from) ? 'pt' : e.from}→${Array.isArray(e.to) ? 'pt' : e.to}`;
    let a = anchor(e.from, centerOf(e.to), name), z = anchor(e.to, centerOf(e.from), name);
    if (!a || !z) return;
    // straight: slide the start along its side so the wire runs straight into the target
    if (e.straight) { if (V(a.side)) a.x = z.x; else a.y = z.y; }
    const pts = route(a, z, e).map(p => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2]);
    const k = col(e.color || 'dim');
    const p = document.createElementNS(NS, 'polyline');
    p.setAttribute('points', pts.map(q => q.join(',')).join(' '));
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', cssv(k)); p.setAttribute('stroke-width', 1.4);
    if (e.dash) { p.setAttribute('stroke-dasharray', '5 4'); if (!STILL) p.classList.add('flow'); }
    if (e.arrow !== false) { marker(k); p.setAttribute('marker-end', `url(#a-${k})`); }
    if (e.arrow === 'both') p.setAttribute('marker-start', `url(#a-${k})`);
    svg.appendChild(p);
    const timing = !STILL && e.packet !== false ? packet(pts, k) : null;
    if (LIVE) liveEntry(e, k, timing);
    if (e.joint && pts.length > 2) dot(pts[pts.length - 2][0], pts[pts.length - 2][1], k, e.joint === 'hollow');
    if (e.startDot) dot(pts[0][0], pts[0][1], k, e.startDot === 'hollow');
    if (e.label) label(pts, e, k, name);
    for (let j = 1; j < pts.length; j++) segs.push({ name, a: pts[j - 1], b: pts[j], skip: [a.box, z.box] });
  });
  for (const d of S.dots || []) {
    const c = Array.isArray(d.at) ? { x: d.at[0], y: d.at[1] } : anchor(d.at, null, 'dot');
    if (c) dot(c.x, c.y, col(d.color || 'dim'), d.hollow);
  }
  if (LIVE) startLive();

  // ---------- self-check ----------
  const tag = e => e.id ? '#' + e.id : (e.className || e.tagName);
  const solids = [...stage.querySelectorAll('.box, .note, #log, #head, .group > .glg')].map(e => ({ e, r: R(e) }));
  if (!solids.every(s => s.e.id)) solids.filter(s => s.e.classList.contains('glg')).forEach(s => { s.e.id ||= (s.e.parentElement.id || 'group') + '-legend'; });
  const inter = (p, q, pad = 0) => Math.min(p.r, q.r) - Math.max(p.l, q.l) > pad && Math.min(p.b, q.b) - Math.max(p.t, q.t) > pad;
  for (let i = 0; i < solids.length; i++) for (let j = i + 1; j < solids.length; j++) {
    const A = solids[i], B = solids[j];
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    if (inter(A.r, B.r, 2)) issues.push(`overlap: ${tag(A.e)} and ${tag(B.e)}`);
  }
  for (const { e, r } of solids) {
    if (e.classList.contains('box')) {
      if (e.scrollHeight > e.clientHeight + 2) issues.push(`${tag(e)}: content is ${e.scrollHeight - e.clientHeight}px taller than the box — raise h or cut text`);
      if (e.scrollWidth > e.clientWidth + 2) issues.push(`${tag(e)}: content is ${e.scrollWidth - e.clientWidth}px wider than the box — widen it or shorten a line`);
    }
    if (r.l < -1 || r.r > W + 1) issues.push(`${tag(e)}: outside the ${W}px canvas (l=${Math.round(r.l)}, r=${Math.round(r.r)})`);
  }
  for (const rl of rails) {
    const its = rl.items.map((x, i) => ({ i: i + 1, r: R(x.e) })).sort((p, q) => p.r.t - q.r.t);
    for (let i = 1; i < its.length; i++) {
      if (its[i].r.t < its[i - 1].r.b + 4) issues.push(`rail #${rl.n.id}: item ${its[i].i} collides with item ${its[i - 1].i} — move it or set top`);
    }
    const last = its[its.length - 1];
    if (last && last.r.b > R(rl.d).b - 4) issues.push(`rail #${rl.n.id}: items run past the bottom — raise h`);
  }
  const boxes = solids.filter(s => ['box', 'note', 'glg'].some(c => s.e.classList.contains(c)));
  for (const s of segs) {
    const hz = Math.abs(s.a[1] - s.b[1]) < .5;
    const sl = Math.min(s.a[0], s.b[0]), sr = Math.max(s.a[0], s.b[0]), st = Math.min(s.a[1], s.b[1]), sb = Math.max(s.a[1], s.b[1]);
    for (const { e, r } of boxes) {
      if (s.skip.includes(e)) continue;
      const hit = hz ? (s.a[1] > r.t + 2 && s.a[1] < r.b - 2 && sr > r.l + 2 && sl < r.r - 2)
                     : (s.a[0] > r.l + 2 && s.a[0] < r.r - 2 && sb > r.t + 2 && st < r.b - 2);
      if (hit) issues.push(`${s.name}: wire passes through ${tag(e)} — use rail/mid/via to route around it`);
    }
  }
  for (const { t, name } of labels) {
    const b = t.getBBox(), lr = { l: b.x, t: b.y, r: b.x + b.width, b: b.y + b.height };
    for (const { e, r } of solids) if (inter(lr, r, 1)) issues.push(`${name}: label "${t.textContent}" sits on ${tag(e)} — use labelSide/labelOffset`);
    if (lr.l < -1 || lr.r > W + 1) issues.push(`${name}: label "${t.textContent}" leaves the canvas`);
    const hits = new Set();
    for (const s of segs) {
      if (s.name === name) continue;
      const sl = Math.min(s.a[0], s.b[0]), sr = Math.max(s.a[0], s.b[0]), st = Math.min(s.a[1], s.b[1]), sb = Math.max(s.a[1], s.b[1]);
      if (sr > lr.l + 1 && sl < lr.r - 1 && sb > lr.t + 1 && st < lr.b - 1) hits.add(s.name);
    }
    for (const h of hits) issues.push(`${name}: label "${t.textContent}" is crossed by ${h} — use labelSide/labelPos`);
  }
  let crossings = 0;
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const s = segs[i], u = segs[j];
    if (s.name === u.name) continue;
    const sh = Math.abs(s.a[1] - s.b[1]) < .5, uh = Math.abs(u.a[1] - u.b[1]) < .5;
    if (sh === uh) continue;
    const h = sh ? s : u, v = sh ? u : s;
    const x = v.a[0], y = h.a[1];
    if (x > Math.min(h.a[0], h.b[0]) + 1 && x < Math.max(h.a[0], h.b[0]) - 1 &&
        y > Math.min(v.a[1], v.b[1]) + 1 && y < Math.max(v.a[1], v.b[1]) - 1) crossings++;
  }
  for (const c of badColors) issues.push(`unknown color ${JSON.stringify(c)} — use one of: ${[...COLORS].join(' ')} (or ${Object.keys(SHORT).join(' ')})`);
  if (crossings) warnings.push(`${crossings} wire crossing(s) — fine if unavoidable, but try reordering boxes first`);

  const pre = el('pre', null, null, document.body);
  pre.id = '__diag'; pre.hidden = true;
  pre.textContent = JSON.stringify({ width: W, height: H, issues, warnings });
  if (issues.length) console.warn('[arch-diagram]', issues);

  // ---------- scale to fit narrow screens ----------
  // zoom re-lays out at the smaller size so text stays crisp; transform blurs in narrow windows
  const useZoom = CSS.supports('zoom', '0.5');
  function scale() {
    const k = Math.min(1, fit.clientWidth / W);
    if (useZoom) stage.style.zoom = k; else stage.style.transform = `scale(${k})`;
    fit.style.height = (H * k) + 'px';
  }
  addEventListener('resize', scale); scale();
})();
