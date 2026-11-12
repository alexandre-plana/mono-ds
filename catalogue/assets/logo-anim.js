/* Animation du logo MONO — canevas, sans dépendance.

   Le logo s'écrit comme une commande : un curseur, quatre lettres. Puis le curseur, au lieu de
   disparaître, se retire d'un pas, rétrécit et devient le point de signal. Des traits de
   construction passent — ligne de base, hauteur de capitale, espacement — et s'effacent en
   descendant les tons. Il reste le logo. Boucle de huit secondes ; image fixe si les animations
   sont réduites. Aucune couleur écrite : les rôles du thème sont lus à chaque image. */
'use strict';
window.MonoLogo = (canvas, { size = 28, loop = true } = {}) => {
  const ctx = canvas.getContext('2d'), WORD = 'MONO', T = 8;
  let C = {}, W = 0, H = 0, t0 = performance.now(), raf = 0;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tones = () => { const g = getComputedStyle(document.documentElement), v = (n) => g.getPropertyValue(n).trim(); C = { bg: v('--bg'), faint: v('--line-faint'), line: v('--line'), strong: v('--line-strong'), muted: v('--fg-muted'), soft: v('--fg-soft'), max: v('--fg-strong'), signal: v('--signal') }; C.fade = [C.soft, C.muted, C.strong, C.line, C.faint]; };
  const fit = () => { const d = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const px = (v) => Math.round(v) + 0.5, clamp = (x) => Math.max(0, Math.min(1, x)), ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const line = (x1, y1, x2, y2, c, dash) => { ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
  function draw(t) {
    tones(); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.font = `${size}px "IBM Plex Mono", ui-monospace, monospace`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
    const adv = ctx.measureText('M').width, track = size * 0.42, step = adv + track, cap = size * 0.7, total = step * WORD.length - track + size * 0.48 + 4, x0 = Math.round((W - total) / 2), base = Math.round(H / 2 + cap / 2);
    // 1. le curseur attend, puis écrit
    const typed = Math.floor(clamp((t - 0.9) / 1.6) * WORD.length + 0.0001), writing = t < 2.5;
    for (let i = 0; i < typed; i++) { ctx.fillStyle = C.max; ctx.textAlign = 'left'; ctx.fillText(WORD[i], x0 + i * step, base); }
    // 2. le curseur devient le point : il recule vers sa place, rétrécit, passe au signal
    const px0 = x0 + typed * step, pxEnd = x0 + step * WORD.length - track + size * 0.48, g = ease((t - 2.7) / 0.9), big = Math.round(size * 0.5);
    if (writing) { if (t < 0.9 ? Math.floor(t * 2.2) % 2 === 0 : true) { ctx.fillStyle = C.max; ctx.fillRect(Math.round(px0), base - cap, big, cap); } }
    else { const w = big + (4 - big) * g, h = cap + (4 - cap) * g, x = px0 + (pxEnd - px0) * g; ctx.fillStyle = g > 0.55 ? C.signal : C.max; ctx.fillRect(Math.round(x), Math.round(base - h), Math.round(w), Math.round(h)); }
    // 3. les traits de construction passent, puis descendent les tons jusqu'à s'effacer
    const k = t < 3.8 ? -1 : t < 5.6 ? 0 : Math.floor((t - 5.6) / 0.22) + 1;
    if (k >= 0 && k < C.fade.length) {
      const c = C.fade[k], xl = x0 - 56, xr = pxEnd + 60, grow = ease((t - 3.8) / 0.7), xe = xl + (xr - xl) * grow;
      line(xl, px(base), xe, px(base), c, [1, 4]); line(xl, px(base - cap), xe, px(base - cap), c, [1, 4]);
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'; ctx.letterSpacing = '0.9px'; ctx.fillStyle = c;
      if (grow > 0.5) { for (let i = 0; i < WORD.length; i++) { const x = px(x0 + i * step); line(x, base + 8, x, base + 14, c); }
        const a = px(x0 + adv), b = px(x0 + step); line(a, base + 22, b, base + 22, c); line(a, base + 19, a, base + 25, c); line(b, base + 19, b, base + 25, c); ctx.textAlign = 'left'; ctx.fillText('0,42 EM', b + 8, base + 26); }
      if (grow > 0.9) { ctx.textAlign = 'left'; ctx.fillText('4 PX', pxEnd + 22, base - cap - 12); line(pxEnd + 4, base - 6, pxEnd + 18, base - cap - 8, c); ctx.textAlign = 'right'; ctx.fillText('CAP.', xl - 8, base - cap + 4); ctx.fillText('BASE', xl - 8, base + 4); }
    }
  }
  const tick = (now) => { const t = still ? T - 0.5 : ((now - t0) / 1000) % T; draw(loop ? t : Math.min(t, T - 0.5)); if (!still) raf = requestAnimationFrame(tick); };
  new ResizeObserver(() => { fit(); if (still) draw(T - 0.5); }).observe(canvas);
  fit(); (document.fonts?.ready || Promise.resolve()).then(() => { t0 = performance.now(); raf = requestAnimationFrame(tick); });
  return { restart() { t0 = performance.now(); }, at(t) { cancelAnimationFrame(raf); draw(t); } };
};
