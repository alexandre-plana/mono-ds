/* Catalogue MONO — navigation, bascule de thème, extraits de code. */
(() => {
  'use strict';
  const root = document.body.dataset.root || './';
  const PAGES = [
    ['index.html', 'Présentation'],
    ['fondations.html', 'Fondations'],
    ['composition.html', 'Composition'],
    ['composants.html', 'Composants'],
    ['dataviz.html', 'Visualisations'],
    ['exemples.html', 'Exemples'],
  ];
  const EXAMPLES = [
    ['exemples/tableau-de-bord.html', 'Tableau de bord'],
    ['exemples/rapport.html', 'Rapport'],
    ['exemples/collection.html', 'Collection'],
    ['exemples/application.html', 'Application · chemin'],
    ['exemples/application-modules.html', 'Application · onglets'],
    ['exemples/connexion.html', 'Connexion'],
    ['exemples/bureau.html', 'Bureau'],
    ['exemples/carte.html', 'Carte'],
    ['exemples/plan.html', 'Plan'],
    ['exemples/kanban.html', 'Dossiers'],
    ['exemples/planches.html', 'Planches'],
  ];
  const here = location.pathname.replace(/\/$/, '/index.html');
  const isCurrent = (href) => here.endsWith('/catalogue/' + href) || here.endsWith('/' + href);

  // Thème : mémorisé par confort, la page fonctionne sans.
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('mono-theme', t); } catch {}
    document.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === t)));
    document.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.setTheme === t)));
    document.dispatchEvent(new CustomEvent('mono:theme', { detail: t }));
  };
  let saved = null;
  try { saved = localStorage.getItem('mono-theme'); } catch {}
  const forced = new URLSearchParams(location.search).get('theme');
  const initial = forced || saved || document.documentElement.dataset.theme || 'encre';

  // Le catalogue applique son propre gabarit : une application à parties séparées, donc des onglets
  // persistants au-dessus de la page, le fil d'Ariane en tête — et pas de rail. Ce qui vaut pour toute
  // l'application a sa propre ligne, au-dessus des onglets : le logo, la recherche — un vrai champ, qui
  // prend la largeur libre —, puis les notifications, le thème et les réglages. Tout s'y écrit en mots.
  const sys = document.createElement('div'); sys.className = 'cat-sys';
  sys.innerHTML = `<button class="c-logo" type="button" id="cat-logo" aria-haspopup="dialog" aria-label="Mono — le logo" style="appearance: none; background: none; border: 0; padding: 0; cursor: pointer">Mono</button>
    <div id="cat-search" class="cat-search" role="search"></div>
    <div class="cat-sys__tools">
      <details class="c-menu c-menu--end" id="cat-notifs"><summary class="c-button c-button--quiet">Notifications<span class="g-bracket" data-badge hidden></span></summary><div class="c-menu__list c-notifs" aria-label="Notifications"></div></details>
      <div class="c-segmented" role="group" aria-label="Thème"><button class="c-segmented__item" type="button" data-set-theme="encre">Encre</button><button class="c-segmented__item" type="button" data-set-theme="papier">Papier</button></div>
      <details class="c-menu c-menu--end" id="cat-settings"><summary class="c-button c-button--quiet">Réglages</summary>
        <div class="c-menu__list" role="menu" aria-label="Réglages"><span class="c-menu__label">Accent — comment le signal se montre</span>
          <button class="c-menu__item" type="button" role="menuitemradio" data-set-accent="discret">Discret <span class="c-menu__hint">En trait</span></button>
          <button class="c-menu__item" type="button" role="menuitemradio" data-set-accent="fort">Fort <span class="c-menu__hint">En aplat</span></button>
          <button class="c-menu__item" type="button" role="menuitemradio" data-set-accent="flash">Flash <span class="c-menu__hint">Aplat à l'arrivée</span></button>
          <hr class="c-menu__sep">
          <button class="c-menu__item c-menu__item--check" type="button" role="menuitemcheckbox" data-toggle-grain>Grain <span class="c-menu__hint" aria-hidden="true"></span></button>
        </div></details>
    </div>`;
  const tabs = document.createElement('nav'); tabs.className = 'c-doctabs'; tabs.setAttribute('aria-label', 'Catalogue');
  tabs.innerHTML = PAGES.map(([href, label]) => `<a class="c-doctabs__tab" href="${root}${href}"${isCurrent(href) ? ' aria-current="page"' : ''}><span class="c-doctabs__label">${label}</span></a>`).join('');
  document.body.classList.add('l-desk--tabs', 'cat-has-sys'); document.body.prepend(sys, tabs);
  document.addEventListener('click', (e) => { document.querySelectorAll('.c-menu[open]').forEach((m) => { if (!m.contains(e.target) || e.target.closest('.c-menu__item:not(.c-menu__item--check)')) m.open = false; }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.c-breadcrumb__seg[open], .cat-sys .c-menu[open]').forEach((m) => { m.open = false; }); });
  // Notifications : un réglage changé est une action réversible — elle s'exécute, puis offre son annulation
  // (toast, et centre ouvert depuis cette ligne). Le journal vit le temps de la page.
  const toasts = document.createElement('div'); toasts.className = 'c-toasts'; toasts.setAttribute('aria-live', 'polite'); document.body.append(toasts);
  let notifs = null; const bootNotifs = () => { notifs = window.MonoNotifs({ toasts, center: sys.querySelector('.c-notifs'), badge: sys.querySelector('[data-badge]') }); };
  addEventListener('load', () => { if (window.MonoNotifs) bootNotifs(); else { const sc = document.createElement('script'); sc.src = root + 'assets/notifs.js'; sc.onload = bootNotifs; document.head.append(sc); } });
  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && toasts.childElementCount && notifs?.undoLast()) e.preventDefault(); });
  // Un exemple ouvert dans l'onglet Exemples suit les réglages choisis ici.
  const frame = () => document.querySelector('iframe.cat-frame')?.contentDocument?.documentElement;
  document.addEventListener('mono:theme', (e) => { const d = frame(); if (d) d.dataset.theme = e.detail; });
  document.addEventListener('mono:accent', (e) => { const d = frame(); if (d) { if (e.detail === 'discret') delete d.dataset.accent; else d.dataset.accent = e.detail; } });

  // Le logo : une grande modale, pas une page — on y entre et on en sort sans perdre sa place.
  let logoDlg = null;
  document.getElementById('cat-logo').addEventListener('click', () => {
    if (!logoDlg) {
      logoDlg = document.createElement('dialog'); logoDlg.className = 'c-dialog c-dialog--large'; logoDlg.setAttribute('aria-labelledby', 'cat-logo-title');
      logoDlg.innerHTML = `<h3 class="c-dialog__title" id="cat-logo-title">Le logo</h3>
        <div class="c-dialog__body">
          <canvas id="cat-logo-anim" style="display: block; width: 100%; height: 13rem" role="img" aria-label="Le logo MONO s'écrit lettre par lettre ; le curseur devient le point de signal"></canvas>
          <p>Le nom, composé comme le titre courant de chaque page, puis un carré de quatre pixels en signal. Le curseur qui l'écrit devient le point.</p>
          <dl class="c-kv c-kv--plain" style="max-width: 34rem"><div><dt>Caractère</dt><dd>IBM Plex Mono, capitales, 0,42 em</dd></div><div><dt>Point</dt><dd>4 px, en signal, toujours</dd></div><div><dt>Tailles</dt><dd>de 13 à 24 px</dd></div><div><dt>Classe</dt><dd>.c-logo, .c-logo--plain sans point</dd></div></dl>
        </div>
        <form method="dialog" class="c-dialog__actions"><span class="c-dialog__aside"><kbd class="c-kbd">Échap</kbd></span><a class="c-button c-button--quiet" href="${root}logo.html">Fiche complète</a><button class="c-button" type="submit" autofocus>Fermer</button></form>`;
      document.body.append(logoDlg);
      const sc = document.createElement('script'); sc.src = root + 'assets/logo-anim.js'; sc.onload = () => { logoDlg.anim = window.MonoLogo(logoDlg.querySelector('canvas'), { size: 26 }); }; document.head.append(sc);
    } else logoDlg.anim?.restart();
    logoDlg.showModal();
  });

  // ---- Organisation d'une page : une marge à gauche, une chose à la fois à droite.
  // La marge est le sommaire de la page : toutes les rubriques y sont, repliées sur leur seul nom ; celle
  // qu'on lit est ouverte sur ses éléments. Elle reste en place quand on défile, et se tient en ton éteint
  // tant qu'on ne s'en approche pas : pendant la lecture, il n'y a presque rien à côté du texte.
  // À droite, la rubrique (ou l'élément, quand la rubrique en compte au moins trois) s'affiche seule.
  const shell = document.querySelector('.l-shell'), sections = [...document.querySelectorAll('.cat-section[id]')], intro = document.querySelector('.cat-intro');
  const rail = document.querySelector('.cat-rail'), margin = document.getElementById('cat-nav');
  const crumb = document.querySelector('.c-breadcrumb--head'), crumb0 = crumb?.innerHTML, pageName = crumb?.querySelector('[aria-current]')?.textContent || document.title;
  const label = (sec) => sec.dataset.title || sec.querySelector('.c-section-head span:nth-child(2)')?.textContent || sec.id;
  const short = (sub) => (sub.querySelector('h3')?.textContent || sub.id).split(' — ')[0];
  const paged = sections.length > 1 && intro && rail && margin;
  const views = [];   // l'ordre de lecture : une rubrique entière, ou un élément
  if (paged) {
    sections.forEach((sec) => {
      sec.subs = [...sec.querySelectorAll(':scope > .cat-sub[id]')]; sec.split = sec.subs.length >= 3; sec.first = sec.split ? sec.subs[0] : sec;
      if (sec.split) sec.subs.forEach((sub) => views.push({ el: sub, sec, name: short(sub) })); else views.push({ el: sec, sec, name: label(sec) });
    });
    rail.classList.add('cat-rail--margin'); rail.before(intro);
    margin.className = 'cat-margin'; margin.setAttribute('aria-label', 'Dans cette page');
    margin.innerHTML = sections.map((sec) => `<a class="cat-margin__sec" href="#${sec.first.id}" data-sec="${sec.id}">${label(sec)}</a>` + (sec.split ? `<div class="cat-margin__subs" hidden>${sec.subs.map((sub) => `<a href="#${sub.id}">${short(sub)}</a>`).join('')}</div>` : '')).join('');
    views.forEach((v, i) => {
      const prev = views[i - 1], next = views[i + 1], f = document.createElement('nav'); f.className = 'cat-next'; f.setAttribute('aria-label', 'Lire dans l’ordre');
      f.innerHTML = (next ? `<a href="#${next.el.id}"><span class="t-micro">Suite</span><span>${next.name}</span><i class="c-icon i-arrow-right" aria-hidden="true"></i></a>` : '') + (prev ? `<a href="#${prev.el.id}"><span class="t-micro">Avant</span><span>${prev.name}</span></a>` : '');
      v.el.append(f);
    });
  }
  // Dans une démonstration, un lien d'ancre ne fait pas quitter la vue.
  document.addEventListener('click', (e) => { if (e.target.closest('.cat-demo a[href^="#"]')) e.preventDefault(); });
  const key = 'mono-scroll:' + location.pathname;
  const go = (id, first) => {
    if (!paged) { if (!first && id) document.getElementById(id)?.scrollIntoView({ block: 'start' }); return; }
    const el = id ? document.getElementById(id) : null, root = !el?.closest('.cat-section'), sec = el?.closest('.cat-section') || sections[0];
    const sub = sec.split ? sec.subs.find((x) => x.contains(el)) || sec.subs[0] : null;
    intro.hidden = !root;
    sections.forEach((x) => { x.hidden = x !== sec; });
    if (sec.split) sec.subs.forEach((x) => { x.hidden = x !== sub; });
    sec.classList.toggle('is-leaf', !!sub);
    margin.querySelectorAll('.cat-margin__sec').forEach((a) => { const on = a.dataset.sec === sec.id; on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); const subs = a.nextElementSibling; if (subs?.classList.contains('cat-margin__subs')) subs.hidden = !on; });
    margin.querySelectorAll('.cat-margin__subs a').forEach((a) => (sub && a.getAttribute('href') === '#' + sub.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (crumb) crumb.innerHTML = root ? crumb0 : crumb0.replace(/<span aria-current="page">[^<]*<\/span>/, `<a href="#">${pageName}</a>`) + (sub ? `<a href="#${sec.first.id}">${label(sec)}</a><span aria-current="page">${short(sub)}</span>` : `<span aria-current="page">${label(sec)}</span>`);
    if (first) return;
    if (el && el !== sec && el !== sub) el.scrollIntoView({ block: 'start' }); else if (shell) shell.scrollTop = 0;
  };
  if (sections.length) { go(location.hash.slice(1), true); if (location.hash) requestAnimationFrame(() => go(location.hash.slice(1))); }
  addEventListener('hashchange', () => go(location.hash.slice(1)));
  // Un onglet garde l'état de sa page : on retrouve la rubrique et le défilement où on les avait laissés.
  if (shell && !location.hash) { try { const sv = JSON.parse(sessionStorage.getItem(key) || 'null'); if (sv?.hash) { history.replaceState(null, '', sv.hash); go(sv.hash.slice(1), true); } if (sv) shell.scrollTop = sv.top || 0; } catch {} }
  addEventListener('pagehide', () => { try { sessionStorage.setItem(key, JSON.stringify({ top: shell.scrollTop, hash: location.hash })); } catch {} });
  const NAME = { encre: 'Thème encre', papier: 'Thème papier', discret: 'Accent discret', fort: 'Accent fort', flash: 'Accent flash' };
  document.querySelectorAll('[data-set-theme]').forEach((b) => b.addEventListener('click', () => { const prev = document.documentElement.dataset.theme, next = b.dataset.setTheme; if (prev === next) return; setTheme(next); notifs?.push({ kind: 'Réglage', text: NAME[next], undo: () => setTheme(prev) }); }));
  // Accent : discret (défaut), fort (le signal en aplat) ou flash (l'aplat à l'arrivée, puis discret).
  const setAccent = (a) => {
    if (a === 'fort' || a === 'flash') document.documentElement.dataset.accent = a; else { a = 'discret'; delete document.documentElement.dataset.accent; }
    try { localStorage.setItem('mono-accent', a); } catch {}
    document.querySelectorAll('[data-set-accent]').forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.setAccent === a)); b.setAttribute('aria-checked', String(b.dataset.setAccent === a)); });
    document.dispatchEvent(new CustomEvent('mono:accent', { detail: a }));
  };
  let savedAccent = null; try { savedAccent = localStorage.getItem('mono-accent'); } catch {}
  setAccent(new URLSearchParams(location.search).get('accent') || savedAccent || 'discret');
  document.querySelectorAll('[data-set-accent]').forEach((b) => b.addEventListener('click', () => { const prev = document.documentElement.dataset.accent || 'discret', next = b.dataset.setAccent; if (prev === next) return; setAccent(next); notifs?.push({ kind: 'Réglage', text: NAME[next], undo: () => setAccent(prev) }); }));
  setTheme(initial);

  const syncFrameGrain = () => {
    const example = frame();
    if (example) example.dataset.grain = document.documentElement.dataset.grain;
  };
  const grainToggle = sys.querySelector('[data-toggle-grain]');
  const grainHint = grainToggle.querySelector('.c-menu__hint');
  const showGrain = (grain) => {
    grainToggle.setAttribute('aria-checked', String(grain === 'on'));
    grainHint.textContent = grain === 'on' ? 'Activé' : 'Désactivé';
  };
  const setGrain = (grain) => {
    document.documentElement.dataset.grain = grain;
    try { localStorage.setItem('mono-grain', grain); } catch {}
    showGrain(grain);
    syncFrameGrain();
  };
  const changeGrain = (grain) => {
    const previous = document.documentElement.dataset.grain;
    if (previous === grain) return;
    setGrain(grain);
    notifs?.push({ kind: 'Réglage', text: grain === 'on' ? 'Grain activé' : 'Grain désactivé', undo: () => setGrain(previous) });
  };
  showGrain(document.documentElement.dataset.grain);
  grainToggle.addEventListener('click', () => changeGrain(document.documentElement.dataset.grain === 'on' ? 'off' : 'on'));
  document.querySelector('iframe.cat-frame')?.addEventListener('load', syncFrameGrain);

  // ---------------------------------------------------------------------------
  // Recherche avancée : texte libre + filtres par rubrique et par type.
  // L'index (search-index.js) est généré par scripts/build-search-index.mjs.
  //   plusieurs mots = tous requis · "expression exacte" · -mot = exclure
  //   .c-button, --fg-muted, S2 : classes, tokens et codes de règle sont indexés
  // ---------------------------------------------------------------------------
  const host = document.getElementById('cat-search');
  const INDEX = window.MonoSearchIndex;
  if (host && INDEX) {
    const TYPES = [['regle', 'Règle'], ['composant', 'Composant'], ['token', 'Token'], ['rubrique', 'Rubrique'], ['exemple', 'Exemple']];
    const TYPE_LABEL = Object.fromEntries(TYPES);
    const norm = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'");
    const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const entries = INDEX.entries.map((e, i) => ({ ...e, i, page: e.p < 0 ? 'Exemples' : INDEX.pages[e.p][1], href: root + (e.u ? e.u.replace(/^exemples\/([a-z-]+)\.html$/, 'exemples.html?e=$1') : INDEX.pages[e.p][0] + (e.id ? '#' + e.id : '')), nt: norm(e.t), nc: norm(e.c), nk: norm(e.k), nx: norm(e.x) }));
    const RUBRIQUES = [...INDEX.pages.map((p) => p[1]), 'Exemples'];

    host.innerHTML = `
      <label class="c-search">
        <i class="c-icon i-search" aria-hidden="true"></i>
        <input type="search" id="cat-q" autocomplete="off" spellcheck="false" placeholder="Rechercher une page, un composant, une règle, un token" aria-label="Rechercher dans le catalogue" role="combobox" aria-expanded="false" aria-controls="cat-results" aria-autocomplete="list">
        <span class="c-kbd" aria-hidden="true">/</span>
      </label>
      <div class="cat-search__panel" hidden>
        <div class="cat-search__filters">
          <div class="cat-search__group" role="group" aria-label="Filtrer par rubrique"><span class="t-micro">Rubrique</span>${RUBRIQUES.map((r) => `<button class="c-chip" type="button" aria-pressed="false" data-rub="${r}">${r} <span class="c-chip__count"></span></button>`).join('')}</div>
          <div class="cat-search__group" role="group" aria-label="Filtrer par type"><span class="t-micro">Type</span>${TYPES.map(([k, l]) => `<button class="c-chip" type="button" aria-pressed="false" data-type="${k}">${l} <span class="c-chip__count"></span></button>`).join('')}</div>
        </div>
        <div class="cat-search__status t-micro" role="status" aria-live="polite"></div>
        <div class="cat-search__results" id="cat-results" role="listbox" aria-label="Résultats"></div>
        <div class="cat-search__help t-micro"><span><span class="c-kbd">↑</span> <span class="c-kbd">↓</span> naviguer</span><span><span class="c-kbd">↵</span> ouvrir</span><span><span class="c-kbd">esc</span> fermer</span><span>"expression exacte"</span><span>-exclure</span><span>.c-classe</span><span>--token</span></div>
      </div>`;
    const input = host.querySelector('input'), panel = host.querySelector('.cat-search__panel');
    const results = host.querySelector('.cat-search__results'), status = host.querySelector('.cat-search__status');
    const state = { rub: new Set(), type: new Set(), active: -1, shown: [] };
    // L'affichage se règle ici aussi : ce sont des commandes, trouvées comme le reste.
    const CMDS = [['theme', 'encre', 'Thème encre', 'Fond sombre'], ['theme', 'papier', 'Thème papier', 'Fond clair'], ['accent', 'discret', 'Accent discret', 'Le signal en trait'], ['accent', 'fort', 'Accent fort', 'Le signal en aplat'], ['accent', 'flash', 'Accent flash', 'L’aplat à l’arrivée, puis discret'], ['grain', 'on', 'Activer le grain', 'Fond texturé'], ['grain', 'off', 'Désactiver le grain', 'Fond uni']]
      .map(([kind, val, t, x]) => ({ cmd: kind, val, t, x, n: norm(t + ' affichage apparence ' + x) }));
    const applySetting = { theme: setTheme, accent: setAccent, grain: changeGrain };
    const cmdOn = (c) => (document.documentElement.dataset[c.cmd] ?? (c.cmd === 'accent' ? 'discret' : '')) === c.val;

    const parse = (q) => {
      const inc = [], exc = [];
      for (const m of q.matchAll(/(-?)"([^"]+)"|(\S+)/g)) {
        let term = m[2] ?? m[3], neg = m[1] === '-';
        if (m[3] && term.length > 1 && term[0] === '-' && term[1] !== '-') { neg = true; term = term.slice(1); }
        term = norm(term.replace(/^"|"$/g, ''));
        if (term) (neg ? exc : inc).push(term);
      }
      return { inc, exc };
    };
    const scoreOf = (e, inc) => {
      let total = 0;
      for (const t of inc) {
        let s = 0;
        if (e.nc && e.nc === t) s = 120;
        else if (e.nt === t) s = 110;
        else if (e.nt.startsWith(t)) s = 90;
        else if (e.nt.includes(t)) s = 70;
        else if (e.nk.split(' ').some((k) => k === t || k === '.' + t)) s = 60;
        else if (e.nk.includes(t)) s = 40;
        else if (e.nx.includes(t)) s = 15;
        else return 0;
        total += s;
      }
      return total + (e.y === 'composant' ? 6 : e.y === 'regle' ? 4 : e.y === 'rubrique' ? 2 : 0);
    };
    const hay = (e) => e.nt + ' ' + e.nc + ' ' + e.nk + ' ' + e.nx;
    // Surligne les termes dans un texte, en retrouvant les positions sur la forme normalisée.
    const mark = (raw, inc) => {
      if (!inc.length) return esc(raw);
      const n = norm(raw);
      if (n.length !== raw.length) return esc(raw);
      const hits = [];
      for (const t of inc) for (let i = n.indexOf(t); i >= 0; i = n.indexOf(t, i + t.length)) hits.push([i, i + t.length]);
      hits.sort((a, b) => a[0] - b[0]);
      let out = '', pos = 0;
      for (const [a, b] of hits) { if (a < pos) continue; out += esc(raw.slice(pos, a)) + '<mark>' + esc(raw.slice(a, b)) + '</mark>'; pos = b; }
      return out + esc(raw.slice(pos));
    };
    const excerpt = (e, inc) => {
      const n = e.nx, first = inc.map((t) => n.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
      let start = first > 60 ? e.x.lastIndexOf(' ', first - 40) + 1 : 0;
      let text = e.x.slice(start, start + 150);
      if (start + 150 < e.x.length) text = text.slice(0, text.lastIndexOf(' ')) + ' …';
      return (start ? '… ' : '') + mark(text, inc);
    };

    const render = () => {
      const { inc, exc } = parse(input.value);
      const matched = entries.map((e) => ({ e, s: inc.length ? scoreOf(e, inc) : 1 })).filter(({ e, s }) => s > 0 && !exc.some((t) => hay(e).includes(t)));
      // Compteurs à facettes : chaque groupe compte selon le texte et l'autre groupe.
      const inRub = (e) => !state.rub.size || state.rub.has(e.page), inType = (e) => !state.type.size || state.type.has(e.y);
      host.querySelectorAll('[data-rub]').forEach((b) => { const n = matched.filter(({ e }) => e.page === b.dataset.rub && inType(e)).length; b.querySelector('.c-chip__count').textContent = n; b.disabled = !n && b.getAttribute('aria-pressed') !== 'true'; });
      host.querySelectorAll('[data-type]').forEach((b) => { const n = matched.filter(({ e }) => e.y === b.dataset.type && inRub(e)).length; b.querySelector('.c-chip__count').textContent = n; b.disabled = !n && b.getAttribute('aria-pressed') !== 'true'; });
      const browsing = !inc.length && !state.rub.size && !state.type.size;
      host.classList.toggle('is-browsing', browsing);
      let list = matched.filter(({ e }) => inRub(e) && inType(e));
      if (browsing) list = list.filter(({ e }) => e.y === 'rubrique' && !e.s || e.y === 'exemple');
      list.sort((a, b) => b.s - a.s || a.e.i - b.e.i);
      const total = list.length;
      list = list.slice(0, 60);
      // Regroupement par rubrique ; la rubrique du meilleur résultat passe en tête,
      // pour que l'ordre affiché soit aussi l'ordre du clavier.
      const best = (r) => Math.max(0, ...list.filter(({ e }) => e.page === r).map(({ s }) => s));
      const order = browsing || !inc.length ? RUBRIQUES : [...RUBRIQUES].sort((a, b) => best(b) - best(a));
      const groups = order.map((r) => [r, list.filter(({ e }) => e.page === r)]).filter(([, g]) => g.length);
      const cmds = state.rub.size || state.type.size ? [] : CMDS.filter((c) => inc.every((t) => c.n.includes(t)) && !exc.some((t) => c.n.includes(t)));
      state.shown = [...cmds, ...groups.flatMap(([, g]) => g.map(({ e }) => e))];
      const cmdHtml = () => (cmds.length ? `<div class="cat-search__heading"><span>Affichage</span><span>${cmds.length}</span></div>` + cmds.map((c) => { const pos = state.shown.indexOf(c); return `<button type="button" class="cat-result" role="option" id="cat-opt-${pos}" data-pos="${pos}" data-cmd="${c.cmd}" data-val="${c.val}" aria-selected="${pos === state.active}"><span class="cat-result__type">Réglage</span><span class="cat-result__main"><span class="cat-result__title">${mark(c.t, inc)}</span><span class="cat-result__text">${c.x}</span></span><span class="cat-result__where">${cmdOn(c) ? 'En vigueur' : ''}</span></button>`; }).join('') : '');
      state.active = inc.length && state.shown.length ? 0 : -1;
      status.textContent = browsing ? ''
        : total ? `${total} résultat${total > 1 ? 's' : ''}${total > 60 ? ' — 60 affichés, préciser la recherche' : ''}` : '';
      if (!total && !cmds.length) {
        results.innerHTML = `<div class="c-empty c-empty--plain"><span class="c-empty__label">Aucun résultat</span><div class="c-empty__title">Rien ne correspond à « ${esc(input.value.trim())} »</div><p class="c-empty__text">Essayez un mot plus court, une classe (.c-card), un token (--fg) ou retirez un filtre.</p>${state.rub.size || state.type.size ? '<div class="c-empty__actions"><button class="c-button" type="button" data-reset>Retirer les filtres</button></div>' : ''}</div>`;
        return;
      }
      let html = cmdHtml();
      for (const [r, group] of groups) {
        html += `<div class="cat-search__heading"><span>${r}</span><span>${group.length}</span></div>`;
        for (const { e } of group) {
          const pos = state.shown.indexOf(e);
          html += `<a class="cat-result" role="option" id="cat-opt-${pos}" data-pos="${pos}" href="${e.href}" aria-selected="${pos === state.active}">
            <span class="cat-result__type">${TYPE_LABEL[e.y]}</span>
            <span class="cat-result__main"><span class="cat-result__title">${e.c ? `<span class="cat-result__code">${mark(e.c, inc)}</span>` : ''}${mark(e.t, inc)}</span>${e.x ? `<span class="cat-result__text">${excerpt(e, inc)}</span>` : ''}</span>
            <span class="cat-result__where">${esc(e.s || '')}</span></a>`;
        }
      }
      results.innerHTML = html;
    };
    const open = () => { if (!panel.hidden) return; panel.hidden = false; input.setAttribute('aria-expanded', 'true'); render(); };
    const close = () => { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const setActive = (pos) => {
      if (!state.shown.length) return;
      state.active = (pos + state.shown.length) % state.shown.length;
      results.querySelectorAll('.cat-result').forEach((a) => a.setAttribute('aria-selected', String(+a.dataset.pos === state.active)));
      const el = results.querySelector(`#cat-opt-${state.active}`);
      if (el) { el.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', el.id); }
    };

    input.addEventListener('focus', open);
    input.addEventListener('input', () => { open(); render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); setActive(state.active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(state.active - 1); }
      else if (e.key === 'Enter') { const el = results.querySelector(`#cat-opt-${state.active}`); if (el) { e.preventDefault(); el.click(); } }
      else if (e.key === 'Escape') { if (input.value) { input.value = ''; render(); } else { close(); input.blur(); } }
    });
    host.addEventListener('click', (e) => {
      const chip = e.target.closest('.c-chip');
      if (chip) {
        const set = chip.dataset.rub ? state.rub : state.type, key = chip.dataset.rub || chip.dataset.type;
        set.has(key) ? set.delete(key) : set.add(key);
        chip.setAttribute('aria-pressed', String(set.has(key)));
        render(); input.focus(); return;
      }
      if (e.target.closest('[data-reset]')) { state.rub.clear(); state.type.clear(); host.querySelectorAll('.c-chip').forEach((c) => c.setAttribute('aria-pressed', 'false')); render(); input.focus(); return; }
      const cmd = e.target.closest('[data-cmd]');
      if (cmd) { applySetting[cmd.dataset.cmd](cmd.dataset.val); const keep = state.active; render(); state.active = keep; setActive(keep); input.focus(); return; }
      if (e.target.closest('.cat-result')) close();
    });
    document.addEventListener('pointerdown', (e) => { if (!host.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) && !document.querySelector('dialog[open]')) { e.preventDefault(); input.focus(); input.select(); }
    });
    // ?q=… préremplit la recherche : une recherche se partage par son adresse.
    const preset = new URLSearchParams(location.search).get('q');
    if (preset) { input.value = preset; input.focus(); open(); }
  }

  // Extraits : le code affiché EST le DOM de la démo, jamais une copie.
  const dedent = (s) => {
    const lines = s.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines.at(-1).trim()) lines.pop();
    const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(pad)).join('\n');
  };
  document.querySelectorAll('[data-code]').forEach((demo) => {
    const d = document.createElement('details');
    d.className = 'cat-code';
    const pre = document.createElement('pre');
    pre.className = 'c-code';
    pre.textContent = dedent(demo.innerHTML);
    d.innerHTML = '<summary>Code</summary>';
    d.appendChild(pre);
    demo.after(d);
  });

  // Valeurs de tokens et contrastes, lus dans la feuille de style en vigueur.
  const hex = (v) => v.trim().toLowerCase();
  const lum = (h) => { const c = h.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const fillTokens = () => {
    const cs = getComputedStyle(document.documentElement);
    const bg = hex(cs.getPropertyValue('--bg'));
    document.querySelectorAll('[data-token]').forEach((el) => {
      const v = hex(cs.getPropertyValue(el.dataset.token));
      const out = el.dataset.show === 'ratio' ? (/^#[0-9a-f]{6}$/.test(v) ? ratio(v, bg).toFixed(1) + ' : 1' : '—') : v.toUpperCase();
      el.textContent = out;
    });
  };
  fillTokens();
  document.addEventListener('mono:theme', fillTokens);
})();
