# Principes

MONO est un système monochrome, sobre et technique. Il s'inspire de la typographie
des pochettes de disques, des rapports annuels et de la cartographie imprimée :
du monospace clair sur un fond d'encre, des filets d'un pixel, beaucoup de vide,
et une seule couleur qui ne sert qu'à désigner.

| | Principe | En pratique |
|---|---|---|
| P1 | **Monochrome d'abord** | Tout écran fonctionne en gris seuls. La couleur est ajoutée en dernier, à un seul endroit. |
| P2 | **Ni noir, ni blanc** | La gamme va de `#131415` à `#E9E9E5`. `#000` et `#fff` n'existent pas. |
| P3 | **Le vide est un matériau** | Un tiers de l'écran au moins reste libre. On ne remplit pas un espace parce qu'il est disponible. |
| P4 | **Hiérarchie sans volume** | Graisse, casse, interlettrage et ton d'abord ; le corps en dernier. Trois corps par écran. |
| P5 | **Le filet avant la boîte** | Plein = structure, tireté = relation ou inactif, pointillé = repère. |
| P6 | **Un seul point focal** | Un élément porte le ton le plus clair, et un seul. |
| P7 | **Lisible avant tout** | Aucun texte sous 11 px, aucun texte sous 4,5 : 1. |
| P8 | **Rien d'ornemental** | Ni ombre, ni dégradé, ni arrondi, ni icône d'ambiance. |

## Liste de contrôle d'un écran

Avant de considérer un écran comme terminé :

1. Peut-on dire en une phrase ce que l'écran doit faire voir ? C'est le point focal.
2. Les blocs tiennent-ils sur trois ou quatre axes verticaux ?
3. Un tiers de la vue est-il vide ?
4. Y a-t-il au plus un bouton primaire et au plus un bloc inversé ?
5. Compte-t-on au plus trois corps de texte ?
6. L'écran reste-t-il compréhensible sans le signal (impression noir et blanc) ?
7. Tout ce qui est en signal désigne-t-il le même fait ?
8. `node scripts/contrast.mjs` et `node scripts/tonal-audit.mjs <page>` passent-ils ?

## Ce que le système refuse

- Les couleurs d'état (vert, orange, bleu). L'état se lit à la forme et au mot.
- Une couleur par série dans un graphique.
- Les cartes imbriquées, les ombres portées, les coins arrondis, les dégradés.
- Le texte centré et les mises en page symétriques.
- Les capitales pour une phrase entière ; l'italique ; le soulignement hors lien.
- Les tons bruts (`--tone-*`) et les valeurs hexadécimales dans un composant.
