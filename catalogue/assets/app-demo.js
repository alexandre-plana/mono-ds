/* Logique de démonstration commune aux deux gabarits d'application.
   MonoApp({ renderNav }) : le gabarit ne fournit que le dessin de sa navigation. */
'use strict';
window.MonoApp = ({ renderNav }) => {
  const MAP = [
    ['Réseau', [['Synthèse', 'Chiffres clés du trimestre', '5 190', 'M de primes', 'Exporter'], ['Agences', '412 points de vente', '412', 'agences', 'Nouvelle agence'], ['Branches', '4 branches régionales', '4', 'branches', 'Nouvelle branche']]],
    ['Pilotage', [['Rapports', 'Annuel, trimestriels', '6', 'rapports', 'Nouveau rapport'], ['Journal', 'Opérations et diagnostics', '128', 'entrées', 'Exporter']]],
    ['Système', [['Réglages', 'Comptes, droits, sources', '3', 'sources', 'Ajouter une source']]],
  ];
  const AGENCES = [['N-011', 'Chambéry', 'A. Perrin', '7,9'], ['N-014', 'Grenoble Centre', 'M. Delorme', '12,4'], ['N-015', 'Voiron', 'S. Garcin', '4,1'], ['N-016', 'Vizille', 'L. Brun', '0,9']].map(([ref, nom, resp, primes]) => ({ ref, nom, resp, primes }));
  const $ = (s) => document.querySelector(s);
  const here = { group: 'Réseau', screen: 'Agences' }; let detail = null, beside = null;
  const find = (screen) => MAP.flatMap(([g, screens]) => screens.map((sc) => [g, ...sc])).find(([, n]) => n === screen);
  const groupOf = (screen) => MAP.find(([, s]) => s.some(([n]) => n === screen))[0];

  function render() {
    const cur = MAP.find(([g]) => g === here.group)[1].find(([s]) => s === here.screen);
    renderNav(here, MAP, detail);
    $('#hero').textContent = detail ? detail.nom : cur[2]; $('#hero-label').textContent = detail ? detail.ref : cur[3];
    $('#action span').textContent = detail ? 'Modifier' : cur[4]; $('#action .c-icon').className = 'c-icon ' + (detail ? 'i-edit' : 'i-plus');
    // Le tableau n'existe que sur l'écran des agences ; un détail le remplace.
    document.querySelector('#screen > .l-grid').hidden = !!detail; $('#table').hidden = !!detail || here.screen !== 'Agences';
    const dl = $('#detail'); dl.hidden = !detail;
    if (detail) dl.innerHTML = `<div><dt>Branche</dt><dd>Nord</dd></div><div><dt>Responsable</dt><dd>${detail.resp}</dd></div><div><dt>Primes</dt><dd>${detail.primes} M</dd></div>`;
    document.title = `${detail ? detail.nom : here.screen} — ${here.group}`;
    // La page d'à côté : la bande de plan de travail sépare les deux, comme partout.
    const aside = $('#beside'); aside.hidden = !beside; document.body.classList.toggle('l-desk--split', !!beside);
    if (beside) { const [g, n, d, fig, lab] = find(beside); $('#beside-title').textContent = n; $('#beside-hero').textContent = fig; $('#beside-label').textContent = lab; $('#beside-desc').textContent = d + '.'; $('#beside-group').textContent = g; }
  }

  // ---- Plan : toutes les pages, posées sur le plan de travail.
  const plan = $('#plan'), page = $('#page');
  function drawPlan() {
    let n = 0;
    plan.innerHTML = MAP.map(([g, screens]) => `<div class="c-plan__group" role="group" aria-label="${g}">` + screens.map(([name, d, fig, lab]) => `<article class="c-plan__page"${name === here.screen ? ' aria-current="page"' : ''}>
      <div class="c-plan__head"><span>${g}</span><span>${++n && name === here.screen ? 'Vous êtes ici' : name === beside ? 'À côté' : String(n).padStart(2, '0')}</span></div>
      <button class="c-plan__open" type="button" data-screen="${name}">${name}</button>
      <span class="c-plan__desc">${d}</span>
      <div class="c-plan__foot"><span class="c-plan__figure">${fig}<small>${lab}</small></span>${name === here.screen ? '' : `<button class="c-button c-button--quiet c-plan__beside" type="button" data-beside="${name}"><i class="c-icon i-panel" aria-hidden="true"></i>À côté</button>`}</div></article>`).join('') + '</div>').join('');
  }
  const planOpen = () => !plan.hidden;
  function showPlan(on) {
    if (on) drawPlan();
    plan.hidden = !on; page.hidden = on; if (on) $('#beside').hidden = true; else render();
    document.body.classList.toggle('l-desk--split', !on && !!beside);
    if (on) (plan.querySelector('[aria-current] .c-plan__open') || plan.querySelector('.c-plan__open')).focus();
  }
  plan.addEventListener('keydown', (e) => {
    const opens = [...plan.querySelectorAll('.c-plan__open')], i = opens.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); opens[(i + 1) % opens.length].focus(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); opens[(i - 1 + opens.length) % opens.length].focus(); }
    else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); const name = opens[i].dataset.screen; if (name !== here.screen) { beside = name; showPlan(false); } }
  });
  const goScreen = (screen) => { here.screen = screen; here.group = groupOf(screen); detail = null; if (beside === screen) beside = null; planOpen() ? showPlan(false) : render(); };
  const goGroup = (group) => goScreen(MAP.find(([g]) => g === group)[1][0][0]);
  const goAgence = (a) => { here.screen = 'Agences'; here.group = 'Réseau'; detail = a; planOpen() ? showPlan(false) : render(); };

  // « Aller à » : écrans, agences et actions dans une même recherche.
  const out = MonoConsole($('#log'), $('#cmd'));
  const palette = MonoPalette({ entries: [
    ...MAP.flatMap(([g, screens]) => screens.map(([s, d]) => ({ type: 'Écran', title: s, desc: d, group: g, hint: g, go: () => goScreen(s) }))),
    ...AGENCES.map((a) => ({ type: 'Agence', title: a.nom, desc: a.resp, hint: a.ref, keywords: a.ref, go: () => goAgence(a) })),
    { type: 'Action', title: 'Nouvelle agence', desc: 'Créer une agence', keywords: 'creer ajouter', go: () => { goScreen('Agences'); $('#action').focus(); } },
    { type: 'Action', title: 'Exporter les agences', desc: 'Fichier CSV', keywords: 'telecharger export', go: () => { toggleConsole(true); out.print('Export écrit dans agences-2026-T3.csv (412 lignes)'); } },
    { type: 'Action', title: 'Voir le plan', desc: 'Toutes les pages de l\'application', hint: 'G', keywords: 'sommaire carte', go: () => showPlan(true) },
    { type: 'Action', title: 'Ouvrir la console', desc: 'Journal et commandes', hint: 'C', go: () => toggleConsole(true) },
  ] });

  // Console : une fenêtre, déplaçable par sa barre.
  const win = $('#console');
  out.print('Session ouverte — M. Delorme'); out.print('412 agences chargées en 0,8 s'); out.print('Référentiel des branches : 2 entrées sans responsable', 'warn');
  function toggleConsole(open = win.hidden) { win.hidden = !open; if (open) $('#cmd').focus(); }
  $('#console-close').addEventListener('click', () => toggleConsole(false));
  win.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleConsole(false); });
  { const bar = win.querySelector('.c-window__bar'); let start = null;
    bar.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; const r = win.getBoundingClientRect(); start = { dx: e.clientX - r.left, dy: e.clientY - r.top }; bar.setPointerCapture(e.pointerId); });
    bar.addEventListener('pointermove', (e) => { if (!start) return; Object.assign(win.style, { left: Math.max(0, Math.min(innerWidth - win.offsetWidth, e.clientX - start.dx)) + 'px', top: Math.max(0, Math.min(innerHeight - win.offsetHeight, e.clientY - start.dy)) + 'px', right: 'auto', bottom: 'auto' }); });
    bar.addEventListener('pointerup', () => { start = null; }); }

  const closeMenus = (except) => document.querySelectorAll('.c-menu[open]').forEach((m) => { if (m !== except) m.open = false; });
  $('#goto').addEventListener('click', () => palette.open());
  $('#beside-close').addEventListener('click', () => { beside = null; render(); });
  $('#beside-swap').addEventListener('click', () => { const was = here.screen; const next = beside; beside = was; goScreen(next); });
  document.addEventListener('click', (e) => {
    // Un clic sur le plan de travail lui-même ouvre ou referme le plan.
    if (e.target === document.body || e.target === plan) { closeMenus(); showPlan(!planOpen()); return; }
    const t = e.target.closest('[data-plan], [data-beside], [data-group], [data-screen], [data-open], [data-console], tr[data-ref]');
    if (t) {
      if (t.dataset.plan !== undefined) { closeMenus(); showPlan(!planOpen()); return; }
      if (t.dataset.beside) { beside = t.dataset.beside; showPlan(false); return; }
      if (t.matches('tr[data-ref]')) goAgence(AGENCES.find((a) => a.ref === t.dataset.ref));
      else { e.preventDefault(); if (t.dataset.console !== undefined) toggleConsole(true); else if (t.dataset.screen || t.dataset.open) goScreen(t.dataset.screen || t.dataset.open); else goGroup(t.dataset.group); }
      closeMenus(); return;
    }
    closeMenus(e.target.closest('.c-menu'));
  });
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.querySelector('dialog[open]')) return;
    const k = e.key.toLowerCase();
    if (e.key === '/') { e.preventDefault(); closeMenus(); palette.open(); }
    else if (k === 'g') { e.preventDefault(); closeMenus(); showPlan(!planOpen()); }
    else if (k === 'c') { e.preventDefault(); toggleConsole(); }
    else if (e.key === 'Escape') { closeMenus(); if (planOpen()) showPlan(false); else if (detail) { detail = null; render(); } }
  });
  render();
};
