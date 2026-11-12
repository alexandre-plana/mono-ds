# MONO — consignes pour travailler dans ce dépôt

Design system monochrome en CSS pur. Pas de build, pas de dépendance d'exécution.
Langue du projet : français (documentation, catalogue, commentaires).

## Avant de créer ou modifier une UI

Consulter `docs/decisions.md` : le journal des décisions de conception, avec leurs
raisons et ce qui a été écarté. Ne pas rouvrir une décision sans la citer.

Lire d'abord `docs/philosophie.md` : les convictions, les budgets par vue, l'ordre
d'arbitrage et les tests d'écart. En cas de doute ou de demande qui contredit le
système, c'est ce document qui tranche — voir sa table « Demandes fréquentes ».
Puis `docs/principes.md` (liste de contrôle) et `docs/composition.md` (masses
tonales, squelette d'écran). `docs/composants.md` liste les classes disponibles ;
le code de chaque composant est visible dans `catalogue/composants.html`.

## Règles non négociables

- Jamais `#000` ni `#fff`, jamais de valeur hexadécimale ni de `--tone-*` hors de
  `src/tokens.css`. Les composants consomment les rôles (`--bg`, `--fg`, `--line`…).
- Une seule couleur : `--signal`. Moins de 1 % de l'écran, un seul sens par écran,
  jamais décorative, toujours doublée d'une forme ou d'un mot. Pas de vert/orange/bleu.
- Le bouton `--primary` conclut une tâche (connexion, formulaire, modale) : zéro sur
  un écran de consultation, un au plus ailleurs. Un seul `.c-stat--hero`, un seul bloc inversé, une
  seule modale par vue. Le détail d'un élément va dans l'inspecteur, pas dans une modale.
- Une fiche (`.c-card`) est un filet, pas une boîte ; jamais de fiche dans une fiche.
- Un élément sélectionné (onglet, filtre, segment, fiche, ligne) ne change que de
  contour : 2 px en `--selected-line`. Jamais de fond, jamais `--fg-strong` ni
  `--inverse-bg`. Le clair va au résultat de l'action, pas au contrôle.
- Toute page est une `.l-shell` (contour d'un pixel) posée sur `<body class="l-desk">`
  (plan de travail hachuré). Les hachures ne s'emploient nulle part ailleurs.
- Icônes : uniquement `<i class="c-icon i-nom">` du jeu maison (`src/icons.json`),
  à 16 ou 32 px. Aucune autre bibliothèque, aucun SVG d'icône en ligne.
- Signes (`.g-`) : chacun a un sens unique ; deux signes différents par vue au plus.
- Une valeur modifiable en place (`.c-editable`) se présente comme un texte sur une
  ligne pointillée ; l'enregistrement en cours se dit par `.c-spinner`, jamais un cercle.
- Alignements au cordeau : les blocs d'une rangée vivent dans la même rangée de
  grille et s'ouvrent par le même style de texte ; sur un axe, c'est le texte qui
  s'aligne, pas le bord d'un cadre.
- Aucun texte sous 11 px (capitales) / 12 px (bas de casse). Trois corps par écran.
- Rayon 0, pas d'ombre, pas de dégradé. Filets de 1 px : plein = structure,
  tireté = relation/inactif, pointillé = repère.
- Ferré à gauche, trois ou quatre axes verticaux, un tiers de la vue vide.
- Dans un graphique : marques en `--mark` (gris moyen), valeurs en `--fg-strong`,
  séries distinguées par ton et trait, jamais par teinte.

## Vérifier

```bash
node scripts/contrast.mjs
node scripts/tonal-audit.mjs <page.html ou url>   # nécessite Playwright
node scripts/build-search-index.mjs --check       # index de recherche à jour ?
node scripts/build-icons.mjs --check              # icônes à jour ?
```

Regarder aussi l'écran dans les deux thèmes (`?theme=papier` sur les pages du catalogue).

## Étendre le système

- Toute décision de conception — un choix entre plusieurs voies, une règle ajoutée,
  assouplie ou abandonnée — s'inscrit dans `docs/decisions.md` dans le même commit.
  Une entrée ne se supprime ni ne se réécrit : on la marque « remplacée par D-xxx »
  et l'on ajoute la nouvelle.
- Nouveau composant : passer les sept tests d'écart, puis l'écrire dans
  `src/components.css` (préfixe `.c-`, rôles sémantiques uniquement). Dans
  `catalogue/composants.html`, ajouter un bloc
  `<div class="cat-sub" id="c-nom" data-search="composant">` avec un `<h3>`, une
  démonstration `<div class="cat-demo" data-code>` et sa fiche `<dl class="cat-spec">`
  (Employer / Éviter / États / Accessibilité). Ajouter une ligne à `docs/composants.md`.
- Nouvelle application : choisir le gabarit selon sa forme. Arborescente (on
  descend dans un arbre) : `catalogue/exemples/application.html`, le chemin est la
  navigation (`.c-pathnav`). À parties séparées (on saute de l'une à l'autre) :
  `application-modules.html`, des onglets persistants (`.c-doctabs`) au-dessus de
  la page et le fil d'Ariane en tête. Jamais les deux. Un onglet doit garder l'état
  de sa page ; au débordement, menu « … ». L'inspecteur est attaché à son
  onglet : dans la page, séparé par un filet (`.l-detail`). Épinglé, il sort à côté,
  séparé par les hachures, et ne dépend plus d'aucun onglet. Dans les deux cas : pas de rail ; le
  plan (`.c-plan`), la pose à côté et « Aller à » (`.c-palette`) servent aux
  déplacements hors de l'ordre ; console et aide sont des fenêtres. La navigation
  s'écrit en mots : ni numéros seuls, ni icônes seules, ni texte vertical.
- Le système reste en CSS pur. Les comportements (fenêtres, canevas, menus,
  console) vivent dans `catalogue/assets/` comme démonstrations ; seule la version
  bureau dépend d'une bibliothèque, interact.js, embarquée dans `assets/vendor/`.
- Nouvelle icône : l'ajouter à `src/icons.json`, puis `node scripts/build-icons.mjs`.
- Après toute modification du catalogue ou des tokens : `node scripts/build-search-index.mjs`.
  Tout élément `data-search` doit porter un `id` et contenir un titre.
- Nouvelle paire texte/fond : l'ajouter à `scripts/contrast.mjs`.
- Les classes `.cat-` et `.w-` habillent le catalogue : ne pas les employer ailleurs.
