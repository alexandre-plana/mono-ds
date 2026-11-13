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
})();
