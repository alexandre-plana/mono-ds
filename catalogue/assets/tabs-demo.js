/* Démonstration du gabarit à onglets.
   Un onglet = une page qui reste dans le document tant qu'il est ouvert : son panneau est
   masqué, jamais détruit. Filtre saisi, ligne ouverte, défilement et note en cours sont
   donc retrouvés tels quels. Les contenus ci-dessous sont À REMPLACER par les écrans réels. */
'use strict';
(() => {
  const MAP = [
    ['Réseau', [['Synthèse', 'Chiffres clés du trimestre', '5 190', 'M de primes'], ['Agences', '412 points de vente', '412', 'agences'], ['Branches', '4 branches régionales', '4', 'branches']]],
    ['Pilotage', [['Rapports', 'Annuel, trimestriels', '6', 'rapports'], ['Journal', 'Opérations et diagnostics', '128', 'entrées']]],
    ['Système', [['Réglages', 'Comptes, droits, sources', '3', 'sources']]],
  ];
  const PAGES = MAP.flatMap(([family, list]) => list.map(([name, desc, fig, label]) => ({ id: name, name, family, desc, fig, label })));
  const AGENCES = [['N-011', 'Chambéry', 'A. Perrin', '7,9', 'Actif', 'c-status--on'], ['N-014', 'Grenoble Centre', 'M. Delorme', '12,4', 'Actif', 'c-status--on'], ['N-015', 'Voiron', 'S. Garcin', '4,1', 'En cours', 'c-status--progress'], ['N-016', 'Vizille', 'L. Brun', '0,9', 'Fermeture', 'c-status--critical'], ['C-021', 'Clermont Jaude', 'P. Vidal', '9,8', 'Actif', 'c-status--on'], ['S-031', 'Avignon', 'J. Reynaud', '8,7', 'Actif', 'c-status--on']]
    .map(([ref, nom, resp, primes, etat, cls]) => ({ ref, nom, resp, primes, etat, cls }));
  const $ = (s, r = document) => r.querySelector(s);
  const norm = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // ---- onglets : les modules sont permanents, le reste s'ouvre et se ferme
  const tabs = PAGES.filter((p) => p.name !== 'Réglages').map((p) => ({ ...p, pinned: true }));
  let current = 'Agences', beside = null;
  const panels = new Map();
  const tab = (id) => tabs.find((t) => t.id === id);

  const kv = (rows) => `<dl class="c-kv c-kv--plain" style="max-width: 30rem">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const note = (label) => `<section class="l-stack" style="--gap: var(--space-4); max-width: 40rem"><h2 class="c-section-head"><span>Note</span><span class="c-section-head__aside">Conservée avec l'onglet</span></h2><div class="c-editable" style="align-items: flex-start"><textarea class="c-editable__input" rows="2" aria-label="${label}" placeholder="Écrire ici, changer d'onglet, revenir : le texte est toujours là."></textarea></div></section>`;
  function build(t) {
    const el = document.createElement('main');
    el.className = 'l-pane__body'; el.id = 'panel-' + norm(t.id).replace(/[^a-z0-9]+/g, '-'); el.setAttribute('role', 'tabpanel'); el.dataset.tab = t.id;
    if (t.agence) {
      const a = t.agence;
      el.innerHTML = `<div class="c-stat"><span class="c-stat__label">${a.ref}</span><span class="c-stat__value">${a.nom}</span><span class="c-stat__note"><span class="c-status ${a.cls}">${a.etat}</span></span></div>${kv([['Branche', 'Nord'], ['Responsable', a.resp], ['Primes', a.primes + ' M']])}${note('Note sur ' + a.nom)}`;
    } else if (t.id === 'Agences') {
      el.innerHTML = `<div class="l-split" style="align-items: flex-end"><h1 class="t-title"><span data-count>${AGENCES.length}</span> <span class="t-soft t-body">agences affichées</span></h1><button class="c-button c-button--primary" type="button"><i class="c-icon i-plus" aria-hidden="true"></i>Nouvelle agence</button></div>
        <label class="c-search" style="max-width: 22rem"><i class="c-icon i-search" aria-hidden="true"></i><input type="search" placeholder="Filtrer les agences" aria-label="Filtrer les agences" autocomplete="off"></label>
        <table class="c-table"><thead><tr><th>Réf.</th><th>Agence</th><th>Responsable</th><th>État</th><th class="is-num">Primes (M)</th></tr></thead><tbody></tbody></table>
        <div class="l-stack" data-detail hidden style="--gap: var(--space-6)"></div>`;
      const tbody = $('tbody', el), input = $('input', el);
      const draw = () => { const q = norm(input.value); const rows = AGENCES.filter((a) => !q || norm(a.nom + a.ref + a.resp).includes(q)); tbody.innerHTML = rows.map((a) => `<tr tabindex="0" data-ref="${a.ref}"><td class="t-muted u-nowrap">${a.ref}</td><th>${a.nom}</th><td>${a.resp}</td><td><span class="c-status ${a.cls}">${a.etat}</span></td><td class="is-num">${a.primes}</td></tr>`).join(''); $('[data-count]', el).textContent = rows.length; };
      input.addEventListener('input', draw); draw();
    } else {
      el.innerHTML = `<h1 class="t-title">${t.fig} <span class="t-soft t-body">${t.label}</span></h1><p class="t-soft" style="max-width: 46ch">${t.desc}.</p>${note('Note de la page ' + t.name)}`;
    }
    $('#panels').appendChild(el); panels.set(t.id, el); return el;
  }
  // Dans l'onglet Agences, ouvrir une ligne descend d'un niveau ; l'onglet s'en souvient.
  function setDetail(ref) {
    const el = panels.get('Agences'), box = $('[data-detail]', el), a = AGENCES.find((x) => x.ref === ref);
    el.dataset.detail = ref || '';
    [...el.children].forEach((c) => { c.hidden = c === box ? !a : !!a; });
    if (a) box.innerHTML = `<div class="c-stat"><span class="c-stat__label">${a.ref}</span><span class="c-stat__value">${a.nom}</span><span class="c-stat__note"><span class="c-status ${a.cls}">${a.etat}</span></span></div>${kv([['Branche', 'Nord'], ['Responsable', a.resp], ['Primes', a.primes + ' M']])}<div class="l-cluster"><button class="c-button" type="button" data-newtab="${a.ref}"><i class="c-icon i-external" aria-hidden="true"></i>Ouvrir dans un onglet</button></div>`;
    renderHead();
  }

  // ---- rangée d'onglets, avec débordement dans le menu « … »
  const list = $('#tablist'), bar = $('#tabs'), more = $('#more');
  const tabHtml = (t) => `<button class="c-doctabs__tab" type="button" role="tab" id="tab-${norm(t.id).replace(/[^a-z0-9]+/g, '-')}" data-tab="${t.id}" aria-selected="${t.id === current}" tabindex="${t.id === current ? 0 : -1}"><span class="c-doctabs__label">${t.name}</span>${t.pinned ? '' : `<span class="c-doctabs__close" data-close="${t.id}" role="button" aria-label="Fermer ${t.name}"><i class="c-icon i-close" aria-hidden="true"></i></span>`}</button>`;
  function renderTabs() {
    list.innerHTML = tabs.map(tabHtml).join(''); more.hidden = true;
    const nodes = [...list.children], room = () => bar.scrollWidth <= bar.clientWidth + 1;
    if (!room()) {
      more.hidden = false;
      // On retire des onglets par la droite — jamais le courant — jusqu'à ce que la rangée tienne.
      let hidden = [];
      for (let i = nodes.length - 1; i >= 0 && !room(); i--) { if (nodes[i].dataset.tab === current) continue; nodes[i].hidden = true; hidden.unshift(tabs[i]); $('#more-label').innerHTML = `… <span>${hidden.length}</span>`; }
      $('#more-label').setAttribute('aria-label', `${hidden.length} autre${hidden.length > 1 ? 's' : ''} onglet${hidden.length > 1 ? 's' : ''}`);
      $('#more-list').innerHTML = hidden.map((t) => `<button class="c-menu__item" type="button" role="menuitem" data-tab="${t.id}">${t.name}<span class="c-menu__hint">${t.family}</span></button>`).join('');
    }
    $('#tab-count').textContent = `${tabs.length} onglets`;
  }
  function renderHead() {
    const t = tab(current), detail = current === 'Agences' && panels.get('Agences')?.dataset.detail;
    const a = detail && AGENCES.find((x) => x.ref === detail);
    $('#crumbs').innerHTML = `<span>${t.family}</span>` + (t.agence ? `<a href="#" data-tab="Agences">Agences</a><span aria-current="page">${t.name}</span>` : a ? `<a href="#" data-up>${t.name}</a><span aria-current="page">${a.nom}</span>` : `<span aria-current="page">${t.name}</span>`);
    document.title = `${a ? a.nom : t.name} — ${t.family}`;
  }
  function activate(id) {
    const prev = panels.get(current); if (prev) prev.dataset.scroll = prev.scrollTop;
    current = id; if (beside === id) beside = null;
    const t = tab(id), el = panels.get(id) || build(t);
    panels.forEach((p) => { p.hidden = p !== el; });
    el.setAttribute('aria-labelledby', 'tab-' + norm(id).replace(/[^a-z0-9]+/g, '-'));
    el.scrollTop = +(el.dataset.scroll || 0);
    renderTabs(); renderHead(); renderBeside(); if (planOpen()) showPlan(false);
  }
  function openPage(id) { if (!tab(id)) tabs.push({ ...PAGES.find((p) => p.id === id), pinned: false }); activate(id); }
  function openAgence(a) { const id = 'agence:' + a.ref; if (!tab(id)) tabs.push({ id, name: a.nom, family: 'Réseau', agence: a, pinned: false }); activate(id); }
  function closeTab(id) { const i = tabs.findIndex((t) => t.id === id); if (i < 0 || tabs[i].pinned) return; tabs.splice(i, 1); panels.get(id)?.remove(); panels.delete(id); if (current === id) activate(tabs[Math.max(0, i - 1)].id); else renderTabs(); }

  // ---- page d'à côté et plan
  const plan = $('#plan'), page = $('#page'), planOpen = () => !plan.hidden;
  function renderBeside() {
    const p = beside && PAGES.find((x) => x.id === beside), aside = $('#beside');
    aside.hidden = !p || planOpen(); document.body.classList.toggle('l-desk--split', !!p && !planOpen());
    if (p) { $('#beside-family').textContent = p.family; $('#beside-title').textContent = p.name; $('#beside-hero').textContent = p.fig; $('#beside-label').textContent = p.label; $('#beside-desc').textContent = p.desc + '.'; }
  }
  function showPlan(on) {
    if (on) { let n = 0; plan.innerHTML = MAP.map(([g, l]) => `<div class="c-plan__group" role="group" aria-label="${g}">` + l.map(([name, d, fig, lab]) => `<article class="c-plan__page"${name === current ? ' aria-current="page"' : ''}><div class="c-plan__head"><span>${g}</span><span>${++n && name === current ? 'Vous êtes ici' : name === beside ? 'À côté' : tab(name) ? 'Ouvert' : String(n).padStart(2, '0')}</span></div><button class="c-plan__open" type="button" data-open="${name}">${name}</button><span class="c-plan__desc">${d}</span><div class="c-plan__foot"><span class="c-plan__figure">${fig}<small>${lab}</small></span>${name === current ? '' : `<button class="c-button c-button--quiet c-plan__beside" type="button" data-beside="${name}"><i class="c-icon i-panel" aria-hidden="true"></i>À côté</button>`}</div></article>`).join('') + '</div>').join(''); }
    plan.hidden = !on; page.hidden = on; $('#plan-open').setAttribute('aria-pressed', String(on)); renderBeside();
    if (on) (plan.querySelector('[aria-current] .c-plan__open') || plan.querySelector('.c-plan__open')).focus();
  }
  plan.addEventListener('keydown', (e) => {
    const o = [...plan.querySelectorAll('.c-plan__open')], i = o.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); o[(i + 1) % o.length].focus(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); o[(i - 1 + o.length) % o.length].focus(); }
  });

  // ---- console et « Aller à »
  const win = $('#console'), out = MonoConsole($('#log'), $('#cmd'), { onglets: () => tabs.forEach((t) => out.print(`${t.id === current ? '>' : ' '} ${t.name}${t.pinned ? '' : ' (ouvert à la demande)'}`)) });
  out.print('Session ouverte — M. Delorme'); out.print('412 agences chargées en 0,8 s');
  const toggleConsole = (open = win.hidden) => { win.hidden = !open; if (open) $('#cmd').focus(); };
  $('#console-close').addEventListener('click', () => toggleConsole(false));
  win.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleConsole(false); });
  const palette = MonoPalette({ entries: [
    ...PAGES.map((p) => ({ type: 'Écran', title: p.name, desc: p.desc, group: p.family, hint: p.family, go: () => openPage(p.id) })),
    ...AGENCES.map((a) => ({ type: 'Agence', title: a.nom, desc: a.resp, hint: a.ref, keywords: a.ref, go: () => openAgence(a) })),
    { type: 'Action', title: 'Voir le plan', desc: 'Toutes les pages de l\'application', hint: 'G', go: () => showPlan(true) },
    { type: 'Action', title: 'Ouvrir la console', desc: 'Journal et commandes', hint: 'C', go: () => toggleConsole(true) },
  ] });

  // ---- événements
  const closeMenus = (except) => document.querySelectorAll('.c-menu[open]').forEach((m) => { if (m !== except) m.open = false; });
  $('#goto').addEventListener('click', () => palette.open());
  $('#plan-open').addEventListener('click', () => showPlan(!planOpen()));
  $('#beside-close').addEventListener('click', () => { beside = null; renderBeside(); });
  $('#beside-swap').addEventListener('click', () => { const was = current, next = beside; openPage(next); beside = PAGES.some((p) => p.id === was) ? was : null; renderBeside(); });
  document.addEventListener('click', (e) => {
    if (e.target === document.body || e.target === plan) { closeMenus(); showPlan(!planOpen()); return; }
    const t = e.target.closest('[data-close], [data-tab], [data-open], [data-beside], [data-up], [data-newtab], [data-console], tr[data-ref]');
    if (t) {
      if (t.dataset.close) closeTab(t.dataset.close);
      else if (t.dataset.tab) { e.preventDefault(); activate(t.dataset.tab); }
      else if (t.dataset.open) openPage(t.dataset.open);
      else if (t.dataset.beside) { beside = t.dataset.beside; showPlan(false); }
      else if (t.dataset.up !== undefined) { e.preventDefault(); setDetail(null); }
      else if (t.dataset.newtab) { const a = AGENCES.find((x) => x.ref === t.dataset.newtab); setDetail(null); openAgence(a); }
      else if (t.dataset.console !== undefined) toggleConsole(true);
      else if (t.matches('tr[data-ref]')) setDetail(t.dataset.ref);
      closeMenus(); return;
    }
    closeMenus(e.target.closest('.c-menu'));
  });
  // Flèches gauche et droite dans la rangée d'onglets ; Suppr ferme un onglet ouvert à la demande.
  list.addEventListener('keydown', (e) => {
    const i = tabs.findIndex((t) => t.id === current);
    if (e.key === 'ArrowRight') { e.preventDefault(); activate(tabs[(i + 1) % tabs.length].id); list.querySelector('[aria-selected="true"]').focus(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); activate(tabs[(i - 1 + tabs.length) % tabs.length].id); list.querySelector('[aria-selected="true"]').focus(); }
    else if (e.key === 'Delete') { e.preventDefault(); closeTab(current); list.querySelector('[aria-selected="true"]').focus(); }
  });
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.querySelector('dialog[open]')) return;
    const k = e.key.toLowerCase();
    if (e.key === '/') { e.preventDefault(); closeMenus(); palette.open(); }
    else if (k === 'g') { e.preventDefault(); closeMenus(); showPlan(!planOpen()); }
    else if (k === 'c') { e.preventDefault(); toggleConsole(); }
    else if (e.key === 'Escape') { closeMenus(); if (planOpen()) showPlan(false); else if (current === 'Agences' && panels.get('Agences').dataset.detail) setDetail(null); }
  });
  new ResizeObserver(() => renderTabs()).observe(bar);
  activate(current);
})();
