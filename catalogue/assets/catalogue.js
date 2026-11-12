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
  ];
  const EXAMPLES = [
    ['exemples/tableau-de-bord.html', 'Tableau de bord'],
    ['exemples/rapport.html', 'Rapport'],
  ];
  const here = location.pathname.replace(/\/$/, '/index.html');
  const isCurrent = (href) => here.endsWith('/catalogue/' + href) || here.endsWith('/' + href);

  // Thème : mémorisé par confort, la page fonctionne sans.
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('mono-theme', t); } catch {}
    document.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === t)));
    document.dispatchEvent(new CustomEvent('mono:theme', { detail: t }));
  };
  let saved = null;
  try { saved = localStorage.getItem('mono-theme'); } catch {}
  const forced = new URLSearchParams(location.search).get('theme');
  const initial = forced || saved || document.documentElement.dataset.theme || 'encre';

  const nav = document.getElementById('cat-nav');
  if (nav) {
    const item = ([href, label], i) => `<a class="c-nav__item" href="${root}${href}"${isCurrent(href) ? ' aria-current="page"' : ''}><span>${String(i + 1).padStart(2, '0')}</span><span>${label}</span></a>`;
    let html = '<div class="c-nav__label">Catalogue</div>' + PAGES.map(item).join('');
    html += '<div class="c-nav__label">Exemples</div>' + EXAMPLES.map(item).join('');
    const sections = [...document.querySelectorAll('.cat-section[id]')];
    if (sections.length > 1) {
      html += '<div class="c-nav__label">Sur cette page</div>' + sections.map((s) => `<a class="c-nav__item" href="#${s.id}"><span>—</span><span>${s.dataset.title || s.querySelector('.c-section-head span:nth-child(2)')?.textContent || s.id}</span></a>`).join('');
    }
    nav.innerHTML = html;
  }
  document.querySelectorAll('[data-set-theme]').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.setTheme)));
  setTheme(initial);

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
    const entries = INDEX.entries.map((e, i) => ({ ...e, i, page: e.p < 0 ? 'Exemples' : INDEX.pages[e.p][1], href: root + (e.u || INDEX.pages[e.p][0] + (e.id ? '#' + e.id : '')), nt: norm(e.t), nc: norm(e.c), nk: norm(e.k), nx: norm(e.x) }));
    const RUBRIQUES = [...INDEX.pages.map((p) => p[1]), 'Exemples'];

    host.innerHTML = `
      <label class="c-search c-search--large">
        <svg class="c-icon c-icon--small" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></svg>
        <input type="search" id="cat-q" autocomplete="off" spellcheck="false" placeholder="Rechercher une règle, un composant, une classe, un token…" aria-label="Rechercher dans le catalogue" role="combobox" aria-expanded="false" aria-controls="cat-results" aria-autocomplete="list">
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
      state.shown = groups.flatMap(([, g]) => g.map(({ e }) => e));
      state.active = inc.length && list.length ? 0 : -1;
      status.textContent = browsing ? 'Parcourir les rubriques — ou saisir un mot, une classe, un code de règle'
        : total ? `${total} résultat${total > 1 ? 's' : ''}${total > 60 ? ' — 60 affichés, préciser la recherche' : ''}` : '';
      if (!total) {
        results.innerHTML = `<div class="c-empty c-empty--plain"><span class="c-empty__label">Aucun résultat</span><div class="c-empty__title">Rien ne correspond à « ${esc(input.value.trim())} »</div><p class="c-empty__text">Essayez un mot plus court, une classe (.c-card), un token (--fg) ou retirez un filtre.</p>${state.rub.size || state.type.size ? '<div class="c-empty__actions"><button class="c-button" type="button" data-reset>Retirer les filtres</button></div>' : ''}</div>`;
        return;
      }
      let html = '';
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
      if (e.target.closest('.cat-result')) close();
    });
    document.addEventListener('pointerdown', (e) => { if (!host.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.querySelector('dialog[open]')) { e.preventDefault(); input.focus(); input.select(); }
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
