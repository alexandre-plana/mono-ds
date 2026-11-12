# Fondations

Source : `src/tokens.css`. Démonstration : `catalogue/fondations.html`.

## Tons

Treize gris bruts, `--tone-0` (`#131415`) à `--tone-12` (`#E9E9E5`). Les sombres
tirent très légèrement vers le froid, les clairs vers le chaud. **Ils ne
s'emploient jamais directement** : un composant ne connaît que des rôles.

## Rôles

| Rôle | Emploi | Encre | Papier | Contraste min. |
|---|---|---|---|---|
| `--bg-sunken` | Creux : code, zones en retrait | tone-0 | `#CBCBC7` | — |
| `--bg` | Fond de page | tone-1 | tone-10 | — |
| `--surface` | Surface détachée, ligne survolée | tone-2 | tone-11 | — |
| `--surface-2` | Survol de contrôle, infobulle | tone-3 | tone-12 | — |
| `--line-faint` | Filet de rang | tone-4 | `#C2C2BE` | décoratif |
| `--line` | Filet de structure | tone-5 | `#A9AAA7` | décoratif |
| `--line-strong` | Bordure de contrôle | tone-6 | `#77787A` | 3 : 1 |
| `--fg-muted` | Texte tertiaire : unités, folios | tone-7 | `#57585A` | 4,5 : 1 |
| `--fg-soft` | Texte secondaire, légendes | tone-8 | tone-5 | 4,5 : 1 |
| `--fg` | Texte courant | tone-9 | tone-3 | 7 : 1 |
| `--fg-strong` | Titres, labels, chiffres clés | tone-11 | tone-1 | 7 : 1 |
| `--inverse-bg` / `--inverse-fg` | Bloc inversé : action primaire | tone-10 / tone-1 | tone-2 / tone-10 | 7 : 1 |
| `--mark`, `--mark-2`, `--mark-3` | Marques de données | tone-7, 9, 6 | — | 3 : 1 |
| `--signal` / `--on-signal` | L'exception | `#EA4F63` | `#AD1F37` | 4,5 : 1 |

Règles :

- **T1 — Quatre niveaux de texte**, pas cinq : fort, courant, secondaire, tertiaire.
- **T2 — Le clair se mérite** : `--fg-strong` nomme ou chiffre. Jamais un paragraphe entier.
- **T3 — Élévation par le ton** : une surface se détache en s'éclaircissant d'un cran,
  jamais par une ombre. Trois plans au plus : creux, fond, surface.
- Toute nouvelle paire texte/fond s'ajoute à `scripts/contrast.mjs`.

## Thèmes

`data-theme="encre"` (défaut, clair sur sombre) ou `data-theme="papier"` (sombre sur
clair), sur `<html>` ou sur n'importe quel bloc pour l'inverser localement.

## Signal

Une seule teinte. Elle répond à : *« qu'est-ce qui, sur cet écran, ne doit pas être
manqué ? »* S'il n'y a rien, il n'y a pas de signal — c'est le cas le plus fréquent.

| Le signal sert à | Le signal ne sert jamais à |
|---|---|
| Désigner LA donnée dont on parle | Distinguer des séries entre elles |
| Marquer un état critique ou une erreur | Dire « succès », « info », « nouveau » |
| Annoncer une action irréversible | Habiller l'action primaire courante |
| Un point, un trait, un mot, un chiffre | Un fond, un bandeau, un paragraphe |

- **S1 — Moins de 1 %** de la surface visible.
- **S2 — Un seul sens par écran** : tout ce qui est rouge sur une vue désigne le même fait.
- **S3 — Jamais seul** : le signal double toujours une forme, une graisse ou un mot.
- **S4 — Ajouté en dernier** : on compose en gris, puis on pose le signal.

Changer la teinte du système : modifier `--signal-on-dark` et `--signal-on-light`,
puis relancer `scripts/contrast.mjs`. Il n'y a jamais de seconde teinte.

## Typographie

IBM Plex Mono est la voix du système (interface, données, titres). IBM Plex Sans ne
sert qu'à la prose de plus de trois lignes (`.t-prose`).

| Classe | Corps / interligne | Emploi |
|---|---|---|
| `.t-hero` | 48 / 56 | Un chiffre ou un titre unique |
| `.t-display` | 32 / 40 | Titre d'écran |
| `.t-title` | 24 / 32 | Titre de section |
| `.t-large` | 18 / 28 | Sous-titre, titre de figure |
| `.t-body` | 13 / 20 | Interface et données (défaut) |
| `.t-prose` | 15 / 24, sans | Lecture longue, 68 caractères au plus |
| `.t-small` | 12 / 16 | Notes |
| `.t-micro` | 11 / 16, capitales, .14em | Légendes, unités, folios |
| `.t-label` | capitales, 600, .06em | Nomme une valeur |
| `.t-spaced` | capitales, .32em | Titre espacé |

- **Y1 — Plancher à 11 px**, réservé aux capitales espacées ; 12 px au moins en bas de casse.
- **Y2 — Trois corps par écran.**
- **Y3 — Capitales = espacées** : .06em en label, .14em en micro, .32em en titre.
- **Y4 — Label gras, valeur maigre** (600 / 400).
- **Y5 — Chiffres tabulaires**, alignés à droite en colonne, même précision.
- **Y6 — Ni italique ni souligné** ; l'emphase passe par la graisse ou le ton.

## Espace

Base 4 px : `--space-1` (4) · 2 (8) · 3 (12) · 4 (16) · 5 (24) · 6 (32) · 7 (48) ·
8 (64) · 9 (96) · 10 (128). Grille de 12 colonnes, gouttière 24 px, marge 20 à 64 px.

- **E1 — Serré dedans, large dehors** : 4–8 px dans un groupe, 48–96 px entre groupes.
- **E2 — Sauter des crans** entre deux niveaux d'imbrication (8 → 24, 16 → 48).
- **E3 — Tout sur la base 4** : interlignes, contrôles (32 / 40 px), marges.

## Filets

| Style | Sens | Classe |
|---|---|---|
| Plein | Structure : sépare, souligne, porte un axe | `.c-rule` (`--faint`, `--strong`) |
| Tireté | Relation, inactif, provisoire | `.c-rule--dashed` |
| Pointillé | Repère : grille, graticule | `.c-rule--dotted` |

- **F1 — Un pixel.** 2 à 4 px sont réservés à l'état actif et aux marques de données.
- **F2 — Filet conducteur** entre un label et sa valeur éloignée (`.c-kv`, `.c-index`).
- **F3 — Pas de cadre par défaut** : un filet au-dessus et de l'espace.

## Formes

Rayon 0 partout ; le cercle est réservé aux marques de données, aux radios et aux
glyphes de statut. Aucune ombre, aucun dégradé. Transitions de 120 ms, sur la
couleur et la bordure uniquement.
