#!/usr/bin/env node
// Construit l'index de recherche du catalogue : catalogue/assets/search-index.js
//
// Sont indexés : tout élément des pages du catalogue portant `id` et `data-search`
// (rubrique | regle | composant), les tokens de src/tokens.css et les écrans d'exemple.
// Le texte d'une entrée va de sa balise jusqu'à la prochaine entrée.
//
// Usage : node scripts/build-search-index.mjs          écrit l'index
//         node scripts/build-search-index.mjs --check  échoue si l'index n'est pas à jour
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL('../' + p, import.meta.url));
const PAGES = [
  ['index.html', 'Présentation'],
  ['fondations.html', 'Fondations'],
  ['composition.html', 'Composition'],
  ['composants.html', 'Composants'],
  ['dataviz.html', 'Visualisations'],
];
const EXAMPLES = [
  ['exemples/tableau-de-bord.html', 'Tableau de bord', 'Écran de pilotage en thème encre : chiffre héros, graphique en barres, tableau, statuts. Trois axes verticaux, un bouton primaire, un seul sens pour le signal.'],
  ['exemples/collection.html', 'Collection et inspecteur', 'Application en deux pages séparées par la bande hachurée : une collection en tableau, une ligne sélectionnée, son détail dans un inspecteur. Édition en place, indicateur d\'enregistrement, barre d\'état, raccourcis clavier.'],
  ['exemples/rapport.html', 'Rapport', 'Page éditoriale en thème papier : titre, prose, clé-valeur, tableau, courbes, et une figure cartographique dans un bloc inversé encre.'],
];

const entities = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"', '#39': "'" };
const text = (html) => html
  .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#?\w+);/g, (m, e) => entities[e] ?? m)
  .replace(/\s+/g, ' ').trim();

const entries = [];
PAGES.forEach(([file, pageTitle], p) => {
  const html = readFileSync(root('catalogue/' + file), 'utf8');
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const marks = [...main.matchAll(/<[a-z0-9]+\b[^>]*\bdata-search="[^"]+"[^>]*>/g)];
  let section = '';
  marks.forEach((m, i) => {
    const tag = m[0];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const type = tag.match(/data-search="([^"]+)"/)[1];
    if (!id) throw new Error(`${file} : élément data-search sans id — ${tag}`);
    const chunk = main.slice(m.index + tag.length, marks[i + 1]?.index ?? main.length);
    const heading = chunk.match(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/)?.[2] ?? '';
    const title = text(heading.replace(/<span class="c-section-head__(num|aside)">[\s\S]*?<\/span>/g, ''));
    if (!title) throw new Error(`${file}#${id} : pas de titre`);
    const code = chunk.match(/<span class="cat-rule__num">([^<]+)<\/span>/)?.[1] ?? '';
    if (/class="cat-section"/.test(tag)) section = title;
    // Mots-clés : classes du système présentes dans le texte ou dans le balisage des démonstrations.
    const keys = new Set();
    for (const c of chunk.matchAll(/class="([^"]+)"/g)) for (const n of c[1].split(/\s+/)) if (/^[cltvu]-[a-z]/.test(n)) keys.add('.' + n);
    for (const c of chunk.matchAll(/(?<![\w-])\.[cltvu]-[a-z][\w-]*/g)) keys.add(c[0]);
    for (const c of chunk.matchAll(/(?<![\w-])--[a-z][\w-]*/g)) keys.add(c[0]);
    const body = text(chunk.replace(/<h([1-4])\b[^>]*>[\s\S]*?<\/h\1>/, '').replace(/<span class="cat-rule__num">[^<]+<\/span>/, ''));
    entries.push({ p, id, y: type, t: title, c: code, s: section === title ? '' : section, k: [...keys].sort().join(' '), x: body.slice(0, 420) });
  });
});

// Tokens : une entrée par propriété déclarée dans :root.
const css = readFileSync(root('src/tokens.css'), 'utf8');
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)[1];
const themeBlock = css.match(/\[data-theme="encre"\]\s*\{([\s\S]*?)\n\}/)[1];
const tokenTarget = (n) => /^--(tone|signal-on)/.test(n) ? ['tons', 'Tons'] : /^--(font|text|leading|weight|track)/.test(n) ? ['typographie', 'Typographie'] : /^--(space|gutter|page|measure|control)/.test(n) ? ['espace', 'Espace'] : /^--(hairline|stroke|radius|duration)/.test(n) ? ['filets', 'Filets'] : ['roles', 'Rôles'];
for (const [block, note] of [[rootBlock, ''], [themeBlock, 'Rôle sémantique — valeur du thème encre : ']]) {
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g)) {
    const [id, section] = tokenTarget(m[1]);
    entries.push({ p: 1, id, y: 'token', t: m[1], c: '', s: section, k: m[1], x: (note + m[2].trim() + (m[3] ? ' — ' + m[3] : '')).slice(0, 200) });
  }
}
EXAMPLES.forEach(([file, title, desc]) => entries.push({ p: -1, id: '', y: 'exemple', t: title, c: '', s: '', k: '', x: desc, u: file }));

const out = `/* Généré par scripts/build-search-index.mjs — ne pas modifier à la main. */
window.MonoSearchIndex = ${JSON.stringify({ pages: PAGES, entries }, null, 0).replace(/\},\{/g, '},\n{')};
`;
const target = root('catalogue/assets/search-index.js');
if (process.argv.includes('--check')) {
  const ok = existsSync(target) && readFileSync(target, 'utf8') === out;
  console.log(ok ? `Index de recherche à jour (${entries.length} entrées).` : 'Index de recherche périmé : lancer node scripts/build-search-index.mjs');
  process.exit(ok ? 0 : 1);
}
writeFileSync(target, out);
const count = entries.reduce((a, e) => ((a[e.y] = (a[e.y] || 0) + 1), a), {});
console.log(`${entries.length} entrées — ` + Object.entries(count).map(([k, v]) => `${k} ${v}`).join(' · '));
