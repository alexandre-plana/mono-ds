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
  // Une liste classée, alimentée en direct. L'application juge chaque changement : l'important passe tout de
  // suite, dans l'ordre de sa gravité — rouge, orange, vert — et sa ligne monte au-dessus du tri ; le mineur
  // attend une accalmie. Rien ne bouge sans dire pourquoi : la cause s'écrit et s'allume, puis la ligne se
  // déplace en laissant la trace de son trajet. Tout ce qui a changé reste marqué tant qu'on ne l'a pas vu.
  (() => { const stage = document.getElementById('x3'); if (!stage) return;
    const box = $('.x-live', stage), body = $('tbody', stage), read = $('.x-read', stage), mood = $('.x-mood', stage), reserve = $('[data-reserve]', stage), calmBar = $('[data-calm]', stage), back = $('[data-back]', stage), below = $('.x-below', stage), away = $('.x-away', stage), journal = $('.x-journal', stage), title0 = document.title;
    const fr = (v) => v.toFixed(1).replace('.', ','), hms = () => new Date().toLocaleTimeString('fr-FR'), cfg = (k) => stage.dataset[k], wait = (ms) => new Promise((r) => setTimeout(r, still ? 0 : ms));
    const SEED = [['Annecy', 6.2], ['Arles', 4.9], ['Arras', 8.1], ['Bar-le-Duc', 3.8], ['Bayonne', 5.5], ['Brest', 9.4], ['Carcassonne', 3.4], ['Colmar', 12.1], ['Dax', 3.2], ['Narbonne', 7.0], ['Tarbes', 7.8], ['Valence', 5.9]], POOL = [['Vizille', 2.4], ['Vannes', 4.4], ['Lorient', 5.1], ['Chartres', 6.6]];
    const WORD = { 1: ['critique', 'critiques'], 2: ['à surveiller', 'à surveiller'], 3: ['bonne nouvelle', 'bonnes nouvelles'] };
    let rows = [], sep = null, timer = null, lastAct = performance.now(), busy = false, waiting = [], arrivals = [], pool = [], gone = false, awayCount = { v: 0, i: 0 }, todo = [], running = false, seq = 0;
    const TH = () => ({ stricte: 30, normale: 20, large: 10 }[cfg('sense')]);
    const log = (what, why) => { const li = document.createElement('li'); li.innerHTML = `<time>${hms()}</time><span><b></b><small></small></span>`; $('b', li).textContent = what; $('small', li).textContent = why; journal.prepend(li); while (journal.children.length > 16) journal.lastElementChild.remove(); };
    const digits = (el, txt, dir) => { const old = el.textContent; el.innerHTML = [...txt].map((c, i) => `<span${dir && !still && c !== old.padStart(txt.length, ' ')[i] ? ` style="animation: x-${dir} 260ms ease-out 1 both"` : ''}>${c}</span>`).join(''); };
    const spark = (h) => { const lo = Math.min(...h), hi = Math.max(...h), W = 72, H = 14, pts = h.map((v, i) => [i * W / Math.max(1, h.length - 1), H - (hi === lo ? H / 2 : (v - lo) / (hi - lo) * H)]); const [x, y] = pts.at(-1);
      return `<svg width="${W + 4}" height="${H + 4}" viewBox="-2 -2 ${W + 4} ${H + 4}" aria-hidden="true"><polyline points="${pts.map((p) => p.join(',')).join(' ')}"></polyline><rect x="${x - 1.5}" y="${y - 1.5}" width="3" height="3"></rect></svg>`; };
    // Le jugement. Chaque règle a un nom lisible et une priorité : 1 rouge (bloque), 2 orange (à surveiller), 3 vert (bonne nouvelle), 4 sans couleur (suivie).
    const judge = (r, kind, old, now) => { const pct = kind === 'pr' ? Math.abs(now - old) / old * 100 : 0;
      if (kind === 'st') return now === 2 ? { p: 1, txt: 'Bloquée', rule: 'Un état bloqué passe avant tout' } : { p: 3, txt: 'Rétablie', rule: 'Une agence débloquée est une bonne nouvelle' };
      if (old >= 3 && now < 3) return { p: 2, txt: 'Passe sous 3 M', rule: 'Franchissement du seuil de 3 M, à la baisse' };
      if (old < 3 && now >= 3) return { p: 3, txt: 'Repasse au-dessus de 3 M', rule: 'Franchissement du seuil de 3 M, à la hausse' };
      if (pct >= TH()) return now < old ? { p: 2, txt: `− ${Math.round(pct)} % d'un coup`, rule: `Une baisse d'au moins ${TH()} %` } : { p: 3, txt: `+ ${Math.round(pct)} % d'un coup`, rule: `Une hausse d'au moins ${TH()} %` };
      if (r.follow) return { p: 4, txt: 'Suivie par vous', rule: 'Vous suivez cette agence : tout changement compte' };
      return null; };
    // L'état et sa marque : la couleur est celle de la raison en cours — ou du blocage, tant qu'il dure. La forme la double.
    const state = (r) => { const p = r.st === 2 ? 1 : r.reason && r.reason.p < 4 ? r.reason.p : 0; if (p) r.tr.dataset.p = p; else delete r.tr.dataset.p; $('.x-state', r.tr).textContent = ['Normal', 'Bloqué', 'À surveiller', 'Favorable'][p]; };
    // Ce que l'on garde de l'ancienne valeur : l'écart est cumulé depuis la dernière fois que la ligne a été vue.
    const evo = (r) => { const m = cfg('before'), td = $('.x-evo', r.tr); if (m === 'trace') { td.innerHTML = spark(r.hist); return; } const d = +(r.shown - r.base).toFixed(1); if (!d || m === 'rien') { td.innerHTML = ''; return; }
      td.innerHTML = m === 'fantome' ? `<s>${fr(r.base)}</s>` : `<span class="d">${d > 0 ? '▲' : '▼'} ${fr(Math.abs(d))}</span>`; };
    const seen = (r) => { r.tr.classList.remove('is-unseen', 'is-since'); r.base = r.shown; evo(r); if (r.up && !r.leaving) { r.leaving = true; enqueue(5, () => demote(r)); } };
    const make = ([name, pr], isNew) => { const r = { name, pr, shown: pr, base: pr, hist: [pr], st: 0, follow: false, up: false, held: false, reason: null }; const tr = document.createElement('tr'); r.tr = tr; tr.className = 'x-row x-seen';
      tr.innerHTML = `<td class="rk"><span class="x-rk"></span></td><td class="nm"><span>${name}</span></td><td class="n pr"><span class="x-num"></span><i class="x-held" title="Une mise à jour mineure attend"></i></td><td class="x-evo"></td><td><span class="x-state">Normal</span></td><td class="x-why"></td><td class="n"><button class="x-follow" type="button" aria-pressed="false">Suivre</button></td>`;
      digits($('.x-num', tr), fr(pr)); if (cfg('before') === 'trace') $('.x-evo', tr).innerHTML = spark(r.hist); if (isNew) tr.classList.add('is-new', 'is-unseen');
      $('.x-follow', tr).addEventListener('click', (e) => { r.follow = !r.follow; e.target.setAttribute('aria-pressed', String(r.follow)); e.target.textContent = r.follow ? 'Suivie' : 'Suivre'; log(`${name} ${r.follow ? 'est suivie' : 'n\'est plus suivie'}`, 'Décision de l\'utilisateur'); });
      tr.addEventListener('pointerenter', () => { seen(r); report(); }); return r; };
    const sorted = () => rows.slice().sort((a, b) => b.shown - a.shown || a.name.localeCompare(b.name, 'fr'));
    // L'ordre voulu : ce que l'application a remonté (le plus grave d'abord), la frontière, puis le tri de l'utilisateur.
    const want = () => { const all = sorted(), ups = all.filter((r) => r.up).sort((a, b) => a.reason.p - b.reason.p || a.since - b.since); return [...ups.map((r) => r.tr), ...(ups.length ? [sep] : []), ...all.filter((r) => !r.up).map((r) => r.tr)]; };
    const number = () => { sorted().forEach((r, i) => { $('.x-rk', r.tr).textContent = String(i + 1).padStart(2, '0'); }); sep.hidden = !rows.some((r) => r.up); };
    const top = (el) => el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const place = (g) => (g.anchor && g.anchor.isConnected ? g.anchor.after(g) : body.prepend(g));
    // Déplacer : on note où est chaque ligne, on range, on anime l'écart — toutes ensemble, d'un seul mouvement.
    const layout = (ms = 520, fresh) => { const before = new Map([...body.children].map((t) => [t, t.getBoundingClientRect().top])); number(); const old = $$('.x-ghost', body); want().forEach((t) => body.append(t)); old.forEach(place); if (fresh) place(fresh);
      if (!still) [...body.children].forEach((t) => { const a = before.get(t); if (a == null) return; const dy = a - t.getBoundingClientRect().top; if (dy) { t.style.position = 'relative'; t.style.zIndex = Math.abs(dy) > 60 ? 3 : 1; t.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.2, .8, .2, 1)' }).onfinish = () => { t.style.zIndex = ''; }; } }); return wait(ms); };
    const why = (r, txt, rule) => { const td = $('.x-why', r.tr); td.innerHTML = txt ? '<span class="is-in"></span><small></small>' : ''; if (txt) { td.firstChild.textContent = txt; td.lastChild.textContent = rule || ''; } };
    // Montrer une valeur : ses chiffres roulent, elle « refroidit », la ligne garde le point du non-vu.
    const show = (r, underline) => { const dir = r.pr > r.shown ? 'up' : r.pr < r.shown ? 'down' : null; if (dir) { r.shown = r.pr; r.hist.push(r.pr); if (r.hist.length > 10) r.hist.shift(); const el = $('.x-num', r.tr); digits(el, fr(r.pr), dir); el.classList.remove('is-fresh'); void el.offsetWidth; el.classList.add('is-fresh'); }
      r.held = false; r.tr.classList.remove('is-held'); r.tr.classList.add('is-unseen'); if (gone) { r.tr.classList.add('is-since'); awayCount.v++; } evo(r); if (underline) { r.tr.classList.remove('is-touched'); void r.tr.offsetWidth; r.tr.classList.add('is-touched'); } };
    // L'aplat de l'expérience 01 : la ligne s'allume dans la couleur de sa priorité, puis retombe en marque.
    const flash = (r) => { const tr = r.tr; if (still || !tr.dataset.p) { tr.classList.add('x-seen'); return; } tr.classList.remove('x-seen', 'x-flash'); void tr.offsetWidth; tr.classList.add('x-flash'); setTimeout(() => { tr.classList.remove('x-flash'); tr.classList.add('x-seen'); }, 1500); };
    const above = (tr) => { let p = tr.previousElementSibling; while (p && p.classList.contains('x-ghost')) p = p.previousElementSibling; return p; };
    const ghost = (anchor, text) => { const g = document.createElement('tr'); g.className = 'x-ghost'; g.innerHTML = '<td colspan="7"><div></div></td>'; $('div', g).textContent = text; g.anchor = anchor; setTimeout(() => { g.classList.add('is-closing'); setTimeout(() => g.remove(), 460); }, still ? 1200 : 2400); return g; };
    const thread = (y0, y1) => { const t = document.createElement('div'); t.className = 'x-thread'; t.style.top = Math.min(y0, y1) + 12 + 'px'; t.style.height = Math.abs(y1 - y0) + 'px'; box.append(t); setTimeout(() => t.remove(), 2700); };
    // Une chose à la fois, la plus grave d'abord : c'est l'ordre de mise en valeur de l'expérience 01, appliqué au direct.
    const enqueue = (p, fn) => { todo.push({ p, fn, t: seq++ }); if (!running) { running = true; setTimeout(pump, 0); } };
    const pump = async () => { while (todo.length) { todo.sort((a, b) => a.p - b.p || a.t - b.t); const j = todo.shift(); busy = true; try { await j.fn(); } catch (err) { console.error(err); } busy = false; } running = false; report(); };
    // Remonter, en trois temps : la cause s'écrit et s'allume ; un silence ; la ligne monte en laissant sa trace.
    const promote = async (r, reason) => { r.reason = reason; show(r); state(r); why(r, reason.txt, reason.rule); flash(r); if (gone) awayCount.i++; log(`${r.name} — ${reason.txt.toLowerCase()}`, `Montré tout de suite. Règle : ${reason.rule.toLowerCase()}`); report(); await wait(950);
      if (cfg('lift') === 'non' || r.up) { await layout(); return; }
      if (rows.filter((x) => x.up).length >= 3) { waiting.push(r); why(r, reason.txt, 'En attente : trois lignes sont déjà remontées'); log(`${r.name} attend`, 'Budget d\'attention : trois lignes remontées au plus'); await layout(); return; }
      const y0 = top(r.tr), g = ghost(above(r.tr), `↑ ${r.name} remontée — ${reason.txt.toLowerCase()}`); r.up = true; r.since = performance.now(); r.tr.classList.add('is-up'); await layout(520, g); thread(y0, top(r.tr)); log(`${r.name} remontée en tête`, 'Au-dessus de votre tri, jusqu\'à ce que vous l\'ayez vue'); };
    // Redescendre dès que la ligne a été vue : « Vue » s'écrit d'abord, puis le même trajet, à l'envers.
    const demote = async (r) => { const rk = String(sorted().indexOf(r) + 1).padStart(2, '0'); why(r, 'Vue', `Elle retourne à son rang, le ${rk}`); await wait(900); const y0 = top(r.tr), g = ghost(above(r.tr), `↓ ${r.name} vue — retourne au rang ${rk}`); r.up = false; r.leaving = false; r.tr.classList.remove('is-up'); await layout(520, g); thread(y0, top(r.tr)); log(`${r.name} redescend au rang ${rk}`, 'Vous l\'avez vue');
      await wait(1200); if (!r.up) { r.reason = null; state(r); why(r, '', ''); } const next = waiting.shift(); if (next && next.reason) enqueue(next.reason.p, () => promote(next, next.reason)); };
    // L'accalmie : les changements mineurs passent en une vague, de haut en bas, puis la liste se range une fois.
    const flush = async () => { const held = [...body.children].map((t) => rows.find((r) => r.tr === t)).filter((r) => r && r.held), come = arrivals.splice(0); if (!held.length && !come.length) return; const n = held.length;
      calmBar.hidden = false; $('b', calmBar).textContent = `Accalmie — ${n} changement${n > 1 ? 's' : ''} mineur${n > 1 ? 's' : ''} appliqué${n > 1 ? 's' : ''}` + (come.length ? `, ${come.length} agence${come.length > 1 ? 's' : ''} arrivée${come.length > 1 ? 's' : ''}` : ''); $('span', calmBar).textContent = '';
      const before = sorted().map((r) => r.name).join(); for (const r of held) { show(r, true); await wait(90); } come.forEach((r) => { rows.push(r); body.append(r.tr); if (gone) r.tr.classList.add('is-since'); }); await wait(450);
      $('span', calmBar).textContent = sorted().map((r) => r.name).join() !== before || come.length ? 'puis la liste se range, une seule fois' : 'l\'ordre ne change pas'; await layout(620); log(`${n} changement${n > 1 ? 's' : ''} mineur${n > 1 ? 's' : ''} appliqué${n > 1 ? 's' : ''}`, 'Accalmie : vous ne lisiez plus la liste'); setTimeout(() => { calmBar.hidden = true; }, 3600); };
    // Ce qui compte et qu'on ne voit pas s'annonce au bord, dans l'ordre de priorité.
    const report = () => { const h = rows.filter((r) => r.held).length + arrivals.length, ups = rows.filter((r) => r.up).length, u = rows.filter((r) => r.tr.classList.contains('is-unseen')).length; reserve.hidden = !h; if (h) $('b', reserve).textContent = `${h} changement${h > 1 ? 's' : ''} mineur${h > 1 ? 's' : ''} en réserve`;
      const br = box.getBoundingClientRect(), out = rows.filter((r) => r.reason && r.reason.p < 4 && r.tr.classList.contains('is-unseen')).map((r) => { const t = r.tr.getBoundingClientRect(); return { p: r.reason.p, where: t.top > br.bottom - 34 ? 'plus bas' : t.bottom < br.top + 34 ? 'plus haut' : null }; }).filter((x) => x.where);
      below.innerHTML = ['plus haut', 'plus bas'].map((w) => [1, 2, 3].map((p) => { const n = out.filter((x) => x.p === p && x.where === w).length; return n ? `<span data-p="${p}">${n} ${WORD[p][n > 1 ? 1 : 0]} ${w}</span>` : ''; }).join('')).join('');
      read.innerHTML = `<span><b>${rows.length}</b> agences, votre tri : primes décroissantes</span><span><b>${u}</b> non vu${u > 1 ? 's' : ''}</span><span><b>${ups}</b> remontée${ups > 1 ? 's' : ''}</span>${waiting.length ? `<span><b>${waiting.length}</b> en attente de place</span>` : ''}`;
      const n = awayCount.v; document.title = gone && n ? `(${n}) ${title0}` : title0; };
    // Le flux : surtout du mineur, parfois de l'important.
    const event = (force) => { const k = force ? 0.99 : Math.random(); if (k < 0.04 && pool.length) { arrivals.push(make(pool.shift(), true)); report(); return; }
      const free = rows.filter((r) => !r.up && !r.leaving && !waiting.includes(r) && !(force && r.st === 2)), r = free[Math.floor(Math.random() * free.length)]; if (!r) return; let reason = null;
      if (k > 0.955) { const now = r.st === 2 ? 0 : 2; reason = judge(r, 'st', r.st, now); r.st = now; }
      else { const old = r.pr, amp = k > 0.87 ? 0.2 + Math.random() * 0.2 : k > 0.76 ? 0.09 + Math.random() * 0.07 : 0.01 + Math.random() * 0.05, now = Math.max(0.6, +(old * (1 + (Math.random() < 0.5 ? -1 : 1) * amp)).toFixed(1)); if (now === old) return; r.pr = now; reason = judge(r, 'pr', r.shown, now); }
      if (reason) enqueue(reason.p, () => promote(r, reason)); else { r.held = true; r.tr.classList.add('is-held'); report(); } };
    const tick = () => { const n = cfg('pace') === 'rafale' ? 5 : 1; for (let i = 0; i < n; i++) event(false); };
    const run = () => { clearInterval(timer); if (cfg('flow') === 'marche') timer = setInterval(tick, { calme: 1500, vif: 520, rafale: 3200 }[cfg('pace')]); };
    // L'accalmie se détecte : ni pointeur, ni défilement, ni touche depuis deux secondes et demie, et aucun déplacement en cours.
    const act = () => { lastAct = performance.now(); mood.classList.remove('is-calm'); mood.lastChild.textContent = 'Vous lisez'; };
    ['pointermove', 'wheel', 'keydown', 'pointerdown'].forEach((ev) => $('.x-screen', stage).addEventListener(ev, act, { passive: true })); box.addEventListener('scroll', report, { passive: true });
    setInterval(() => { if (performance.now() - lastAct <= 2500) return; mood.classList.add('is-calm'); mood.lastChild.textContent = 'Accalmie'; if (!busy && !todo.length && (rows.some((r) => r.held) || arrivals.length)) enqueue(9, flush); }, 600);
    // L'absence, vraie (changer d'onglet) ou simulée : au retour, l'écran dit ce qu'on a manqué.
    const leave = () => { if (gone) return; gone = true; awayCount = { v: 0, i: 0 }; back.hidden = true; };
    const ret = () => { if (!gone) return; gone = false; const { v, i } = awayCount; if (v) { back.hidden = false; $('b', back).textContent = `${v} changement${v > 1 ? 's' : ''}` + (i ? `, dont ${i} important${i > 1 ? 's' : ''}` : ', tous mineurs'); } report(); };
    $('[data-leave]', stage).addEventListener('click', () => { leave(); away.hidden = false; let s = 8; const out = $('small', away); out.textContent = `Retour dans ${s} s`; const fast = setInterval(tick, 700); const t = setInterval(() => { s--; out.textContent = `Retour dans ${s} s`; if (s <= 0) { clearInterval(t); clearInterval(fast); away.hidden = true; ret(); } }, 1000); });
    document.addEventListener('visibilitychange', () => (document.hidden ? leave() : ret()));
    $('[data-first]', back).addEventListener('click', () => { $('.is-since', body)?.scrollIntoView({ block: 'center' }); });
    $('[data-seen]', back).addEventListener('click', () => { rows.forEach(seen); back.hidden = true; report(); });
    const reset = () => { body.innerHTML = ''; journal.innerHTML = ''; todo = []; waiting = []; arrivals = []; pool = POOL.slice(); rows = SEED.map((d) => make(d)); sep = document.createElement('tr'); sep.className = 'x-sep'; sep.innerHTML = '<td colspan="7"><div>↑ Remonté par l\'application · ↓ Votre tri</div></td>'; sep.hidden = true; sorted().forEach((r) => body.append(r.tr)); body.prepend(sep); number(); calmBar.hidden = true; back.hidden = true; report(); run(); log('Liste ouverte', 'Votre tri : primes décroissantes'); };
    $('[data-apply]', reserve).addEventListener('click', () => enqueue(9, flush));
    $('[data-important]', stage).addEventListener('click', () => event(true));
    $('[data-restart]', stage).addEventListener('click', reset);
    seg(stage, 'flow', run); seg(stage, 'pace', run); seg(stage, 'sense'); seg(stage, 'colors'); seg(stage, 'before', () => rows.forEach(evo)); seg(stage, 'lift', () => { if (cfg('lift') === 'non') rows.filter((r) => r.up && !r.leaving).forEach((r) => { r.leaving = true; enqueue(5, () => demote(r)); }); });
    reset(); })();

  // Les volets de la bande (mode d'emploi, réglages, journal) : un seul ouvert, fermé d'un clic ailleurs ou par Échap.
  document.addEventListener('click', (e) => $$('.x-pop[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.x-pop[open]').forEach((d) => { d.open = false; }); });
  document.addEventListener('toggle', (e) => { if (e.target.matches?.('.x-pop') && e.target.open) $$('.x-pop[open]').forEach((d) => { if (d !== e.target) d.open = false; }); }, true);

})();
