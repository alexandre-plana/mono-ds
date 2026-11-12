/* Carte MONO — démonstration, sans dépendance.

   Le fond vient de Natural Earth (domaine public), 1:50 000 000, monde entier, embarqué dans
   assets/vendor/world-50m.js : aucune tuile, aucun service. On peut cadrer n'importe quelle
   partie du monde ; le niveau de détail est celui d'un atlas, pas d'un plan de ville.

   Le dessin suit les règles des visualisations :
     terres       un ton au-dessus du fond, sans contour propre
     côtes        filet plein — c'est une limite physique
     frontières   filet tireté — c'est une relation entre deux pays
     graticule    pointillé, coté en degrés sur les bords
     données      anneaux proportionnels, un seul en signal

   MonoGeo(host, { world, view: { lon, lat, span }, points, names, onMove, onView }) */
'use strict';
window.MonoGeo = (host, { world, view, points = [], names = {}, unit = '', onMove, onView }) => {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a = {}, p, text) => { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (text != null) e.textContent = text; if (p) p.appendChild(e); return e; };
  const fmt = (n, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---- décodage du TopoJSON : arcs en degrés, avec leur boîte englobante
  const [sx, sy] = world.transform.scale, [tx, ty] = world.transform.translate;
  const arcs = world.arcs.map((arc) => { let x = 0, y = 0, b = [Infinity, Infinity, -Infinity, -Infinity]; const pts = arc.map(([dx, dy]) => { x += dx; y += dy; const lon = x * sx + tx, lat = y * sy + ty; if (lon < b[0]) b[0] = lon; if (lat < b[1]) b[1] = lat; if (lon > b[2]) b[2] = lon; if (lat > b[3]) b[3] = lat; return [lon, lat]; }); return { pts, b, uses: 0 }; });
  const bbox = (pts) => pts.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
  // Ce qui enjambe l'antiméridien est déroulé de proche en proche : un saut de plus de 180° entre deux
  // points voisins n'est pas un trajet, c'est le bord de la carte. Le tracé reste d'un seul tenant.
  const unwrap = (o) => { let off = 0, prev = null, moved = false; o.pts = o.pts.map(([x, y]) => { if (prev !== null) { if (x - prev > 180) { off -= 360; moved = true; } else if (prev - x > 180) { off += 360; moved = true; } } prev = x; return [x + off, y]; }); if (moved) o.b = bbox(o.pts); return o; };
  const polys = (g) => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);
  const ringPts = (ring) => ring.flatMap((i) => (i >= 0 ? arcs[i].pts : [...arcs[~i].pts].reverse()));
  // Un arc partagé par deux pays est une frontière ; un arc à un seul pays est une côte.
  const countries = world.objects.countries.geometries.map((g) => {
    const rings = polys(g).map((poly) => { poly.forEach((ring) => ring.forEach((i) => { arcs[i >= 0 ? i : ~i].uses++; })); const pts = ringPts(poly[0]); return unwrap({ pts, b: bbox(pts) }); });
    const main = rings.reduce((a, r) => ((r.b[2] - r.b[0]) * (r.b[3] - r.b[1]) > (a.b[2] - a.b[0]) * (a.b[3] - a.b[1]) ? r : a), rings[0]);
    return { name: names[g.properties.name] || g.properties.name, b: main.b, c: [(main.b[0] + main.b[2]) / 2, (main.b[1] + main.b[3]) / 2] };
  });
  const land = world.objects.land.geometries.flatMap(polys).flatMap((poly) => poly.map((ring) => { const pts = ringPts(ring); return unwrap({ pts, b: bbox(pts) }); }));
  arcs.forEach(unwrap);

  const svg = el('svg', { class: 'v-chart v-geo', role: 'img', 'aria-label': host.dataset.label || 'Carte' }, host);
  const tip = document.createElement('div'); tip.className = 'v-tip'; host.appendChild(tip);
  let w = 0, h = 0, v = { ...view };

  function draw() {
    w = host.clientWidth; h = host.clientHeight; if (!w || !h) return;
    svg.replaceChildren(); svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
    const k = h / v.span, c = Math.cos((v.lat * Math.PI) / 180);
    const X = (lon) => w / 2 + (lon - v.lon) * c * k, Y = (lat) => h / 2 - (lat - v.lat) * k;
    const west = v.lon - w / 2 / (c * k), east = v.lon + w / 2 / (c * k), south = v.lat - v.span / 2, north = v.lat + v.span / 2;
    // Chaque tracé est essayé à −360°, 0° et +360° : le cadre peut ainsi franchir l'antiméridien.
    const paths = (list, close) => list.map((o) => [-360, 0, 360].filter((d) => o.b[2] + d >= west && o.b[0] + d <= east && o.b[3] >= south && o.b[1] <= north).map((d) => 'M' + o.pts.map(([x, y]) => `${X(x + d).toFixed(1)} ${Y(y).toFixed(1)}`).join('L') + (close ? 'Z' : '')).join('')).join('');
    // terres
    el('path', { class: 'v-land', 'fill-rule': 'evenodd', d: paths(land, true) }, svg);
    // graticule, coté sur les bords gauche et bas
    const step = [30, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1].find((s) => v.span / s >= 3) || 0.1, dec = step < 1 ? (step < 0.25 ? 1 : 2) : 0;
    for (let lon = Math.ceil(west / step) * step; lon <= east; lon += step) { const x = Math.round(X(lon)) + 0.5; el('line', { class: 'v-graticule', x1: x, x2: x, y1: 0, y2: h }, svg); if (x < w - 190) el('text', { class: 'v-label v-label--muted', x: x + 6, y: h - 10 }, svg, `${fmt(Math.abs(lon), dec)}°${lon < 0 ? 'O' : 'E'}`); }
    for (let lat = Math.ceil(south / step) * step; lat <= north; lat += step) { const y = Math.round(Y(lat)) + 0.5; el('line', { class: 'v-graticule', x1: 0, x2: w, y1: y, y2: y }, svg); el('text', { class: 'v-label v-label--muted', x: 10, y: y - 6 }, svg, `${fmt(Math.abs(lat), dec)}°${lat < 0 ? 'S' : 'N'}`); }
    // frontières puis côtes
    el('path', { class: 'v-border', d: paths(arcs.filter((a) => a.uses > 1)) }, svg);
    el('path', { class: 'v-coast', d: paths(arcs.filter((a) => a.uses <= 1)) }, svg);
    // noms de pays : seulement ceux qui tiennent dans le cadre et sont assez grands pour être lus
    countries.forEach((p) => { const pw = (p.b[2] - p.b[0]) * c * k, ph = (p.b[3] - p.b[1]) * k, x = X(p.c[0]), y = Y(p.c[1]); if (pw > 90 && ph > 40 && pw < w * 1.6 && x > 60 && x < w - 60 && y > 30 && y < h - 30) el('text', { class: 'v-label v-geo__country', x, y, 'text-anchor': 'middle' }, svg, p.name); });
    // données : anneaux proportionnels ; les étiquettes qui se chevaucheraient sont tues (l'infobulle les rend)
    // Aux petites échelles les anneaux rétrécissent pour ne pas se fondre en une tache.
    const max = Math.max(...points.map((p) => p.value || 0), 1), shrink = Math.max(0.3, Math.min(1, Math.sqrt(5 / v.span)));
    const order = [...points].sort((a, b) => (b.signal || 0) - (a.signal || 0) || b.value - a.value)
      .map((p) => ({ p, x: X(p.lon), y: Y(p.lat), r: (4 + Math.sqrt(p.value / max) * 18) * shrink })).filter((o) => o.x > -40 && o.x < w + 40 && o.y > -40 && o.y < h + 40);
    const hits = (b, list) => list.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    const labels = [];
    order.forEach((o) => {
      const { p, x, y, r } = o, g = el('g', {}, svg);
      el('circle', { class: 'v-ring' + (p.signal ? ' v-ring--signal' : ''), cx: x, cy: y, r }, g);
      el('rect', { class: 'v-dot' + (p.signal ? ' v-dot--signal' : ''), x: Math.round(x) - 2, y: Math.round(y) - 2, width: 4, height: 4 }, g);
      // Le nom se pose à droite, sinon à gauche, dessous, dessus ; s'il toucherait un anneau ou un autre nom, il se tait (l'infobulle le rend).
      const tw = p.name.length * 7.4, rings = order.filter((q) => q !== o).map((q) => [q.x - q.r, q.y - q.r, q.x + q.r, q.y + q.r]);
      const spots = [[x + r + 6, y, 'start'], [x - r - 6 - tw, y, 'end'], [x + 4, y + r + 12, 'start'], [x + 4, y - r - 8, 'start']].map(([bx, by, a]) => ({ box: [bx, by - 8, bx + tw, by + 6], a, y: by }));
      const spot = spots.find((c) => !hits(c.box, rings) && !hits(c.box, labels)) || (p.signal ? spots[2] : null);   // le point en signal est toujours nommé
      if (spot) { labels.push(spot.box); el('text', { class: 'v-label' + (p.signal ? ' v-label--signal' : ' v-label--strong'), x: spot.a === 'start' ? spot.box[0] : spot.box[2], y: spot.y + 4, 'text-anchor': spot.a }, g, p.name); }
      const hit = el('circle', { class: 'v-hit', cx: x, cy: y, r: Math.max(12, r), tabindex: 0, role: 'img', 'aria-label': `${p.name} : ${fmt(p.value, 1)} ${unit}` }, g);
      const show = () => { tip.innerHTML = `<span>${p.name}</span>${fmt(p.value, 1)} ${unit}${p.note ? ' — ' + p.note : ''}`; tip.style.left = Math.max(70, Math.min(w - 70, x)) + 'px'; tip.style.top = y - r + 'px'; tip.classList.add('is-visible'); };
      hit.addEventListener('pointerenter', show); hit.addEventListener('focus', show); hit.addEventListener('pointerleave', () => tip.classList.remove('is-visible')); hit.addEventListener('blur', () => tip.classList.remove('is-visible'));
    });
    // échelle : une longueur ronde, en kilomètres
    const kmpx = 111.32 / k, nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].filter((n) => n / kmpx <= 140).pop() || 1, len = Math.round(nice / kmpx), x0 = w - len - 16.5, y0 = h - 16.5;
    el('path', { class: 'v-axis', d: `M${x0} ${y0 - 5}V${y0}H${x0 + len}V${y0 - 5}` }, svg);
    el('text', { class: 'v-label', x: x0 + len, y: y0 - 10, 'text-anchor': 'end' }, svg, `${fmt(nice)} km`);
    onView?.({ ...v, west, east, south, north });
    draw.inv = (px, py) => [v.lon + (px - w / 2) / (c * k), v.lat - (py - h / 2) / k];
  }

  const clamp = () => { v.span = Math.max(0.4, Math.min(170, v.span)); v.lat = Math.max(-80, Math.min(84, v.lat)); v.lon = ((v.lon + 540) % 360) - 180; };
  const zoom = (f, px = w / 2, py = h / 2) => { const [lon, lat] = draw.inv(px, py); v.span *= f; clamp(); const k = h / v.span, c = Math.cos((v.lat * Math.PI) / 180); v.lon = lon - (px - w / 2) / (c * k); v.lat = lat + (py - h / 2) / k; clamp(); draw(); };
  // glisser pour déplacer, molette pour changer d'échelle
  let drag = null, raf = 0;
  svg.addEventListener('pointerdown', (e) => { if (e.target.classList.contains('v-hit')) return; drag = { x: e.clientX, y: e.clientY, lon: v.lon, lat: v.lat }; svg.setPointerCapture(e.pointerId); svg.classList.add('is-dragging'); });
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    if (drag) { const k = h / v.span, c = Math.cos((drag.lat * Math.PI) / 180); v.lon = drag.lon - (e.clientX - drag.x) / (c * k); v.lat = drag.lat + (e.clientY - drag.y) / k; clamp(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    else if (draw.inv) onMove?.(...draw.inv(e.clientX - r.left, e.clientY - r.top));
  });
  const end = () => { drag = null; svg.classList.remove('is-dragging'); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoom(e.deltaY > 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  new ResizeObserver(draw).observe(host);
  draw();
  return { zoom, set(next) { v = { ...v, ...next }; clamp(); draw(); }, get view() { return { ...v }; } };
};
