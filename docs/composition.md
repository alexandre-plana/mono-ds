# Composition

Démonstration : `catalogue/composition.html`. Exemples : `catalogue/exemples/`.

Un écran se compose comme une page imprimée : des masses de ton, des axes, du vide.
Les composants viennent après.

## Masses tonales

Tout écran se répartit en quatre masses. Les valeurs ci-dessous sont mesurées en
part de pixels de la vue (1440 × 900) par `scripts/tonal-audit.mjs`.

| Masse | Contenu | Cible | Mesuré (tableau de bord) |
|---|---|---|---|
| **Fond** | Fond, creux, surfaces | ≥ 88 % | 94,7 % |
| **Trame** | Gris moyens : filets, texte secondaire, marques | 2 – 10 % | 4,3 % |
| **Éclat** | Ton opposé au fond : titres, chiffres, action primaire | ≤ 3 % | 0,6 % |
| **Signal** | L'exception | ≤ 1 % | 0,3 % |

- **M1 — L'éclat est rare.** Le ton le plus clair ne s'emploie qu'en trait ou en
  glyphe. La seule surface claire admise est le bouton primaire.
- **M2 — Les aplats sont moyens.** Toute surface étendue (barre, aire, segment
  actif) prend un gris moyen. Plus une forme est grande, plus son ton se rapproche
  du fond.
- **M3 — Un bloc inversé, un tiers au plus.** Un panneau du thème opposé peut
  porter une figure. Il est unique sur la vue et n'en couvre pas plus du tiers ;
  l'éclat mesuré peut alors monter jusqu'à 35 % et le fond descendre à 60 %.
- **M4 — Répartir, ne pas empiler.** Les éléments clairs se répondent en
  diagonale ou en triangle, jamais tous dans le même quart d'écran.
- **M5 — Plisser les yeux.** Écran flouté : un point clair, deux ou trois nappes
  grises, le reste uni.
- **M7 — Le résultat, pas le contrôle.** Après une action, le clair va à ce qui
  a changé : le chiffre, la liste filtrée, la vue ouverte. L'onglet, le filtre ou
  la fiche choisis ne changent que de contour, en gris moyen.
- **M6 — Mesurer.** `node scripts/tonal-audit.mjs <page>`.

## Équilibre

- **C1 — Peu d'axes.** Tous les blocs s'accrochent à trois ou quatre axes
  verticaux pris sur la grille (ex. colonnes 1, 4, 10).
- **C2 — Grappes et silences.** Dense dans un groupe, très large entre deux
  groupes. Un tiers de l'écran au moins reste vide, d'un seul tenant si possible.
- **C3 — Un point focal.** Un seul élément porte le ton le plus clair en aplat ou
  en grand corps : un chiffre héros, un titre, ou l'action primaire.
- **C4 — Contrepoids.** La masse principale part du haut à gauche ; un élément
  petit mais marqué (folio, clé, référence, action) lui répond en bas à droite.
- **C5 — Filets, pas de boîtes.** Un filet au-dessus de chaque groupe et de
  l'espace autour. Jamais de cadre dans un cadre.
- **C6 — Le signal désigne.** Une marque et le texte qui la commente : plusieurs
  occurrences, un seul fait.
- **C7 — Ferré à gauche.** Seuls les chiffres en colonne s'alignent à droite.
  Rien n'est centré, hormis un glyphe dans son contrôle.
- **C8 — Cadre de page.** `.c-masthead` en haut, `.c-colophon` en bas, mêmes
  marges des quatre côtés.
- **C9 — Marges généreuses.** La marge extérieure vaut au moins deux gouttières.
- **C10 — Ligne courte.** 68 caractères pour la prose, 46 pour un chapeau.
- **C11 — Au cordeau.** Dans une rangée, toutes les colonnes partent de la même
  ligne et s'ouvrent par le même style de texte : la première ligne de base est
  commune. Poser les blocs dans des rangées de grille partagées plutôt que dans
  des piles indépendantes, sinon les lignes dérivent.
- **C12 — Le texte tient l'axe.** Sur un axe vertical, c'est le premier caractère
  qui s'aligne, pas le bord d'un cadre. Un filet d'accompagnement sort dans la
  gouttière (`.c-notice--hang`) ; un titre de groupe revient à la ligne avant ses
  contrôles, qui repartent de l'axe.

## Cadre : page et plan de travail

La page est une feuille posée sur un plan de travail. `<body class="l-desk">` est
le plan : un fond uni, un ton plus sombre que la page, visible sur une bande de 24 px autour de la page.
`.l-shell` est la page : fond uni, contour d'un pixel.

- **K1 — Un contour, toujours.** Toute page a son contour. C'est le seul cadre
  systématique ; à l'intérieur, la règle reste le filet avant la boîte.
- **K2 — Retrait constant.** `--shell-inset` : 24 px sur grand écran, 8 px sur
  téléphone, identique des quatre côtés et entre deux pages voisines.
- **K3 — Le plan uni, les hachures sous la modale.** Le plan de travail est d'un
  seul ton, sans motif. Les hachures n'apparaissent qu'à un moment : sous une
  modale, où elles couvrent la page devenue hors d'atteinte. Jamais comme fond de
  page, de composant ou de graphique.
- **K4 — Légères.** Traits d'un pixel à 135°, tous les 7 px, sur un voile au ton
  du plan de travail (`.c-dialog::backdrop`).

- **K7 — Dans la page, ou hors de la page.** L'image dit à qui un contenu
  appartient. Séparé par l'espace seul (`.l-detail`), il est dans la page : il suit
  son onglet. Posé à côté, dans sa propre page à contour (`.l-desk--split`), il est hors de la page : il
  ne dépend d'aucun onglet, et la rangée d'onglets s'arrête avant lui. Un
  inspecteur est attaché par défaut ; on l'épingle pour le sortir, on le rattache
  pour le rentrer.
- **K8 — Pas de cloison dans la page.** Deux régions d'une même page se séparent
  par l'espace — au moins 64 px, quatre fois l'écart interne — jamais par un filet
  vertical. Les filets horizontaux qui s'arrêtent net et un axe de texte propre
  suffisent. Empilées sur écran étroit, elles reprennent un filet horizontal.
- **K5 — Les pages se répondent.** Deux pages voisines ont des en-têtes et des
  barres d'état de même hauteur : leurs filets tombent sur les mêmes lignes.
- **K6 — À gauche la collection, à droite le détail.** L'inspecteur est permanent
  et ne bloque rien ; la bande de plan de travail qui le sépare de la collection se saisit
  pour le redimensionner (`.l-splitter`). Le détail d'un élément ne s'ouvre jamais
  en modale.

`.l-desk` est une grille : plusieurs `.l-shell` côte à côte sont séparés par la
même bande de plan de travail.

### Shell d'application

Une application tient en une page et deux lignes fixes : en haut la ligne de tête,
en bas la barre d'état. Ce que porte la ligne de tête dépend de la forme de
l'application.

| Forme | Ligne de tête | Gabarit |
|---|---|---|
| Arborescente : on descend dans un arbre, on travaille dans une branche | Le chemin, `.c-pathnav` : chaque segment ouvre ses voisins | `catalogue/exemples/application.html` |
| À parties séparées : on saute sans cesse de l'une à l'autre | Le fil d'Ariane ; les parties sont des onglets persistants (`.c-doctabs`) au-dessus de la page | `catalogue/exemples/application-modules.html` |

Les deux partagent trois moyens de se déplacer hors de l'ordre :

- **Le plan** (`.c-plan`, touche G, ou un clic sur le plan de travail) : on recule d'un
  cran et l'on voit toutes les pages de l'application posées sur le plan de
  travail, les familles séparées par le plan de travail.
- **À côté** : depuis le plan, une page se pose à droite de celle où l'on
  travaille (`.l-desk--split`). On lit l'une en agissant sur l'autre.
- **Aller à** (`.c-palette`, touche /) : une recherche qui saute à un écran, un
  objet ou une action, sans avoir à savoir où il est rangé.

Règles :

- **A1 — Deux lignes fixes.** Ni rail, ni barre d'outils permanente, ni console ancrée.
- **A2 — Des mots, pas des signes.** Ni numéros seuls, ni icônes seules, ni texte
  vertical : on sait où cliquer et ce qu'on va trouver.
- **A3 — Un seul moyen principal** : le chemin ou les onglets, jamais les deux.
  Dans les deux cas la ligne de tête dit où l'on est : le chemin, ou le fil d'Ariane.
- **A7 — Un onglet tient sa promesse.** Une page ouverte en onglet garde son état
  (filtre, ligne ouverte, défilement, saisie). Sans persistance, pas d'onglets.
- **A8 — Rien ne se perd au débordement.** Les onglets qui ne tiennent plus vont
  dans le menu « … » ; l'onglet courant reste visible.
- **A4 — Le plan de travail est la carte.** Les pages y gardent leur place :
  l'emplacement est une mémoire.
- **A5 — Deux pages plutôt qu'un aller-retour.**
- **A6 — Les outils viennent à la demande** : console, aide et raccourcis sont
  des fenêtres.

Pistes écartées : le rail de navigation (une région fixe de plus), les onglets
numérotés en marge (on ne sait ni où cliquer ni à quoi correspondent les numéros)
et les pages empilées sur la tranche (lecture verticale, largeur perdue).

### Application : collection et inspecteur

```html
<body class="l-desk l-desk--app l-desk--split">
  <div class="l-shell">
    <div class="l-pane">
      <div class="l-pane__head">
        <header class="c-masthead">…</header>
        <div class="l-pane__bar">…recherche, filtres…</div>
      </div>
      <main class="l-pane__body">…tableau, lignes <tr tabindex="0" aria-selected>…</main>
      <div class="l-pane__foot"><div class="c-statusbar">…</div></div>
    </div>
  </div>
  <div class="l-splitter" role="separator" aria-orientation="vertical" tabindex="0"></div>
  <aside class="l-shell" aria-label="Inspecteur">
    <div class="l-pane">…même structure : le détail de la ligne sélectionnée…</div>
  </aside>
</body>
```

La ligne sélectionnée ne change que de contour ; c'est l'inspecteur — le résultat
de la sélection — qui porte le clair. Exemple complet :
`catalogue/exemples/collection.html`.

## Méthode

1. **Nommer le point focal** — une phrase : ce que l'écran doit dire.
2. **Choisir trois axes** sur la grille de 12.
3. **Former les grappes** — serré dedans, 48 à 96 px dehors.
4. **Réserver le vide** — un tiers de la vue.
5. **Poser les tons** — gris moyens d'abord, éclat ensuite.
6. **Placer le contrepoids** à l'opposé de la masse principale.
7. **Décider du signal** — un fait, ou aucun.
8. **Mesurer** — `contrast.mjs`, `tonal-audit.mjs`.

## Squelette d'écran

```html
<html lang="fr" data-theme="encre">
<link rel="stylesheet" href="src/mono.css">
<body class="l-desk">
 <div class="l-shell">
  <div class="l-page l-frame">
    <header class="c-masthead">
      <div class="c-masthead__title">Titre de l'écran</div>
      <div class="c-masthead__meta"><span>Contexte</span><span>Date</span></div>
    </header>
    <main class="l-grid" style="padding-block: var(--space-7); row-gap: var(--space-7); align-content: start; align-items: start">
      <section class="l-span-3 l-stack">…point focal…</section>
      <figure class="l-span-6 v-figure">…figure…</figure>
      <aside class="l-span-3 l-stack">…contexte…</aside>
    </main>
    <footer class="c-colophon"><span>Source</span><span class="c-ref">REF-001</span></footer>
  </div>
 </div>
</body>
</html>
```
