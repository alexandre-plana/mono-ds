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
