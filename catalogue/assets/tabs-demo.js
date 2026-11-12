/* Démonstration du gabarit à onglets.

   Deux règles tiennent tout :
   1. Un onglet = une page qui reste dans le document tant qu'il est ouvert. Son panneau est
      masqué, jamais détruit : filtre saisi, défilement et note en cours sont retrouvés.
   2. L'inspecteur est DANS la page (l'espace seul le sépare) : il appartient à son onglet et le
      suit. Épinglé, il sort À CÔTÉ, hors de la page (le plan de travail le sépare), et ne dépend
      plus d'aucun onglet. L'image dit donc toujours la vérité.

   Les contenus ci-dessous sont À REMPLACER par les écrans réels. */
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
  const slug = (v) => norm(v).replace(/[^a-z0-9]+/g, '-');

  // ---- état : les onglets (modules permanents + ouverts à la demande), et la page d'à côté
  const tabs = PAGES.filter((p) => p.name !== 'Réglages').map((p) => ({ ...p, pinned: true }));
  let current = 'Agences';
  let side = null;                       // { kind: 'agence' | 'page', id } — global, hors onglets
  const panels = new Map();
  const tab = (id) => tabs.find((t) => t.id === id);

  const kv = (rows) => `<dl class="c-kv c-kv--plain" style="max-width: 30rem">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const note = (label, hint) => `<section class="l-stack" style="--gap: var(--space-4); max-width: 40rem"><h2 class="c-section-head"><span>Note</span><span class="c-section-head__aside">${hint}</span></h2><div class="c-editable" style="align-items: flex-start"><textarea class="c-editable__input" rows="2" aria-label="${label}" placeholder="Écrire ici, changer d'onglet, revenir : le texte est toujours là."></textarea></div></section>`;
  const fiche = (a) => `<div class="c-stat"><span class="c-stat__label">${a.ref}</span><span class="c-stat__value">${a.nom}</span><span class="c-stat__note"><span class="c-status ${a.cls}">${a.etat}</span></span></div>${kv([['Branche', 'Nord'], ['Responsable', a.resp], ['Primes', a.primes + ' M']])}`;

  function build(t) {
    const el = document.createElement('main');
    el.className = 'l-pane__body'; el.id = 'panel-' + slug(t.id); el.setAttribute('role', 'tabpanel'); el.dataset.tab = t.id;
    if (t.agence) el.innerHTML = fiche(t.agence) + note('Note sur ' + t.agence.nom, 'Conservée avec l\'onglet');
    else if (t.id === 'Agences') {
      el.innerHTML = `<div class="l-detail"><div class="l-detail__main"><div class="l-split" style="align-items: flex-end"><h1 class="t-title"><span data-count></span> <span class="t-soft t-body">agences affichées</span></h1><button class="c-button" type="button"><i class="c-icon i-plus" aria-hidden="true"></i>Nouvelle agence</button></div>
        <label class="c-search" style="max-width: 22rem"><i class="c-icon i-search" aria-hidden="true"></i><input type="search" placeholder="Filtrer les agences" aria-label="Filtrer les agences" autocomplete="off"></label>
        <table class="c-table"><thead><tr><th>Réf.</th><th>Agence</th><th>Responsable</th><th>État</th><th class="is-num">Primes (M)</th></tr></thead><tbody></tbody></table></div>
        <aside class="l-detail__aside" aria-label="Inspecteur" hidden></aside></div>`;
      $('input', el).addEventListener('input', drawAgences);
    } else el.innerHTML = `<h1 class="t-title">${t.fig} <span class="t-soft t-body">${t.label}</span></h1><p class="t-soft" style="max-width: 46ch">${t.desc}.</p>${note('Note de la page ' + t.name, 'Conservée avec l\'onglet')}`;
    $('#panels').appendChild(el); panels.set(t.id, el);
    if (t.id === 'Agences') drawAgences();
    return el;
  }
  // La ligne inspectée porte le contour : c'est l'inspecteur de CET onglet qui en dépend.
  function drawAgences() {
    const el = panels.get('Agences'); if (!el) return;
    const q = norm($('input', el).value), rows = AGENCES.filter((a) => !q || norm(a.nom + a.ref + a.resp).includes(q));
    $('tbody', el).innerHTML = rows.map((a) => `<tr tabindex="0" data-ref="${a.ref}" aria-selected="${el.dataset.inspect === a.ref}"><td class="t-muted u-nowrap">${a.ref}</td><th>${a.nom}</th><td>${a.resp}</td><td><span class="c-status ${a.cls}">${a.etat}</span></td><td class="is-num">${a.primes}</td></tr>`).join('');
    $('[data-count]', el).textContent = rows.length;
  }
  // Inspecteur attaché : dans le panneau de l'onglet, donc conservé et masqué avec lui.
  function inspect(ref, keep) {
    const el = panels.get('Agences') || build(tab('Agences')), box = $('.l-detail__aside', el), a = AGENCES.find((x) => x.ref === ref);
    if (a && el.dataset.inspect !== ref) box.innerHTML = `<div class="l-detail__head"><span class="t-micro">Inspecteur</span><span class="l-cluster" style="--gap: var(--space-1); flex-wrap: nowrap"><button class="c-button c-button--quiet" type="button" data-pin="${a.ref}"><i class="c-icon i-pin" aria-hidden="true"></i>Épingler</button><button class="c-button c-button--quiet" type="button" data-uninspect aria-label="Fermer l'inspecteur"><i class="c-icon i-close" aria-hidden="true"></i></button></span></div>${fiche(a)}${note('Note sur ' + a.nom, 'Suit l\'onglet')}`;
    if (a && keep) $('textarea', box).value = keep;
    el.dataset.inspect = a ? ref : ''; box.hidden = !a; $('.l-detail', el).classList.toggle('has-aside', !!a);
    drawAgences();
  }

  // ---- rangée d'onglets, avec débordement dans le menu « … »
  const list = $('#tablist'), bar = $('#tabs'), more = $('#more');
  const tabHtml = (t) => `<button class="c-doctabs__tab" type="button" role="tab" id="tab-${slug(t.id)}" data-tab="${t.id}" aria-selected="${t.id === current}" tabindex="${t.id === current ? 0 : -1}"><span class="c-doctabs__label">${t.name}</span>${t.pinned ? '' : `<span class="c-doctabs__close" data-close="${t.id}" role="button" aria-label="Fermer ${t.name}"><i class="c-icon i-close" aria-hidden="true"></i></span>`}</button>`;
  function renderTabs() {
    list.innerHTML = tabs.map(tabHtml).join(''); more.hidden = true;
    const nodes = [...list.children], room = () => bar.scrollWidth <= bar.clientWidth + 1;
    if (!room()) {
      more.hidden = false; const hidden = [];
      // On retire des onglets par la droite — jamais le courant — jusqu'à ce que la rangée tienne.
      for (let i = nodes.length - 1; i >= 0 && !room(); i--) { if (nodes[i].dataset.tab === current) continue; nodes[i].hidden = true; hidden.unshift(tabs[i]); $('#more-label').innerHTML = `… <span>${hidden.length}</span>`; }
      $('#more-label').setAttribute('aria-label', `${hidden.length} autre${hidden.length > 1 ? 's' : ''} onglet${hidden.length > 1 ? 's' : ''}`);
      $('#more-list').innerHTML = hidden.map((t) => `<button class="c-menu__item" type="button" role="menuitem" data-tab="${t.id}">${t.name}<span class="c-menu__hint">${t.family}</span></button>`).join('');
    }
    $('#tab-count').textContent = `${tabs.length} onglets`;
  }
  function renderHead() {
    const t = tab(current);
    $('#crumbs').innerHTML = `<span>${t.family}</span>` + (t.agence ? `<a href="#" data-tab="Agences">Agences</a><span aria-current="page">${t.name}</span>` : `<span aria-current="page">${t.name}</span>`);
    document.title = `${t.name} — ${t.family}`;
  }
  function activate(id) {
    const prev = panels.get(current); if (prev) prev.dataset.scroll = prev.scrollTop;
    current = id;
    const el = panels.get(id) || build(tab(id));
    panels.forEach((p) => { p.hidden = p !== el; });
    el.setAttribute('aria-labelledby', 'tab-' + slug(id)); el.scrollTop = +(el.dataset.scroll || 0);
    if (planOpen()) showPlan(false);
    renderSide(); renderTabs(); renderHead();          // ce qui est épinglé n'est PAS touché par le changement d'onglet
  }
  function openPage(id) { if (!tab(id)) tabs.push({ ...PAGES.find((p) => p.id === id), pinned: false }); if (side?.kind === 'page' && side.id === id) side = null; activate(id); }
  function openAgence(a) { const id = 'agence:' + a.ref; if (!tab(id)) tabs.push({ id, name: a.nom, family: 'Réseau', agence: a, pinned: false }); activate(id); }
  function closeTab(id) { const i = tabs.findIndex((t) => t.id === id); if (i < 0 || tabs[i].pinned) return; tabs.splice(i, 1); panels.get(id)?.remove(); panels.delete(id); if (current === id) activate(tabs[Math.max(0, i - 1)].id); else renderTabs(); }

  // ---- épinglé : global, hors de la page. On n'y arrive que par un geste volontaire.
  const plan = $('#plan'), page = $('#page'), planOpen = () => !plan.hidden;
  let sideKey = null;
  function renderSide() {
    const aside = $('#side'), on = !!side && !planOpen();
    aside.hidden = !on; document.body.classList.toggle('l-desk--split', on);
    const key = side ? side.kind + ':' + side.id : null;
    if (side && key !== sideKey) {          // on ne redessine que si le contenu change : sa saisie en cours est conservée
      if (side.kind === 'agence') { const a = AGENCES.find((x) => x.ref === side.id); $('#side-title').textContent = a.nom; $('#side-label').textContent = 'Épinglé'; $('#side-attach').hidden = false; $('#side-body').innerHTML = fiche(a) + note('Note sur ' + a.nom, 'Reste quand on change d\'onglet'); if (side.keep) $('#side-body textarea').value = side.keep; $('#side-origin').textContent = 'Agences'; $('#side-origin').dataset.tab = 'Agences'; }
      else { const p = PAGES.find((x) => x.id === side.id); $('#side-title').textContent = p.name; $('#side-label').textContent = 'À côté'; $('#side-attach').hidden = true; $('#side-body').innerHTML = `<h2 class="t-title">${p.fig} <span class="t-soft t-body">${p.label}</span></h2><p class="t-soft" style="max-width: 46ch">${p.desc}.</p>`; $('#side-origin').textContent = p.family; delete $('#side-origin').dataset.tab; }
    }
    sideKey = key; drawAgences();
  }
  const setSide = (next) => { side = next; if (planOpen()) showPlan(false); else renderSide(); renderTabs(); };
  function showPlan(on) {
    if (on) { let n = 0; plan.innerHTML = MAP.map(([g, l]) => `<div class="c-plan__group" role="group" aria-label="${g}">` + l.map(([name, d, fig, lab]) => `<article class="c-plan__page"${name === current ? ' aria-current="page"' : ''}><div class="c-plan__head"><span>${g}</span><span>${++n && name === current ? 'Vous êtes ici' : side?.kind === 'page' && side.id === name ? 'À côté' : tab(name) ? 'Ouvert' : String(n).padStart(2, '0')}</span></div><button class="c-plan__open" type="button" data-open="${name}">${name}</button><span class="c-plan__desc">${d}</span><div class="c-plan__foot"><span class="c-plan__figure">${fig}<small>${lab}</small></span>${name === current ? '' : `<button class="c-button c-button--quiet c-plan__beside" type="button" data-beside="${name}"><i class="c-icon i-panel" aria-hidden="true"></i>À côté</button>`}</div></article>`).join('') + '</div>').join(''); }
    plan.hidden = !on; page.hidden = on; $('#plan-open').setAttribute('aria-pressed', String(on)); renderSide(); if (!on) renderTabs();
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
    // Aller à une agence, c'est y aller : on passe sur l'onglet Agences et on l'inspecte là, dans son contexte.
    ...AGENCES.map((a) => ({ type: 'Agence', title: a.nom, desc: a.resp, hint: a.ref, keywords: a.ref, go: () => { activate('Agences'); inspect(a.ref); } })),
    { type: 'Action', title: 'Voir le plan', desc: 'Toutes les pages de l\'application', hint: 'G', go: () => showPlan(true) },
    { type: 'Action', title: 'Ouvrir la console', desc: 'Journal et commandes', hint: 'C', go: () => toggleConsole(true) },
  ] });

  // ---- événements
  const closeMenus = (except) => document.querySelectorAll('.c-menu[open]').forEach((m) => { if (m !== except) m.open = false; });
  $('#goto').addEventListener('click', () => palette.open());
  $('#plan-open').addEventListener('click', () => showPlan(!planOpen()));
  $('#side-close').addEventListener('click', () => setSide(null));
  // Rattacher : la fiche épinglée retourne dans sa page, avec ce qu'on y avait écrit.
  $('#side-attach').addEventListener('click', () => { const s = side, keep = $('#side-body textarea')?.value; side = null; activate('Agences'); inspect(s.id, keep); });
  $('#side-open').addEventListener('click', () => { const s = side; side = null; s.kind === 'agence' ? openAgence(AGENCES.find((a) => a.ref === s.id)) : openPage(s.id); });
  document.addEventListener('click', (e) => {
    if (e.target === document.body || e.target === plan) { closeMenus(); showPlan(!planOpen()); return; }
    const t = e.target.closest('[data-close], [data-tab], [data-open], [data-beside], [data-pin], [data-uninspect], [data-console], tr[data-ref]');
    if (t) {
      if (t.dataset.close) closeTab(t.dataset.close);
      else if (t.dataset.tab) { e.preventDefault(); activate(t.dataset.tab); }
      else if (t.dataset.open) openPage(t.dataset.open);
      else if (t.dataset.beside) setSide({ kind: 'page', id: t.dataset.beside });
      else if (t.dataset.console !== undefined) toggleConsole(true);
      else if (t.dataset.pin) { const keep = $('.l-detail__aside textarea', panels.get('Agences'))?.value; inspect(null); setSide({ kind: 'agence', id: t.dataset.pin, keep }); }   // épingler = sortir de la page
      else if (t.dataset.uninspect !== undefined) inspect(null);
      else if (t.matches('tr[data-ref]')) inspect(t.dataset.ref);                 // inspecter = dans la page, avec l'onglet
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
    else if (e.key === 'Escape') { closeMenus(); if (planOpen()) showPlan(false); else if (current === 'Agences' && panels.get('Agences').dataset.inspect) inspect(null); }
  });
  new ResizeObserver(() => renderTabs()).observe(bar);
  activate(current);
})();
