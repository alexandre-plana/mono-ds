# Composants

Source : `src/components.css`, `src/base.css`. Dans `catalogue/composants.html`,
chaque composant est montré avec son code (bouton « Code ») et sa fiche : quand
l'employer, quand l'éviter, ses variantes, ses états, son accessibilité. Ce
document en est l'index ; le pourquoi est dans `philosophie.md`.

Préfixes : `.t-` texte · `.l-` mise en page · `.c-` composant · `.v-` donnée · `.u-` utilitaire.
États : `.is-*` et attributs ARIA (`aria-selected`, `aria-current`, `aria-pressed`,
`aria-invalid`, `disabled`).

## Mise en page

| Classe | Rôle |
|---|---|
| `.l-desk` (sur `<body>`) | Plan de travail uni ; grille dont la gouttière sépare les pages |
| `.l-shell` | La page : fond uni, contour d'un pixel, en retrait de `--shell-inset` |
| `.l-desk--app`, `.l-desk--split` | Application : le plan occupe l'écran, chaque page défile seule ; deux pages côte à côte (collection + inspecteur, `--inspector`) |
| `.l-desk--os`, `.l-desk__area` | Version bureau : le plan occupe l'écran, les fenêtres en sont les pages |
| `.l-detail` (`__main`, `__aside`, `__head`, `.has-aside`) | Inspecteur attaché : dans la page, séparé par 64 px d'espace, sans filet vertical ; il suit son onglet. Épinglé, il sort à côté (`.l-desk--split`) |
| `.l-splitter` | `role="separator"`, `.is-dragging` | La bande de plan de travail entre deux pages se saisit pour régler `--inspector` |
| `.l-pane` (`__head`, `__bar`, `__body`, `__foot`) | Volet d'application : en-tête fixe, barre d'outils, corps défilant, pied |
| `.l-page` | Conteneur : largeur max. 1440 px, marges de page |
| `.l-frame` | Pleine hauteur : en-tête / contenu / pied |
| `.l-grid` + `.l-span-1…12`, `.l-start-2…10` | Grille de 12 colonnes (6 puis 1 en étroit) |
| `.l-stack` (`--tight`, `--loose`, `--section`) | Pile verticale ; `--gap` règle l'intervalle |
| `.l-cluster` | Grappe horizontale qui passe à la ligne |
| `.l-split` | Deux extrémités d'une ligne |
| `.l-rail` | Rail latéral + contenu (`--rail` règle la largeur) |

## Structure

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-masthead` | `__title`, `__meta` | Un par écran |
| `.c-section-head` | `__num`, `__aside` | Ouvre chaque région |
| `.c-colophon` | — | Pied d'écran : source, folio, référence |
| `.c-doctabs` | `__tab[aria-selected]`, `__label`, `__close`, `__tab--tool`, `__more` (`<details class="c-menu">`) ; plan de travail `.l-desk--tabs` | Navigation des applications à parties séparées. Un onglet est une page qui reste ouverte et garde son état ; au-delà de la largeur, menu « … ». Jamais avec `.c-pathnav` |
| `.c-taskbar` | `__group` (`--windows`), `__item[aria-pressed]`, `.is-minimized`, `__meta` | Barre des fenêtres, en version bureau seulement. Active = trait de 2 px dessus ; réduite = tireté |
| `.c-console` | `__head`, `__log`, `__line` (`--warn`, `--error`, `--cmd`), `__time`, `__mark`, `__prompt` ; `--fill` | Journal et ligne de commande. Niveau lu au glyphe (· ▲ ■ >), jamais à une teinte |
| `.c-canvas` | `__plane`, `__item[aria-selected]`, `__head`, `__body` ; `--x`, `--y`, `--z`, `--grid` | Surface libre de représentations. Sa trame de points est la grille d'aimantation, et n'existe que là |
| `.c-statusbar` | `__group` | Pied d'un volet : position, état d'enregistrement, raccourcis (`.c-kbd`) |
| `.c-panel` | `--surface`, `--sunken`, `--dashed`, `--flush`, `__head`, `[data-theme]` | Seulement pour détacher du flux. Un bloc inversé par vue |
| `.c-card` (+ `.c-cards`) | `__head`, `__title` (`--label`), `__body`, `__media`, `__foot` ; `--boxed`, `--surface`, `--dashed`, `--signal` ; `aria-current` / `aria-selected` | Collection d'objets de même nature. Un filet, pas une boîte ; jamais de fiche dans une fiche |
| `.c-board` | `__col` (`.is-target`), `__head`, `__list`, `__drop`, `__add` ; `.c-card.is-dragging`, `.c-card--ghost`, `.c-card__title--small` | Tableau de cartes (kanban) : colonnes sans boîte, fiches glissées de l'une à l'autre, édition par l'inspecteur. Trois à cinq colonnes |
| `.c-media` | `--raw`, `--raster`, `--threshold` ; `--square`, `--wide` ; `__caption` | Image. Dessin du système tel quel ; toute image brute est encrée (`--raw`), tramée si elle est grande ou sombre, seuillée en vignette |
| `.c-cue` (+ `.c-cue-host`) | sur une `.c-icon` en fin d'élément interactif | Indice de survol : dit ce que fera le clic. Automatique (pointe de flèche) sur `tr[tabindex]` et `a.c-card` |
| `.c-disclosure` (+ `.c-accordion`) | `<details>` ; `__body` | Contenu secondaire que peu de lecteurs ouvriront |
| `.c-rule` | `--faint`, `--strong`, `--dashed`, `--dotted` | Voir Filets |

## Listes et données

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-kv` (`<dl>` de `<div><dt><dd>`) | `--plain` | Label gras, filet conducteur, valeur maigre |
| `.c-index` | `__row`, `__title`, `__value` | Numérotation automatique ; sommaire, classement |
| `.c-table` | `--caps`, `--dense`, `.is-num`, `tr.is-key`, `tr.is-muted`, `.is-signal`, `.c-table-wrap`, `tr[tabindex][aria-selected]`, `__sort` + `th[aria-sort]`, `--sticky`, `__check`, `__expand` + `tr.c-table__detail`, `--ruled` | Aucun filet entre les lignes ; un filet sous la ligne survolée ; `--ruled` pour un tableau large ou imprimé ; une cellule signal au plus |
| `.c-bulkbar` | `__count`, `__actions` | Remplace la barre d'outils dès qu'une ligne est cochée ; deux actions au plus |
| `.c-stat` | `__label`, `__value` (+ `<small>` unité), `__note`, `--hero`, `--compact`, `--ruled` | Un seul `--hero` par écran |
| `.c-key` | `__title`, `__item`, `__swatch` (`--2`, `--3`, `--line`, `--dashed`, `--dotted`, `--dot`, `--ring`, `--signal`) | Nomme les formes ; se loge dans un vide |
| `.c-meter` | `--signal`, `style="--value: 42"` | Filet fin + segment épais |

## Actions et navigation

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-button` | `--primary`, `--quiet`, `--signal`, `--large`, `disabled` | **Zéro ou un primaire par vue** : il conclut une tâche (connexion, formulaire, modale), jamais sur un écran de consultation. `--signal` = irréversible |
| `.c-tabs` | `__tab[aria-selected]` | Vues d'un même objet |
| `.c-segmented` | `__item[aria-pressed]` | 2 à 4 options exclusives ; actif = contour de 2 px |
| `.c-menu` (`<details>`) | `__list`, `__label`, `__item` (`--signal`), `__hint`, `__sep` (un espace, pas un trait) ; `--end`, `--up` | 3 à 7 actions secondaires. Jamais l'action principale ; pas de sous-menu dans un menu de bouton |
| `.c-menu__list--context` | `--x`, `--y` ; `.c-menu__sub` (`--left`, `.is-open`) | Menu contextuel au clic droit ; un seul niveau de sous-menu. Aucune action ne doit exister seulement là |
| `.c-chip` | `[aria-pressed]`, `__count`, `disabled` | Filtres cumulables ; aucun actif = tout |
| `.c-steps` | `__step`, `.is-done`, `[aria-current="step"]` | Parcours linéaire de 3 à 6 étapes : plein = fait, épais = en cours, tireté = à venir |
| `.c-nav` | `__label`, `__item[aria-current]` | Menu numéroté |
| `.c-pathnav` | `__home`, `__sep`, `__seg` (`<details class="c-menu">`) | Ligne de tête des applications arborescentes : le chemin est la navigation. Trois niveaux au plus |
| `.c-plan` | `__group`, `__page[aria-current]`, `__head`, `__open`, `__desc`, `__foot`, `__figure`, `__beside` | Toutes les pages de l'application posées sur le plan de travail ; une page s'ouvre en grand ou se pose à côté |
| `.c-palette` (`<dialog>`) | `__search`, `__list`, `__group`, `__item[aria-selected]`, `__type`, `__title`, `__desc`, `__hint`, `__foot` | « Aller à » : saut vers un écran, un objet ou une action. Vide, elle montre les récents puis la carte |
| `.c-breadcrumb`, `.c-pagination` | `[aria-current]` ; `--head` en tête d'une page à onglets | Le fil d'Ariane situe et remonte ; il ne navigue pas entre voisins |

## Saisie

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-field` | `__label`, `__hint`, `__error` | Label toujours visible, au-dessus |
| `.c-input`, `.c-select`, `.c-textarea` | `[aria-invalid="true"]`, `disabled` | Erreur = texte + glyphe ; le signal désigne |
| `.c-check` (`<label><input><span>`) | checkbox ou radio | Carré = multiple, rond = unique |
| `.c-switch` (`<label><input role="switch"><span>`) | — | Effet immédiat uniquement |
| `.c-editable` | `__input` (`<input>` ou `<textarea>`), `__status` ; `data-state` : `idle`, `saving`, `saved`, `error` | Corriger une valeur là où on la lit. Ligne pointillée = modifiable ; Entrée enregistre, Échap annule |
| `.c-search` (`<label>` + `<input type="search">`) | `--large` | Une par page ; filtre à la frappe, sans bouton |
| `.c-kbd` | — | Nomme une touche ou un raccourci |

## États et retours

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-status` | `--on`, `--progress`, `--off`, `--warning`, `--critical` | Forme + mot ; seul `--critical` prend le signal |
| `.c-tag` | `--solid`, `--dashed` | Métadonnée courte |
| `.c-ref` | — | Référence entre parenthèses : `( WAP375CD )` |
| `.c-notice` | `__label`, `--signal`, `--stacked`, `--hang` | Note en marge du flux |
| `.c-tooltip`, `.c-toast` (`--signal`) | `__action` ; `.c-toasts` | Trois toasts au plus, en bas à gauche ; une action et sa touche |
| `.c-notifs` | `__head`, `__list`, `__item` (`.is-unread`), `__meta`, `__text`, `__action`, `__foot` | Centre de notifications dans un `.c-menu` de l'en-tête : les six derniers événements, leur annulation, « Tout voir » |
| `.c-empty` | `__label`, `__title`, `__text`, `__actions` ; `--plain` | Nomme ce qui manque, propose une issue. Ferré à gauche, sans illustration |
| `.c-spinner` | — | `\| / - \\` : une valeur en cours d'enregistrement. Toujours à côté d'elle, jamais seul |
| `.c-loader`, `.c-progress`, `.c-skeleton` | `--title`, `--block` ; `--w`, `--h` | < 1 s : rien · quelques secondes : points ou filet · au-delà : gabarit |
| `.c-code`, `code` | — | Bloc de code en creux |
| `.c-icon` + `.i-nom` | `--large` | Jeu propre, grille 16, trait 1 px ; voir `fondations.md` |

## Superpositions

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-dialog` (`<dialog>`) | `__title`, `__body`, `__stake`, `__actions`, `__aside` ; `--small`, `--column`, `--large` | Tâche courte qui exige une réponse. Une feuille large (32 rem) au centre, sur la page hachurée mais lisible : un titre, une phrase ou quelques champs, les actions à droite. Hauteur du contenu. |
| `.c-dialog--small` (confirmation) | — | Irréversible uniquement. Pas de bouton fermer ; focus initial sur « Annuler » ; seul le bouton porte le signal |
| `.c-window` | `__frame`, `__bar`, `__title`, `__actions`, `__body` (`--flush`) ; `--resizable`, `.is-active`, `.is-maximized`, `.is-minimized` ; `--window`, `--window-height` | Fenêtre flottante non modale : un outil gardé sous la main. Liseré de plan de travail, aucune ombre. Deux au plus |

Deux natures : la modale interrompt (une seule à la fois, voile et filet), la
fenêtre accompagne (elle ne bloque rien). Aucune ne porte d'ombre. Déplacement,
redimensionnement et aimantation des fenêtres ne font pas partie du système : la
version bureau les confie à interact.js (`catalogue/assets/vendor`, licence MIT). Le détail d'un
élément ne va dans aucune des deux : il va dans l'inspecteur — il n'y a pas de tiroir. La modale est posée au centre, ancrée au tiers haut ;
ses actions sont à droite, la principale tout au bout.

## Règles transversales

- **Sélectionné = contour de 2 px** en `--selected-line` (gris moyen). Le fond
  ne change pas, le ton clair n'est jamais employé : onglet, segment, filtre,
  fiche, page courante, case cochée. Le contrôle s'efface ; c'est le résultat de
  l'action qui porte le clair.
- **Modifiable = ligne pointillée sous la valeur**, pleine pendant la saisie.
- **Ce qui vient de changer porte le clair** (`.is-fresh`), le temps de le voir.
- **Un filet se mérite** (F4) : pas de trait sous les en-têtes de tableau, les
  titres de groupe d'un menu ou d'une légende, ni sous une rangée d'onglets de vue.
- **Inactif = tireté**, jamais une opacité réduite : le texte reste lisible.
- **Survol = un cran de ton** ou une bordure qui s'éclaircit. Pas de déplacement.
- **Focus clavier = contour de 2 px** en `--fg-strong`, décalé de 3 px. Jamais
  supprimé : ce n'est pas une sélection, c'est un repère de navigation. Un champ
  de saisie actif s'éclaircit seulement d'un cran (`--fg-soft`).
- **Hauteur de contrôle : 32 px** (40 px en `--large`), cible tactile comprise.
- **Détacher = un cran de ton et un filet.** Menu, infobulle, modale : jamais d'ombre.
- **Natif d'abord** : `<dialog>`, `<details>`, contrôles de formulaire. Le
  système ne fournit aucun script ; les comportements viennent du navigateur.
- **Ajouter un composant** : passer les tests d'écart de `philosophie.md`, puis
  suivre « Étendre le système » dans `CLAUDE.md`.

## Annulation et notifications

On ne demande pas confirmation : on exécute et l'on offre l'annulation. Chaque
modification ou suppression est un événement, montré à trois échelles :

1. **Toast** (`.c-toasts`) — sur le moment, avec « Annuler » ou « Rétablir » et sa touche.
2. **Centre** (`.c-notifs`) — liste condensée, ouverte depuis l'en-tête de toute page.
3. **Écran** — le journal : un `.c-table` à cases, des filtres `.c-chip`, une
   `.c-bulkbar` pour marquer lu, archiver, supprimer.

Une suppression reste rétablissable tant que son événement est au journal. La
modale de confirmation est réservée à l'irréversible. Démonstration :
`catalogue/assets/notifs.js`, branchée dans `exemples/application-modules.html`.
