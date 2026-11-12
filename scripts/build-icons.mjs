#!/usr/bin/env node
// Construit src/icons.css à partir de src/icons.json.
// Chaque icône est un masque CSS : <i class="c-icon i-plus" aria-hidden="true"></i>
// Elle prend la couleur du texte, ne demande ni script ni fichier d'image, et pèse ~150 octets.
//
// Usage : node scripts/build-icons.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL('../' + p, import.meta.url));
const icons = JSON.parse(readFileSync(root('src/icons.json'), 'utf8'));
const uri = (body) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='#000' stroke-linecap='square' stroke-linejoin='miter'>${body}</svg>`;
  return 'data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E');
};
let css = `/* ==========================================================================
   MONO — Icônes (.c-icon + .i-nom)
   Généré par scripts/build-icons.mjs depuis src/icons.json — ne pas modifier à la main.
   Grille de 16 px, traits d'un pixel posés sur la grille, extrémités carrées,
   angles vifs, aucune courbe : le même trait que les filets du système.
   ========================================================================== */

.c-icon { display: inline-block; flex: none; width: var(--icon, 1rem); height: var(--icon, 1rem); vertical-align: -0.1875rem; background-color: currentColor; -webkit-mask: var(--i) center / contain no-repeat; mask: var(--i) center / contain no-repeat; }
/* Seuls les multiples entiers de 16 px gardent des traits nets. */
.c-icon--large { --icon: 2rem; }

`;
// Chaque dessin est aussi une variable (--i-nom) : un pseudo-élément peut ainsi porter une icône.
css += ':root {\n';
for (const [name, body] of Object.entries(icons)) css += `  --i-${name}: url("${uri(body)}");\n`;
css += '}\n';
for (const name of Object.keys(icons)) css += `.i-${name} { --i: var(--i-${name}); }\n`;

const target = root('src/icons.css');
if (process.argv.includes('--check')) {
  const ok = existsSync(target) && readFileSync(target, 'utf8') === css;
  console.log(ok ? `Icônes à jour (${Object.keys(icons).length}).` : 'Icônes périmées : lancer node scripts/build-icons.mjs');
  process.exit(ok ? 0 : 1);
}
writeFileSync(target, css);
console.log(`${Object.keys(icons).length} icônes — ${(css.length / 1024).toFixed(1)} Ko`);
