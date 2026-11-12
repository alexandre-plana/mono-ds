# MONO

Design system monochrome, sobre et technique, pour les interfaces de données,
les outils et les rapports. Treize gris, une seule couleur, des règles de
composition — et un catalogue pour les réemployer.

- **Ni noir ni blanc purs** : la gamme va de `#131415` à `#E9E9E5`.
- **Une seule couleur**, le signal, sous 1 % de l'écran, pour ce qui ne doit pas être manqué.
- **Monospace**, capitales espacées, filets d'un pixel, angles droits.
- **Une page encadrée** posée sur un plan de travail hachuré, en retrait de 24 px.
- **Deux thèmes** : `encre` (clair sur sombre) et `papier` (sombre sur clair).
- **Lisibilité vérifiée** : 11 px au moins, contrastes WCAG contrôlés par script.
- **Aucune dépendance** pour le système, aucune étape de construction. Polices
  embarquées. Seul l'exemple « bureau » embarque une bibliothèque (interact.js)
  pour déplacer, redimensionner et aimanter les fenêtres.

## Voir le catalogue

```bash
npm run serve
```

Puis ouvrir <http://localhost:8080/catalogue/>. Le catalogue est statique : tout
serveur de fichiers convient (GitHub Pages compris, depuis la racine du dépôt).

## Utiliser le système

```html
<html lang="fr" data-theme="encre">
  <link rel="stylesheet" href="src/mono.css">
```

`src/mono.css` importe les tokens, la base, les composants et les marques de
données. Un squelette d'écran complet se trouve dans `docs/composition.md`.

## Organisation

```
src/
  tokens.css        tons bruts, rôles sémantiques par thème, échelles
  base.css          reset, texte (.t-), mise en page (.l-), utilitaires (.u-)
  components.css    composants (.c-)
  viz.css           marques de données pour SVG (.v-)
  signs.css         signes graphiques (.g-) : repères d'angle, règle, crochets…
  icons.json/.css   jeu d'icônes maison, 16 px, en masques CSS (.c-icon .i-nom)
  fonts.css, fonts/ IBM Plex Mono et Sans (SIL OFL 1.1)
  mono.css          point d'entrée
docs/               les règles
  philosophie.md    le pourquoi : convictions, budgets, arbitrages, tests d'écart
  principes.md      les 8 principes et la liste de contrôle d'un écran
  fondations.md     tons, rôles, signal, typographie, espace, filets
  composition.md    masses tonales, équilibre, méthode
  composants.md     index des composants et de leurs variantes
  dataviz.md        règles et classes de visualisation
catalogue/          le catalogue navigable (démonstrations + code)
  exemples/         six écrans : tableau de bord, rapport, collection + inspecteur,
                    connexion, bureau à fenêtres, et application.html — le
                    gabarit de shell à copier pour démarrer
  assets/vendor/    interact.js (MIT), pour la seule version bureau
scripts/
  contrast.mjs      contrôle des contrastes des tokens
  build-search-index.mjs  index de la recherche du catalogue
  build-icons.mjs   feuille d'icônes à partir de icons.json
  tonal-audit.mjs   mesure des masses tonales d'un écran
reference/
  maquette-v1.html  la maquette d'origine, conservée pour mémoire
```

## Recherche du catalogue

Le champ en haut de chaque page (touche `/`) cherche dans toutes les rubriques :
règles, composants, tokens, classes. Plusieurs mots sont tous requis ;
`"expression exacte"`, `-exclure`, `.c-classe`, `--token` et les codes de règle
(`S2`, `C4`) sont reconnus ; les filtres par rubrique et par type se cumulent.
`?q=…` dans l'adresse préremplit la recherche.

L'index est un fichier généré. Après toute modification d'une page du catalogue
ou de `src/tokens.css` :

```bash
npm run build:search
```

## Contrôles

```bash
npm run check:contrast
```

```bash
node scripts/tonal-audit.mjs catalogue/exemples/tableau-de-bord.html
```

```bash
npm run check:search
```

Le premier vérifie chaque paire texte/fond des deux thèmes et refuse tout noir ou
blanc pur. Le second capture un écran et chiffre la part de fond, de gris moyens,
d'éclat et de signal, ainsi que le vide ; il demande Playwright
(`npm i -D playwright && npx playwright install chromium`). Le troisième échoue si
l'index de recherche n'est plus à jour.

## Écarts par rapport à la maquette d'origine

Les références visuelles priment sur la maquette. Ce qui a changé :

| Maquette v1 | MONO | Raison |
|---|---|---|
| Textes de 8 à 10 px | Plancher à 11 px, 13 px par défaut | Lisibilité |
| Sans-serif pour les textes courants | Monospace partout ; sans-serif pour la prose longue seulement | Les références sont entièrement en monospace |
| Aucune couleur | Un signal rouge, sous 1 % | Les références l'emploient pour désigner la donnée clé |
| Dégradés dans les aires et les espacements | Aplats uniquement | Références plates |
| Interrupteur arrondi | Angles droits partout | Cohérence des formes |
| Barres en quatre gris alternés | Un gris moyen, valeurs en clair | Un ton par sens ; le chiffre porte le clair |
| Carte du monde en points | Graticule pointillé à coordonnées | Référence cartographique |
| Thème sombre seul | Thèmes encre et papier, blocs inversés | Les références jouent du panneau sombre sur fond clair |
| Grain fixe sur toute la page | Utilitaire optionnel `.u-grain` | Ne doit pas nuire au texte |
| Filets en `rgba` | Tons opaques nommés | Contrastes mesurables |
