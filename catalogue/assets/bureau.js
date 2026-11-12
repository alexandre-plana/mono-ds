/* Bureau de démonstration MONO : gestion des fenêtres, barre, canevas, menus contextuels.
   interact.js prend en charge le déplacement, le redimensionnement et l'aimantation. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const area = $('#area'), tasks = $('#tasks'), ctx = $('#ctx');
  const fr = (n, d = 1) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const small = () => matchMedia('(max-width: 760px)').matches;
  const MAGNET = 14;   // distance d'aimantation, en px

  const AGENCES = [
    ['N-011', 'Chambéry', 'Nord', 7.9, 'A. Perrin', 11], ['N-014', 'Grenoble Centre', 'Nord', 12.4, 'M. Delorme', 18],
    ['N-015', 'Voiron', 'Nord', 4.1, 'S. Garcin', 6], ['C-021', 'Clermont Jaude', 'Centre', 9.8, 'P. Vidal', 14],
    ['C-024', 'Montluçon', 'Centre', 3.3, 'C. Roux', 5], ['S-031', 'Avignon', 'Sud', 8.7, 'J. Reynaud', 12],
    ['S-034', 'Nîmes Arènes', 'Sud', 6.2, 'N. Blanc', 9], ['O-041', 'Limoges', 'Ouest', 5.4, 'H. Lacroix', 8],
  ].map(([ref, nom, branche, primes, resp, effectif]) => ({ ref, nom, branche, primes, resp, effectif }));
  const shared = { selected: 'N-014', listeners: new Set() };
  const select = (ref) => { shared.selected = ref; shared.listeners.forEach((f) => f()); };

  // ------------------------------------------------------------------ applications
  const APPS = {
    agences: { title: 'Agences', icon: 'table', w: 520, h: 330, x: 0, y: 0, flush: true, init(body) {
      const tb = $('tbody', body);
      const draw = () => { tb.innerHTML = AGENCES.map((a) => `<tr tabindex="0" data-ref="${a.ref}" aria-selected="${a.ref === shared.selected}"><td class="t-muted u-nowrap">${a.ref}</td><th>${a.nom}</th><td>${a.branche}</td><td class="is-num">${fr(a.primes)}</td></tr>`).join(''); };
      tb.addEventListener('click', (e) => { const tr = e.target.closest('tr'); if (tr) { select(tr.dataset.ref); open('inspecteur', false); } });
      shared.listeners.add(draw); draw();
      $('table', body).style.margin = '0 var(--space-4)'; $('table', body).style.width = 'calc(100% - 2 * var(--space-4))';
    } },
    inspecteur: { title: 'Inspecteur', icon: 'panel', w: 300, h: 330, x: 534, y: 0, init(body) {
      const draw = () => { const a = AGENCES.find((x) => x.ref === shared.selected); body.querySelectorAll('[data-f]').forEach((n) => { const k = n.dataset.f; n.textContent = k === 'primes' ? fr(a.primes) + ' M' : a[k]; }); };
      shared.listeners.add(draw); draw();
    } },
    canevas: { title: 'Canevas', icon: 'layers', w: 834, h: 420, x: 0, y: 344, flush: true, init: initCanvas },
    console: { title: 'Console', icon: 'menu', w: 430, h: 330, x: 848, y: 0, flush: true, init(body) {
      const out = MonoConsole($('.c-console__log', body), $('input', body), {
        fenetres: () => [...wins.values()].forEach((w) => out.print(`${w.app.title} — ${Math.round(w.el.offsetWidth)} × ${Math.round(w.el.offsetHeight)}${w.el.classList.contains('is-minimized') ? ' (réduite)' : ''}`)),
        ranger: () => { tile(); out.print('Fenêtres rangées'); },
        ouvrir: ([name]) => (APPS[name] ? open(name) : out.print(`Application inconnue : « ${name ?? ''} »`, 'error')),
      });
      out.print('Bureau prêt — ' + Object.keys(APPS).length + ' applications'); out.print('Clic droit sur le bureau ou le canevas pour le menu');
      shared.log = out.print;
    } },
  };

  // ------------------------------------------------------------------ fenêtres
  const wins = new Map(); let z = 10;
  const place = (w) => Object.assign(w.el.style, { left: w.x + 'px', top: w.y + 'px', width: w.w + 'px', height: w.h + 'px' });

  function focus(id) {
    const w = wins.get(id); if (!w) return;
    w.el.classList.remove('is-minimized'); w.el.style.zIndex = ++z;
    wins.forEach((o) => o.el.classList.toggle('is-active', o === w));
    syncBar();
  }
  function open(id, andFocus = true) {
    if (wins.has(id)) { if (andFocus) focus(id); return; }
    const app = APPS[id], el = document.createElement('section');
    el.className = 'c-window c-window--resizable'; el.dataset.win = id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', app.title);
    el.innerHTML = `<div class="c-window__frame">
      <header class="c-window__bar"><i class="c-icon i-grip" aria-hidden="true"></i><span class="c-window__title">${app.title}</span>
        <span class="c-window__actions">
          <button class="c-button c-button--quiet" type="button" data-act="min" aria-label="Réduire"><i class="c-icon i-minus" aria-hidden="true"></i></button>
          <button class="c-button c-button--quiet" type="button" data-act="max" aria-label="Agrandir"><i class="c-icon i-window" aria-hidden="true"></i></button>
          <button class="c-button c-button--quiet" type="button" data-act="close" aria-label="Fermer"><i class="c-icon i-close" aria-hidden="true"></i></button>
        </span></header>
      <div class="c-window__body${app.flush ? ' c-window__body--flush' : ''}"></div></div>`;
    const body = $('.c-window__body', el); body.appendChild($('#tpl-' + id).content.cloneNode(true));
    const r = area.getBoundingClientRect();
    const w = { id, app, el, w: Math.min(app.w, r.width), h: Math.min(app.h, r.height) };
    w.x = Math.max(0, Math.min(app.x, r.width - w.w)); w.y = Math.max(0, Math.min(app.y, r.height - w.h));
    wins.set(id, w); place(w); area.appendChild(el); app.init(body, w);
    el.addEventListener('pointerdown', () => focus(id), true);
    focus(id);
  }
  function close(id) { const w = wins.get(id); if (!w) return; w.el.remove(); wins.delete(id); const last = [...wins.values()].filter((o) => !o.el.classList.contains('is-minimized')).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0]; last ? focus(last.id) : syncBar(); }
  function minimize(id) { const w = wins.get(id); w.el.classList.add('is-minimized'); w.el.classList.remove('is-active'); const next = [...wins.values()].filter((o) => !o.el.classList.contains('is-minimized')).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0]; next ? focus(next.id) : syncBar(); }
  const maximize = (id) => { wins.get(id).el.classList.toggle('is-maximized'); focus(id); };
  function tile() {
    const list = [...wins.values()].filter((w) => !w.el.classList.contains('is-minimized')); if (!list.length) return;
    const r = area.getBoundingClientRect(), cols = Math.ceil(Math.sqrt(list.length)), rows = Math.ceil(list.length / cols);
    list.forEach((w, i) => { w.el.classList.remove('is-maximized'); w.w = Math.floor(r.width / cols); w.h = Math.floor(r.height / rows); w.x = (i % cols) * w.w; w.y = Math.floor(i / cols) * w.h; place(w); });
  }
  area.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const id = btn.closest('.c-window').dataset.win;
    ({ min: minimize, max: maximize, close })[btn.dataset.act](id);
  });
  area.addEventListener('dblclick', (e) => { const bar = e.target.closest('.c-window__bar'); if (bar && !e.target.closest('button')) maximize(bar.closest('.c-window').dataset.win); });

  // ------------------------------------------------------------------ barre des fenêtres
  function syncBar() {
    tasks.innerHTML = [...wins.values()].map((w) => `<button class="c-taskbar__item${w.el.classList.contains('is-minimized') ? ' is-minimized' : ''}" type="button" data-win="${w.id}" aria-pressed="${w.el.classList.contains('is-active')}"><i class="c-icon i-${w.app.icon}" aria-hidden="true"></i>${w.app.title}</button>`).join('');
    $('#count').textContent = wins.size + (wins.size > 1 ? ' fenêtres' : ' fenêtre');
  }
  tasks.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-win]'); if (!btn) return;
    const w = wins.get(btn.dataset.win);
    w.el.classList.contains('is-active') && !w.el.classList.contains('is-minimized') ? minimize(w.id) : focus(w.id);
  });
  $('#launcher-list').innerHTML = Object.entries(APPS).map(([id, a]) => `<button class="c-menu__item" type="button" role="menuitem" data-open="${id}"><span><i class="c-icon i-${a.icon}" aria-hidden="true"></i> ${a.title}</span></button>`).join('') + '<hr class="c-menu__sep"><button class="c-menu__item" type="button" role="menuitem" data-open="*">Ranger les fenêtres</button>';
  $('#launcher').addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (!b) return; b.dataset.open === '*' ? tile() : open(b.dataset.open); $('#launcher').open = false; });
  document.addEventListener('pointerdown', (e) => { if (!$('#launcher').contains(e.target)) $('#launcher').open = false; });
  const tick = () => { $('#clock').textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }; tick(); setInterval(tick, 20000);

  // ------------------------------------------------------------------ interact.js : déplacer, redimensionner, aimanter
  // Cible d'aimantation : les bords du bureau et les bords des autres fenêtres.
  const edges = (self) => {
    const xs = [0, area.clientWidth], ys = [0, area.clientHeight];
    wins.forEach((o) => { if (o === self || o.el.classList.contains('is-minimized')) return; xs.push(o.x, o.x + o.w); ys.push(o.y, o.y + o.h); });
    return { xs, ys };
  };
  const nearest = (v, list) => { let best = v, d = MAGNET; for (const c of list) { const dd = Math.abs(c - v); if (dd < d) { d = dd; best = c; } } return best; };
  if (window.interact && !small()) {
    interact('.c-window').draggable({
      allowFrom: '.c-window__bar', ignoreFrom: 'button',
      modifiers: [
        // Le coin haut gauche et le coin bas droit s'aimantent tous deux sur les bords voisins.
        interact.modifiers.snap({ range: Infinity, relativePoints: [{ x: 0, y: 0 }], targets: [(x, y, interaction) => {
          const w = wins.get(interaction.element.dataset.win), r = area.getBoundingClientRect(), { xs, ys } = edges(w);
          const lx = x - r.left, ly = y - r.top;
          let sx = nearest(lx, xs); if (sx === lx) { const rx = nearest(lx + w.w, xs); if (rx !== lx + w.w) sx = rx - w.w; }
          let sy = nearest(ly, ys); if (sy === ly) { const by = nearest(ly + w.h, ys); if (by !== ly + w.h) sy = by - w.h; }
          return { x: sx + r.left, y: sy + r.top };
        }] }),
        interact.modifiers.restrictRect({ restriction: area, elementRect: { left: 0, top: 0, right: 1, bottom: 1 } }),
      ],
      listeners: {
        start(e) { e.target.classList.remove('is-maximized'); },
        move(e) { const w = wins.get(e.target.dataset.win), r = area.getBoundingClientRect(); w.x = Math.round(e.rect.left - r.left); w.y = Math.round(e.rect.top - r.top); place(w); },
      },
    }).resizable({
      edges: { left: true, right: true, bottom: true, top: false }, margin: 9,
      modifiers: [
        interact.modifiers.snapEdges({ range: MAGNET, targets: [(x, y, interaction) => {
          const w = wins.get(interaction.element.dataset.win), r = area.getBoundingClientRect(), { xs, ys } = edges(w);
          return { x: nearest(x - r.left, xs) + r.left, y: nearest(y - r.top, ys) + r.top, range: MAGNET };
        }] }),
        interact.modifiers.restrictEdges({ outer: area }),
        interact.modifiers.restrictSize({ min: { width: 240, height: 140 } }),
      ],
      listeners: { move(e) { const w = wins.get(e.target.dataset.win), r = area.getBoundingClientRect(); e.target.classList.remove('is-maximized'); w.x = Math.round(e.rect.left - r.left); w.y = Math.round(e.rect.top - r.top); w.w = Math.round(e.rect.width); w.h = Math.round(e.rect.height); place(w); } },
    });
  }

  // ------------------------------------------------------------------ menu contextuel (un niveau de sous-menu)
  // entrées : { label, action, hint, signal, checked, disabled, sub: [...] } ou '-' pour un filet
  function showMenu(x, y, entries) {
    const build = (list) => list.map((e, i) => {
      if (e === '-') return '<hr class="c-menu__sep">';
      if (e.title) return `<div class="c-menu__label">${e.title}</div>`;
      const item = `<button class="c-menu__item${e.signal ? ' c-menu__item--signal' : ''}" type="button" role="menuitem"${e.checked ? ' aria-checked="true"' : ''}${e.disabled ? ' disabled' : ''}${e.sub ? ' aria-haspopup="menu"' : ''} data-i="${i}">${e.label}${e.sub ? '<i class="c-icon i-chevron-right" aria-hidden="true"></i>' : e.hint ? `<span class="c-menu__hint">${e.hint}</span>` : ''}</button>`;
      return e.sub ? `<div class="c-menu__sub" data-i="${i}">${item}<div class="c-menu__list" role="menu">${build(e.sub)}</div></div>` : item;
    }).join('');
    ctx.innerHTML = build(entries); ctx.hidden = false; ctx.classList.remove('is-left');
    const w = ctx.offsetWidth, h = ctx.offsetHeight;
    ctx.style.setProperty('--x', Math.max(4, Math.min(x, innerWidth - w - 4)) + 'px'); ctx.style.setProperty('--y', Math.max(4, Math.min(y, innerHeight - h - 4)) + 'px');
    // Près du bord droit, les sous-menus s'ouvrent à gauche.
    ctx.querySelectorAll('.c-menu__sub').forEach((s) => s.classList.toggle('c-menu__sub--left', x + w + 230 > innerWidth));
    ctx._entries = entries; ctx.querySelector('.c-menu__item:not(:disabled)')?.focus();
  }
  const hideMenu = () => { ctx.hidden = true; ctx.innerHTML = ''; };
  ctx.addEventListener('click', (e) => {
    const btn = e.target.closest('.c-menu__item'); if (!btn || btn.getAttribute('aria-haspopup')) return;
    const sub = btn.closest('.c-menu__sub .c-menu__list') ? btn.closest('.c-menu__sub') : null;
    const entry = sub ? ctx._entries[sub.dataset.i].sub[btn.dataset.i] : ctx._entries[btn.dataset.i];
    hideMenu(); entry.action?.();
  });
  ctx.addEventListener('keydown', (e) => {
    const list = document.activeElement.closest('.c-menu__list'), items = [...list.children].flatMap((c) => (c.matches('.c-menu__item') ? [c] : c.matches('.c-menu__sub') ? [c.firstElementChild] : [])).filter((b) => !b.disabled);
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'ArrowRight' && document.activeElement.getAttribute('aria-haspopup')) { e.preventDefault(); document.activeElement.nextElementSibling.querySelector('.c-menu__item').focus(); }
    else if (e.key === 'ArrowLeft' && list.parentElement.matches('.c-menu__sub')) { e.preventDefault(); list.parentElement.firstElementChild.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); hideMenu(); }
  });
  document.addEventListener('pointerdown', (e) => { if (!ctx.hidden && !ctx.contains(e.target)) hideMenu(); });
  addEventListener('blur', hideMenu); addEventListener('resize', hideMenu);

  const setTheme = (t) => { document.documentElement.dataset.theme = t; };
  area.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.c-canvas')) return;            // le canevas a son propre menu
    e.preventDefault();
    const theme = document.documentElement.dataset.theme, win = e.target.closest('.c-window');
    showMenu(e.clientX, e.clientY, [
      ...(win ? [{ title: wins.get(win.dataset.win).app.title }, { label: 'Agrandir', action: () => maximize(win.dataset.win) }, { label: 'Réduire', action: () => minimize(win.dataset.win) }, { label: 'Fermer', action: () => close(win.dataset.win) }, '-'] : []),
      { label: 'Ouvrir', sub: Object.entries(APPS).map(([id, a]) => ({ label: a.title, checked: wins.has(id), action: () => open(id) })) },
      { label: 'Ranger les fenêtres', action: tile },
      '-',
      { label: 'Thème', sub: [{ label: 'Encre', checked: theme !== 'papier', action: () => setTheme('encre') }, { label: 'Papier', checked: theme === 'papier', action: () => setTheme('papier') }] },
    ]);
  });

  // ------------------------------------------------------------------ canevas
  function initCanvas(body) {
    const canvas = $('.c-canvas', body), plane = $('.c-canvas__plane', body), coords = $('[data-coords]', body), count = $('[data-n]', body);
    const GRID = 16, view = { x: 32, y: 32, z: 1 }; let seq = 0, selected = null;
    const items = new Map();
    const applyView = () => { canvas.style.setProperty('--x', view.x + 'px'); canvas.style.setProperty('--y', view.y + 'px'); canvas.style.setProperty('--z', view.z); };
    const snap = (v) => Math.round(v / GRID) * GRID;
    const setSelected = (id) => { selected = id; items.forEach((it) => it.el.setAttribute('aria-selected', String(it.id === id))); };
    const KINDS = {
      barres: { label: 'Graphique en barres', w: 320, render(b) { b.style.height = '170px'; MonoCharts.bars(b, { data: MonoDemo.primes.slice(-10).map((d) => ({ ...d, signal: false })), unit: 'M', steps: 3, height: 170, labelAll: false }); } },
      courbes: { label: 'Courbes', w: 352, render(b) { b.style.height = '170px'; MonoCharts.lines(b, { labels: MonoDemo.mois, series: MonoDemo.indices.slice(0, 2), steps: 3, height: 170 }); } },
      tableau: { label: 'Tableau', w: 288, render(b) { b.innerHTML = `<table class="c-table c-table--dense"><thead><tr><th>Agence</th><th class="is-num">Primes</th></tr></thead><tbody>${AGENCES.slice(0, 4).map((a) => `<tr><th>${a.nom}</th><td class="is-num">${fr(a.primes)}</td></tr>`).join('')}</tbody></table>`; } },
      chiffre: { label: 'Chiffre clé', w: 192, render(b) { b.innerHTML = '<div class="c-stat c-stat--compact"><span class="c-stat__label">Primes totales</span><span class="c-stat__value">5 190<small>M</small></span><span class="c-stat__note">−3,2 % sur un an</span></div>'; } },
      note: { label: 'Note', w: 224, render(b) { b.innerHTML = '<p class="t-soft">Vérifier le repli de la branche vie avant la clôture.</p>'; } },
    };
    function add(kind, x, y) {
      const id = 'R' + String(++seq).padStart(2, '0'), k = KINDS[kind], el = document.createElement('article');
      el.className = 'c-canvas__item'; el.dataset.item = id; el.setAttribute('aria-selected', 'false');
      el.innerHTML = `<header class="c-canvas__head"><span>${k.label}</span><span>${id}</span></header><div class="c-canvas__body"></div>`;
      const it = { id, kind, el, x: snap(x), y: snap(y) };
      el.style.setProperty('--ix', it.x + 'px'); el.style.setProperty('--iy', it.y + 'px'); el.style.setProperty('--iw', k.w + 'px');
      plane.appendChild(el); items.set(id, it); k.render($('.c-canvas__body', el));
      count.textContent = items.size + (items.size > 1 ? ' objets' : ' objet'); setSelected(id); return it;
    }
    const remove = (id) => { items.get(id).el.remove(); items.delete(id); count.textContent = items.size + (items.size > 1 ? ' objets' : ' objet'); if (selected === id) selected = null; };
    const toPlane = (cx, cy) => { const r = canvas.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.z, y: (cy - r.top - view.y) / view.z }; };
    const setZoom = (zv) => { view.z = zv; applyView(); body.querySelectorAll('[data-zoom]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.zoom === zv))); };
    body.addEventListener('click', (e) => { const b = e.target.closest('[data-zoom]'); if (b) setZoom(+b.dataset.zoom); });
    canvas.addEventListener('pointermove', (e) => { const p = toPlane(e.clientX, e.clientY); coords.textContent = `x ${Math.round(p.x)} · y ${Math.round(p.y)}`; });
    canvas.addEventListener('pointerdown', (e) => { const el = e.target.closest('.c-canvas__item'); setSelected(el ? el.dataset.item : null); });
    canvas.addEventListener('keydown', (e) => { if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); remove(selected); } });

    if (window.interact) {
      // Le fond se saisit pour déplacer la vue ; un objet se déplace et s'aimante sur la grille.
      interact(canvas).draggable({ ignoreFrom: '.c-canvas__item', listeners: { start() { canvas.classList.add('is-panning'); }, move(e) { view.x += e.dx; view.y += e.dy; applyView(); }, end() { canvas.classList.remove('is-panning'); } } });
      interact('.c-canvas__item', { context: canvas }).draggable({ listeners: {
        start(e) { const it = items.get(e.target.dataset.item); it.fx = it.x; it.fy = it.y; plane.appendChild(e.target); },
        move(e) { const it = items.get(e.target.dataset.item); it.fx += e.dx / view.z; it.fy += e.dy / view.z; it.x = snap(it.fx); it.y = snap(it.fy); e.target.style.setProperty('--ix', it.x + 'px'); e.target.style.setProperty('--iy', it.y + 'px'); },
      } });
    }
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation();
      const el = e.target.closest('.c-canvas__item'), p = toPlane(e.clientX, e.clientY);
      if (el) setSelected(el.dataset.item);
      const addSub = Object.entries(KINDS).map(([k, v]) => ({ label: v.label, action: () => add(k, p.x, p.y) }));
      showMenu(e.clientX, e.clientY, el ? [
        { title: `${KINDS[items.get(el.dataset.item).kind].label} ${el.dataset.item}` },
        { label: 'Dupliquer', hint: '⌘ D', action: () => { const it = items.get(el.dataset.item); add(it.kind, it.x + GRID * 2, it.y + GRID * 2); } },
        { label: 'Mettre au premier plan', action: () => plane.appendChild(el) },
        { label: 'Remplacer par', sub: Object.entries(KINDS).map(([k, v]) => ({ label: v.label, checked: items.get(el.dataset.item).kind === k, action: () => { const it = items.get(el.dataset.item); remove(it.id); add(k, it.x, it.y); } })) },
        '-',
        { label: 'Supprimer', hint: 'Suppr', signal: true, action: () => remove(el.dataset.item) },
      ] : [
        { label: 'Ajouter', sub: addSub },
        { label: 'Zoom', sub: [0.75, 1, 1.5].map((zv) => ({ label: zv * 100 + ' %', checked: view.z === zv, action: () => setZoom(zv) })) },
        { label: 'Recentrer la vue', action: () => { view.x = 32; view.y = 32; applyView(); } },
        '-',
        { label: 'Tout supprimer', signal: true, disabled: !items.size, action: () => [...items.keys()].forEach(remove) },
      ]);
    });
    applyView();
    add('chiffre', 0, 0); add('barres', 224, 0); add('note', 576, 0); add('tableau', 576, 112);
    setSelected(null);
  }

  // Quand l'écran rétrécit, les fenêtres sont ramenées dans le bureau.
  addEventListener('resize', () => { const r = area.getBoundingClientRect(); wins.forEach((w) => { w.w = Math.min(w.w, r.width); w.h = Math.min(w.h, r.height); w.x = Math.max(0, Math.min(w.x, r.width - w.w)); w.y = Math.max(0, Math.min(w.y, r.height - w.h)); place(w); }); });

  // ------------------------------------------------------------------ démarrage
  ['agences', 'inspecteur', 'console', 'canevas'].forEach((id) => open(id));
  focus('agences');
})();
