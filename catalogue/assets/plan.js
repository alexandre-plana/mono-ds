/* Plan détaillé MONO — démonstration.

   Ici, et ici seulement, le système s'appuie sur des services en ligne :
     rues, routes, eau, bâti   tuiles vectorielles OpenStreetMap servies par OpenFreeMap (schéma OpenMapTiles)
     relief                    tuiles d'altitude Terrarium (Mapzen, jeux de données ouverts d'AWS),
                               converties en courbes de niveau dans le navigateur par maplibre-contour
   Le rendu est confié à MapLibre GL JS (assets/vendor). La feuille de style ci-dessous est celle de MONO :
   aucune couleur n'y est écrite, toutes sont lues dans les rôles du thème courant.

   Le dessin :
     relief       courbes de niveau, maîtresses plus marquées et cotées — pas d'ombrage (ce serait un dégradé)
     eau          le ton le plus bas
     routes       l'épaisseur et le ton disent le rang ; les chemins sont tiretés
     bâti         un aplat d'un cran, sans contour
     limites      tireté
     noms         capitales espacées
   Chaque famille est un calque que l'on affiche ou masque.

   MonoPlan(host, { view: { lon, lat, zoom }, points, onMove, onView }) */
'use strict';
window.MonoPlan = (host, { view, points = [], onMove, onView }) => {
  const role = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const FONT = ['Noto Sans Regular'], BOLD = ['Noto Sans Bold'];
  const hidden = new Set(['vegetation']);

  const dem = new mlcontour.DemSource({ url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', encoding: 'terrarium', maxzoom: 13, worker: true });
  dem.setupMaplibre(maplibregl);

  const agences = { type: 'FeatureCollection', features: points.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lon, p.lat] }, properties: { name: p.name.toUpperCase(), value: p.value, signal: !!p.signal } })) };

  function style() {
    const c = { bg: role('--bg'), sunken: role('--bg-sunken'), surface: role('--surface'), surface2: role('--surface-2'), faint: role('--line-faint'), line: role('--line'), strong: role('--line-strong'), muted: role('--fg-muted'), soft: role('--fg-soft'), fg: role('--fg'), max: role('--fg-strong'), signal: role('--signal') };
    const L = (group, layer) => ({ ...layer, metadata: { group }, layout: { ...(layer.layout || {}), visibility: hidden.has(group) ? 'none' : 'visible' } });
    const road = (id, group, classes, color, w, extra = {}) => L(group, { id, type: 'line', source: 'osm', 'source-layer': 'transportation', filter: ['all', ['in', ['get', 'class'], ['literal', classes]], ['!=', ['get', 'brunnel'], 'tunnel']], layout: { 'line-cap': 'butt', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': ['interpolate', ['linear'], ['zoom'], ...w] }, ...extra });
    const text = (size, color, font = FONT) => ({ 'text-color': color, 'text-halo-color': c.bg, 'text-halo-width': 1.5 });
    return {
      version: 8,
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: {
        osm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
        relief: { type: 'vector', maxzoom: 15, tiles: [dem.contourProtocolUrl({ multiplier: 1, thresholds: { 8: [500, 2000], 10: [200, 1000], 12: [100, 500], 13: [50, 250], 14: [20, 100], 15: [10, 50] }, contourLayer: 'contours', elevationKey: 'ele', levelKey: 'level' })] },
        agences: { type: 'geojson', data: agences },
      },
      layers: [
        { id: 'fond', type: 'background', paint: { 'background-color': c.bg } },
        L('vegetation', { id: 'bois', type: 'fill', source: 'osm', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['wood', 'forest']]], paint: { 'fill-color': c.surface } }),
        L('eau', { id: 'eau', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': c.sunken } }),
        L('eau', { id: 'cours', type: 'line', source: 'osm', 'source-layer': 'waterway', paint: { 'line-color': c.sunken, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 14, 3] } }),
        L('eau', { id: 'rives', type: 'line', source: 'osm', 'source-layer': 'water', paint: { 'line-color': c.strong, 'line-width': 1 } }),
        L('relief', { id: 'courbes', type: 'line', source: 'relief', 'source-layer': 'contours', paint: { 'line-color': ['match', ['get', 'level'], 1, c.strong, c.line], 'line-width': ['match', ['get', 'level'], 1, 1, 0.6] } }),
        L('batiments', { id: 'bati', type: 'fill', source: 'osm', 'source-layer': 'building', minzoom: 13, paint: { 'fill-color': c.surface2 } }),
        L('limites', { id: 'limites', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['<=', ['get', 'admin_level'], 6], paint: { 'line-color': c.muted, 'line-width': 1, 'line-dasharray': [5, 3] } }),
        road('chemins', 'voies', ['path', 'track'], c.line, [12, 0.6, 16, 1], { minzoom: 14, paint: { 'line-color': c.line, 'line-width': 0.8, 'line-dasharray': [4, 3] } }),
        road('rues', 'voies', ['minor', 'service'], c.strong, [11, 0.5, 14, 1, 17, 3], { minzoom: 11 }),
        road('rail', 'routes', ['rail'], c.muted, [8, 0.8, 14, 1.2], { paint: { 'line-color': c.muted, 'line-width': 1, 'line-dasharray': [6, 2, 1, 2] } }),
        road('secondaires', 'routes', ['secondary', 'tertiary'], c.muted, [8, 0.6, 12, 1.2, 16, 4], { minzoom: 8 }),
        road('principales', 'routes', ['primary', 'trunk'], c.soft, [6, 0.8, 12, 1.8, 16, 6]),
        road('autoroutes', 'routes', ['motorway'], c.fg, [5, 1, 12, 2.4, 16, 8]),
        L('relief', { id: 'cotes', type: 'symbol', source: 'relief', 'source-layer': 'contours', filter: ['>', ['get', 'level'], 0], layout: { 'symbol-placement': 'line', 'text-field': ['concat', ['number-format', ['get', 'ele'], {}], ' m'], 'text-font': FONT, 'text-size': 11, 'text-letter-spacing': 0.06 }, paint: text(11, c.muted) }),
        L('relief', { id: 'sommets', type: 'symbol', source: 'osm', 'source-layer': 'mountain_peak', minzoom: 10, filter: ['all', ['has', 'name'], ['has', 'ele']], layout: { 'text-field': ['concat', ['get', 'name'], '\n', ['to-string', ['get', 'ele']], ' m'], 'text-font': FONT, 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.6], 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: text(11, c.soft) }),
        L('noms', { id: 'noms-rues', type: 'symbol', source: 'osm', 'source-layer': 'transportation_name', minzoom: 14, layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11, 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: text(11, c.muted) }),
        L('noms', { id: 'noms-eau', type: 'symbol', source: 'osm', 'source-layer': 'water_name', layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': 11, 'text-letter-spacing': 0.1 }, paint: text(11, c.muted) }),
        L('noms', { id: 'noms-lieux', type: 'symbol', source: 'osm', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'village', 'suburb']]], layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': ['match', ['get', 'class'], 'city', 13, 'town', 12, 11], 'text-transform': 'uppercase', 'text-letter-spacing': 0.16, 'text-max-width': 8, 'symbol-sort-key': ['get', 'rank'] }, paint: text(12, c.fg) }),
        L('agences', { id: 'agences-anneau', type: 'circle', source: 'agences', paint: { 'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'value']], 0, 5, 3.6, 22], 'circle-opacity': 0, 'circle-stroke-width': 1.5, 'circle-stroke-color': ['case', ['get', 'signal'], c.signal, c.max] } }),
        L('agences', { id: 'agences-point', type: 'circle', source: 'agences', paint: { 'circle-radius': 2.5, 'circle-color': ['case', ['get', 'signal'], c.signal, c.max] } }),
        L('agences', { id: 'agences-nom', type: 'symbol', source: 'agences', layout: { 'text-field': ['get', 'name'], 'text-font': BOLD, 'text-size': 11, 'text-letter-spacing': 0.1, 'text-anchor': 'left', 'text-offset': [2.4, 0], 'text-allow-overlap': false, 'symbol-sort-key': ['case', ['get', 'signal'], 0, 1] }, paint: { 'text-color': ['case', ['get', 'signal'], c.signal, c.max], 'text-halo-color': c.bg, 'text-halo-width': 2 } }),
      ],
    };
  }

  const map = new maplibregl.Map({ container: host, style: style(), center: [view.lon, view.lat], zoom: view.zoom, minZoom: 3, maxZoom: 17, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false });
  map.touchZoomRotate.disableRotation(); map.keyboard.disableRotation();
  map.on('mousemove', (e) => onMove?.(e.lngLat.lng, e.lngLat.lat));
  const told = () => onView?.({ zoom: map.getZoom(), lon: map.getCenter().lng, lat: map.getCenter().lat, mpp: (78271.517 * Math.cos((map.getCenter().lat * Math.PI) / 180)) / 2 ** map.getZoom() });
  map.on('moveend', told); map.on('load', told);
  // Le thème change : la feuille de style est relue dans les rôles, les calques masqués le restent.
  new MutationObserver(() => map.setStyle(style())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    map,
    toggle(group, on) { on ? hidden.delete(group) : hidden.add(group); map.getStyle().layers.forEach((l) => { if (l.metadata?.group === group) map.setLayoutProperty(l.id, 'visibility', on ? 'visible' : 'none'); }); },
    shown: (group) => !hidden.has(group),
    go(v) { map.easeTo({ center: [v.lon, v.lat], zoom: v.zoom, duration: 0 }); },
    zoom(d) { map.easeTo({ zoom: map.getZoom() + d, duration: 120 }); },
  };
};
