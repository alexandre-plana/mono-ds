/* Graphiques de démonstration MONO — SVG sans dépendance.
   Chaque fonction dessine à la taille réelle du conteneur (le texte ne rétrécit
   jamais) et se redessine au redimensionnement. Les classes .v- viennent de
   src/viz.css : aucune couleur n'est écrite ici. */
window.MonoCharts = (() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (name, attrs = {}, parent, text) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n);
  const snap = (v) => Math.round(v) + 0.5;

  // Monte un SVG responsive dans `host` et rappelle draw(svg, largeur, hauteur).
  const mount = (host, height, draw) => {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!host) return;
    const svg = el('svg', { class: 'v-chart', role: 'img', 'aria-label': host.dataset.label || '' }, host);
    let tip = null;
    const api = {
      tip(x, y, html) {
        const fig = host.closest('.v-figure') || host;
        if (!tip) { tip = document.createElement('div'); tip.className = 'v-tip'; fig.appendChild(tip); if (getComputedStyle(fig).position === 'static') fig.style.position = 'relative'; }
        if (html == null) { tip.classList.remove('is-visible'); return; }
        const a = svg.getBoundingClientRect(), b = fig.getBoundingClientRect();
        tip.innerHTML = html;
        tip.style.left = Math.max(60, Math.min(b.width - 60, a.left - b.left + x)) + 'px';
        tip.style.top = a.top - b.top + y + 'px';
        tip.classList.add('is-visible');
      },
    };
    let last = 0;
    const render = () => {
      const w = Math.floor(host.clientWidth);
      if (!w || w === last) return;
      last = w;
      const h = typeof height === 'function' ? height(w) : height;
      svg.replaceChildren();
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w); svg.setAttribute('height', h);
      draw(svg, w, h, api);
    };
    new ResizeObserver(render).observe(host);
    render();
  };

  const niceMax = (max, steps) => {
    const raw = max / steps, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    return { step, max: step * steps };
  };

  /* Barres verticales. data : [{ label, value, signal?, note? }] */
  function bars(host, { data, unit = '', steps = 5, height = 320, labelAll = true }) {
    mount(host, height, (svg, w, h, api) => {
      const m = { t: 24, r: 20, b: 40, l: 44 };
      const iw = w - m.l - m.r, ih = h - m.t - m.b;
      const { step, max } = niceMax(Math.max(...data.map((d) => d.value)), steps);
      const y = (v) => m.t + ih - (v / max) * ih;
      for (let i = 1; i <= steps; i++) {
        el('line', { class: 'v-grid', x1: m.l, x2: w - m.r, y1: snap(y(i * step)), y2: snap(y(i * step)) }, svg);
        el('text', { class: 'v-label v-label--muted', x: m.l - 10, y: y(i * step) + 4, 'text-anchor': 'end' }, svg, fmt(i * step));
      }
      el('text', { class: 'v-label v-label--muted', x: m.l - 10, y: y(0) + 4, 'text-anchor': 'end' }, svg, '0');
      const band = iw / data.length, bw = Math.max(3, Math.min(28, Math.round(band * 0.56)));
      const tight = band < 34, showAll = labelAll && band >= 30;
      const maxV = Math.max(...data.map((d) => d.value));
      const labelled = (i) => showAll || data[i].signal || data[i].value === maxV || i === data.length - 1;
      data.forEach((d, i) => {
        const cx = m.l + band * i + band / 2, top = y(d.value);
        const g = el('g', {}, svg);
        el('rect', { class: 'v-mark' + (d.signal ? ' v-mark--signal' : ''), x: Math.round(cx - bw / 2), y: top, width: bw, height: Math.max(1, y(0) - top) }, g);
        if (labelled(i)) {
          // Deux étiquettes voisines s'écartent l'une de l'autre au lieu de se chevaucher.
          const crowd = band < 44, prev = crowd && i > 0 && labelled(i - 1), next = crowd && i < data.length - 1 && labelled(i + 1);
          const anchor = next && !prev ? 'end' : prev && !next ? 'start' : 'middle';
          const tx = anchor === 'end' ? cx + bw / 2 : anchor === 'start' ? cx - bw / 2 : cx;
          el('text', { class: 'v-value' + (d.signal ? ' v-value--signal' : ''), x: tx, y: top - 7, 'text-anchor': anchor }, g, fmt(d.value));
        }
        // Étiquettes d'abscisse sur deux rangs quand la place manque (cf. référence).
        // Entre 17 et 34 px par barre : deux rangs alternés. En dessous : une étiquette sur k.
        const two = tight && band >= 17, k = tight && !two ? Math.ceil(36 / band) : 1;
        if ((data.length - 1 - i) % k === 0) {
          el('text', { class: 'v-label', x: cx, y: h - m.b + (two && i % 2 ? 31 : 17), 'text-anchor': 'middle' }, g, d.label);
        }
        const hit = el('rect', { class: 'v-hit', x: cx - band / 2, y: m.t, width: band, height: ih, tabindex: 0, role: 'img', 'aria-label': `${d.label} : ${fmt(d.value)} ${unit}` }, g);
        const show = () => api.tip(cx, top, `<span>${d.label}</span>${fmt(d.value)} ${unit}${d.note ? ' — ' + d.note : ''}`);
        hit.addEventListener('pointerenter', show); hit.addEventListener('focus', show);
        hit.addEventListener('pointerleave', () => api.tip()); hit.addEventListener('blur', () => api.tip());
      });
      el('line', { class: 'v-axis', x1: m.l, x2: w - m.r, y1: snap(y(0)), y2: snap(y(0)) }, svg);
    });
  }

  /* Courbes. series : [{ name, values, variant? ('2' | '3') }], mark : { series, index, label } */
  function lines(host, { labels, series, mark, steps = 4, height = 280, unit = '' }) {
    mount(host, height, (svg, w, h, api) => {
      const m = { t: 20, r: 96, b: 32, l: 44 };
      const iw = w - m.l - m.r, ih = h - m.t - m.b;
      const { step, max } = niceMax(Math.max(...series.flatMap((s) => s.values)), steps);
      const x = (i) => m.l + (iw * i) / (labels.length - 1), y = (v) => m.t + ih - (v / max) * ih;
      for (let i = 0; i <= steps; i++) {
        if (i) el('line', { class: 'v-grid', x1: m.l, x2: m.l + iw, y1: snap(y(i * step)), y2: snap(y(i * step)) }, svg);
        el('text', { class: 'v-label v-label--muted', x: m.l - 10, y: y(i * step) + 4, 'text-anchor': 'end' }, svg, fmt(i * step));
      }
      const every = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 64)));
      labels.forEach((l, i) => { if (i % every === 0 || i === labels.length - 1) { el('line', { class: 'v-tick', x1: snap(x(i)), x2: snap(x(i)), y1: y(0), y2: y(0) + 5 }, svg); el('text', { class: 'v-label', x: x(i), y: h - m.b + 20, 'text-anchor': i === labels.length - 1 ? 'end' : 'middle' }, svg, l); } });
      el('line', { class: 'v-axis', x1: m.l, x2: m.l + iw, y1: snap(y(0)), y2: snap(y(0)) }, svg);
      series.forEach((s) => {
        el('path', { class: 'v-line' + (s.variant ? ' v-line--' + s.variant : ''), d: s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ') }, svg);
      });
      // Noms en bout de courbe, écartés d'au moins 14 px pour ne jamais se chevaucher.
      const ends = series.map((s) => ({ s, y: y(s.values.at(-1)) })).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
      ends.forEach(({ s, y: ly }) => el('text', { class: 'v-label' + (s.variant ? '' : ' v-label--strong'), x: m.l + iw + 14, y: ly + 4 }, svg, s.name));
      if (mark) {
        const v = series[mark.series].values[mark.index], cx = x(mark.index), cy = y(v);
        el('line', { class: 'v-link', x1: snap(cx), x2: snap(cx), y1: cy + 9, y2: y(0) }, svg);
        el('circle', { class: 'v-halo', cx, cy, r: 8 }, svg);
        el('circle', { class: 'v-ring v-ring--signal', cx, cy, r: 6 }, svg);
        el('circle', { class: 'v-dot v-dot--signal', cx, cy, r: 2 }, svg);
        el('text', { class: 'v-value v-value--signal', x: cx, y: cy - 14, 'text-anchor': 'middle' }, svg, mark.label);
      }
      // Lecture au survol : réticule + valeurs de toutes les séries.
      const cross = el('line', { class: 'v-link v-link--solid', y1: m.t, y2: y(0), visibility: 'hidden' }, svg);
      const hit = el('rect', { class: 'v-hit', x: m.l, y: m.t, width: iw, height: ih }, svg);
      hit.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(), px = e.clientX - r.left;
        const i = Math.max(0, Math.min(labels.length - 1, Math.round(((px - m.l) / iw) * (labels.length - 1))));
        cross.setAttribute('x1', snap(x(i))); cross.setAttribute('x2', snap(x(i))); cross.setAttribute('visibility', 'visible');
        api.tip(x(i), y(Math.max(...series.map((s) => s.values[i]))), `<span>${labels[i]}</span>` + series.map((s) => `${s.name} ${fmt(s.values[i])}${unit}`).join(' · '));
      });
      hit.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); api.tip(); });
    });
  }

  /* Arbre de décision. tree : { n?, len, call?, children? } — len = longueur de la barre. */
  function tree(host, { tree: rootNode, row = 22, unit = 2.2 }) {
    const leaves = (n) => (n.children?.length ? n.children.reduce((a, c) => a + leaves(c), 0) : 1);
    const depth = (n) => 1 + (n.children?.length ? Math.max(...n.children.map(depth)) : 0);
    mount(host, () => leaves(rootNode) * row + 16, (svg, w) => {
      const cols = depth(rootNode), colW = (w - 12) / cols;
      const place = (n, d, top) => {
        const x = 4 + d * colW, span = leaves(n) * row;
        const y = snap(top + (n.children?.length ? row / 2 : span / 2));
        const len = Math.min(colW - 46, n.len * unit);
        let cx = x;
        if (n.n !== undefined) { el('text', { class: 'v-label', x: cx, y: y + 4 }, svg, n.n); cx += 14; }
        el('line', { class: 'v-bar-line', x1: cx, x2: cx + len, y1: y, y2: y }, svg);
        const end = cx + len + 6;
        if (n.call) {
          el('line', { class: 'v-link', x1: end, x2: x + colW - 22, y1: y, y2: y }, svg);
          el('circle', { class: 'v-dot v-dot--signal', cx: x + colW - 16, cy: y, r: 3 }, svg);
        }
        if (n.children?.length) {
          const trunk = snap(x + colW - 12);
          el('line', { class: 'v-link', x1: end, x2: trunk, y1: y, y2: y }, svg);
          let t = top, lastY = y;
          n.children.forEach((c) => {
            const cy = place(c, d + 1, t);
            el('line', { class: 'v-link', x1: trunk, x2: x + colW + 2, y1: cy, y2: cy }, svg);
            lastY = cy; t += leaves(c) * row;
          });
          el('line', { class: 'v-link', x1: trunk, x2: trunk, y1: y, y2: lastY }, svg);
        }
        return y;
      };
      place(rootNode, 0, 8);
    });
  }

  /* Carte à graticule. points : [{ lon, lat, value?, signal?, name? }] */
  function graticule(host, { lon, lat, points, height = 360, maxValue = 1200 }) {
    mount(host, height, (svg, w, h, api) => {
      const m = { t: 12, r: 12, b: 28, l: 44 };
      const iw = w - m.l - m.r, ih = h - m.t - m.b;
      const x = (v) => m.l + ((v - lon[0]) / (lon[1] - lon[0])) * iw, y = (v) => m.t + ih - ((v - lat[0]) / (lat[1] - lat[0])) * ih;
      for (let v = Math.ceil(lon[0]); v <= lon[1]; v++) { el('line', { class: 'v-graticule', x1: snap(x(v)), x2: snap(x(v)), y1: m.t, y2: m.t + ih }, svg); el('text', { class: 'v-label v-label--muted', x: x(v), y: h - 8, 'text-anchor': 'middle' }, svg, v + '°E'); }
      for (let v = Math.ceil(lat[0]); v <= lat[1]; v++) { el('line', { class: 'v-graticule', x1: m.l, x2: m.l + iw, y1: snap(y(v)), y2: snap(y(v)) }, svg); el('text', { class: 'v-label v-label--muted', x: m.l - 10, y: y(v) + 4, 'text-anchor': 'end' }, svg, v + '°N'); }
      const r = (v) => 4 + Math.sqrt(v / maxValue) * 22;
      points.forEach((p) => {
        const cx = x(p.lon), cy = y(p.lat);
        if (p.value) el('circle', { class: 'v-ring' + (p.signal ? ' v-ring--signal' : ''), cx, cy, r: r(p.value) }, svg);
        el('circle', { class: 'v-dot' + (p.signal ? ' v-dot--signal' : p.value ? '' : ' v-dot--soft'), cx, cy, r: p.value ? 2 : 1.75 }, svg);
        if (p.name) {
          el('text', { class: 'v-label' + (p.signal ? ' v-label--signal' : ''), x: cx + (p.value ? r(p.value) : 3) + 7, y: cy + 4 }, svg, p.name);
          const hit = el('circle', { class: 'v-hit', cx, cy, r: Math.max(12, p.value ? r(p.value) : 0), tabindex: 0, role: 'img', 'aria-label': `${p.name} : ${p.value ?? '—'}` }, svg);
          const show = () => api.tip(cx, cy - (p.value ? r(p.value) : 4), `<span>${p.name}</span>${p.value ? fmt(p.value) + ' agences' : 'point standard'}`);
          hit.addEventListener('pointerenter', show); hit.addEventListener('focus', show);
          hit.addEventListener('pointerleave', () => api.tip()); hit.addEventListener('blur', () => api.tip());
        }
      });
    });
  }

  return { bars, lines, tree, graticule };
})();
