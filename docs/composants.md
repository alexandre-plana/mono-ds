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
| `.c-panel` | `--surface`, `--sunken`, `--dashed`, `--flush`, `__head`, `[data-theme]` | Seulement pour détacher du flux. Un bloc inversé par vue |
| `.c-card` (+ `.c-cards`) | `__head`, `__title` (`--label`), `__body`, `__media`, `__foot` ; `--boxed`, `--surface`, `--dashed`, `--signal` ; `aria-current` / `aria-selected` | Collection d'objets de même nature. Un filet, pas une boîte ; jamais de fiche dans une fiche |
| `.c-disclosure` (+ `.c-accordion`) | `<details>` ; `__body` | Contenu secondaire que peu de lecteurs ouvriront |
| `.c-rule` | `--faint`, `--strong`, `--dashed`, `--dotted` | Voir Filets |

## Listes et données

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-kv` (`<dl>` de `<div><dt><dd>`) | `--plain` | Label gras, filet conducteur, valeur maigre |
| `.c-index` | `__row`, `__title`, `__value` | Numérotation automatique ; sommaire, classement |
| `.c-table` | `--caps`, `--dense`, `.is-num`, `tr.is-key`, `tr.is-muted`, `.is-signal`, `.c-table-wrap` | Filets horizontaux seuls ; une cellule signal au plus |
| `.c-stat` | `__label`, `__value` (+ `<small>` unité), `__note`, `--hero`, `--compact`, `--ruled` | Un seul `--hero` par écran |
| `.c-key` | `__title`, `__item`, `__swatch` (`--2`, `--3`, `--line`, `--dashed`, `--dotted`, `--dot`, `--ring`, `--signal`) | Nomme les formes ; se loge dans un vide |
| `.c-meter` | `--signal`, `style="--value: 42"` | Filet fin + segment épais |

## Actions et navigation

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-button` | `--primary`, `--quiet`, `--signal`, `--large`, `disabled` | **Un seul primaire par vue.** `--signal` = irréversible |
| `.c-tabs` | `__tab[aria-selected]` | Vues d'un même objet |
| `.c-segmented` | `__item[aria-pressed]` | 2 à 4 options exclusives ; actif en retrait (`--selected-bg`) |
| `.c-menu` (`<details>`) | `__list`, `__label`, `__item` (`--signal`), `__hint`, `__sep` ; `--end` | 3 à 7 actions secondaires. Jamais l'action principale, jamais de sous-menu |
| `.c-chip` | `[aria-pressed]`, `__count`, `disabled` | Filtres cumulables ; aucun actif = tout |
| `.c-steps` | `__step`, `.is-done`, `[aria-current="step"]` | Parcours linéaire de 3 à 6 étapes : plein = fait, épais = en cours, tireté = à venir |
| `.c-nav` | `__label`, `__item[aria-current]` | Menu numéroté |
| `.c-breadcrumb`, `.c-pagination` | `[aria-current]` | — |

## Saisie

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-field` | `__label`, `__hint`, `__error` | Label toujours visible, au-dessus |
| `.c-input`, `.c-select`, `.c-textarea` | `[aria-invalid="true"]`, `disabled` | Erreur = texte + glyphe ; le signal désigne |
| `.c-check` (`<label><input><span>`) | checkbox ou radio | Carré = multiple, rond = unique |
| `.c-switch` (`<label><input role="switch"><span>`) | — | Effet immédiat uniquement |
| `.c-search` (`<label>` + `<input type="search">`) | `--large` | Une par page ; filtre à la frappe, sans bouton |
| `.c-kbd` | — | Nomme une touche ou un raccourci |

## États et retours

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-status` | `--on`, `--progress`, `--off`, `--warning`, `--critical` | Forme + mot ; seul `--critical` prend le signal |
| `.c-tag` | `--solid`, `--dashed` | Métadonnée courte |
| `.c-ref` | — | Référence entre parenthèses : `( WAP375CD )` |
| `.c-notice` | `__label`, `--signal` | Note en marge du flux |
| `.c-tooltip`, `.c-toast` (`--signal`) | — | Une notification à la fois, en bas à gauche |
| `.c-empty` | `__label`, `__title`, `__text`, `__actions` ; `--plain` | Nomme ce qui manque, propose une issue. Ferré à gauche, sans illustration |
| `.c-loader`, `.c-progress`, `.c-skeleton` | `--title`, `--block` ; `--w`, `--h` | < 1 s : rien · quelques secondes : points ou filet · au-delà : gabarit |
| `.c-code`, `code` | — | Bloc de code en creux |
| `.c-icon` | `--small` | Trait 1,25, grille 24, hérite de la couleur du texte |

## Superpositions

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-dialog` (`<dialog>`) | `__head`, `__title`, `__body`, `__actions`, `__aside` ; `--small`, `--large` | Tâche courte qui exige une réponse. Titre = verbe + objet ; le bouton principal répète le verbe |
| `.c-dialog--small` (confirmation) | — | Irréversible uniquement. Pas de bouton fermer ; focus initial sur « Annuler » ; seul le bouton porte le signal |
| `.c-dialog--drawer` (tiroir) | — | Détail d'un élément de liste, à droite, contexte visible à gauche |

Une seule superposition à la fois, jamais l'une sur l'autre. Elle se détache par
un voile et un filet, jamais par une ombre. La modale est ancrée au tiers haut ;
ses actions sont ferrées à gauche, la principale en premier.

## Règles transversales

- **Sélectionné = gris moyen** (`--selected-bg`, `--selected-line`), jamais le ton
  clair : onglet, segment, filtre, fiche, page courante, case cochée. Le contrôle
  s'efface ; c'est le résultat de l'action qui porte le clair.
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
