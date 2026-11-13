/* Laboratoire — les scénarios. Une expérience à la fois : chacune vit dans sa rubrique, et rien de ce
   qu'elle règle ne déborde sur l'autre ni sur le reste du catalogue. Rien ici ne fait partie du système. */
'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = (stage, attr, onChange) => $$(`[data-set-${attr}]`, stage).forEach((b) => b.addEventListener('click', () => {
    stage.dataset[attr] = b.dataset['set' + attr[0].toUpperCase() + attr.slice(1)];
    $$(`[data-set-${attr}]`, stage).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); onChange?.(); }));

  // ===== Expérience 01 — la mise en valeur ordonnée ==========================
  (() => { const stage = document.getElementById('x1'); if (!stage) return;
    const box = $('.x-scroll', stage), body = $('tbody', stage), below = $('.x-below', stage), read = $('.x-read', stage), steps = $$('.x-steps li', stage);
    const NAMES = { 1: ['Bloqué', 'critique', 'critiques'], 2: ['À surveiller', 'à surveiller', 'à surveiller'], 3: ['Rétabli', 'rétabli', 'rétablis'] };
    const BASE = [['A-102', 'Annecy', 0], ['A-117', 'Arles', 3], ['A-124', 'Arras', 1], ['A-131', 'Bar-le-Duc', 0], ['A-140', 'Bayonne', 2], ['A-152', 'Brest', 3], ['A-166', 'Carcassonne', 0], ['A-173', 'Chartres', 0], ['A-181', 'Colmar', 0], ['A-195', 'Dax', 2], ['A-203', 'Lorient', 0], ['A-214', 'Narbonne', 1], ['A-226', 'Tarbes', 0], ['A-238', 'Vizille', 3], ['A-241', 'Valence', 0], ['A-257', 'Vannes', 3]];
    let rows = [], timers = [], io = null, pending = new Set(), batch = null;
    const step = (n) => steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
    const flash = (tr, delay) => timers.push(setTimeout(() => { if (still) { tr.classList.add('x-seen'); report(); return; } tr.classList.add('x-flash'); tr.addEventListener('animationend', () => { tr.classList.remove('x-flash'); tr.classList.add('x-seen'); report(); }, { once: true }); }, delay));
    // L'ordre : la priorité 1 d'abord, seule ; puis la 2 ; puis la 3. « Ensemble » sert de témoin.
    const reveal = (list) => { const ordered = stage.dataset.order !== 'ensemble'; const ps = [...new Set(list.map((tr) => +tr.dataset.p))].sort();
      list.forEach((tr) => { tr.dataset.queued = '1'; flash(tr, ordered ? ps.indexOf(+tr.dataset.p) * 1000 : 0); }); };
    const report = () => { const marked = rows.filter((tr) => tr.dataset.p), seen = marked.filter((tr) => tr.classList.contains('x-seen')).length;
      const edge = box.getBoundingClientRect().bottom - 30, hidden = marked.filter((tr) => !tr.dataset.queued && tr.getBoundingClientRect().top > edge);
      below.innerHTML = [1, 2, 3].map((p) => { const n = hidden.filter((tr) => +tr.dataset.p === p).length; return n ? `<span data-p="${p}">${n} ${NAMES[p][n > 1 ? 2 : 1]} plus bas</span>` : ''; }).join('');
      read.innerHTML = `<span>Vu <b>${seen}</b> sur <b>${marked.length}</b></span><span>${marked.filter((tr) => tr.dataset.p === '1').length} critiques · ${marked.filter((tr) => tr.dataset.p === '2').length} à surveiller · ${marked.filter((tr) => tr.dataset.p === '3').length} rétablis</span>`; };
    const build = () => { timers.forEach(clearTimeout); timers = []; io?.disconnect(); pending.clear(); box.scrollTop = 0;
      body.innerHTML = BASE.map(([ref, name, p], i) => `<tr class="x-row"${p ? ` data-p="${p}"` : ''}><td>${ref}</td><td>${name}</td><td><span class="x-state">${p ? NAMES[p][0] : 'Normal'}</span></td><td>${String(7 + (i * 3) % 5).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}</td></tr>`).join('');
      rows = $$('.x-row', body); step(0); report();
      // À l'arrivée comme au défilement : une ligne n'est mise en valeur que lorsqu'elle entre dans la vue, une seule fois.
      io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting && e.target.dataset.p && !e.target.dataset.queued) pending.add(e.target); });
        clearTimeout(batch); batch = setTimeout(() => { if (!pending.size) return; reveal([...pending]); pending.clear(); report(); }, 140); }, { root: box, threshold: 0.9, rootMargin: '0px 0px -30px 0px' });
      timers.push(setTimeout(() => rows.forEach((tr) => io.observe(tr)), 350)); };
    box.addEventListener('scroll', () => { if (box.scrollTop > 8) step(1); report(); }, { passive: true });
    $('[data-replay]', stage).addEventListener('click', build);
    $('[data-change]', stage).addEventListener('click', () => { const r = box.getBoundingClientRect(), free = rows.filter((tr) => !tr.dataset.p && tr.getBoundingClientRect().top > r.top + 30 && tr.getBoundingClientRect().bottom < r.bottom - 30); const tr = free[Math.floor(Math.random() * free.length)]; if (!tr) return;
      tr.dataset.p = '1'; tr.dataset.queued = '1'; $('.x-state', tr).textContent = NAMES[1][0]; step(2); flash(tr, 0); report(); });
    seg(stage, 'colors'); seg(stage, 'order', build);
    // Le scénario ne joue que lorsqu'on regarde l'expérience.
    new IntersectionObserver((es) => { if (es[0].isIntersecting) build(); }, { threshold: 0.2 }).observe(stage); })();

  // ===== Expérience 02 — le geste récompensé =================================
  (() => { const stage = document.getElementById('x2'); if (!stage) return;
    const on = () => stage.dataset.reward === 'avec' && !still, gain = () => (n > 3 ? 0.5 : 1);
    const tally = $('[data-tally]', stage), uses = $('[data-uses]', stage); let n = 0;
    // Chaque geste abouti : un bâton de plus. L'usure : pleine récompense trois fois, puis moitié moins longue.
    const reward = () => { n++; stage.style.setProperty('--x-gain', gain()); uses.textContent = n > 3 ? `${n} — récompense abrégée` : String(n);
      let g = tally.lastElementChild; if (!g || g.children.length >= 5) { g = document.createElement('span'); g.className = 'x-tally__five'; tally.append(g); }
      g.append(document.createElement(g.children.length === 4 ? 'b' : 'i')); };
    const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    // Le mot à palettes : les lettres défilent puis se fixent, de gauche à droite.
    const flap = (el, text) => { clearInterval(el.flap); const from = el.textContent, len = Math.max(from.length, text.length), A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; if (!on()) { el.textContent = text; return; }
      let t = 0; const per = Math.min(2, 12 / len) * gain(); /* un mot long ne dure pas plus qu'un court : une demi-seconde au plus */ el.flap = setInterval(() => { t++; let out = ''; for (let i = 0; i < len; i++) { const fixed = t > (i + 1) * per + 2, target = text[i] ?? ' '; out += fixed || target === ' ' ? target : A[(i * 7 + t * 3) % 26].toLowerCase(); }
        el.textContent = out.replace(/^./, (c) => c.toUpperCase()); if (t > len * per + 3) { clearInterval(el.flap); el.textContent = text; } }, 34); };
    // Glisser à sa place : on note où était chaque élément, on range, on anime l'écart.
    const flip = (els, change, ms = 280) => { const before = new Map(els().map((e) => [e, e.getBoundingClientRect()])); change(); if (!on()) return;
      els().forEach((e) => { const a = before.get(e), z = e.getBoundingClientRect(); if (!a) return; const dy = a.top - z.top, dx = a.left - z.left; if (!dx && !dy) return; e.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: ms * gain(), easing: 'cubic-bezier(.2, .8, .2, 1)' }); }); };

    // Cocher, puis tout finir
    const tasks = $$('.x-task input', stage), stamp = $('.x-stamp', stage);
    tasks.forEach((t) => t.addEventListener('change', () => { if (t.checked) reward(); stamp.classList.toggle('is-on', tasks.every((x) => x.checked)); }));
    // Appuyer
    $$('.x-hit', stage).forEach((b) => b.addEventListener('click', () => { replay(b, 'is-hit'); reward(); }));
    // Maintenir
    const hold = $('.x-hold', stage), holdWord = $('[data-flap]', hold); let holdTimer = null;
    const release = () => { clearTimeout(holdTimer); hold.classList.remove('is-holding'); };
    hold.addEventListener('pointerdown', (e) => { if (e.button) return; hold.setPointerCapture?.(e.pointerId); hold.classList.add('is-holding'); holdTimer = setTimeout(() => { hold.classList.remove('is-holding'); hold.classList.add('is-done'); flap(holdWord, 'Supprimé'); reward(); }, 900); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => hold.addEventListener(ev, release));
    hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { hold.classList.add('is-holding'); holdTimer = setTimeout(() => { hold.classList.remove('is-holding'); hold.classList.add('is-done'); flap(holdWord, 'Supprimé'); reward(); }, 900); } });
    hold.addEventListener('keyup', release);
    // Basculer
    const sw = $('[data-case="palettes"] input', stage), swWord = $('[data-case="palettes"] [data-flap]', stage);
    sw.addEventListener('change', () => { flap(swWord, sw.checked ? 'Suivi actif' : 'Suivi inactif'); reward(); });
    // Compter
    const odo = $('.x-odo', stage); const paint = (v, dir) => { const old = odo.textContent, txt = String(v).padStart(3, ' '); odo.dataset.value = v; odo.innerHTML = [...txt].map((c, i) => `<span${dir && c !== (old.padStart(txt.length, ' ')[i] ?? '') ? ` class="is-${dir}"` : ''}>${c === ' ' ? '&nbsp;' : c}</span>`).join(''); };
    paint(+odo.dataset.value); $$('[data-odo]', stage).forEach((b) => b.addEventListener('click', () => { const d = +b.dataset.odo, v = Math.max(0, +odo.dataset.value + d); paint(v, d > 0 ? 'up' : 'down'); reward(); }));
    // Trier
    const list = $('.x-sortlist', stage), DATA = [['Arles', 7, 4.9], ['Brest', 12, 9.4], ['Colmar', 9, 12.1], ['Dax', 5, 3.2], ['Tarbes', 14, 7.8]];
    const draw = () => { list.innerHTML = DATA.map(([nm, e, p]) => `<li data-nom="${nm}" data-effectif="${e}" data-primes="${p}"><span>${nm}</span><span>${e}</span><span>${String(p).replace('.', ',')} M</span></li>`).join(''); };
    draw(); $$('[data-sort]', stage).forEach((b) => b.addEventListener('click', () => { const k = b.dataset.sort; $$('[data-sort]', stage).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      flip(() => $$('li', list), () => $$('li', list).sort((x, y) => (k === 'nom' ? x.dataset.nom.localeCompare(y.dataset.nom, 'fr') : +y.dataset[k] - +x.dataset[k])).forEach((li) => list.append(li)), 340); reward(); }));
    // Saisir juste
    const valid = $('.x-valid', stage), vin = $('input', valid); vin.addEventListener('input', () => { const ok = /^[a-z]{3}\d{3}[a-z]{2}$/i.test(vin.value), was = valid.classList.contains('is-ok'); valid.classList.toggle('is-ok', ok); if (ok && !was) reward(); });
    // Copier
    const carbon = $('.x-carbon', stage), ctext = $('.x-carbon__text', carbon), cbtn = $('[data-carbon]', carbon); const ghost = document.createElement('span'); ghost.className = 'x-carbon__ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.textContent = ctext.textContent; carbon.append(ghost);
    cbtn.addEventListener('click', () => { navigator.clipboard?.writeText(ctext.textContent).catch(() => {}); replay(ghost, 'is-on'); $('span', cbtn).textContent = 'Copié'; clearTimeout(cbtn.t); cbtn.t = setTimeout(() => { $('span', cbtn).textContent = 'Copier'; }, 1600); reward(); });
    // Régler
    const range = $('.x-detent', stage), ticks = $('.x-ticks', stage), butee = $('.x-butee', stage), dread = $('[data-detent]', stage); ticks.innerHTML = '<i></i>'.repeat(11);
    const setRange = (hit) => { const i = Math.round(range.value / 10); range.style.setProperty('--value', range.value); dread.textContent = range.value + ' %'; $$('i', ticks).forEach((t, k) => { t.classList.toggle('is-under', k <= i); if (hit && k === i) replay(t, 'is-hit'); }); const end = +range.value === 100; if (end && !butee.classList.contains('is-on')) reward(); butee.classList.toggle('is-on', end); };
    setRange(false); range.addEventListener('input', () => setRange(true));
    // Envoyer
    const log = $('.x-log', stage), form = $('.x-send', stage), sin = $('input', form);
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = sin.value.trim(); if (!v) return; const from = sin.getBoundingClientRect(), li = document.createElement('li'); li.innerHTML = `<time>${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time><span></span>`; li.lastChild.textContent = v;
      flip(() => $$('li', log), () => { log.append(li); if (log.children.length > 4) log.firstElementChild.remove(); }, 260); sin.value = '';
      if (on()) { const to = li.lastChild.getBoundingClientRect(); li.lastChild.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`, color: 'var(--fg-strong)' }, { transform: 'none' }], { duration: 300 * gain(), easing: 'cubic-bezier(.2, .8, .2, 1)' }); li.firstChild.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], { duration: 420 * gain() }); } reward(); });
    // Lire jusqu'au bout, ouvrir
    const box = $('.x-readbox', stage), prog = $('.x-progress', stage), done = $('.x-done', stage), folds = $$('.x-fold', stage);
    box.addEventListener('scroll', () => { const v = Math.min(100, Math.round(box.scrollTop / (box.scrollHeight - box.clientHeight) * 100)); prog.style.setProperty('--value', v); if (v >= 99 && !prog.classList.contains('is-done')) { prog.classList.add('is-done'); done.classList.add('is-on'); reward(); } }, { passive: true });
    folds.forEach((f) => f.addEventListener('toggle', () => { if (f.open) reward(); }));
    seg(stage, 'reward');
    $('[data-reset]', stage).addEventListener('click', () => { tasks.forEach((t) => (t.checked = false)); stamp.classList.remove('is-on'); folds.forEach((f) => (f.open = false)); box.scrollTop = 0; prog.classList.remove('is-done'); done.classList.remove('is-on'); prog.style.setProperty('--value', 0);
      hold.classList.remove('is-done'); clearInterval(holdWord.flap); holdWord.textContent = 'Maintenir pour supprimer'; sw.checked = false; clearInterval(swWord.flap); swWord.textContent = 'Suivi inactif'; paint(412); draw(); $$('[data-sort]', stage).forEach((x, i) => x.setAttribute('aria-pressed', String(!i)));
      vin.value = ''; valid.classList.remove('is-ok'); range.value = 40; butee.classList.remove('is-on'); setRange(false); log.innerHTML = '<li><time>09:12</time><span>Vizille relancée.</span></li>'; n = 0; stage.style.removeProperty('--x-gain'); uses.textContent = '0'; tally.innerHTML = ''; }); })();

  // ===== Expérience 03 — la donnée vivante ===================================
  (() => { const stage = document.getElementById('x3'); if (!stage) return;
    const box = $('.x-live', stage), body = $('tbody', stage), read = $('.x-read', stage), pulse = $('.x-pulse', stage), arrive = $('[data-arrive]', stage), back = $('[data-back]', stage), away = $('.x-away', stage), title0 = document.title;
    const fr = (v) => v.toFixed(1).replace('.', ','), hms = () => new Date().toLocaleTimeString('fr-FR'), ST = ['Normal', 'À surveiller', 'Bloqué'];
    const SEED = [['A-102', 'Annecy', 9, 6.2], ['A-117', 'Arles', 7, 4.9], ['A-124', 'Arras', 11, 8.1], ['A-131', 'Bar-le-Duc', 6, 3.8], ['A-140', 'Bayonne', 8, 5.5], ['A-152', 'Brest', 12, 9.4], ['A-166', 'Carcassonne', 5, 3.1], ['A-181', 'Colmar', 9, 12.1], ['A-195', 'Dax', 5, 3.2], ['A-214', 'Narbonne', 10, 7.0], ['A-226', 'Tarbes', 14, 7.8]];
    const POOL = [['A-262', 'Vizille', 4, 2.4], ['A-270', 'Valence', 8, 5.9], ['A-281', 'Vannes', 6, 4.4], ['A-290', 'Lorient', 7, 5.1], ['A-298', 'Chartres', 9, 6.6]];
    let rows = [], queue = [], timer = null, gone = false, awayCount = { v: 0, n: 0 }, last = null, pool = [];
    const digits = (el, txt, dir) => { const old = el.textContent; el.innerHTML = [...txt].map((c, i) => `<span${dir && !still && c !== old.padStart(txt.length, ' ')[i] ? ` style="animation: x-${dir} 260ms ease-out 1 both"` : ''}>${c}</span>`).join(''); };
    const spark = (h) => { const lo = Math.min(...h), hi = Math.max(...h), W = 72, H = 14, pts = h.map((v, i) => [i * W / Math.max(1, h.length - 1), H - (hi === lo ? H / 2 : (v - lo) / (hi - lo) * H)]); const [x, y] = pts.at(-1);
      return `<svg width="${W + 4}" height="${H + 4}" viewBox="-2 -2 ${W + 4} ${H + 4}" aria-hidden="true"><polyline points="${pts.map((p) => p.join(',')).join(' ')}"></polyline><rect x="${x - 1.5}" y="${y - 1.5}" width="3" height="3"></rect></svg>`; };
    // Ce que l'on garde de l'ancienne valeur : rien, le fantôme (barré, un temps), l'écart (sens et montant), ou le tracé.
    const evo = (r) => { const m = stage.dataset.before, c = r.change; const td = $('.x-evo', r.tr); if (m === 'trace') { td.innerHTML = spark(r.hist); return; } if (!c || m === 'rien') { td.innerHTML = ''; return; }
      const d = c.now - c.old; td.innerHTML = m === 'fantome' ? `<s>${c.txt}</s>` : `<span class="d">${d > 0 ? '▲' : '▼'} ${c.f === 'pr' ? fr(Math.abs(d)) : Math.abs(d)}</span>`;
      clearTimeout(r.ghost); if (m === 'fantome') r.ghost = setTimeout(() => { if (stage.dataset.before === 'fantome') td.innerHTML = ''; }, 9000); };
    const make = (d, isNew) => { const r = { ref: d[0], name: d[1], eff: d[2], pr: d[3], st: 0, hist: [d[3]], change: null }; const tr = document.createElement('tr'); r.tr = tr;
      tr.innerHTML = `<td class="ref">${r.ref}</td><td class="nm"><span>${r.name}</span></td><td class="n"><span class="x-num" data-f="eff"></span></td><td class="n"><span class="x-num" data-f="pr"></span></td><td class="x-evo"></td><td class="st" data-st="0">${ST[0]}</td><td class="t n">${isNew ? hms() : '—'}</td>`;
      digits($('[data-f="eff"]', tr), String(r.eff)); digits($('[data-f="pr"]', tr), fr(r.pr)); tr.addEventListener('pointerenter', () => { tr.classList.remove('is-unseen', 'is-since'); report(); }); if (isNew) tr.classList.add('is-new', 'is-unseen'); if (stage.dataset.before === 'trace') $('.x-evo', tr).innerHTML = spark(r.hist); return r; };
    const report = () => { const u = rows.filter((r) => r.tr.classList.contains('is-unseen')).length; read.innerHTML = `<span><b>${rows.length}</b> agences</span><span><b>${u}</b> non vu${u > 1 ? 's' : ''}</span><span>Dernière mise à jour ${last || '—'}</span>`;
      arrive.hidden = !queue.length; if (queue.length) $('b', arrive).textContent = `${queue.length} agence${queue.length > 1 ? 's' : ''} arrivée${queue.length > 1 ? 's' : ''}`;
      document.title = gone && (awayCount.v + awayCount.n) ? `(${awayCount.v + awayCount.n}) ${title0}` : title0; };
    const insert = (list) => { const h0 = box.scrollHeight, top = box.scrollTop; list.forEach((r) => { body.prepend(r.tr); rows.unshift(r); }); if (top > 4) box.scrollTop = top + box.scrollHeight - h0; };   // on ne fait pas sauter ce qu'on lit
    const touch = (r) => { const tr = r.tr; tr.classList.remove('is-touched'); void tr.offsetWidth; tr.classList.add('is-touched', 'is-unseen'); if (gone) tr.classList.add('is-since'); $('.t', tr).textContent = hms(); };
    const update = () => { last = hms(); pulse.classList.remove('is-beat'); void pulse.offsetWidth; pulse.classList.add('is-beat'); const k = Math.random();
      if (k < 0.14 && pool.length) { const r = make(pool.shift(), true); if (gone) { awayCount.n++; r.tr.classList.add('is-since'); } if (stage.dataset.arrivals === 'attente') queue.push(r); else insert([r]); report(); return; }
      const r = rows[Math.floor(Math.random() * rows.length)]; if (!r) return;
      if (k < 0.24) { const st = (r.st + 1 + Math.floor(Math.random() * 2)) % 3, td = $('.st', r.tr); r.st = st; td.dataset.st = st; td.textContent = ST[st]; r.change = null; }
      else { const f = k < 0.45 ? 'eff' : 'pr', old = r[f], now = f === 'eff' ? Math.max(1, old + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))) : Math.max(0.5, +(old + (Math.random() - 0.45) * 1.6).toFixed(1)); if (now === old) return;
        r[f] = now; r.change = { f, old, now, txt: f === 'pr' ? fr(old) : String(old) }; if (f === 'pr') { r.hist.push(now); if (r.hist.length > 10) r.hist.shift(); }
        const el = $(`[data-f="${f}"]`, r.tr); digits(el, f === 'pr' ? fr(now) : String(now), ['valeur', 'deux'].includes(stage.dataset.where) ? (now > old ? 'up' : 'down') : null); el.classList.remove('is-fresh'); void el.offsetWidth; el.classList.add('is-fresh'); evo(r); }
      touch(r); if (gone) awayCount.v++; report(); };
    const run = () => { clearInterval(timer); const on = stage.dataset.flow === 'marche'; pulse.classList.toggle('is-off', !on); pulse.lastChild.textContent = on ? 'En direct' : 'Flux en pause'; if (on) timer = setInterval(update, 2600); };
    const leave = () => { if (gone) return; gone = true; awayCount = { v: 0, n: 0 }; back.hidden = true; };
    const ret = () => { if (!gone) return; gone = false; const { v, n } = awayCount; if (v + n) { back.hidden = false; $('b', back).textContent = `${v} valeur${v > 1 ? 's' : ''} ${v > 1 ? 'ont' : 'a'} changé` + (n ? ` · ${n} agence${n > 1 ? 's' : ''} arrivée${n > 1 ? 's' : ''}` : ''); } report(); };
    const reset = () => { body.innerHTML = ''; rows = []; queue = []; pool = POOL.slice(); SEED.forEach((d) => { const r = make(d); body.append(r.tr); rows.push(r); }); back.hidden = true; last = null; report(); run(); };
    $('[data-show]', arrive).addEventListener('click', () => { insert(queue.reverse()); queue = []; report(); });
    $('[data-first]', back).addEventListener('click', () => { $('.is-since', body)?.scrollIntoView({ block: 'center' }); });
    $('[data-seen]', back).addEventListener('click', () => { $$('tr', body).forEach((tr) => tr.classList.remove('is-unseen', 'is-since')); back.hidden = true; report(); });
    $('[data-once]', stage).addEventListener('click', update);
    $('[data-restart]', stage).addEventListener('click', reset);
    $('[data-leave]', stage).addEventListener('click', () => { leave(); away.hidden = false; let s = 8; const out = $('small', away); out.textContent = `Retour dans ${s} s`; const fast = setInterval(update, 900);
      const t = setInterval(() => { s--; out.textContent = `Retour dans ${s} s`; if (s <= 0) { clearInterval(t); clearInterval(fast); away.hidden = true; ret(); } }, 1000); });
    document.addEventListener('visibilitychange', () => (document.hidden ? leave() : ret()));   // le vrai départ : changer d'onglet
    seg(stage, 'flow', run); seg(stage, 'where'); seg(stage, 'before', () => rows.forEach(evo)); seg(stage, 'arrivals', () => { if (stage.dataset.arrivals === 'inserees' && queue.length) { insert(queue.reverse()); queue = []; } report(); });
    reset(); })();
})();
