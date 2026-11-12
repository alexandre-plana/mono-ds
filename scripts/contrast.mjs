#!/usr/bin/env node
// Vérifie les contrastes WCAG des paires de tokens définies dans src/tokens.css.
// Usage : node scripts/contrast.mjs   (code de sortie 1 si une paire échoue)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/tokens.css', import.meta.url)), 'utf8');

const block = (re) => {
  const m = css.match(re);
  if (!m) throw new Error('Bloc introuvable : ' + re);
  return Object.fromEntries([...m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
};
const root = block(/:root\s*\{([\s\S]*?)\n\}/);
const themes = {
  encre: { ...root, ...block(/\[data-theme="encre"\]\s*\{([\s\S]*?)\n\}/) },
  papier: { ...root, ...block(/\[data-theme="papier"\]\s*\{([\s\S]*?)\n\}/) },
};
const resolve = (vars, v) => {
  for (let i = 0; i < 8 && /var\(/.test(v); i++) v = v.replace(/var\((--[\w-]+)\)/g, (_, k) => vars[k] ?? 'MISSING');
  return v;
};
const lum = (hex) => {
  const [r, g, b] = hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [premier plan, fond, seuil, rôle]
const pairs = [
  ['--fg-strong', '--bg', 7, 'titres, chiffres clés'],
  ['--fg', '--bg', 7, 'texte courant'],
  ['--fg-soft', '--bg', 4.5, 'texte secondaire'],
  ['--fg-muted', '--bg', 4.5, 'texte tertiaire'],
  ['--fg', '--surface', 7, 'texte sur surface'],
  ['--fg-muted', '--surface', 4.5, 'tertiaire sur surface'],
  ['--fg-muted', '--surface-2', 4.5, 'tertiaire sur survol'],
  ['--fg-soft', '--bg-sunken', 4.5, 'secondaire sur creux'],
  ['--line-strong', '--bg', 3, 'bordure de contrôle'],
  ['--selected-line', '--bg', 3, 'trait de sélection'],
  ['--selected-line', '--surface', 3, 'trait de sélection sur surface'],
  ['--mark', '--bg', 3, 'marque de donnée'],
  ['--mark-3', '--bg', 3, 'marque de donnée la plus sombre'],
  ['--signal', '--bg', 4.5, 'signal (texte, marque)'],
  ['--signal', '--surface', 4.5, 'signal sur surface'],
  ['--inverse-fg', '--inverse-bg', 7, 'bloc inversé'],
  ['--on-signal', '--signal', 4.5, 'texte sur signal'],
];

let failed = 0;
for (const [name, vars] of Object.entries(themes)) {
  console.log(`\nThème ${name}`);
  for (const [fg, bg, min, role] of pairs) {
    const a = resolve(vars, vars[fg]), b = resolve(vars, vars[bg]);
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)} ≥ ${String(min).padEnd(3)} ${fg.padEnd(14)} ${a} sur ${bg.padEnd(12)} ${b}  ${role}`);
  }
  for (const [k, v] of Object.entries(vars)) {
    const c = resolve(vars, v).toLowerCase();
    if (/^#(0{3}|0{6}|f{3}|f{6})$/.test(c)) { failed++; console.log(`  FAIL ${k} vaut ${c} : noir ou blanc pur interdit`); }
  }
}
console.log(failed ? `\n${failed} échec(s)` : '\nTous les contrastes passent.');
process.exit(failed ? 1 : 0);
