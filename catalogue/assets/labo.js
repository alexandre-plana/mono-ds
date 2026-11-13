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
    const box = $('.x-live', stage), body = $('tbody', stage), read = $('.x-read', stage), pulse = $('.x-pulse', stage), arrive = $('[data-arrive]', stage), back = $('[data-back]', stage), reorderBar = $('[data-reorder]', stage), away = $('.x-away', stage), title0 = document.title;
    const fr = (v) => v.toFixed(1).replace('.', ','), hms = () => new Date().toLocaleTimeString('fr-FR'), ST = ['Normal', 'À surveiller', 'Bloqué'], cfg = (k) => stage.dataset[k];
    const SEED = [['A-102', 'Annecy', 9, 6.2], ['A-117', 'Arles', 7, 4.9], ['A-124', 'Arras', 11, 8.1], ['A-131', 'Bar-le-Duc', 6, 3.8], ['A-140', 'Bayonne', 8, 5.5], ['A-152', 'Brest', 12, 9.4], ['A-166', 'Carcassonne', 5, 3.1], ['A-181', 'Colmar', 9, 12.1], ['A-195', 'Dax', 5, 3.2], ['A-214', 'Narbonne', 10, 7.0], ['A-226', 'Tarbes', 14, 7.8]];
    const POOL = [['A-262', 'Vizille', 4, 2.4], ['A-270', 'Valence', 8, 5.9], ['A-281', 'Vannes', 6, 4.4], ['A-290', 'Lorient', 7, 5.1], ['A-298', 'Chartres', 9, 6.6]];
    let rows = [], queue = [], timer = null, flushTimer = null, calm = null, gone = false, awayCount = { v: 0, n: 0 }, last = null, pool = [], dirty = new Map(), hover = false, lot = '';
    const digits = (el, txt, dir) => { const old = el.textContent; el.innerHTML = [...txt].map((c, i) => `<span${dir && !still && c !== old.padStart(txt.length, ' ')[i] ? ` style="animation: x-${dir} 260ms ease-out 1 both"` : ''}>${c}</span>`).join(''); };
    const spark = (h) => { const lo = Math.min(...h), hi = Math.max(...h), W = 72, H = 14, pts = h.map((v, i) => [i * W / Math.max(1, h.length - 1), H - (hi === lo ? H / 2 : (v - lo) / (hi - lo) * H)]); const [x, y] = pts.at(-1);
      return `<svg width="${W + 4}" height="${H + 4}" viewBox="-2 -2 ${W + 4} ${H + 4}" aria-hidden="true"><polyline points="${pts.map((p) => p.join(',')).join(' ')}"></polyline><rect x="${x - 1.5}" y="${y - 1.5}" width="3" height="3"></rect></svg>`; };
    // Ce que l'on garde de l'ancienne valeur : rien, le fantôme (barré, un temps), l'écart, ou le tracé.
    // L'écart est CUMULÉ depuis la dernière fois que la ligne a été vue : dix sauts rapides se lisent comme un seul.
    const evo = (r) => { const m = cfg('before'), td = $('.x-evo', r.tr); if (m === 'trace') { td.innerHTML = spark(r.hist); return; } const f = r.lastF, d = f ? +(r[f] - r.base[f]).toFixed(1) : 0; if (!f || !d || m === 'rien') { td.innerHTML = ''; return; }
      td.innerHTML = m === 'fantome' ? `<s>${f === 'pr' ? fr(r.base[f]) : r.base[f]}</s>` : `<span class="d">${d > 0 ? '▲' : '▼'} ${f === 'pr' ? fr(Math.abs(d)) : Math.abs(d)}</span>`;
      clearTimeout(r.ghost); if (m === 'fantome') r.ghost = setTimeout(() => { if (cfg('before') === 'fantome') td.innerHTML = ''; }, 9000); };
    const seen = (r) => { r.tr.classList.remove('is-unseen', 'is-since'); r.base = { eff: r.eff, pr: r.pr }; r.lastF = null; r.seenRank = rows.indexOf(r); evo(r); rank(); };
    const make = (d, isNew) => { const r = { ref: d[0], name: d[1], eff: d[2], pr: d[3], st: 0, hist: [d[3]], base: { eff: d[2], pr: d[3] }, lastF: null, seenRank: null, touched: 0 }; const tr = document.createElement('tr'); r.tr = tr;
      tr.innerHTML = `<td class="rk"><span class="x-rk"></span><span class="x-mv"></span></td><td class="nm"><span>${r.name}</span></td><td class="n"><span class="x-num" data-f="eff"></span></td><td class="n"><span class="x-num" data-f="pr"></span></td><td class="x-evo"></td><td class="st" data-st="0">${ST[0]}</td><td class="t n">${isNew ? hms() : '—'}</td>`;
      digits($('[data-f="eff"]', tr), String(r.eff)); digits($('[data-f="pr"]', tr), fr(r.pr)); tr.addEventListener('pointerenter', () => { seen(r); report(); }); if (isNew) tr.classList.add('is-new', 'is-unseen'); if (cfg('before') === 'trace') $('.x-evo', tr).innerHTML = spark(r.hist); return r; };
    // ---- L'ordre. La liste est classée par primes. `rows` est l'ordre AFFICHÉ ; l'ordre juste se calcule.
    const sorted = () => rows.slice().sort((a, b) => b.pr - a.pr || a.name.localeCompare(b.name, 'fr'));
    // Le rang et son mouvement. Reclassé : ▲2 depuis la dernière fois qu'on a vu la ligne. En attente : « → 3 », la place qu'elle prendra.
    const rank = () => { const want = sorted(); let pending = 0; rows.forEach((r, i) => { const w = want.indexOf(r), mv = $('.x-mv', r.tr); $('.x-rk', r.tr).textContent = String(i + 1).padStart(2, '0');
      if (w !== i) { pending++; mv.textContent = `→ ${String(w + 1).padStart(2, '0')}`; mv.className = 'x-mv is-pending'; }
      else if (r.seenRank != null && r.seenRank !== i) { const d = r.seenRank - i; mv.textContent = `${d > 0 ? '▲' : '▼'} ${Math.abs(d)}`; mv.className = 'x-mv'; }
      else { mv.textContent = ''; mv.className = 'x-mv'; } });
      reorderBar.hidden = !pending || cfg('order') === 'immediat'; if (pending) { $('b', reorderBar).textContent = `${pending} ligne${pending > 1 ? 's' : ''} à reclasser`; $('span', reorderBar).textContent = cfg('order') === 'calme' ? (hover ? 'Le pointeur est sur la liste : rien ne bouge' : 'Reclassement à la prochaine accalmie') : 'L\'ordre affiché n\'est plus le bon'; $('button', reorderBar).hidden = false; }
      return pending; };
    // Reclasser : chaque ligne glisse de sa place à la nouvelle, en un seul mouvement pour tout le lot.
    const reorder = () => { const want = sorted(); if (want.every((r, i) => r === rows[i])) return; const before = new Map(rows.map((r) => [r, r.tr.getBoundingClientRect().top]));
      rows.forEach((r, i) => { if (r.seenRank == null) r.seenRank = i; }); rows = want; rows.forEach((r) => body.append(r.tr));
      if (!still) rows.forEach((r) => { const dy = before.get(r) - r.tr.getBoundingClientRect().top; if (dy) { r.tr.style.position = 'relative'; r.tr.style.zIndex = dy > 0 ? 2 : 1; r.tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2, .8, .2, 1)' }).onfinish = () => { r.tr.style.zIndex = ''; }; } });
      rows.forEach((r, i) => { if (r.seenRank !== i) r.tr.classList.add('is-unseen'); }); rank(); report(); };
    const settle = () => { const m = cfg('order'); clearTimeout(calm); if (m === 'immediat') reorder(); else { rank(); if (m === 'calme') calm = setTimeout(() => { if (hover) settle(); else reorder(); }, 2600); } };
    const report = () => { const u = rows.filter((r) => r.tr.classList.contains('is-unseen')).length; read.innerHTML = `<span><b>${rows.length}</b> agences, classées par primes</span><span><b>${u}</b> non vu${u > 1 ? 's' : ''}</span><span>Dernière mise à jour ${last || '—'}</span>${lot ? `<span>${lot}</span>` : ''}`;
      arrive.hidden = !queue.length; if (queue.length) $('b', arrive).textContent = `${queue.length} agence${queue.length > 1 ? 's' : ''} arrivée${queue.length > 1 ? 's' : ''}`;
      document.title = gone && (awayCount.v + awayCount.n) ? `(${awayCount.v + awayCount.n}) ${title0}` : title0; };
    const insert = (list) => { const h0 = box.scrollHeight, top = box.scrollTop; list.forEach((r) => { body.prepend(r.tr); rows.unshift(r); }); if (top > 4) box.scrollTop = top + box.scrollHeight - h0; settle(); };   // on ne fait pas sauter ce qu'on lit
    // ---- Une mise à jour se fait en deux temps : le modèle change (mutate), puis l'écran le montre (paint).
    // « Par lots » sépare les deux : les changements d'une fenêtre de temps sont montrés en une fois.
    const mutate = () => { last = hms(); const k = Math.random();
      if (k < 0.1 && pool.length) { const r = make(pool.shift(), true); if (gone) { awayCount.n++; r.tr.classList.add('is-since'); } if (cfg('arrivals') === 'attente') queue.push(r); else insert([r]); return; }
      const r = rows[Math.floor(Math.random() * rows.length)]; if (!r) return; const d = dirty.get(r) || { was: { eff: r.eff, pr: r.pr } };
      if (k < 0.18) { r.st = (r.st + 1 + Math.floor(Math.random() * 2)) % 3; d.st = true; }
      else { const f = k < 0.36 ? 'eff' : 'pr', old = r[f], now = f === 'eff' ? Math.max(1, old + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))) : Math.max(0.5, +(old + (Math.random() - 0.47) * 2.2).toFixed(1)); if (now === old) return; r[f] = now; r.lastF = f; d[f] = true; if (f === 'pr') { r.hist.push(now); if (r.hist.length > 10) r.hist.shift(); } }
      dirty.set(r, d); if (gone) awayCount.v++; };
    const paint = () => { if (!dirty.size) { report(); return; } const n = dirty.size, t = performance.now(); pulse.classList.remove('is-beat'); void pulse.offsetWidth; pulse.classList.add('is-beat');
      dirty.forEach((d, r) => { const tr = r.tr, roll = ['valeur', 'deux'].includes(cfg('where'));
        ['eff', 'pr'].forEach((f) => { if (!d[f]) return; const el = $(`[data-f="${f}"]`, tr); digits(el, f === 'pr' ? fr(r[f]) : String(r[f]), roll ? (r[f] > d.was[f] ? 'up' : 'down') : null); el.classList.remove('is-fresh'); void el.offsetWidth; el.classList.add('is-fresh'); });
        if (d.st) { const td = $('.st', tr); td.dataset.st = r.st; td.textContent = ST[r.st]; }
        // Une ligne qui vient d'être soulignée ne l'est pas de nouveau avant deux secondes : le rythme du flux n'est pas celui de l'œil.
        if (t - r.touched > 2000) { tr.classList.remove('is-touched'); void tr.offsetWidth; tr.classList.add('is-touched'); r.touched = t; }
        tr.classList.add('is-unseen'); if (gone) tr.classList.add('is-since'); $('.t', tr).textContent = hms(); evo(r); });
      dirty.clear(); const p0 = rank(); settle(); lot = cfg('batch') === 'lots' ? `Dernier lot : ${n} ligne${n > 1 ? 's' : ''}${p0 ? `, ${p0} à reclasser` : ''}` : ''; report(); };
    const tick = () => { const burst = cfg('pace') === 'rafale' ? 6 : 1; for (let i = 0; i < burst; i++) mutate(); if (cfg('batch') !== 'lots') paint(); else report(); };
    const run = () => { clearInterval(timer); clearInterval(flushTimer); const on = cfg('flow') === 'marche'; pulse.classList.toggle('is-off', !on); pulse.lastChild.textContent = on ? 'En direct' : 'Flux en pause'; if (!on) { paint(); return; }
      timer = setInterval(tick, { calme: 2600, vif: 420, rafale: 2200 }[cfg('pace')]); if (cfg('batch') === 'lots') flushTimer = setInterval(paint, 1800); };
    const leave = () => { if (gone) return; gone = true; awayCount = { v: 0, n: 0 }; back.hidden = true; };
    const ret = () => { if (!gone) return; gone = false; const { v, n } = awayCount; if (v + n) { back.hidden = false; $('b', back).textContent = `${v} changement${v > 1 ? 's' : ''} de valeur` + (n ? ` · ${n} agence${n > 1 ? 's' : ''} arrivée${n > 1 ? 's' : ''}` : ''); } report(); };
    const reset = () => { body.innerHTML = ''; rows = []; queue = []; dirty.clear(); lot = ''; pool = POOL.slice(); SEED.slice().sort((a, b) => b[3] - a[3]).forEach((d) => { const r = make(d); body.append(r.tr); rows.push(r); }); rows.forEach((r, i) => (r.seenRank = i)); back.hidden = true; last = null; rank(); report(); run(); };
    box.addEventListener('pointerenter', () => { hover = true; rank(); }); box.addEventListener('pointerleave', () => { hover = false; rank(); });
    $('button', reorderBar).addEventListener('click', reorder);
    $('[data-show]', arrive).addEventListener('click', () => { const q = queue.reverse(); queue = []; insert(q); report(); });
    $('[data-first]', back).addEventListener('click', () => { $('.is-since', body)?.scrollIntoView({ block: 'center' }); });
    $('[data-seen]', back).addEventListener('click', () => { rows.forEach(seen); back.hidden = true; report(); });
    $('[data-once]', stage).addEventListener('click', () => { tick(); if (cfg('batch') === 'lots') paint(); });
    $('[data-restart]', stage).addEventListener('click', reset);
    $('[data-leave]', stage).addEventListener('click', () => { leave(); away.hidden = false; let s = 8; const out = $('small', away); out.textContent = `Retour dans ${s} s`; const fast = setInterval(tick, 900);
      const t = setInterval(() => { s--; out.textContent = `Retour dans ${s} s`; if (s <= 0) { clearInterval(t); clearInterval(fast); away.hidden = true; paint(); ret(); } }, 1000); });
    document.addEventListener('visibilitychange', () => (document.hidden ? leave() : ret()));   // le vrai départ : changer d'onglet
    seg(stage, 'flow', run); seg(stage, 'pace', run); seg(stage, 'batch', run); seg(stage, 'where'); seg(stage, 'before', () => rows.forEach(evo)); seg(stage, 'order', settle);
    seg(stage, 'arrivals', () => { if (cfg('arrivals') === 'inserees' && queue.length) { const q = queue.reverse(); queue = []; insert(q); } report(); });
    reset(); })();

  // Les volets de la bande (mode d'emploi, réglages, journal) : un seul ouvert, fermé d'un clic ailleurs ou par Échap.
  document.addEventListener('click', (e) => $$('.x-pop[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.x-pop[open]').forEach((d) => { d.open = false; }); });
  document.addEventListener('toggle', (e) => { if (e.target.matches?.('.x-pop') && e.target.open) $$('.x-pop[open]').forEach((d) => { if (d !== e.target) d.open = false; }); }, true);

  // ===== Expérience 04 — l'attention arbitrée ================================
  // L'application juge chaque changement. Important : il passe tout de suite, et sa ligne remonte au-dessus du
  // tri de l'utilisateur. Mineur : il attend une accalmie. Rien ne bouge sans dire pourquoi : la cause s'écrit
  // d'abord, puis la ligne se déplace en laissant la trace de son trajet.
  (() => { const stage = document.getElementById('x4'); if (!stage) return;
    const box = $('.x-live', stage), body = $('tbody', stage), read = $('.x-read', stage), mood = $('.x-mood', stage), reserve = $('[data-reserve]', stage), calmBar = $('[data-calm]', stage), journal = $('.x-journal', stage);
    const fr = (v) => v.toFixed(1).replace('.', ','), hms = () => new Date().toLocaleTimeString('fr-FR'), ST = ['Normal', 'À surveiller', 'Bloqué'], cfg = (k) => stage.dataset[k], wait = (ms) => new Promise((r) => setTimeout(r, still ? 0 : ms));
    const SEED = [['Annecy', 6.2], ['Arles', 4.9], ['Arras', 8.1], ['Bar-le-Duc', 3.8], ['Bayonne', 5.5], ['Brest', 9.4], ['Carcassonne', 3.4], ['Colmar', 12.1], ['Dax', 3.2], ['Narbonne', 7.0], ['Tarbes', 7.8], ['Valence', 5.9]];
    let rows = [], sep = null, timer = null, chain = Promise.resolve(), lastAct = performance.now(), busy = false, waiting = [];
    const TH = () => ({ stricte: 30, normale: 20, large: 10 }[cfg('sense')]);
    const log = (what, why) => { const li = document.createElement('li'); li.innerHTML = `<time>${hms()}</time><span><b></b><small></small></span>`; $('b', li).textContent = what; $('small', li).textContent = why; journal.prepend(li); while (journal.children.length > 14) journal.lastElementChild.remove(); };
    const digits = (el, txt, dir) => { const old = el.textContent; el.innerHTML = [...txt].map((c, i) => `<span${dir && !still && c !== old.padStart(txt.length, ' ')[i] ? ` style="animation: x-${dir} 260ms ease-out 1 both"` : ''}>${c}</span>`).join(''); };
    // Le jugement. Chaque règle a un nom que l'on peut lire : c'est la raison qui s'écrira dans la ligne.
    const judge = (r, kind, old, now) => { const pct = kind === 'pr' ? Math.abs(now - old) / old * 100 : 0;
      if (kind === 'st' && now === 2) return { txt: 'Bloquée', rule: 'Un état bloqué passe avant tout', level: 1 };
      if (kind === 'pr' && old >= 3 && now < 3) return { txt: 'Passe sous 3 M', rule: 'Franchissement du seuil de 3 M', level: 2 };
      if (kind === 'pr' && pct >= TH()) return { txt: `${now > old ? '+' : '−'} ${Math.round(pct)} % d'un coup`, rule: `Un saut d'au moins ${TH()} %`, level: 2 };
      if (r.follow) return { txt: 'Suivie par vous', rule: 'Vous suivez cette agence : tout changement compte', level: 3 };
      return null; };
    const make = ([name, pr]) => { const r = { name, pr, shown: pr, st: 0, follow: false, up: false, held: false, reason: null }; const tr = document.createElement('tr'); r.tr = tr;
      tr.innerHTML = `<td class="rk"><span class="x-rk"></span></td><td class="nm"><span>${name}</span></td><td class="n pr"><span class="x-num"></span><i class="x-held" title="Une mise à jour mineure attend"></i></td><td class="st" data-st="0">${ST[0]}</td><td class="x-why"></td><td class="n"><button class="x-follow" type="button" aria-pressed="false">Suivre</button></td>`;
      digits($('.x-num', tr), fr(pr)); $('.x-follow', tr).addEventListener('click', (e) => { r.follow = !r.follow; e.target.setAttribute('aria-pressed', String(r.follow)); e.target.textContent = r.follow ? 'Suivie' : 'Suivre'; log(`${name} ${r.follow ? 'est suivie' : 'n\'est plus suivie'}`, 'Décision de l\'utilisateur'); });
      tr.addEventListener('pointerenter', () => { if (r.up && !r.leaving) { r.leaving = true; chain = chain.then(() => demote(r)); } }); return r; };
    const sorted = () => rows.slice().sort((a, b) => b.shown - a.shown || a.name.localeCompare(b.name, 'fr'));
    // L'ordre voulu : ce que l'application a remonté (le plus grave d'abord), la frontière, puis le tri de l'utilisateur.
    const want = () => { const all = sorted(), ups = all.filter((r) => r.up).sort((a, b) => a.reason.level - b.reason.level || a.since - b.since); return [...ups.map((r) => r.tr), ...(ups.length ? [sep] : []), ...all.filter((r) => !r.up).map((r) => r.tr)]; };
    const number = () => { sorted().forEach((r, i) => { $('.x-rk', r.tr).textContent = String(i + 1).padStart(2, '0'); }); const ups = rows.filter((r) => r.up).length; sep.hidden = !ups; };
    const top = (el) => el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    // Déplacer : on note où est chaque ligne, on range, on anime l'écart — toutes ensemble, d'un seul mouvement.
    const place = (g) => (g.anchor && g.anchor.isConnected ? g.anchor.after(g) : body.prepend(g));
    const layout = (ms = 520, fresh) => { const trs = [...body.children], before = new Map(trs.map((t) => [t, t.getBoundingClientRect().top])); number(); const old = $$('.x-ghost', body); want().forEach((t) => body.append(t)); old.forEach(place); if (fresh) place(fresh);
      if (!still) [...body.children].forEach((t) => { const a = before.get(t); if (a == null) return; const dy = a - t.getBoundingClientRect().top; if (dy) { t.style.position = 'relative'; t.style.zIndex = Math.abs(dy) > 60 ? 3 : 1; t.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.2, .8, .2, 1)' }).onfinish = () => { t.style.zIndex = ''; }; } }); return wait(ms); };
    const why = (r, txt, rule) => { const td = $('.x-why', r.tr); td.innerHTML = txt ? `<span class="is-in"></span><small></small>` : ''; if (txt) { td.firstChild.textContent = txt; td.lastChild.textContent = rule || ''; } };
    const show = (r) => { const dir = r.pr > r.shown ? 'up' : r.pr < r.shown ? 'down' : null; r.shown = r.pr; r.held = false; r.tr.classList.remove('is-held'); if (dir) { const el = $('.x-num', r.tr); digits(el, fr(r.pr), dir); el.classList.remove('is-fresh'); void el.offsetWidth; el.classList.add('is-fresh'); }
      const st = $('.st', r.tr); st.dataset.st = r.st; st.textContent = ST[r.st]; r.tr.classList.remove('is-touched'); void r.tr.offsetWidth; r.tr.classList.add('is-touched'); };
    // La place quittée garde un mot ; un fil tireté relie le départ à l'arrivée.
    const above = (tr) => { let p = tr.previousElementSibling; while (p && p.classList.contains('x-ghost')) p = p.previousElementSibling; return p; };
    const ghost = (anchor, text) => { const g = document.createElement('tr'); g.className = 'x-ghost'; g.innerHTML = '<td colspan="6"><div></div></td>'; $('div', g).textContent = text; g.anchor = anchor; setTimeout(() => { g.classList.add('is-closing'); setTimeout(() => g.remove(), 460); }, still ? 1200 : 2400); return g; };
    const thread = (y0, y1) => { const t = document.createElement('div'); t.className = 'x-thread'; t.style.top = Math.min(y0, y1) + 12 + 'px'; t.style.height = Math.abs(y1 - y0) + 'px'; box.append(t); setTimeout(() => t.remove(), 2700); };
    // Remonter, en trois temps que l'œil peut suivre : la cause s'écrit ; un silence ; la ligne monte en laissant sa trace.
    const promote = async (r, reason) => { busy = true; r.reason = reason; show(r); why(r, reason.txt, reason.rule); log(`${r.name} — ${reason.txt.toLowerCase()}`, `Montré tout de suite. Règle : ${reason.rule.toLowerCase()}`); report(); await wait(800);
      if (cfg('lift') === 'non' || r.up) { await layout(); busy = false; report(); return; }
      if (rows.filter((x) => x.up).length >= 3) { waiting.push(r); why(r, reason.txt, 'En attente : trois lignes sont déjà remontées'); log(`${r.name} attend`, 'Budget d\'attention : trois lignes remontées au plus'); await layout(); busy = false; report(); return; }
      const y0 = top(r.tr), g = ghost(above(r.tr), `↑ ${r.name} remontée — ${reason.txt.toLowerCase()}`); r.up = true; r.since = performance.now(); r.tr.classList.add('is-up'); await layout(520, g);
      thread(y0, top(r.tr)); log(`${r.name} remontée en tête`, 'Au-dessus de votre tri, jusqu\'à ce que vous l\'ayez vue'); busy = false; report(); };
    // Redescendre : dès que la ligne a été vue. La raison se met à jour d'abord — « vue » —, puis le même trajet, à l'envers.
    const demote = async (r) => { busy = true; const rankTxt = String(sorted().indexOf(r) + 1).padStart(2, '0'); why(r, 'Vue', `Elle retourne à son rang, le ${rankTxt}`); await wait(900); const y0 = top(r.tr); r.up = false; r.leaving = false; r.tr.classList.remove('is-up');
      const g = ghost(above(r.tr), `↓ ${r.name} vue — retourne au rang ${rankTxt}`); await layout(520, g); thread(y0, top(r.tr)); log(`${r.name} redescend au rang ${rankTxt}`, 'Vous l\'avez vue'); await wait(1400); if (!r.up) why(r, r.st === 2 ? 'Bloquée' : '', '');
      const next = waiting.shift(); busy = false; report(); if (next && next.reason) chain = chain.then(() => promote(next, next.reason)); };
    // L'accalmie : les changements mineurs s'appliquent en une vague, de haut en bas, puis la liste se range une fois.
    const flush = async () => { const held = [...body.children].map((t) => rows.find((r) => r.tr === t)).filter((r) => r && r.held); if (!held.length) return; busy = true; calmBar.hidden = false; $('b', calmBar).textContent = `Accalmie — ${held.length} changement${held.length > 1 ? 's' : ''} mineur${held.length > 1 ? 's' : ''} appliqué${held.length > 1 ? 's' : ''}`;
      const before = sorted().map((r) => r.name).join(); for (const r of held) { show(r); await wait(90); } await wait(500); const moved = sorted().map((r) => r.name).join() !== before; $('span', calmBar).textContent = moved ? 'puis la liste se range, une seule fois' : 'l\'ordre ne change pas'; await layout(620);
      log(`${held.length} changement${held.length > 1 ? 's' : ''} mineur${held.length > 1 ? 's' : ''} appliqué${held.length > 1 ? 's' : ''}`, 'Accalmie : vous ne lisiez plus la liste'); setTimeout(() => { calmBar.hidden = true; }, 3600); busy = false; report(); };
    const report = () => { const h = rows.filter((r) => r.held).length, ups = rows.filter((r) => r.up).length; reserve.hidden = !h; if (h) $('b', reserve).textContent = `${h} changement${h > 1 ? 's' : ''} mineur${h > 1 ? 's' : ''} en réserve`;
      read.innerHTML = `<span><b>${rows.length}</b> agences, votre tri : primes décroissantes</span><span><b>${ups}</b> remontée${ups > 1 ? 's' : ''} par l'application</span>${waiting.length ? `<span><b>${waiting.length}</b> en attente de place</span>` : ''}`; };
    // Le flux : surtout du mineur, parfois de l'important.
    const event = (force) => { const k = force ? 0.99 : Math.random(), pool = rows.filter((r) => !r.up && !r.leaving && !waiting.includes(r)), r = pool[Math.floor(Math.random() * pool.length)]; if (!r) return;
      let reason = null; if (k > 0.965) { if (r.st === 2) return; r.st = 2; reason = judge(r, 'st', 0, 2); }
      else { const old = r.pr, amp = k > 0.9 ? 0.2 + Math.random() * 0.2 : k > 0.78 ? 0.09 + Math.random() * 0.07 : 0.01 + Math.random() * 0.05, now = Math.max(0.6, +(old * (1 + (Math.random() < 0.5 ? -1 : 1) * amp)).toFixed(1)); if (now === old) return; r.pr = now; reason = judge(r, 'pr', r.shown, now); }
      if (reason) chain = chain.then(() => promote(r, reason)); else { r.held = true; r.tr.classList.add('is-held'); report(); } };
    const run = () => { clearInterval(timer); if (cfg('flow') === 'marche') timer = setInterval(() => event(false), cfg('pace') === 'vif' ? 520 : 1500); };
    // L'accalmie se détecte : ni pointeur, ni défilement, ni touche depuis deux secondes et demie, et aucun déplacement en cours.
    const act = () => { lastAct = performance.now(); mood.classList.remove('is-calm'); mood.lastChild.textContent = 'Vous lisez'; };
    ['pointermove', 'wheel', 'keydown', 'pointerdown'].forEach((ev) => $('.x-screen', stage).addEventListener(ev, act, { passive: true }));
    setInterval(() => { const calm = performance.now() - lastAct > 2500; if (calm) { mood.classList.add('is-calm'); mood.lastChild.textContent = 'Accalmie'; if (!busy && rows.some((r) => r.held)) chain = chain.then(flush); } }, 600);
    const reset = () => { body.innerHTML = ''; journal.innerHTML = ''; waiting = []; rows = SEED.map(make); sep = document.createElement('tr'); sep.className = 'x-sep'; sep.innerHTML = '<td colspan="6"><div>↑ Remonté par l\'application · ↓ Votre tri</div></td>'; sep.hidden = true; sorted().forEach((r) => body.append(r.tr)); body.prepend(sep); number(); calmBar.hidden = true; report(); run(); log('Liste ouverte', 'Votre tri : primes décroissantes'); };
    $('[data-apply]', reserve).addEventListener('click', () => { chain = chain.then(flush); });
    $('[data-important]', stage).addEventListener('click', () => event(true));
    $('[data-restart]', stage).addEventListener('click', reset);
    seg(stage, 'flow', run); seg(stage, 'pace', run); seg(stage, 'sense'); seg(stage, 'lift', () => { if (cfg('lift') === 'non') rows.filter((r) => r.up).forEach((r) => { r.leaving = true; chain = chain.then(() => demote(r)); }); });
    reset(); })();
})();
