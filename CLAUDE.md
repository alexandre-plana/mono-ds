# MONO — consignes pour travailler dans ce dépôt

Design system monochrome en CSS pur. Pas de build, pas de dépendance d'exécution.
Langue du projet : français (documentation, catalogue, commentaires).

## Avant de créer ou modifier une UI

Lire `docs/principes.md` (liste de contrôle) et `docs/composition.md` (masses
tonales, squelette d'écran). `docs/composants.md` liste les classes disponibles ;
le code de chaque composant est visible dans `catalogue/composants.html`.

## Règles non négociables

- Jamais `#000` ni `#fff`, jamais de valeur hexadécimale ni de `--tone-*` hors de
  `src/tokens.css`. Les composants consomment les rôles (`--bg`, `--fg`, `--line`…).
- Une seule couleur : `--signal`. Moins de 1 % de l'écran, un seul sens par écran,
  jamais décorative, toujours doublée d'une forme ou d'un mot. Pas de vert/orange/bleu.
- Un seul bouton `--primary`, un seul `.c-stat--hero`, un seul bloc inversé par vue.
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
```

Regarder aussi l'écran dans les deux thèmes (`?theme=papier` sur les pages du catalogue).

## Étendre le système

- Nouveau composant : dans `src/components.css`, préfixe `.c-`, rôles sémantiques
  uniquement ; ajouter une démonstration `<div class="cat-demo" data-code>` dans
  `catalogue/composants.html` et une ligne dans `docs/composants.md`.
- Nouvelle paire texte/fond : l'ajouter à `scripts/contrast.mjs`.
- Les classes `.cat-` et `.w-` habillent le catalogue : ne pas les employer ailleurs.
