# Composants

Source : `src/components.css`, `src/base.css`. Le code de chaque composant est
affiché dans `catalogue/composants.html` (bouton « Code » sous chaque démonstration).

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
| `.c-segmented` | `__item[aria-pressed]` | 2 à 4 options exclusives ; actif en gris moyen |
| `.c-nav` | `__label`, `__item[aria-current]` | Menu numéroté |
| `.c-breadcrumb`, `.c-pagination` | `[aria-current]` | — |

## Saisie

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-field` | `__label`, `__hint`, `__error` | Label toujours visible, au-dessus |
| `.c-input`, `.c-select`, `.c-textarea` | `[aria-invalid="true"]`, `disabled` | Erreur = texte + glyphe ; le signal désigne |
| `.c-check` (`<label><input><span>`) | checkbox ou radio | Carré = multiple, rond = unique |
| `.c-switch` (`<label><input role="switch"><span>`) | — | Effet immédiat uniquement |

## États et retours

| Composant | Éléments et variantes | Règle d'emploi |
|---|---|---|
| `.c-status` | `--on`, `--progress`, `--off`, `--warning`, `--critical` | Forme + mot ; seul `--critical` prend le signal |
| `.c-tag` | `--solid`, `--dashed` | Métadonnée courte |
| `.c-ref` | — | Référence entre parenthèses : `( WAP375CD )` |
| `.c-notice` | `__label`, `--signal` | Note en marge du flux |
| `.c-tooltip`, `.c-toast` (`--signal`), `.c-dialog` (`__title`, `__actions`) | — | `<dialog>` natif |
| `.c-code`, `code` | — | Bloc de code en creux |
| `.c-icon` | `--small` | Trait 1,25, grille 24, hérite de la couleur du texte |

## Règles transversales

- **Inactif = tireté**, jamais une opacité réduite : le texte reste lisible.
- **Survol = un cran de ton** ou une bordure qui s'éclaircit. Pas de déplacement.
- **Focus = contour de 2 px** en `--fg-strong`, décalé de 3 px. Jamais supprimé.
- **Hauteur de contrôle : 32 px** (40 px en `--large`), cible tactile comprise.
- **Ajouter un composant** : rôles sémantiques uniquement, préfixe `.c-`, une
  démonstration `data-code` dans le catalogue, et aucune nouvelle couleur.
