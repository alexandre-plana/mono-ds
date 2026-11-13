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
    const NAMES = { 1: ['Bloqué', 'critique', 'critiques'], 2: ['À surveiller', 'à surveiller', 'à surveiller'], 3: ['Nouveau', 'nouveau', 'nouveaux'] };
    const BASE = [['A-102', 'Annecy', 0], ['A-117', 'Arles', 3], ['A-124', 'Arras', 1], ['A-131', 'Bar-le-Duc', 0], ['A-140', 'Bayonne', 2], ['A-152', 'Brest', 3], ['A-166', 'Carcassonne', 0], ['A-173', 'Chartres', 0], ['A-181', 'Colmar', 0], ['A-195', 'Dax', 2], ['A-203', 'Lorient', 0], ['A-214', 'Narbonne', 1], ['A-226', 'Tarbes', 0], ['A-238', 'Vizille', 3], ['A-241', 'Valence', 0], ['A-257', 'Vannes', 3]];
    let rows = [], timers = [], io = null, pending = new Set(), batch = null;
    const step = (n) => steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
    const flash = (tr, delay) => timers.push(setTimeout(() => { if (still) { tr.classList.add('x-seen'); report(); return; } tr.classList.add('x-flash'); tr.addEventListener('animationend', () => { tr.classList.remove('x-flash'); tr.classList.add('x-seen'); report(); }, { once: true }); }, delay));
    // L'ordre : la priorité 1 d'abord, seule ; puis la 2 ; puis la 3. « Ensemble » sert de témoin.
    const reveal = (list) => { const ordered = stage.dataset.order !== 'ensemble'; const ps = [...new Set(list.map((tr) => +tr.dataset.p))].sort();
      list.forEach((tr) => { tr.dataset.queued = '1'; flash(tr, ordered ? ps.indexOf(+tr.dataset.p) * 750 : 0); }); };
    const report = () => { const marked = rows.filter((tr) => tr.dataset.p), seen = marked.filter((tr) => tr.classList.contains('x-seen')).length;
      const edge = box.getBoundingClientRect().bottom - 30, hidden = marked.filter((tr) => !tr.dataset.queued && tr.getBoundingClientRect().top > edge);
      below.innerHTML = [1, 2, 3].map((p) => { const n = hidden.filter((tr) => +tr.dataset.p === p).length; return n ? `<span data-p="${p}">${n} ${NAMES[p][n > 1 ? 2 : 1]} plus bas</span>` : ''; }).join('');
      read.innerHTML = `<span>Vu <b>${seen}</b> sur <b>${marked.length}</b></span><span>${marked.filter((tr) => tr.dataset.p === '1').length} critiques · ${marked.filter((tr) => tr.dataset.p === '2').length} à surveiller · ${marked.filter((tr) => tr.dataset.p === '3').length} nouveaux</span>`; };
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
    const tasks = $$('.x-task input', stage), count = $('.x-count', stage), stamp = $('.x-stamp', stage), box = $('.x-readbox', stage), prog = $('.x-progress', stage), done = $('.x-done', stage), folds = $$('.x-fold', stage), uses = $('[data-uses]', stage);
    let n = 0;
    // L'usure : une récompense répétée s'abrège. Pleine les trois premières fois, puis moitié moins longue.
    const reward = () => { n++; stage.style.setProperty('--x-gain', n > 3 ? '0.5' : '1'); uses.textContent = n > 3 ? `${n} gestes — récompense abrégée` : `${n} geste${n > 1 ? 's' : ''}`; };
    const sync = () => { const k = tasks.filter((t) => t.checked).length; count.textContent = k; count.classList.remove('is-tick'); void count.offsetWidth; count.classList.add('is-tick'); stamp.classList.toggle('is-on', k === tasks.length); };
    tasks.forEach((t) => t.addEventListener('change', () => { if (t.checked) reward(); sync(); }));
    box.addEventListener('scroll', () => { const v = Math.min(100, Math.round(box.scrollTop / (box.scrollHeight - box.clientHeight) * 100)); prog.style.setProperty('--value', v); if (v >= 99 && !prog.classList.contains('is-done')) { prog.classList.add('is-done'); done.classList.add('is-on'); reward(); } }, { passive: true });
    folds.forEach((f) => f.addEventListener('toggle', () => { if (f.open) reward(); }));
    seg(stage, 'reward');
    $('[data-reset]', stage).addEventListener('click', () => { tasks.forEach((t) => (t.checked = false)); folds.forEach((f) => (f.open = false)); box.scrollTop = 0; prog.classList.remove('is-done'); done.classList.remove('is-on'); prog.style.setProperty('--value', 0); n = 0; stage.style.removeProperty('--x-gain'); uses.textContent = '0 geste'; sync(); }); })();
})();
