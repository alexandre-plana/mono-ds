<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/captures/logo-encre.gif">
  <img src="docs/captures/logo-papier.gif" alt="MONO — le logo s'écrit lettre par lettre, puis le curseur devient un point rouge" width="760">
</picture>

# MONO

Design system monochrome, sobre et technique, pour les interfaces de données,
les outils et les rapports. Treize gris, une seule couleur, des règles de
composition — et un catalogue pour les réemployer.

![Écran de connexion](docs/captures/connexion.png)

> MONO traite l'écran comme une page imprimée : une encre, un papier, des filets,
> beaucoup de vide — et une seule couleur, gardée pour ce qui ne doit pas être manqué.

## Philosophie

Le système est né de cinq images dont aucune n'est une interface : un dos de
pochette de disque, une étiquette technique sérigraphiée et trois pages d'un
rapport annuel. Quand une décision hésite, la question est toujours la même :
*cela aurait-il sa place sur ces pages ?*

Neuf convictions en découlent. Le détail, les budgets par vue et l'ordre
d'arbitrage sont dans [`docs/philosophie.md`](docs/philosophie.md).

1. **L'écran est une page.** Un format, des marges, un contour d'un pixel, un
   haut à gauche. On compose des vues, pas des assemblages de tuiles.
2. **La retenue fait la hiérarchie.** Le clair, le gras, la grande taille et la
   couleur ne valent que parce qu'ils sont rares : un point focal, un chiffre
   héros, trois corps de texte.
3. **Le gris est une matière.** Treize tons, de `#131415` à `#E9E9E5`. Ni noir
   ni blanc purs. Deux thèmes symétriques : `encre` et `papier`.
4. **La couleur est un événement.** Une seule teinte, le signal, sous 1 % de
   l'écran, pour un seul fait par vue, toujours doublée d'une forme ou d'un mot.
5. **Le vide travaille.** Un tiers de la vue reste libre. C'est l'espace qui
   forme les groupes et donne l'ordre de lecture.
6. **La structure se trace, elle ne s'emboîte pas.** Un filet avant un cadre, et
   un filet se mérite : on essaie d'abord sans. Rayon 0, pas d'ombre, pas de
   dégradé.
7. **Une forme, un sens.** Filet plein : structure. Tireté : relation.
   Pointillé : repère. Hachures : hors d'atteinte. Aucune forme ne décore.
8. **La sélection s'efface devant son résultat.** Un élément sélectionné ne
   change que de contour. Le clair va à ce que l'action a produit.
9. **Lisible avant d'être beau.** 11 px au moins, contrastes WCAG contrôlés par
   script. Quand le style et la lisibilité s'opposent, la lisibilité gagne.

## En images

### Une page, du texte, du vide

Un contour d'un pixel, un titre espacé, un tableau sans aucun filet. Le seul
trait est celui de la ligne survolée ; la seule couleur, le fait à ne pas manquer.

![Une liste : onglets, fil d'Ariane, tableau sans filets](docs/captures/liste.png)

### Les interactions

Le survol annonce le clic. « Aller à » se tape au clavier. Sous une modale, la
page se hachure mais reste lisible. Les deux thèmes s'échangent sans rien déplacer.

![Survol d'un tableau, « Aller à », modale, changement de thème](docs/captures/interactions.gif)

### La modale

Un titre, quelques champs ou une phrase, deux actions. Ni bandeau, ni croix, ni filet.

![Modale sur la page hachurée](docs/captures/modale.png)

### Le tableau de cartes

Des colonnes sans boîte, des fiches que l'on fait glisser de l'une à l'autre,
une édition par l'inspecteur. Chaque geste s'annule.

![Kanban : une fiche en cours de glissé, l'inspecteur ouvert](docs/captures/kanban.png)

### Discret, fort ou flash

Par défaut le signal tient en un carré. Une variante, sur les deux thèmes, le
passe en aplat sur tout ce qui le porte déjà — à demeure (`fort`) ou le temps
d'un flash à l'arrivée (`flash`). Toujours une seule couleur.

![Accent fort : la ligne critique, la note et la barre en aplat, thème papier](docs/captures/accent-fort.png)

### Annuler plutôt que confirmer

Modifier un champ ou supprimer s'exécute sans question et laisse une annulation.
Chaque événement se montre à trois échelles : un toast sur le moment, un centre
condensé accessible partout, et un journal complet où l'on filtre, sélectionne à
plusieurs, archive et supprime. Une suppression s'y rétablit à tout moment.

![Toasts d'annulation et centre de notifications](docs/captures/notifications.png)

![Journal : filtres, sélection multiple, actions groupées](docs/captures/journal.png)

### Les données

Marques en gris moyen, chiffres en clair, un seul fait en signal. Les séries se
distinguent par le trait — plein, tramé, contour — et les signes du système
annotent : repères d'angle, ligne de rappel, crochets.

![Carte proportionnelle des primes par produit, thème papier](docs/captures/treemap.png)

![Crêtes : douze profils horaires](docs/captures/cretes.png)

![Nuage annoté : graduations, médianes, ligne de rappel](docs/captures/nuage.png)

![Matrice perforée des appels par jour et par heure](docs/captures/matrice.png)

![Strates : trois séries, trois traits, thème papier](docs/captures/strates.png)

### La carte

Un fond réel — Natural Earth, monde entier, embarqué — dans le dessin du système :
côtes pleines, frontières tiretées, graticule coté, barre d'échelle. On cadre
n'importe quelle partie du monde.

![Carte du réseau : anneaux proportionnels sur fond Natural Earth](docs/captures/carte.png)

Et jusqu'à la rue : courbes de niveau, routes, rues, bâti, en calques que l'on
affiche ou masque. La feuille de style ne contient aucune couleur ; elle lit les
rôles du thème.

![Plan du massif de Grenoble : relief en courbes, routes, agences](docs/captures/plan.png)

![Plan de Vizille à l'échelle de la rue, thème papier](docs/captures/plan-rue.png)

### Les planches

Quatre animations procédurales, infinies, à regarder. Chacune naît d'une graine
de deux mots et porte un seul accent de couleur.

**Crêtes** — un relief qui dérive ; la rangée du sommet est en signal. Graine « brume lente ».

![Planche Crêtes](docs/captures/planche-cretes.gif)

**Atlas** — des stations sur un graticule, balayées par un méridien. Graine « nacre du large ».

![Planche Atlas](docs/captures/planche-atlas.gif)

**Arbre** — un arbre de décision qui pousse, tient, puis se retire. Graine « givre de minuit ».

![Planche Arbre](docs/captures/planche-arbre.gif)

**Console** — des commandes s'écrivent, un volume se découpe : une carte proportionnelle en perspective isométrique, dont certains blocs sont détaillés jusqu'au grain — des parts de la taille d'une icône, dont l'état évolue. Puis le volume défile : les blocs rétrécissent et disparaissent au bord. Graine « sel du nord ».

![Planche Console](docs/captures/planche-console.gif)

### Les images

Des photos sans rapport entre elles — studio, nuit, relevé scientifique —
ramenées au gris et fondues dans le ton de la page : elles tiennent ensemble.

![Collection de huit images encrées](docs/captures/images.png)

## Pour les applications

Le système fournit aussi de quoi bâtir un outil complet : onglets persistants,
inspecteur attaché à sa page, valeurs modifiables en place, console, bureau à
fenêtres. Le détail d'un élément s'ouvre dans la page, séparé par l'espace
seul, jamais dans une modale.

![Application à onglets, inspecteur attaché](docs/captures/application-onglets.png)

Onze écrans complets sont dans [`catalogue/exemples/`](catalogue/exemples/).

## En bref

- **Monospace**, capitales espacées, filets d'un pixel, angles droits.
- **Un jeu d'icônes maison** de 50 dessins sur une grille de 16 px.
- **Aucune dépendance** pour le système, aucune étape de construction. Polices
  embarquées. Seul l'exemple « bureau » embarque une bibliothèque (interact.js)
  pour déplacer, redimensionner et aimanter les fenêtres, et l'exemple « plan »
  MapLibre et des tuiles en ligne.
- **Un journal des décisions** : chaque règle, sa raison et ce qui a été écarté,
  dans [`docs/decisions.md`](docs/decisions.md).

## Voir le catalogue

Le catalogue est lui-même bâti avec le système : des onglets au-dessus de la
page, le fil d'Ariane en tête, le logo en bout de rangée — pas de rail.

![Le catalogue : onglets, fil d'Ariane, recherche](docs/captures/catalogue.png)
La commande utilise Python 3 via `py -3` sous Windows et `python3` sous macOS et Linux.

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
  captures/         les captures d'écran de ce fichier
  decisions.md      journal des décisions : ce qui a été choisi, écarté, et pourquoi
  philosophie.md    le pourquoi : convictions, budgets, arbitrages, tests d'écart
  principes.md      les 8 principes et la liste de contrôle d'un écran
  fondations.md     tons, rôles, signal, typographie, espace, filets
  composition.md    masses tonales, équilibre, méthode
  composants.md     index des composants et de leurs variantes
  dataviz.md        règles et classes de visualisation
catalogue/          le catalogue navigable (démonstrations + code)
  exemples/         onze écrans : carte, plan, planches, kanban, tableau de bord, rapport, collection + inspecteur,
                    connexion, bureau à fenêtres, et deux gabarits de shell à
                    copier : application.html (arborescente) et
                    application-modules.html (modules séparés)
  assets/vendor/    interact.js (MIT), pour la seule version bureau ;
                    world-50m.js (Natural Earth, domaine public), pour la carte ;
                    MapLibre GL JS et maplibre-contour (BSD-3), pour le plan
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
