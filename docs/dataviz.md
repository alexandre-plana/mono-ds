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

## Carte géographique

`catalogue/exemples/carte.html`, tracée par `catalogue/assets/geo.js`.

- **Fond réel, embarqué.** Natural Earth (domaine public), 1:50 000 000, monde
  entier : `assets/vendor/world-50m.js`, 760 Ko. Aucune tuile, aucun service.
  On cadre n'importe quelle partie du monde ; le détail est celui d'un atlas.
- **Dessin.** Terres un ton au-dessus du fond (`.v-land`) ; côte en filet plein
  (`.v-coast`), parce que c'est une limite physique ; frontière en tireté
  (`.v-border`), parce que c'est une relation ; graticule pointillé coté en degrés ;
  barre d'échelle en kilomètres ; noms de pays en capitales espacées, ton éteint.
- **Données.** Anneaux proportionnels, un seul en signal, toujours nommé. Un nom
  qui toucherait un anneau ou un autre nom se tait ; l'infobulle le rend. Les
  anneaux rétrécissent aux petites échelles.
- **Limite.** Ni rues, ni relief, ni villes : c'est le rôle du plan détaillé.

## Plan détaillé

`catalogue/exemples/plan.html`, feuille de style dans `catalogue/assets/plan.js`.
Il descend jusqu'à la rue, et c'est le seul écran du système qui dépende de
services en ligne.

| Élément | Source | Dessin |
|---|---|---|
| Relief | Altitudes Terrarium (Mapzen, données ouvertes AWS), converties en courbes par maplibre-contour | Courbes de niveau ; maîtresses plus marquées et cotées. Pas d'ombrage : ce serait un dégradé |
| Eau | OpenStreetMap, tuiles OpenFreeMap | Le ton le plus bas, rive en filet |
| Routes et rail | idem | L'épaisseur et le ton disent le rang ; rail en trait-point |
| Rues et chemins | idem | Filet discret ; chemins tiretés |
| Bâti | idem | Aplat d'un cran, sans contour |
| Limites | idem | Tireté |
| Noms | idem | Capitales espacées, halo au ton du fond |
| Agences | données de l'application | Anneaux proportionnels, un seul en signal |

- **Calques.** Chaque famille s'affiche ou se masque (`.c-check`) ; le compte est
  entre crochets. Les bois sont masqués par défaut.
- **Aucune couleur écrite.** La feuille de style lit les rôles du thème
  (`--bg`, `--line-strong`…) et se reconstruit quand le thème change.
- **Dépendances.** MapLibre GL JS 4.7 et maplibre-contour (BSD-3), embarquées dans
  `assets/vendor/`. Les tuiles sont demandées à `tiles.openfreemap.org` et
  `s3.amazonaws.com` : hors ligne, le plan est vide.
- **Limites.** Les noms sont en Noto Sans (seule police servie en glyphes de
  carte), pas en Plex Mono. Mentions obligatoires dans la barre d'état :
  OpenStreetMap, OpenMapTiles, OpenFreeMap.
