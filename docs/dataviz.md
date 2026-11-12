# Visualisations

Source : `src/viz.css` (classes `.v-` pour éléments SVG). Démonstration :
`catalogue/dataviz.html`. Les fonctions de `catalogue/assets/charts.js` sont des
exemples de mise en œuvre, pas une bibliothèque : n'importe quel outil de tracé
convient s'il applique les classes ou les rôles ci-dessous.

## Règles

- **V1 — Marques en gris moyen.** Barres et aires prennent `--mark`, pas le ton
  le plus clair : une grande surface claire écrase les chiffres.
- **V2 — Le chiffre est le clair.** Valeurs en `--fg-strong`, posées sur la
  marque. Tout étiqueter si la place existe, sinon le maximum, le dernier et
  l'exception.
- **V3 — Une donnée en signal.** Celle dont parle le titre. Jamais une catégorie
  parmi d'autres.
- **V4 — Séries par ton et par trait.** Trois au plus : clair plein, moyen plein,
  moyen tireté. Au-delà, des petits multiples. Jamais une teinte par série.
- **V5 — Grille pointillée.** Repères discrets, axe de base plein, aucun cadre.
- **V6 — Titre, unité, source.** Le titre dit le constat ; l'unité est en
  micro-capitales ; la source est sous la figure.
- **V7 — Légende en clé.** Étiquetage direct d'abord ; `.c-key` nomme les formes.
- **V9 — Pas de camembert.** Les parts d'un tout se lisent sur une barre de
  répartition (`.v-share`), ou sur une carte proportionnelle au-delà de cinq parts.
  Ni disque, ni anneau, ni jauge circulaire.
- **V8 — Plat et droit.** Ni dégradé, ni ombre, ni arrondi, ni 3D. Un seul axe
  vertical. Texte à 11 px au moins : tracer à la taille réelle, ne pas réduire un
  `viewBox`.

## Classes

| Classe | Emploi |
|---|---|
| `.v-figure`, `__title`, `__caption`, `__source` | Enveloppe d'une figure |
| `.v-axis`, `.v-tick` | Axe de base, graduations |
| `.v-grid`, `.v-grid--solid`, `.v-graticule` | Repères pointillés |
| `.v-mark`, `--2`, `--3`, `--strong`, `--signal`, `--ghost`, `.is-dimmed` | Aplats : barres, aires |
| `.v-line`, `--2`, `--3` (tireté), `--signal` | Courbes |
| `.v-link`, `--solid`, `.v-bar-line` | Liens pointillés, barres-traits |
| `.v-dot`, `--soft`, `--signal` ; `.v-ring`, `--signal` ; `.v-halo` | Points, anneaux proportionnels |
| `.v-label`, `--muted`, `--strong`, `--signal` ; `.v-value`, `--signal` | Texte d'axe, valeurs |
| `.v-hit`, `.v-tip` | Zone de survol, infobulle |
| `.v-hbars`, `.v-hbar` (`--signal`, `--strong`) | Barres horizontales en HTML |
| `.v-cell`, `--2` ; `.v-value--large` | Tuiles d'une carte proportionnelle (treemap) |
| `.v-strate`, `--raster`, `--open` | Plein, tramé, contour : trois séries par le trait |
| `.v-callout`, `.v-tick--mark`, `--signal`, `.v-axis--signal` | Ligne de rappel, graduations de valeur |
| `.v-share` | Barre de répartition en HTML : remplace le camembert |
| `.v-spark` | Courbe de tendance dans une ligne de texte |

## Accessibilité

- Chaque graphique porte `role="img"` et un `aria-label` qui énonce le constat.
- Les marques interactives sont focalisables et annoncent leur valeur.
- Le signal double toujours une étiquette ; un tableau équivalent accompagne toute
  figure dont les valeurs exactes comptent.

## Choisir un graphique

| Question | Graphique | Fonction de démonstration |
|---|---|---|
| Comment une grandeur évolue-t-elle ? | Barres (peu de points), courbes (beaucoup) | `bars`, `lines` |
| Comment un tout se partage-t-il ? | Grille d'unités (cent carrés), barre de répartition ; carte proportionnelle au-delà de cinq parts | `waffle`, `.v-share`, `treemap` |
| Comment ce partage évolue-t-il ? | Strates : barres empilées à trois traits | `stack` |
| Deux grandeurs sont-elles liées ? | Nuage annoté : graduations sur les axes, médianes, ligne de rappel | `scatter` |
| Où est la densité, sur deux axes ? | Matrice perforée : la taille du carré dit la quantité | `heat` |
| Comment une forme se déplace-t-elle, sur beaucoup de séries ? | Crêtes | `ridges` |
| Comment des valeurs se répartissent-elles ? | Frise : un trait par valeur sur une règle | `strip` |
| Quelle allure, dans une ligne de tableau ? | Courbe de tendance | `spark` |
| Quel classement ? | Barres horizontales | `.v-hbars` |
| Quelle structure ? | Arbre | `tree` |
| Où ? | Carte à graticule | `graticule` |

Trois idées tiennent ces graphiques ensemble :

- **Le trait avant le ton.** Trois séries se distinguent par plein, tramé (lignes
  horizontales, comme les images tramées) et contour seul (`.v-strate`,
  `--raster`, `--open`) — pas par trois gris, qui se confondent et s'inversent
  d'un thème à l'autre.
- **Les signes du système annotent.** Repères d'angle autour du point désigné,
  ligne de rappel vers sa note (`.v-callout`), crochets pour une médiane,
  graduations (`.v-tick--mark`) pour chaque valeur.
- **Le vide reste vide.** Une matrice ne se couvre pas d'aplats : zéro est un
  point. Une carte proportionnelle est en ton bas.
