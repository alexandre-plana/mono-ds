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
  la fiche choisis restent dans la trame, en gris moyen.
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
<body>
  <div class="l-page l-frame">
    <header class="c-masthead">
      <div class="c-masthead__title">Titre de l'écran</div>
      <div class="c-masthead__meta"><span>Contexte</span><span>Date</span></div>
    </header>
    <main class="l-grid" style="padding-block: var(--space-7); row-gap: var(--space-8); align-content: start">
      <section class="l-span-3 l-stack">…point focal…</section>
      <figure class="l-span-6 v-figure">…figure…</figure>
      <aside class="l-span-3 l-stack">…contexte…</aside>
    </main>
    <footer class="c-colophon"><span>Source</span><span class="c-ref">REF-001</span></footer>
  </div>
</body>
</html>
```
