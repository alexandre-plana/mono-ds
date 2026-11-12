/* Planches animées MONO — trois tableaux procéduraux, infinis, sans dépendance.

   Ce ne sont pas des interfaces : ce sont des planches à regarder, comme on feuillette un atlas.
   Chacune part d'une GRAINE — deux mots tirés d'un petit lexique — qui fixe tout ce qui s'y passe :
   même graine, même planche. Le mouvement est lent, continu, sans début ni fin.

     01  Crêtes   un relief qui dérive, rangée après rangée       (la pochette de disque)
     02  Atlas    des stations sur un graticule, balayées         (la carte du rapport)
     03  Arbre    un arbre de décision qui pousse et se retire    (l'arbre du rapport)
     04  Console  des commandes s'écrivent, un volume se découpe    (l'étiquette technique)

   Elles obéissent au système : aucune couleur écrite (les rôles du thème sont lus à chaque image),
   filets d'un pixel, pointillé pour les repères, tireté pour les relations, capitales espacées,
   un seul point en signal. Aucune transparence : ce qui s'efface descend les tons un à un.
   Avec « réduire les animations », la planche est une image fixe. */
'use strict';
window.MonoPlanches = (canvas, { onInfo } = {}) => {
  const ctx = canvas.getContext('2d');
  const A = ['brume', 'sel', 'nacre', 'cendre', 'givre', 'encre', 'marée', 'lichen', 'ardoise', 'phare', 'écume', 'silence', 'soufre', 'verre', 'neige', 'limon'];
  const B = ['lente', 'du nord', 'sans rive', 'de minuit', 'intérieure', 'des hauts', 'immobile', 'du large', 'd\'avant', 'sous la glace', 'de l\'aube', 'seconde', 'des sables', 'profonde', 'en dérive', 'blanche'];
  // ---- hasard reproductible : une graine en mots, un générateur, un bruit lissé
  const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const lattice = (n, x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + n; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const noise = (n, x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); const a = lattice(n, xi, yi), b = lattice(n, xi + 1, yi), c = lattice(n, xi, yi + 1), d = lattice(n, xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const fbm = (n, x, y) => noise(n, x, y) * 0.6 + noise(n + 7, x * 2.1, y * 2.1) * 0.28 + noise(n + 13, x * 4.3, y * 4.3) * 0.12;
  const SYL = ['or', 'un', 'va', 'el', 'is', 'ka', 'me', 'ra', 'no', 'th', 'ys', 'al', 'om', 'ur', 'ei', 'sa', 'li', 'en', 'do', 'ag'];
  const name = (r) => { let s = ''; for (let i = 0, n = 2 + Math.floor(r() * 2); i < n; i++) s += SYL[Math.floor(r() * SYL.length)]; return s.toUpperCase(); };
  const fr = (v, d = 0) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---- dessin : tons lus dans les rôles, traits posés sur le pixel
  let C = {}, W = 0, H = 0;
  const tones = () => { const g = getComputedStyle(document.documentElement), v = (n) => g.getPropertyValue(n).trim(); C = { bg: v('--bg'), surface: v('--surface'), surface2: v('--surface-2'), faint: v('--line-faint'), line: v('--line'), strong: v('--line-strong'), mark: v('--mark'), muted: v('--fg-muted'), soft: v('--fg-soft'), fg: v('--fg'), max: v('--fg-strong'), signal: v('--signal') }; C.fade = [C.max, C.soft, C.mark, C.strong, C.line, C.faint]; };
  const px = (v) => Math.round(v) + 0.5;
  const seg = (x1, y1, x2, y2, color, dash) => { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
  const text = (s, x, y, color, align = 'left', caps = true, halo = false) => { ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'; ctx.letterSpacing = caps ? '0.9px' : '0px'; if (caps) s = s.toUpperCase(); if (halo) { const w = ctx.measureText(s).width + 8, x0 = align === 'right' ? x - w + 4 : align === 'center' ? x - w / 2 : x - 4; ctx.fillStyle = C.bg; ctx.fillRect(Math.round(x0), Math.round(y - 11), Math.round(w), 15); } ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
  const sq = (x, y, s, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s); };
  const corners = (x, y, r, color) => { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([]); for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(px(x + sx * r), px(y + sy * (r - 4))); ctx.lineTo(px(x + sx * r), px(y + sy * r)); ctx.lineTo(px(x + sx * (r - 4)), px(y + sy * r)); ctx.stroke(); } };

  // ---- 01 · Crêtes
  function cretes(seed) {
    const n = seed & 0xffff, r = rng(seed), rows = 44, drift = 0.3 + r() * 0.22, wander = 0.25 + r() * 0.3;
    let held = null;   // le sommet désigné : on ne le lâche que pour un sommet nettement plus haut
    return (t) => {
      const mx = Math.max(72, W * 0.13), iw = W - 2 * mx, top = H * 0.2, gap = (H * 0.62) / rows, amp = H * 0.17, scroll = t * drift, k0 = Math.floor(scroll), frac = scroll - k0, steps = Math.max(140, Math.floor(iw / 5));
      const val = (u, k) => { const cx = 0.5 + (noise(n + 3, k * 0.07, t * 0.01) - 0.5) * wander; return Math.max(0, fbm(n, u * 9 + k * 0.11, k * 0.19 + t * 0.045) - 0.28) * Math.exp(-((u - cx) ** 2) / 0.03) * Math.min(1, Math.sin(Math.PI * u) * 3); };
      const Y = (i, u, k) => top + (i - frac) * gap + amp * 0.3 - val(u, k) * amp * 2 - noise(n + 21, u * 60, k * 1.7) * 1.6;
      let best = { v: -1 };
      for (let i = 0; i <= rows; i++) {
        const k = k0 + i, base = top + (i - frac) * gap + amp * 0.3, pts = [];
        for (let q = 0; q <= steps; q++) { const u = q / steps, v = val(u, k); pts.push([mx + u * iw, Y(i, u, k)]); if (v > best.v && i > 4 && i < rows - 3) best = { v, u, k }; }
        ctx.beginPath(); ctx.moveTo(mx, base + 2); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(mx + iw, base + 2); ctx.closePath(); ctx.fillStyle = C.bg; ctx.fill();
        ctx.beginPath(); pts.forEach(([x, y], q) => (q ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); const crest = held && held.k === k; ctx.strokeStyle = crest ? C.signal : i === rows ? C.max : C.mark; ctx.lineWidth = crest ? 1.5 : 1; ctx.stroke();
        if (k % 6 === 0 && i > 0) text('R-' + String(k % 1000).padStart(3, '0'), mx - 14, base + 3, C.muted, 'right');
      }
      const ay = px(top + rows * gap + amp * 0.3 + 34);
      for (let i = 0; i <= 8; i++) { const x = px(mx + (iw * i) / 8); seg(x, ay, x, ay + 5, C.strong); text(fr(i * 125), x, ay + 20, C.muted, i === 0 ? 'left' : i === 8 ? 'right' : 'center'); }
      seg(mx, ay, mx + iw, ay, C.soft);
      const hv = held && held.k - k0 > 4 && held.k - k0 < rows - 3 ? val(held.u, held.k) : -1;
      if (hv < 0 || best.v > hv * 1.15) held = { u: best.u, k: best.k };
      const hx = mx + held.u * iw, hy = Y(held.k - k0, held.u, held.k), alt = Math.round(val(held.u, held.k) * 2400);
      sq(hx, hy, 5, C.signal); corners(hx, hy, 9, C.signal);
      const lx = Math.min(W - mx - 8, hx + 150), ly = Math.max(H * 0.1, hy - 52);
      ctx.strokeStyle = C.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx + 11, hy - 11); ctx.lineTo(hx + 30, ly); ctx.lineTo(lx, ly); ctx.stroke();
      text(`Sommet ${fr(alt)} m`, lx, ly - 8, C.signal, 'right', true, true); text(`rangée ${String(held.k % 1000).padStart(3, '0')}`, lx, ly + 16, C.soft, 'right', true, true);
      return [`${rows} rangées`, `sommet ${fr(alt)} m`, `dérive ${fr(drift * 60)} rangées / min`];
    };
  }

  // ---- 02 · Atlas
  function atlas(seed) {
    const r = rng(seed), n = seed & 0xffff, st = Array.from({ length: 34 }, (_, i) => ({ u: r(), v: r(), w: 0.2 + r() * 0.8, f: 0.02 + r() * 0.05, p: r() * 6.28, name: name(r), ping: -99, id: i }));
    const lon0 = Math.floor(r() * 300) - 150, lat0 = Math.floor(r() * 80) - 40, log = [];
    return (t) => {
      const m = Math.max(56, W * 0.06), iw = W - 2 * m, ih = H - 2 * m - 40, top = m + 20, cell = Math.max(90, Math.round(iw / 12)), ox = (t * 4) % cell, oy = (t * 1.5) % cell;
      const shift = Math.floor((t * 4) / cell), vshift = Math.floor((t * 1.5) / cell);
      for (let x = m - ox + cell, i = 1; x < m + iw; x += cell, i++) { seg(px(x), top, px(x), top + ih, C.strong, [1, 5]); text(`${Math.abs(lon0 + shift + i)}°${lon0 + shift + i < 0 ? 'O' : 'E'}`, x + 6, top + ih - 8, C.muted); }
      for (let y = top - oy + cell, i = 1; y < top + ih; y += cell, i++) { seg(m, px(y), m + iw, px(y), C.strong, [1, 5]); text(`${Math.abs(lat0 - vshift - i)}°${lat0 - vshift - i < 0 ? 'S' : 'N'}`, m + 8, y - 6, C.muted); }
      // les stations dérivent avec le graticule et reviennent par l'autre bord
      const P = st.map((s) => ({ s, x: m + ((((s.u * iw - t * 4) % iw) + iw) % iw), y: top + ((((s.v * ih - t * 1.5) % ih) + ih) % ih), val: s.w * (0.65 + 0.35 * Math.sin(t * s.f + s.p)) }));
      // relations : chaque station tend un tireté vers sa plus proche voisine
      P.forEach((a) => { let b = null, d = 1e9; P.forEach((q) => { if (q !== a) { const dd = (q.x - a.x) ** 2 + (q.y - a.y) ** 2; if (dd < d) { d = dd; b = q; } } }); if (b && d < (iw * 0.16) ** 2) seg(a.x, a.y, b.x, b.y, C.line, [3, 3]); });
      // le balayage : un méridien qui traverse la planche ; ce qu'il touche est relevé
      const period = 46, sx = m + ((t % period) / period) * iw; seg(px(sx), top, px(sx), top + ih, C.soft);
      text('balayage', sx + 6, top + 12, C.soft, 'left', true, true);
      const top6 = [...P].sort((a, b) => b.val - a.val), lead = top6[0];
      P.forEach((p) => {
        if (Math.abs(p.x - sx) < 3 && t - p.s.ping > 5) { p.s.ping = t; log.unshift(`${p.s.name.padEnd(7)} ${fr(p.val * 1000).padStart(5)}`); log.length = Math.min(log.length, 5); }
        const age = t - p.s.ping, rad = 4 + Math.sqrt(p.val) * 20, is = p === lead;
        if (age < 6) { ctx.strokeStyle = C.fade[Math.min(5, Math.floor(age))]; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, rad + age * 9, 0, 6.2832); ctx.stroke(); }
        ctx.strokeStyle = is ? C.signal : C.max; ctx.lineWidth = 1.25; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832); ctx.stroke();
        sq(p.x, p.y, 4, is ? C.signal : C.max);
        if (top6.indexOf(p) < 6 && p.x < m + iw - 90) text(p.s.name, p.x + rad + 8, p.y + 4, is ? C.signal : C.max, 'left', true, true);
      });
      // registre : les derniers relevés, comme une bande imprimée
      let rx = m + iw; log.forEach((l, i) => { const lab = l.replace(/\s+/g, ' '); text(lab, rx, top + ih + 26, C.fade[Math.min(4, i)], 'right'); rx -= lab.length * 7.5 + 28; }); if (log.length) text('Relevés', rx, top + ih + 26, C.muted, 'right');
      seg(m, px(top + ih + 22), m + 120, px(top + ih + 22), C.soft); seg(px(m), top + ih + 17, px(m), top + ih + 22, C.soft); seg(px(m + 120), top + ih + 17, px(m + 120), top + ih + 22, C.soft); text('100 lieues', m + 128, top + ih + 26, C.muted);
      return [`${st.length} stations`, `${lead.s.name} ${fr(lead.val * 1000)}`, `méridien ${Math.abs(lon0 + shift)}°`];
    };
  }

  // ---- 03 · Arbre
  function arbre(seed) {
    let cycle = -1, nodes = [], order = [];
    const build = (c) => {
      const r = rng(seed + c * 7919); nodes = []; let row = 0;
      const grow = (depth, parent, path) => { const node = { depth, parent, path, len: 8 + Math.floor(r() * 30), row: 0, kids: [] }; nodes.push(node); const n = depth >= 4 ? 0 : depth === 0 ? 3 : r() < 0.98 - depth * 0.17 ? 2 + Math.floor(r() * 2) : 0; for (let i = 0; i < n; i++) node.kids.push(grow(depth + 1, node, path + '.' + (i + 1))); node.row = node.kids.length ? node.kids[0].row : row++; return node; };
      grow(0, null, '0'); order = nodes.map((_, i) => i); const leaves = nodes.filter((d) => !d.kids.length); leaves.sort((a, b) => b.depth - a.depth || b.len - a.len)[0].issue = true; return row;
    };
    let rowsN = 0;
    return (t) => {
      const span = 70, c = Math.floor(t / span), u = (t % span) / span; if (c !== cycle) { cycle = c; rowsN = build(c); }
      // pousse (0 → 0,62), tient (→ 0,8), se retire dans l'ordre inverse (→ 1)
      const shown = u < 0.62 ? (u / 0.62) * nodes.length : u < 0.8 ? nodes.length : (1 - (u - 0.8) / 0.2) * nodes.length;
      const m = Math.max(72, W * 0.1), top = H * 0.16, rh = Math.max(15, Math.min(30, (H * 0.66) / rowsN)), col = (W - 2 * m) / 5.6, unit = col / 46;
      let words = 0, deep = 0, count = 0;
      for (let d = 0; d <= 4; d++) { const x = px(m + d * col); seg(x, top - 18, x, top + rowsN * rh, C.strong, [1, 5]); text('Niveau ' + d, x + 6, top - 24, C.muted); }
      nodes.forEach((nd, i) => {
        const a = Math.max(0, Math.min(1, shown - i)); if (a <= 0) return; count++; words += nd.len; deep = Math.max(deep, nd.depth);
        const x = m + nd.depth * col + 8, y = px(top + nd.row * rh + rh / 2);
        if (nd.parent) { const pxx = m + nd.parent.depth * col + 8 + nd.parent.len * unit + 6, py = px(top + nd.parent.row * rh + rh / 2), mid = x - 14; ctx.strokeStyle = C.strong; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(pxx, py); ctx.lineTo(mid, py); ctx.lineTo(mid, y); ctx.lineTo(x - 4, y); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = C.mark; ctx.fillRect(Math.round(x), y - 2.5, Math.max(1, Math.round(nd.len * unit * a)), 4);
        if (a >= 1 && !nd.kids.length) { const ex = x + nd.len * unit + 10; if (nd.issue) { sq(ex, y, 5, C.signal); text('issue ' + nd.path, ex + 10, y + 4, C.signal, 'left', false); } else { ctx.strokeStyle = C.soft; ctx.lineWidth = 1; ctx.strokeRect(Math.round(ex) - 2.5, y - 3, 5, 5); text(nd.path, ex + 10, y + 4, C.muted, 'left', false); } }
      });
      text(u < 0.62 ? 'il pousse' : u < 0.8 ? 'il tient' : 'il se retire', m, top + rowsN * rh + 30, C.soft);
      return [`${count} / ${nodes.length} nœuds`, `profondeur ${deep}`, `${fr(words)} mots`, `arbre ${String(cycle + 1).padStart(3, '0')}`];
    };
  }

  // ---- 04 · Console
  // Des commandes s'écrivent ; chacune agit sur un volume : une dalle que l'on divise en blocs, que
  // l'on élève, puis dont on détaille certains blocs — et pas d'autres — sur deux ou trois niveaux.
  // C'est une carte proportionnelle vue en perspective isométrique : la surface dit la part,
  // la hauteur dit la valeur, la finesse du découpage dit jusqu'où l'on a regardé.
  function consoleScene(seed, seedText) {
    let cycle = -1, S = null, base = 0;
    const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    // Aux niveaux fins, le bloc est quadrillé : des parts qui peuvent ne pas dépasser la taille d'une icône.
    const grid = (r, node, cols, rows) => {
      const cut = (n) => { const ws = Array.from({ length: n }, () => 0.6 + r()), sum = ws.reduce((a, b) => a + b, 0); let at = 0; return ws.map((v) => { const o = [at, v / sum]; at += v / sum; return o; }); };
      const cx = cut(cols), cy = cut(rows); node.kids = [];
      cy.forEach(([y0, fy], j) => cx.forEach(([x0, fx], i) => node.kids.push({ id: `${node.id}.${j * cols + i + 1}`, level: node.level + 1, x: node.x + x0 * node.w, y: node.y + y0 * node.d, w: node.w * fx, d: node.d * fy, h: Math.min(0.78, Math.max(0.04, node.h * (0.35 + r() * 1.2))), from: node.h, kids: null })));
      return node.kids;
    };
    const split = (r, node, n) => {            // découpe un bloc en n parts inégales, en alternant l'axe
      const along = node.level % 2 === 0 ? 'x' : 'y', ws = Array.from({ length: n }, () => 0.5 + r()), sum = ws.reduce((a, b) => a + b, 0); let at = 0;
      node.kids = ws.map((wt, k) => { const f = wt / sum, kid = { id: (node.id ? node.id + '.' : 'B-') + (k + 1), level: node.level + 1, x: along === 'x' ? node.x + at * node.w : node.x, y: along === 'y' ? node.y + at * node.d : node.y, w: along === 'x' ? node.w * f : node.w, d: along === 'y' ? node.d * f : node.d, h: Math.min(0.72, Math.max(0.06, (node.h || 0.42) * (0.45 + r() * 1.05))), from: node.h || 0, kids: null }; at += f; return kid; });
      return node.kids;
    };
    const build = (c) => {
      const r = rng(seed + c * 104729), root = { id: '', level: 0, x: 0, y: 0, w: 1, d: 1, h: 0, kids: null }, ops = [];
      const n1 = 3 + Math.floor(r() * 3); ops.push({ cmd: `graine "${seedText}"`, out: () => (seed + c).toString(16).padStart(8, '0'), run: 0.5, kind: 'plate' });
      ops.push({ cmd: `diviser ${n1}`, out: () => `${n1} blocs`, run: 1.4, kind: 'split', node: root, kidsOf: split(r, root, n1) });
      ops.push({ cmd: 'élever', out: () => `hauteur max. ${fr(Math.max(...root.kids.map((k) => k.h)) * 240)}`, run: 2.6, kind: 'raise' });
      // on détaille certains blocs, pas tous : deux ou trois au niveau 2, puis un ou deux d'entre eux au niveau 3
      const l1 = [...root.kids].sort((a, b) => b.w * b.d - a.w * a.d).slice(0, 2 + Math.floor(r() * 2)), deeper = [];
      l1.forEach((b) => { const n = 2 + Math.floor(r() * 4), kids = split(r, b, n); deeper.push(...kids); ops.push({ cmd: `détailler ${b.id} niveau 2`, out: () => `${b.id} : ${n} blocs`, run: 2.2, kind: 'split', node: b, kidsOf: kids }); });
      const finer = [];
      deeper.sort((a, b) => b.w * b.d - a.w * a.d).slice(0, 2 + Math.floor(r() * 2)).forEach((b) => { const n = 3 + Math.floor(r() * 3), kids = split(r, b, n); finer.push(...kids); ops.push({ cmd: `détailler ${b.id} niveau 3`, out: () => `${b.id} : ${n} blocs`, run: 1.8, kind: 'split', node: b, kidsOf: kids }); });
      // … et quelques-uns jusqu'au grain : un quadrillage de parts minuscules
      finer.sort((a, b) => b.w * b.d - a.w * a.d).slice(0, 2 + Math.floor(r() * 2)).forEach((b) => { const cols = 2 + Math.floor(r() * 3), rows = 2 + Math.floor(r() * 3), kids = grid(r, b, cols, rows); ops.push({ cmd: `détailler ${b.id} niveau 4`, out: () => `${b.id} : ${cols} × ${rows} grains`, run: 1.8, kind: 'split', node: b, kidsOf: kids }); });
      const leaves = []; (function walk(nd) { nd.kids ? nd.kids.forEach(walk) : leaves.push(nd); })(root);
      const peak = leaves.reduce((a, b) => (b.h > a.h ? b : a));
      leaves.forEach((l, k) => { l.i = k; });
      ops.push({ cmd: 'mesurer', out: () => `${leaves.length} blocs · ${Math.max(...leaves.map((l) => l.level))} niveaux · sommet ${peak.id}`, run: 3.5, kind: 'measure' });
      // défiler : le volume glisse le long de la dalle ; chaque bloc rétrécit à l'approche du bord, y disparaît, et renaît de l'autre côté
      ops.push({ cmd: 'défiler', out: () => 'vers l\'est, sans fin', run: 5, kind: 'scroll' });
      // surveiller : l'état des grains évolue — veille, alerte (contour), critique (aplat) — et retombe
      const watch = { cmd: 'surveiller', run: 14, kind: 'watch', alerts: 0, crit: 0 }; watch.out = () => `${watch.alerts} en alerte · ${watch.crit} critique${watch.crit > 1 ? 's' : ''}`; ops.push(watch);
      ops.push({ cmd: 'aplanir', out: () => 'dalle nue', run: 2.4, kind: 'flat' });
      let t = 1; ops.forEach((o) => { o.t0 = t; o.t1 = t + o.cmd.length / 13; o.t2 = o.t1 + o.run; t = o.t2 + 0.9; });
      return { root, ops, peak, leaves, span: t + 0.8 };
    };
    return (t) => {
      if (!S || t - base > S.span) { cycle++; base = S ? base + S.span : t; S = build(cycle); }
      const u = t - base, m = Math.max(56, W * 0.06), colW = Math.min(400, W * 0.3), top = H * 0.14;
      // ---- la colonne de commandes
      let y = top + 4; const live0 = S.ops.filter((o) => u >= o.t0), firstShown = Math.max(0, live0.length - 9);
      S.ops.forEach((o, oi) => {
        if (u < o.t0 || oi < firstShown) return;
        const typed = o.cmd.slice(0, Math.floor(((u - o.t0) / (o.t1 - o.t0)) * o.cmd.length + 0.001)), live = u < o.t1;
        text('>', m, y, C.muted, 'left', false); text(typed, m + 16, y, live ? C.max : C.fg, 'left', false);
        if (live) sq(m + 16 + ctx.measureText(typed).width + 6, y - 4, 7, C.max);
        y += 18; if (u >= o.t1) { text('→ ' + o.out(), m + 16, y, C.soft, 'left', false); y += 24; }
      });
      if (u > S.ops.at(-1).t2 + 0.2) { text('>', m, y, C.muted, 'left', false); sq(m + 22, y - 4, 7, C.max); }
      // ---- le volume, en perspective isométrique
      const op = (k) => S.ops.find((o) => o.kind === k), raise = ease((u - op('raise').t1) / op('raise').run), flat = 1 - ease((u - op('flat').t1) / op('flat').run), measured = u >= op('measure').t1 && u < op('scroll').t1, W8 = op('watch'), watching = u >= W8.t1 && u < W8.t2; let alerts = 0, crit = 0;
      // le défilement démarre en douceur à « défiler » et s'arrête en douceur pendant « aplanir »
      const sc0 = op('scroll').t1, sc1 = op('flat').t1, vel = 0.045, ramp = 2.5, travelled = (x) => (x <= 0 ? 0 : x < ramp ? (vel * x * x) / (2 * ramp) : vel * (x - ramp / 2)), slide = travelled(Math.min(u, sc1) - sc0) + (u > sc1 ? vel * (u - sc1) * flat : 0);
      const ax = m + colW + m, aw = W - ax - m, ah = H * 0.72, sc = Math.min(aw / 1.75, ah / 1.25), cx = ax + aw / 2, cy = top + ah * 0.58, zs = sc * 0.5;
      const P = (X, Y, Z) => [cx + (X - Y) * sc * 0.866, cy + (X + Y - 1) * sc * 0.5 - Z * zs];
      const poly = (pts, fill, stroke, lw = 1) => { ctx.beginPath(); pts.forEach(([x, yy], k) => (k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.setLineDash([]); ctx.stroke(); } };
      // la dalle : son contour en pointillé, et deux bords cotés
      if (u >= S.ops[0].t1) { ctx.setLineDash([1, 4]); ctx.strokeStyle = C.strong; ctx.lineWidth = 1; ctx.beginPath(); [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].forEach(([X, Y], k) => { const q = P(X, Y, 0); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.setLineDash([]);
        for (let k = 0; k <= 4; k++) { const a = P(k / 4, 1, 0), b = P(1, k / 4, 0); seg(a[0], a[1] + 6, a[0], a[1] + 11, C.strong); seg(b[0], b[1] + 6, b[0], b[1] + 11, C.strong); if (k % 2 === 0) { if (k < 4) text(String(k * 25), a[0] - 6, a[1] + 26, C.muted, 'right'); text(String(k * 25), b[0] + 6, b[1] + 26, C.muted); } } }
      // les blocs visibles à cet instant : un bloc détaillé cède la place à ses parts, qui partent de sa hauteur
      const shown = [];
      (function walk(nd) {
        const o = nd.kids && S.ops.find((x) => x.kidsOf === nd.kids);
        if (o && u >= o.t1) { const g = ease((u - o.t1) / o.run); nd.kids.forEach((k) => { k.cur = (k.from + (k.h - k.from) * g); walk(k); }); }
        else if (nd.level > 0) shown.push(nd);
      })(S.root);
      const edge = [null, C.soft, C.mark, C.strong, C.strong];
      // géométrie de l'instant : la position glisse, et l'emprise se réduit pour ne jamais dépasser le bord
      shown.forEach((b) => { const mx = (((b.x + b.w / 2 + slide) % 1) + 1) % 1, f = slide ? Math.min(1, Math.min(mx, 1 - mx) / (b.w / 2)) : 1; b.f = f; b.rx = mx - (b.w / 2) * f; b.rw = b.w * f; b.ry = b.y + (b.d / 2) * (1 - f); b.rd = b.d * f; });
      // ordre de tracé : un bloc passe avant tous ceux qu'il ne peut pas cacher (il est derrière eux sur un axe)
      const order = [], rest = shown.filter((b) => b.f > 0.02), behind = (a, b) => a.rx + a.rw <= b.rx + 1e-6 || a.ry + a.rd <= b.ry + 1e-6;
      while (rest.length) { let k = rest.findIndex((a) => !rest.some((b) => b !== a && behind(b, a) && !behind(a, b))); if (k < 0) k = 0; order.push(rest.splice(k, 1)[0]); }
      order.forEach((b) => {
        const g = Math.min(0.007, b.rw / 4, b.rd / 4), x0 = b.rx + g, x1 = b.rx + b.rw - g, y0 = b.ry + g, y1 = b.ry + b.rd - g, hz = b.f * (b.cur ?? b.h) * (b.level === 1 ? raise : 1) * (b.level > 1 || raise >= 1 ? 1 : 1) * flat * (b.level > 1 && raise < 1 ? raise : 1), st = edge[Math.min(4, b.level)], hot = measured && b === S.peak;
        // l'état d'un grain : une valeur lente, propre à chacun ; au-dessus d'un seuil il alerte, plus haut il est critique
        const small = b.w * b.d < 0.012, sv = watching && small ? noise(seed & 0xfff, b.i * 3.7 + 0.5, (u - W8.t1) * 0.3 + b.i * 0.61) * Math.min(1, (u - W8.t1) / 1.5, (W8.t2 - u) / 1.5) : 0, state = sv > 0.76 ? 2 : sv > 0.66 ? 1 : 0; if (state === 2) crit++; else if (state === 1) alerts++;
        if (hz > 0.002) { poly([P(x0, y1, 0), P(x1, y1, 0), P(x1, y1, hz), P(x0, y1, hz)], C.bg, st); poly([P(x1, y0, 0), P(x1, y1, 0), P(x1, y1, hz), P(x1, y0, hz)], C.surface, st); }
        const topF = [P(x0, y0, hz), P(x1, y0, hz), P(x1, y1, hz), P(x0, y1, hz)]; poly(topF, state === 2 ? C.signal : C.surface2, state ? C.signal : hot ? C.max : st, hot ? 1.5 : 1);
        b.top = P((x0 + x1) / 2, (y0 + y1) / 2, hz);
      });
      // les noms : seulement les blocs assez larges pour les porter
      order.forEach((b) => { if (b.f > 0.98 && b.w * b.d > 0.045 && (b.w - b.d) > -0.5 && Math.min(b.w, b.d) * sc > 44) text(b.id, b.top[0], b.top[1] + 4, measured && b === S.peak ? C.max : C.muted, 'center', false); });
      W8.alerts = alerts; W8.crit = crit;
      if (measured && S.peak.top && S.peak.f > 0.98) { const [hx, hy] = S.peak.top, lx = Math.min(W - m - 6, hx + 150), ly = Math.max(top - 6, hy - 70); ctx.strokeStyle = C.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx + 4, hy - 6); ctx.lineTo(hx + 26, ly); ctx.lineTo(lx, ly); ctx.stroke(); text(`Sommet ${S.peak.id}`, lx, ly - 8, C.max, 'right', true, true); text(`hauteur ${fr(S.peak.h * 240)} · niveau ${S.peak.level}`, lx, ly + 16, C.soft, 'right', true, true); }
      return [`${shown.length} blocs`, `${Math.max(0, ...shown.map((b) => b.level))} niveaux`, watching ? `${alerts + crit} en alerte` : `volume ${String(cycle + 1).padStart(3, '0')}`];
    };
  }

  // ---- boucle
  const SCENES = { cretes, atlas, arbre, console: consoleScene };
  let scene = 'cretes', seedText = '', frame = null, t0 = performance.now(), raf = 0, last = 0;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const tick = (now) => {
    tones(); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const t = still ? 31 : (now - t0) / 1000 + 20, info = frame(t);
    if (now - last > 400) { last = now; onInfo?.({ scene, seed: seedText, info }); }
    if (!still) raf = requestAnimationFrame(tick);
  };
  const start = (name, seed) => {
    scene = SCENES[name] ? name : 'cretes'; const r = rng((Math.random() * 2 ** 32) >>> 0);
    seedText = seed || `${A[Math.floor(r() * A.length)]} ${B[Math.floor(r() * B.length)]}`;
    frame = SCENES[scene](hash(scene + '·' + seedText), seedText); t0 = performance.now(); last = 0;
    cancelAnimationFrame(raf); size(); (document.fonts?.ready || Promise.resolve()).then(() => { raf = requestAnimationFrame(tick); });
    return seedText;
  };
  new ResizeObserver(() => { size(); if (still && frame) requestAnimationFrame(tick); }).observe(canvas);
  return { start, get seed() { return seedText; }, get scene() { return scene; } };
};
