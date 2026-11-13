/* Laboratoire — atelier 04, « Les formes du direct ». Un même flux d'événements, montré sous quatre formes :
   la carte qui respire, la bande à temps élastique, le journal qui se résume, les sédiments.
   Rien ici ne fait partie du système. */
'use strict';
(() => {
  const stage = document.getElementById('x4'); if (!stage) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches, cfg = (k) => stage.dataset[k];
  const fr = (v) => v.toFixed(1).replace('.', ','), hms = (t) => new Date(t).toLocaleTimeString('fr-FR');
  const tok = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const host = $('.x-forms', stage), read = $('.x-read', stage), pulse = $('.x-pulse', stage);
  const A = [['Arles', 'Sud', 4.9], ['Carcassonne', 'Sud', 3.4], ['Dax', 'Sud', 3.2], ['Narbonne', 'Sud', 7.0], ['Tarbes', 'Sud', 7.8], ['Brest', 'Ouest', 9.4], ['Vannes', 'Ouest', 4.4], ['Bayonne', 'Ouest', 5.5], ['Colmar', 'Est', 12.1], ['Annecy', 'Est', 6.2], ['Bar-le-Duc', 'Est', 3.8], ['Arras', 'Nord', 8.1]]
    .map(([name, region, v], i) => ({ i, name, region, v, w: [3, 1, 2, 1, 2, 3, 1, 1, 2, 1, 1, 2][i], blocked: false }));
  const REG = ['Sud', 'Ouest', 'Est', 'Nord'];
  let events = [], views = [], timer = null, last = null;
  // ---- Le flux. Certaines agences bougent plus que d'autres ; de temps en temps un saut, rarement un blocage.
  const pick = () => { const sum = A.reduce((s, a) => s + a.w, 0); let k = Math.random() * sum; for (const a of A) { k -= a.w; if (k <= 0) return a; } return A[0]; };
  const gen = (t, apply) => { const a = pick(), k = Math.random(), amp = k > 0.93 ? 0.15 + Math.random() * 0.15 : 0.01 + Math.random() * 0.07, dir = Math.random() < 0.5 ? -1 : 1, d = +(a.v * amp * dir).toFixed(1) || 0.1 * dir;
    const ev = { t, a, d, pct: Math.abs(d) / a.v * 100, big: k > 0.93, block: k < 0.02 && !a.blocked }; if (apply) { a.v = Math.max(0.6, +(a.v + d).toFixed(1)); if (ev.block) a.blocked = true; else if (a.blocked && k > 0.8) { a.blocked = false; ev.unblock = true; } } ev.v = a.v; return ev; };
  const emit = (ev) => { events.push(ev); if (events.length > 900) events.shift(); last = ev; views.forEach((v) => v.on && v.on(ev)); pulse.classList.remove('is-beat'); void pulse.offsetWidth; pulse.classList.add('is-beat'); report(); };
  const tick = () => { const n = cfg('pace') === 'rafale' ? 6 : 1; for (let i = 0; i < n; i++) emit(gen(Date.now(), true)); };
  const run = () => { clearInterval(timer); const on = cfg('flow') === 'marche'; pulse.classList.toggle('is-off', !on); pulse.lastChild.textContent = on ? 'En direct' : 'Flux en pause'; if (on) timer = setInterval(tick, { calme: 1100, vif: 320, rafale: 2600 }[cfg('pace')]); };
  const report = () => { const now = Date.now(), n = events.filter((e) => now - e.t < 300000).length; read.innerHTML = `<span><b>${n}</b> changements en 5 min</span>` + (last ? `<span>Dernier : <b>${last.a.name}</b> ${last.d > 0 ? '▲' : '▼'} ${fr(Math.abs(last.d))} · ${hms(last.t)}</span>` : ''); };
  // Un passé de cinq minutes, pour que les formes aient de la matière dès l'ouverture.
  const seed = () => { events = []; const now = Date.now(); let t = now - 300000; while (t < now - 1500) { events.push(gen(t, false)); t += 600 + Math.random() * 2600; } };
  const canvas = (el) => { const c = document.createElement('canvas'); c.style.cssText = 'display: block; width: 100%; height: 100%'; el.append(c); const ctx = c.getContext('2d'); const fit = () => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1; c.width = Math.max(1, Math.round(r.width * d)); c.height = Math.max(1, Math.round(r.height * d)); ctx.setTransform(d, 0, 0, d, 0, 0); c.w = r.width; c.h = r.height; }; new ResizeObserver(fit).observe(c); fit(); return { c, ctx }; };
  const ink = () => ({ fg: tok('--fg'), strong: tok('--fg-strong'), soft: tok('--fg-soft'), muted: tok('--fg-muted'), line: tok('--line'), lineS: tok('--line-strong'), signal: tok('--signal'), bg: tok('--bg'), font: getComputedStyle(document.body).fontFamily });
  const label = (ctx, K, txt, x, y, color, align = 'left') => { ctx.font = `11px ${K.font}`; ctx.letterSpacing = '1px'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(txt.toUpperCase(), x, y); };

  // ===== 1. La carte qui respire ============================================
  // Chaque agence a une surface proportionnelle à ses primes. Les cases ne changent jamais de place : seule leur
  // taille change. Quand une case change, le contour de son ancienne taille reste un instant : l'écart entre les
  // deux dit de combien elle a grandi ou rétréci.
  const Carte = () => { let el, cells = new Map(), cols = new Map();
    const size = () => REG.forEach((r) => { cols.get(r).style.flexGrow = A.filter((a) => a.region === r).reduce((s, a) => s + a.v, 0); });
    return { mount(e) { el = e; el.className = 'x-map'; el.innerHTML = REG.map((r) => `<div class="x-map__col" data-r="${r}"><span class="x-map__reg">${r}</span>${A.filter((a) => a.region === r).map((a) => `<div class="x-map__cell" data-a="${a.i}" style="flex-grow: ${a.v}"><span class="x-map__name">${a.name}</span><span class="x-map__val">${fr(a.v)}</span><span class="x-map__d"></span></div>`).join('')}</div>`).join('');
        $$('.x-map__col', el).forEach((c) => cols.set(c.dataset.r, c)); $$('.x-map__cell', el).forEach((c) => cells.set(+c.dataset.a, c)); A.forEach((a) => cells.get(a.i).classList.toggle('is-blocked', a.blocked)); size(); },
      on(ev) { const c = cells.get(ev.a.i); if (!c) return; if (!still) { const r = c.getBoundingClientRect(), o = el.getBoundingClientRect(), g = document.createElement('i'); g.className = 'x-map__ghost'; g.style.cssText = `left:${r.left - o.left}px;top:${r.top - o.top}px;width:${r.width}px;height:${r.height}px`; el.append(g); setTimeout(() => g.remove(), 3400); }
        c.style.flexGrow = ev.a.v; size(); $('.x-map__val', c).textContent = fr(ev.a.v); const d = $('.x-map__d', c); d.textContent = `${ev.d > 0 ? '▲' : '▼'} ${fr(Math.abs(ev.d))}`; clearTimeout(c.dt); c.dt = setTimeout(() => { d.textContent = ''; }, 4200);
        c.classList.toggle('is-blocked', ev.a.blocked); c.classList.remove('is-fresh'); void c.offsetWidth; c.classList.add('is-fresh'); } }; };

  // ===== 2. La bande à temps élastique ======================================
  // Le temps coule de droite à gauche. Les quinze dernières secondes occupent plus de la moitié de la bande ;
  // les cinq minutes d'avant se serrent dans le reste : le présent se lit trait par trait, le passé comme une densité.
  const Bande = () => { let cv, K;
    const X = (age, x0, P) => { const near = 0.56 * P; return age <= 15 ? x0 + P - (age / 15) * near : x0 + P - near - Math.min(1, Math.log(age / 15) / Math.log(300 / 15)) * (P - near); };
    return { mount(e) { e.className = 'x-canvas'; cv = canvas(e); K = ink(); },
      frame(now) { const { ctx, c } = cv, W = c.w, H = c.h; ctx.clearRect(0, 0, W, H); const x0 = 108, P = W - x0 - 8, top = 26, lane = (H - top - 6) / (A.length + REG.length - 1) ;
        [[0, 'maintenant'], [15, '15 s'], [60, '1 min'], [300, '5 min']].forEach(([age, txt], i) => { const x = Math.round(X(age || 0.001, x0, P)) + 0.5; ctx.strokeStyle = i === 1 ? K.lineS : K.line; ctx.setLineDash(i === 1 ? [] : [2, 3]); ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, H - 4); ctx.stroke(); ctx.setLineDash([]); label(ctx, K, txt, x - 4, 10, i < 2 ? K.soft : K.muted, 'right'); });
        let y = top, reg = null; A.forEach((a) => { if (reg && reg !== a.region) y += lane; reg = a.region; const mid = Math.round(y + lane / 2) + 0.5; a.laneY = mid; ctx.strokeStyle = K.line; ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x0 + P, mid); ctx.stroke(); label(ctx, K, a.name, 0, mid, a.blocked ? K.strong : K.soft); if (a.blocked) { ctx.fillStyle = K.signal; ctx.fillRect(x0 - 12, mid - 3, 6, 6); } y += lane; });
        const maxH = lane / 2 - 2; for (const ev of events) { const age = (now - ev.t) / 1000; if (age > 300 || age < 0) continue; const x = Math.round(X(Math.max(age, 0.001), x0, P)), h = Math.max(2, Math.min(maxH, ev.pct * 1.1)), mid = ev.a.laneY, fresh = age < 3;
          ctx.fillStyle = fresh || ev.big ? K.strong : age < 15 ? K.soft : K.muted; const w = fresh ? 2 : 1; ctx.fillRect(x - (w - 1), ev.d > 0 ? mid - h : mid, w, h); if (ev.big && age < 60) ctx.fillRect(x - 2, ev.d > 0 ? mid - h - 4 : mid + h, 4, 4); if (ev.block) { ctx.fillStyle = K.signal; ctx.fillRect(x - 3, mid - 3, 6, 6); } } } }; };

  // ===== 3. Le journal qui se résume =========================================
  // Une ligne par événement, à l'instant. Après douze secondes, les lignes d'une même agence se fondent en une
  // seule ; après une minute, celles d'une même région. Rien n'est perdu : le compte reste juste, le détail s'en va.
  const Journal = () => { let el, raw = [], minute = [], older = new Map(), t = null;
    const net = (d) => `${d >= 0 ? '▲' : '▼'} ${fr(Math.abs(d))}`;
    const paint = () => { const groups = new Map(); minute.forEach((e) => { const g = groups.get(e.a) || { n: 0, d: 0, t: e.t }; g.n++; g.d += e.d; g.t = Math.max(g.t, e.t); groups.set(e.a, g); });
      $('[data-j="now"]', el).innerHTML = raw.slice().reverse().map((e) => `<li${e.fresh ? ' class="is-in"' : ''}><time>${hms(e.t)}</time><b>${e.a.name}</b><span>${net(e.d)}</span><span>${fr(e.v)} M${e.block ? ' · bloquée' : e.unblock ? ' · rétablie' : e.big ? ' · saut' : ''}</span></li>`).join('') || '<li class="is-empty">Rien dans les douze dernières secondes</li>';
      $('[data-j="min"]', el).innerHTML = [...groups].sort((x, y) => y[1].t - x[1].t).map(([a, g]) => `<li><time>${g.n} ×</time><b>${a.name}</b><span>${net(g.d)} net</span><span>${g.n} changement${g.n > 1 ? 's' : ''}</span></li>`).join('') || '<li class="is-empty">—</li>';
      $('[data-j="old"]', el).innerHTML = REG.map((r) => { const g = older.get(r) || { n: 0, d: 0 }; return `<li><time>${g.n} ×</time><b>${r}</b><span>${net(g.d)} net</span><span>${g.n} changement${g.n > 1 ? 's' : ''}</span></li>`; }).join('');
      $('[data-c="now"]', el).textContent = raw.length; $('[data-c="min"]', el).textContent = minute.length; $('[data-c="old"]', el).textContent = [...older.values()].reduce((s, g) => s + g.n, 0); raw.forEach((e) => { e.fresh = false; }); };
    const fold = () => { const now = Date.now(); let moved = false; while (raw.length && now - raw[0].t > 12000) { minute.push(raw.shift()); moved = true; } while (minute.length && now - minute[0].t > 60000) { const e = minute.shift(), g = older.get(e.a.region) || { n: 0, d: 0 }; g.n++; g.d += e.d; older.set(e.a.region, g); moved = true; } if (moved) paint(); };
    return { mount(e) { el = e; el.className = 'x-fold3'; el.innerHTML = `<section><h5>À l'instant <span data-c="now"></span></h5><ol class="x-jl" data-j="now"></ol></section><section><h5>Cette minute — par agence <span data-c="min"></span></h5><ol class="x-jl" data-j="min"></ol></section><section><h5>Avant — par région <span data-c="old"></span></h5><ol class="x-jl" data-j="old"></ol></section>`;
        raw = []; minute = []; older = new Map(); const now = Date.now(); events.forEach((ev) => { const age = now - ev.t; if (age <= 12000) raw.push(ev); else if (age <= 60000) minute.push(ev); else { const g = older.get(ev.a.region) || { n: 0, d: 0 }; g.n++; g.d += ev.d; older.set(ev.a.region, g); } }); paint(); t = setInterval(fold, 1000); },
      on(ev) { ev.fresh = true; raw.push(ev); if (raw.length > 14) minute.push(raw.shift()); paint(); }, unmount() { clearInterval(t); } }; };

  // ===== 4. Les sédiments ====================================================
  // Chaque événement est un grain qui tombe dans la colonne de son agence. Les grains s'empilent ; les plus anciens
  // se tassent en strates. En haut de la pile, l'activité récente, grain par grain ; dessous, l'histoire, en épaisseur.
  const Sediments = () => { let cv, K, col = new Map(), G = 7, GAP = 2; const PER = 5;
    const add = (ev, t0) => { const c = col.get(ev.a.i); c.grains.push({ up: ev.d > 0, big: ev.big, block: ev.block, t0, born: ev.t }); if (c.grains.length > 9) { c.grains.splice(0, PER); c.strata++; } };
    return { mount(e) { e.className = 'x-canvas'; cv = canvas(e); K = ink(); col = new Map(A.map((a) => [a.i, { grains: [], strata: 0 }])); events.forEach((ev) => add(ev, -1e9)); },
      on(ev) { add(ev, performance.now()); },
      frame(now, perf) { const { ctx, c } = cv, W = c.w, H = c.h; ctx.clearRect(0, 0, W, H); G = H > 460 ? 13 : 7; GAP = H > 460 ? 3 : 2; const SP = H > 460 ? 5 : 3; const base = H - 26, cw = W / (A.length + REG.length - 1); let x = 0, reg = null;
        A.forEach((a) => { if (reg && reg !== a.region) x += cw; if (reg !== a.region) label(ctx, K, a.region, x + 2, 9, K.muted); reg = a.region; const cx = Math.round(x + cw / 2), half = Math.min(26, cw / 2 - 6), st = col.get(a.i);
          ctx.fillStyle = K.lineS; ctx.fillRect(Math.round(x + 4), base, Math.round(cw - 8), 1); label(ctx, K, a.name.length > cw / 8 ? a.name.slice(0, Math.max(3, Math.floor(cw / 8) - 1)) + '.' : a.name, cx, base + 14, a.blocked ? K.strong : K.soft, 'center');
          let y = base - 3; for (let s = 0; s < st.strata; s++) { ctx.fillStyle = s % 5 === 4 ? K.soft : K.muted; ctx.fillRect(cx - half, y - 1, half * 2, H > 460 ? 2 : 1); y -= SP; if (y < 30) break; }
          st.grains.forEach((g, k) => { const rest = y - (k + 1) * (G + GAP), p = still ? 1 : Math.min(1, (perf - g.t0) / 460), gy = 22 + (rest - 22) * p * p, age = (now - g.born) / 1000; ctx.fillStyle = g.block ? K.signal : age < 3 ? K.strong : K.soft; ctx.strokeStyle = ctx.fillStyle; const gx = cx - (g.big ? G : G / 2), gw = g.big ? G * 2 : G;
            if (g.up || g.block) ctx.fillRect(gx, gy, gw, G); else ctx.strokeRect(gx + 0.5, gy + 0.5, gw - 1, G - 1); }); x += cw; }); } }; };

  // ---- Le choix de la forme : une à la fois, ou les quatre côte à côte sur le même flux.
  const FORMS = { carte: ['La carte qui respire', Carte], bande: ['La bande à temps élastique', Bande], journal: ['Le journal qui se résume', Journal], sediments: ['Les sédiments', Sediments] };
  const mount = () => { views.forEach((v) => v.unmount && v.unmount()); views = []; host.innerHTML = ''; const f = cfg('form'), list = f === 'quatre' ? Object.keys(FORMS) : [f]; host.classList.toggle('is-four', f === 'quatre');
    list.forEach((k) => { const pane = document.createElement('section'); pane.className = 'x-pane'; pane.innerHTML = `<h4>${FORMS[k][0]}</h4><div></div>`; host.append(pane); const v = FORMS[k][1](); v.mount(pane.lastChild); views.push(v); }); };
  const loop = () => { const now = Date.now(), perf = performance.now(); views.forEach((v) => v.frame && v.frame(now, perf)); requestAnimationFrame(loop); };
  const seg = (attr, fn) => $$(`[data-set-${attr}]`, stage).forEach((b) => b.addEventListener('click', () => { stage.dataset[attr] = b.dataset['set' + attr[0].toUpperCase() + attr.slice(1)]; $$(`[data-set-${attr}]`, stage).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); fn && fn(); }));
  seg('form', mount); seg('flow', run); seg('pace', run);
  $('[data-once]', stage).addEventListener('click', tick);
  seed(); mount(); run(); report(); requestAnimationFrame(loop);
})();
