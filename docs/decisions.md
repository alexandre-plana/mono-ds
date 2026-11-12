# Journal des décisions

Ce que nous avons décidé, pourquoi, et ce que nous avons écarté. Il sert à ne pas
rouvrir une question déjà tranchée sans le savoir, et à retrouver la raison d'une
règle quand elle gêne.

**Mode d'emploi**

- Une décision = un choix entre plusieurs voies, une règle ajoutée, assouplie ou
  abandonnée. Elle s'inscrit ici dans le même commit que le changement.
- Une entrée ne se supprime ni ne se réécrit. Si l'on change d'avis, on ajoute une
  nouvelle entrée et l'on marque l'ancienne **remplacée par D-xxx**.
- Statuts : **en vigueur** · **remplacée par D-xxx** · **écartée** (une piste
  étudiée et refusée, gardée pour mémoire).
- « Demandée par » dit d'où vient la décision : le commanditaire, ou une
  proposition de conception qu'il a acceptée.

Les principes eux-mêmes sont dans `philosophie.md` ; ici, c'est leur histoire.

## Sommaire

| N° | Décision | Statut |
|---|---|---|
| D-001 | CSS pur, sans construction ni dépendance | en vigueur |
| D-002 | Les références priment sur la maquette | en vigueur |
| D-003 | Gamme de gris bornée, ni noir ni blanc purs | en vigueur |
| D-004 | Une seule couleur, le signal, sous 1 % | en vigueur |
| D-005 | Monospace partout, sans-serif pour la prose longue | en vigueur |
| D-006 | Plancher de lisibilité : 11 px, 4,5 : 1 | en vigueur |
| D-007 | Deux thèmes symétriques, encre et papier | en vigueur |
| D-008 | Le catalogue montre le code réel et se cherche | en vigueur |
| D-009 | Un document de philosophie tranche les cas non prévus | en vigueur |
| D-010 | La sélection en gris moyen, avec un fond | remplacée par D-011 |
| D-011 | La sélection par le contour seul | en vigueur |
| D-012 | Le focus clavier reste fort | en vigueur |
| D-013 | Toute page a un contour et repose sur un plan hachuré | amendée par D-041 |
| D-014 | Alignements au cordeau | en vigueur |
| D-015 | Travailler en force de proposition | en vigueur |
| D-016 | Signes graphiques : admis s'ils ont un sens | en vigueur |
| D-017 | Un jeu d'icônes maison plutôt qu'une bibliothèque | en vigueur |
| D-018 | Édition en place sur ligne pointillée | en vigueur |
| D-019 | Un indicateur typographique, pas un cercle | en vigueur |
| D-020 | L'inspecteur remplace le tiroir | en vigueur |
| D-021 | Cocher et inspecter sont deux gestes distincts | en vigueur |
| D-022 | La bande hachurée sert de séparateur | en vigueur |
| D-023 | Fenêtre flottante à liseré hachuré | en vigueur |
| D-024 | interact.js pour la seule version bureau | en vigueur |
| D-025 | Sous-menu : un niveau, au clic droit seulement | en vigueur |
| D-026 | La trame de points admise dans le seul canevas | en vigueur |
| D-027 | Shell à rail de navigation | écartée |
| D-028 | Onglets numérotés en marge | écartée |
| D-029 | Pages empilées sur la tranche (feuillets) | écartée |
| D-030 | Le chemin en tête de page, pour les applications arborescentes | en vigueur |
| D-031 | Les outils viennent à la demande | en vigueur |
| D-032 | Les modules en mots dans la ligne de tête | remplacée par D-034 |
| D-033 | Le plan de travail comme carte, et les pages côte à côte | en vigueur |
| D-034 | Des onglets assumés, persistants, avec fil d'Ariane | en vigueur |
| D-035 | Tenir ce journal | en vigueur |
| D-036 | Ce qui est hors de la page ne dépend pas de l'onglet | remplacée par D-038 |
| D-037 | Le bouton primaire conclut une tâche | en vigueur |
| D-038 | L'inspecteur attaché à son onglet, épinglable | en vigueur |
| D-039 | Pas de filet vertical entre deux régions d'une page | en vigueur |
| D-040 | Un filet se mérite : revue de tous les traits | en vigueur, précisée par D-042 et D-043 |
| D-041 | Les hachures quittent le plan de travail pour le fond des modales | en vigueur |
| D-042 | L'écran ne défile jamais ; barre de défilement d'un trait | en vigueur |
| D-043 | Tableau sans filets ; un filet sous la ligne survolée | en vigueur |
| D-044 | Le survol annonce ce que fera le clic | en vigueur |
| D-045 | Images : dessin du système, ou image brute encrée | en vigueur |
| D-046 | La modale est une petite page, sans habillage | amendée par D-048 |
| D-047 | Le filet de survol d'une ligne cliquable dépasse à droite | en vigueur |
| D-048 | Modale éditoriale : un seul titre, actions à droite | en vigueur |
| D-049 | Modales portrait : le chiffre, l'étiquette, la colonne | adoptée, voir D-050 |
| D-050 | La modale est portrait par défaut | en vigueur |

---

## D-001 — CSS pur, sans construction ni dépendance

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Contexte** : le système doit se réemployer pour créer de nouvelles interfaces, dans n'importe quel projet.
- **Décision** : une feuille de style à lier, des classes, aucun script, aucune étape de construction. Polices IBM Plex embarquées.
- **Raison** : rien à installer, rien qui casse à la mise à jour d'un outil ; lisible par un humain comme par un agent.
- **Conséquences** : les comportements (fenêtres, onglets, console, recherche) vivent dans `catalogue/assets/` comme démonstrations, pas dans le système. Deux fichiers sont générés par script : l'index de recherche et la feuille d'icônes.

## D-002 — Les références priment sur la maquette

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : une maquette HTML et cinq images de référence étaient fournies, qui ne disaient pas toujours la même chose.
- **Décision** : en cas de désaccord, les références l'emportent ; la maquette peut être remise en cause.
- **Conséquences** : dix écarts, listés dans le README (corps de texte, dégradés, arrondis, barres, thèmes…). La maquette est conservée dans `reference/`.

## D-003 — Gamme de gris bornée, ni noir ni blanc purs

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : treize tons de `#131415` à `#E9E9E5`. `#000` et `#fff` n'existent pas. Les composants ne consomment que des rôles sémantiques.
- **Raison** : un contraste maximal fatigue et ne laisse aucune marge pour hiérarchiser.
- **Conséquences** : `scripts/contrast.mjs` refuse tout noir ou blanc pur et vérifie chaque paire texte/fond.

## D-004 — Une seule couleur, le signal, sous 1 %

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : un seul rouge. Il désigne ce qui ne doit pas être manqué, couvre moins de 1 % de l'écran, n'a qu'un sens par écran, et double toujours une forme ou un mot.
- **Écarté** : les couleurs d'état (vert, orange, bleu) et une teinte par série dans les graphiques. L'état se lit à la forme du glyphe et au mot.
- **Conséquences** : un écran sans aucune couleur est l'état normal.

## D-005 — Monospace partout, sans-serif pour la prose longue

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Contexte** : la maquette employait un sans-serif pour le texte courant ; les références sont entièrement en monospace.
- **Décision** : IBM Plex Mono pour l'interface, les données et les titres ; IBM Plex Sans seulement au-delà de trois lignes de prose.

## D-006 — Plancher de lisibilité

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (« focus sur la lisibilité »)
- **Décision** : aucun texte sous 11 px (capitales) ni 12 px (bas de casse) ; 4,5 : 1 au moins, 7 : 1 pour le texte courant. La lisibilité l'emporte sur le style.
- **Contexte** : la maquette descendait à 8 px.

## D-007 — Deux thèmes symétriques

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Décision** : `encre` (clair sur sombre) et `papier` (sombre sur clair), applicables à toute la page ou à un bloc.
- **Raison** : les références jouent du panneau sombre posé sur un fond clair.

## D-008 — Le catalogue montre le code réel et se cherche

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (recherche avancée)
- **Décision** : l'extrait de code affiché est le DOM de la démonstration, jamais une copie. Une recherche en tête de chaque page couvre règles, composants, tokens et classes, avec filtres par rubrique et par type.
- **Conséquences** : l'index est généré (`scripts/build-search-index.mjs`) ; tout élément indexé porte `id` et `data-search`.

## D-009 — Un document de philosophie tranche

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : `philosophie.md` porte les convictions, les budgets par vue, l'ordre d'arbitrage et sept tests d'écart. Il est lu en premier et fait foi quand les règles ne disent rien.

## D-010 — La sélection en gris moyen, avec un fond

- **Date** : 2026-11-12 · **Statut** : remplacée par D-011 · **Demandée par** : le commanditaire
- **Contexte** : les éléments sélectionnés prenaient le ton le plus clair et concurrençaient le contenu.
- **Décision** : un fond gris discret (`--selected-bg`) ou un trait gris moyen.
- **Pourquoi remplacée** : un aplat, même discret, faisait encore du contrôle une tache.

## D-011 — La sélection par le contour seul

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : un élément sélectionné ne change que de contour — 2 px en `--selected-line` — et de graisse. Son fond ne change jamais ; `--selected-bg` est supprimé.
- **Raison** : ce que l'on veut voir, c'est le résultat de l'action, pas le contrôle qui l'a produite. Le ton clair va à ce qui a changé (`.is-fresh`).
- **Conséquences** : vaut pour onglet, segment, filtre, fiche, ligne de tableau (deux filets, contour ouvert sur les côtés), page courante.

## D-012 — Le focus clavier reste fort

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Décision** : le focus clavier garde un contour de 2 px au ton clair ; un champ de saisie actif ne s'éclaircit que d'un cran.
- **Raison** : le focus n'est pas une sélection, c'est un repère de navigation exigé pour l'accessibilité.

## D-013 — Toute page a un contour et repose sur un plan hachuré

- **Date** : 2026-11-12 · **Statut** : amendée par D-041 (le plan n'est plus hachuré ; contour et retrait restent) · **Demandée par** : le commanditaire
- **Décision** : `.l-shell` (contour d'un pixel) posée sur `.l-desk` (fond hachuré), en retrait de 24 px. Les hachures ne s'emploient que hors de la page.
- **Raison** : détacher le contenu, et préparer inspecteur et fenêtres.
- **Conséquences** : c'est le seul cadre systématique ; à l'intérieur, la règle reste « le filet avant la boîte ».

## D-014 — Alignements au cordeau

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : les blocs d'une rangée partagent leur première ligne et s'ouvrent par le même style de texte ; sur un axe vertical, c'est le texte qui s'aligne, pas le bord d'un cadre. Deux pages voisines ont des en-têtes et des pieds de même hauteur.
- **Conséquences** : les alignements se mesurent dans le navigateur, pas à l'œil.

## D-015 — Travailler en force de proposition

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : la relation n'est pas de donneur d'ordre à exécutant. Les désaccords sont dits avec leur raison, et les alternatives sont prototypées plutôt que décrites.
- **Conséquences** : plusieurs entrées de ce journal viennent d'un désaccord exprimé (D-017, D-018, D-019, D-030).

## D-016 — Signes graphiques : admis s'ils ont un sens

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (enrichir le langage visuel)
- **Décision** : cinq signes admis, chacun avec un sens unique — repères d'angle (une zone), règle graduée (une mesure), barre d'échelle (une longueur), crochets (une position), ligne de rappel (une annotation). Deux signes différents par écran au plus.
- **Écarté** : croix de repérage, code-barres, séparateur en tirets ASCII — aucun sens que le système n'exprime déjà. La trame de points : voir D-026.

## D-017 — Un jeu d'icônes maison plutôt qu'une bibliothèque

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée (la demande était « une bibliothèque »)
- **Décision** : 49 icônes sur grille de 16 px, traits d'un pixel, angles vifs, sans courbe, livrées en masques CSS.
- **Raison** : une bibliothèque existante apporte une seconde main de dessin, arrondie ou trop grasse à côté de filets d'un pixel.
- **Conséquences** : nettes à 16 et 32 px seulement. Aucune icône d'une autre source.

## D-018 — Édition en place sur ligne pointillée

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire, avec un ajout accepté
- **Décision** : une valeur modifiable se présente comme un texte, pas comme un champ ; Entrée ou la sortie du champ enregistre, Échap annule.
- **Ajout** : une ligne pointillée permanente sous la valeur. Sans indice, on ne découvre l'édition qu'au survol, donc jamais au toucher.

## D-019 — Un indicateur typographique, pas un cercle

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée (la demande était « un spinner »)
- **Décision** : `.c-spinner` est un caractère qui tourne, `| / - \`, posé à côté de la valeur en cours d'enregistrement.
- **Raison** : le cercle tournant est une forme étrangère au système.

## D-020 — L'inspecteur remplace le tiroir

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire, sur proposition
- **Décision** : le tiroir (modale accrochée à droite) est supprimé. Le détail d'un élément va dans l'inspecteur : une seconde page, permanente, qui ne bloque rien.
- **Raison** : les deux faisaient doublon.

## D-021 — Cocher et inspecter sont deux gestes distincts

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition
- **Décision** : cocher une ligne prépare une action groupée ; cliquer la ligne l'ouvre dans l'inspecteur. Ligne dépliable et inspecteur ne cohabitent pas sur un même écran.
- **Question ouverte** : ce que montre l'inspecteur quand plusieurs lignes sont cochées n'est pas décidé.

## D-022 — La bande hachurée sert de séparateur

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Décision** : entre deux pages, c'est la bande hachurée qui se saisit pour redimensionner ; aucune poignée ajoutée.

## D-023 — Fenêtre flottante à liseré hachuré

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Décision** : une fenêtre flottante n'a pas d'ombre ; elle emporte un liseré de plan de travail hachuré. Elle n'est pas modale. Deux au plus au-dessus d'une page ; libre en version bureau.

## D-024 — interact.js pour la seule version bureau

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (« utilise une librairie »)
- **Décision** : déplacement, redimensionnement et aimantation des fenêtres du bureau sont confiés à interact.js (MIT, embarquée dans `catalogue/assets/vendor/`).
- **Raison** : elle gère le comportement sans imposer d'habillage. D'autres bibliothèques n'ont pas été comparées dans le projet.
- **Conséquences** : exception à D-001, limitée à un exemple. Le système lui-même reste sans dépendance.

## D-025 — Sous-menu : un niveau, au clic droit seulement

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : la règle initiale était « jamais de sous-menu ».
- **Décision** : un seul niveau de sous-menu, dans le menu contextuel uniquement. Aucune action ne doit exister seulement au clic droit.

## D-026 — La trame de points admise dans le seul canevas

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition
- **Contexte** : refusée comme signe en D-016.
- **Décision** : admise dans `.c-canvas`, où elle a un sens — la grille d'aimantation — et nulle part ailleurs. Zoom borné à 75 % pour rester lisible.

## D-027 — Shell à rail de navigation

- **Date** : 2026-11-12 · **Statut** : écartée · **Demandée par** : le commanditaire
- **Piste** : un rail de navigation à gauche, un volet, une barre d'outils, une console ancrée.
- **Pourquoi écartée** : « trop commun, rend l'interface trop chargée ». Quatre régions fixes avant le contenu ; 47 % de vide mesuré contre 65 à 69 % pour les alternatives.

## D-028 — Onglets numérotés en marge

- **Date** : 2026-11-12 · **Statut** : écartée · **Demandée par** : le commanditaire
- **Piste** : des onglets numérotés posés sur le plan de travail contre le bord gauche de la page, libellé au survol.
- **Pourquoi écartée** : « on ne sait pas où cliquer ni à quoi correspondent les numéros ».
- **Règle qui en découle** : la navigation s'écrit en mots — ni numéros seuls, ni icônes seules.

## D-029 — Pages empilées sur la tranche (feuillets)

- **Date** : 2026-11-12 · **Statut** : écartée · **Demandée par** : le commanditaire
- **Piste** : chaque niveau est une page ; les précédentes se rangent à gauche sur la tranche, titre à la verticale.
- **Pourquoi écartée** : « lecture verticale contre-intuitive, prend énormément de place ».
- **Règle qui en découle** : pas de texte vertical dans la navigation.

## D-030 — Le chemin en tête de page, pour les applications arborescentes

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire, sur recommandation révisée
- **Décision** : `.c-pathnav` — le chemin est la navigation ; chaque segment ouvre la liste de ses voisins. Trois niveaux au plus.
- **Raison** : la plus claire des trois pistes : où l'on est reste écrit en toutes lettres.
- **Limite reconnue** : elle suppose un arbre ; elle ne convient pas aux applications à parties séparées (voir D-034).
- **Note** : la première recommandation portait sur D-028 ; elle a été retirée quand le critère est devenu la clarté pour l'utilisateur.

## D-031 — Les outils viennent à la demande

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : proposition acceptée
- **Décision** : console, aide et raccourcis sont des fenêtres que l'on ouvre et referme, jamais des régions fixes de la page. Une page n'a que deux lignes fixes : la ligne de tête et la barre d'état.

## D-032 — Les modules en mots dans la ligne de tête

- **Date** : 2026-11-12 · **Statut** : remplacée par D-034 · **Demandée par** : proposition
- **Décision** : pour les applications non linéaires, écrire les modules en toutes lettres dans la ligne de tête (`.c-mainnav`), le fil d'Ariane n'apparaissant qu'en profondeur.
- **Pourquoi remplacée** : le fil d'Ariane disparaissait au premier niveau, et la ligne ressemblait à des onglets sans en tenir la promesse.

## D-033 — Le plan de travail comme carte, et les pages côte à côte

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (« sois créatif sur ce point »)
- **Décision** : `.c-plan` montre toutes les pages de l'application posées sur le plan hachuré, par familles, à des emplacements stables. Une page s'y ouvre, ou se pose à côté de la page courante. « Aller à » (`.c-palette`) complète par un saut au nom.
- **Raison** : dans une navigation non linéaire, le besoin est souvent de ne pas choisir entre deux endroits.
- **Limites** : lisible jusqu'à une vingtaine de pages ; une seule page à côté.

## D-034 — Des onglets assumés, persistants, avec fil d'Ariane

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : dans une application à parties séparées, chaque partie est un onglet (`.c-doctabs`) posé sur le plan de travail au-dessus de la page. Un onglet est une page qui reste ouverte et garde son état. La ligne de tête de la page porte toujours le fil d'Ariane. Quand les onglets ne tiennent plus, ceux qui dépassent vont dans un menu « … » ; l'onglet courant reste visible.
- **Raison** : assumer la forme d'onglet engage sur sa promesse — retrouver la page comme on l'a laissée ; et les onglets disent quelles pages sont ouvertes, pas où l'on est dans la page, d'où le fil d'Ariane permanent.
- **Conséquences** : `.c-mainnav` est supprimé. Les modules sont des onglets permanents ; ce que l'on ouvre en plus s'ajoute à droite et se ferme. Jamais avec `.c-pathnav` sur la même application.
- **Distinction avec D-028** : ici les onglets portent des mots, pas des numéros.

## D-035 — Tenir ce journal

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : toute décision de conception s'inscrit dans ce fichier, dans le même commit que le changement. Les entrées ne se réécrivent pas.
- **Raison** : éviter de rouvrir sans le savoir une question déjà tranchée.
- **Conséquences** : consigne ajoutée à `CLAUDE.md`. Les entrées D-001 à D-034 ont été reconstituées après coup, à partir de l'historique du projet.

## D-036 — Ce qui est hors de la page ne dépend pas de l'onglet

- **Date** : 2026-11-12 · **Statut** : remplacée par D-038 · **Demandée par** : le commanditaire (problème relevé), solution proposée
- **Pourquoi remplacée** : le principe tient (l'image dit à qui un contenu appartient), mais le comportement par défaut était le mauvais : garder une fiche en changeant d'onglet est le cas minoritaire.
- **Contexte** : avec des onglets au-dessus de la page, l'inspecteur est dessiné à côté, hors de la page. On s'attend donc à ce qu'il reste en l'état quand on change d'onglet — or il montrait le détail d'une ligne de l'onglet quitté.
- **Décision** : l'image fait foi. Il n'y a qu'un emplacement « à côté », global : il reçoit ce que l'on inspecte (un clic sur une ligne) ou une page posée là depuis le plan. Il ne change pas quand on change d'onglet ; on le remplace par un autre contenu ou on le ferme soi-même. Il dit d'où vient ce qu'il montre (« Vient de Agences ») et permet de l'ouvrir en onglet.
- **Conséquences** : la rangée d'onglets s'arrête au bord de la page qu'elle gouverne ; au-dessus de la page d'à côté il n'y a que le plan de travail. La ligne inspectée garde son contour tant que sa fiche est à côté. Inspecteur et « page à côté » (D-033) deviennent un seul mécanisme. « Aller à » une agence l'inspecte à côté, sans quitter l'onglet courant — ce qui lève l'incohérence notée après D-034. La descente dans l'onglet (liste → détail dans la même page) est retirée du gabarit.
- **Alternative non retenue** : placer l'inspecteur dans la page, séparé de la liste par un filet, pour qu'il suive l'onglet. Elle reste la bonne réponse quand un détail n'a aucun sens hors de sa liste ; elle n'a pas été retenue comme règle générale parce qu'elle renonce à la séparation par les hachures et à l'usage non linéaire (garder une fiche sous les yeux en travaillant ailleurs).
- **Règle** : K7 dans `composition.md`.

## D-037 — Le bouton primaire conclut une tâche

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (« pourquoi ce bouton est blanc ? »)
- **Contexte** : la règle initiale autorisait un bouton primaire — un aplat clair — par vue. Appliquée à un écran de liste, elle donnait à « Nouvelle agence » la tache la plus claire de l'écran, devant le chiffre et le tableau.
- **Décision** : le primaire est réservé aux écrans qui existent pour accomplir une action — connexion, formulaire, modale. Zéro sur un écran de consultation ; un au plus ailleurs.
- **Raison** : la même que D-011 — le clair va à ce que l'écran doit faire voir, pas à un contrôle.
- **Conséquences** : « Nouvelle agence » et « Exporter » passent en bouton à contour dans les gabarits et le tableau de bord. La connexion et les modales gardent leur primaire.

## D-038 — L'inspecteur attaché à son onglet, épinglable

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : D-036 rendait l'emplacement « à côté » global. Cohérent avec l'image, mais ce n'est pas le cas majoritaire : le plus souvent l'inspecteur montre le détail de ce que l'on vient de sélectionner, et doit suivre son onglet.
- **Décision** : par défaut l'inspecteur est attaché. Il est dessiné **dans** la page, séparé de son contenu par un filet (`.l-detail`) ; il part et revient avec l'onglet. **Épingler** le sort de la page : il passe à côté, séparé par les hachures, et reste quand on change d'onglet. **Rattacher** le remet dans sa page, avec ce qu'on y avait saisi.
- **Raison** : l'image dit toujours la vérité — un filet : c'est dans la page ; des hachures : c'est dehors — et le geste rare (garder sous les yeux) devient volontaire.
- **Conséquences** : la rangée d'onglets ne se raccourcit que lorsqu'un contenu est épinglé. « Aller à » une agence mène à l'onglet Agences et l'y inspecte. Une page posée depuis le plan reste à côté : elle est épinglée par nature. Règle K7 réécrite.
- **Limite connue** : un seul contenu épinglé à la fois ; en épingler un autre remplace le premier sans avertissement.
- **Non concerné** : l'écran « collection + inspecteur » sans onglets, où il n'y a qu'un seul contexte et où l'inspecteur reste une page séparée par les hachures.

## D-039 — Pas de filet vertical entre deux régions d'une page

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : D-038 séparait l'inspecteur attaché de la liste par un filet vertical. C'était le seul filet vertical du système : les tableaux n'en ont pas, les colonnes d'un écran non plus.
- **Décision** : l'espace seul sépare — 64 px, quatre fois l'écart entre deux colonnes du tableau. Les filets des lignes s'arrêtent net au bord du tableau, l'inspecteur a son propre axe de texte.
- **Raison** : « le vide est un matériau » ; un filet vertical faisait de l'inspecteur un compartiment, alors qu'il n'est qu'une autre région de la même page.
- **Conséquences** : D-038 reste en vigueur, seule sa séparation change. Le contraste avec l'état épinglé est plus net encore : de l'espace dans la page, des hachures hors de la page. Empilé sous la liste sur écran étroit, l'inspecteur garde un filet horizontal. Règle K8.
- **À surveiller** : si une page porte un tableau très large dont la dernière colonne est du texte long, l'écart peut ne plus suffire ; la réponse est alors de réduire le tableau, pas de remettre un filet.

## D-040 — Un filet se mérite : revue de tous les traits

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : après D-039, la question s'est posée pour le trait sous les en-têtes de tableau, puis pour tous les composants. Une centaine de traits ont été passés en revue ; les candidats ont été comparés à l'écran, avec et sans.
- **Critère** : un filet ne reste que s'il porte une relation, une limite de défilement, une somme, ou le contour d'un contrôle. Si la casse, le ton et l'espace disent déjà la même chose, il est retiré. Règle F4.

| Trait | Verdict | Raison |
|---|---|---|
| Sous les en-têtes de tableau | **retiré** | Les micro-capitales grises distinguent déjà l'en-tête ; c'était le trait le plus fort de l'écran |
| Sous l'en-tête de tableau figé | gardé, affaibli | Limite de défilement : les lignes passent dessous |
| Sous chaque ligne de tableau | gardé | Relation : guide l'œil d'une colonne à l'autre. Sans eux, la lecture en largeur se perd (essayé) |
| Au-dessus du total | gardé, et réparé | Somme. Il ne s'affichait pas : la bordure de la ligne précédente l'emportait |
| Ligne de base des onglets de vue | **retiré** | Le trait de 2 px de l'onglet courant suffit |
| Sous les titres de groupe du menu | **retiré** | Le titre est déjà en micro-capitales, suivi d'un espace |
| Sous le titre de la légende | **retiré** | Idem. Écart assumé par rapport à la référence cartographique |
| Séparateur de menu | **remplacé par un espace** | Le groupe se lit à l'écart ; l'action irréversible porte déjà le signal |
| Sous les titres de groupe de « Aller à » et de la recherche | **retiré** | Idem menu |
| Sous l'en-tête d'un objet du canevas | **retiré** | L'objet a déjà son contour |
| Cloisons verticales de la barre des fenêtres | **retiré** | Filets verticaux (K8) ; l'espace sépare les trois groupes |
| Sous l'en-tête de page, au-dessus de la barre d'état | gardé | Limite de défilement, et ligne commune à deux pages voisines |
| Sous l'en-tête de section | gardé | C'est le filet de structure : un trait au-dessus de chaque région (F3) |
| En-tête et pied de modale, de console, de fenêtre | gardé | Limite de défilement, ou zone que l'on saisit |
| Filet de la fiche, des étapes, du dépliant, de `.c-stat--ruled` | gardé | Le filet est le composant |
| Filets conducteurs (clé-valeur, index) | gardé | Relation |
| Trait latéral de la note et de la notification | gardé | Ce n'est pas un séparateur : c'est la marque du composant, et le porteur du signal |
| Contours des contrôles, de la page, des surfaces flottantes | gardé | Contour |

- **Conséquences** : sur un écran de liste, le trait le plus fort n'est plus celui des en-têtes mais celui de la ligne sélectionnée — ce qui est le bon ordre.
- **Non tranché** : le filet de piste des barres horizontales et de la jauge (il montre l'étendue de l'échelle) n'a pas été remis en cause.

## D-041 — Les hachures quittent le plan de travail pour le fond des modales

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : depuis D-013, le plan de travail autour de chaque page était hachuré. Présentes en permanence sur tous les écrans, les hachures ne disaient plus rien et ajoutaient du bruit. Le fond des modales, lui, n'était qu'un voile sombre uni.
- **Décision** : le plan de travail devient uni — le ton le plus sombre de la gamme, sans motif. Les hachures passent au fond des modales (`.c-dialog::backdrop`) : tant qu'une modale est ouverte, la page dessous est hachurée, sur un voile au ton du plan de travail (78 %).
- **Raison** : en dessin technique, une zone hachurée est une zone exclue ; c'est exactement l'état d'une page sous une modale. Un motif qui n'apparaît qu'à ce moment redevient un signe, selon la logique de rareté du système.
- **Écarté** : garder les deux emplois (le signe aurait eu deux sens) ; un flou d'arrière-plan (effet, pas un signe).
- **Ce qui reste de D-013** : le contour d'un pixel de chaque page et son retrait de 24 px.
- **Conséquences** : là où les décisions antérieures parlent de « hachures » entre deux pages (D-022, D-033, D-038, D-039), lire « bande de plan de travail » : deux pages se distinguent par leur double contour et la bande sombre entre elles. Le liseré des fenêtres flottantes (D-023) devient une bande unie. Un clic sur le plan de travail ouvre toujours le plan. Règles K3, K4, K7 et G1 réécrites.
- **Vaut pour** : toutes les modales — dialogue, confirmation, « Aller à ».

## D-042 — L'écran ne défile jamais ; barre de défilement d'un trait

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Contexte** : les applications défilaient déjà dans leurs volets, mais les documents (rapport, tableau de bord, catalogue) faisaient défiler l'écran entier : le contour de la page sortait de l'écran. Les barres de défilement étaient celles du navigateur.
- **Décision** : `.l-desk` occupe exactement l'écran ; la page y tient entière et c'est son contenu qui défile — `.l-pane__body` dans une application, `.l-shell` dans un document. Une seule zone défilante par page et par axe, jamais imbriquée (règles S1 à S6). Barre de défilement commune : 4 px, carrée, au ton des filets, sans piste, dans une gouttière de 10 px (`--scrollbar`) réservée dans la marge du volet.
- **Raison** : une page à contour qui glisse hors de l'écran contredit son propre cadre. Et ce qui situe (titre, onglets, état) doit rester sous les yeux.
- **Filets de défilement** : le filet sous l'en-tête de page et celui au-dessus de la barre d'état, gardés en D-040 comme « limites de défilement », n'apparaissent plus que lorsqu'il y a effectivement du contenu passé dessous ou restant dessous. Au repos, aucun trait. Réalisé en CSS pur (deux fonds, l'un fixe, l'autre attaché au contenu). Le filet de l'en-tête de tableau figé est retiré : son fond plein suffit.
- **Exceptions** : sous 900 px de large, défilement naturel de l'écran (barre d'adresse escamotable, geste habituel, une seule colonne) ; à l'impression, tout se déroule.
- **Écarté** : faire défiler l'écran pour les documents seulement (deux modèles à apprendre) ; une barre masquée qui n'apparaît qu'au survol (on ne sait plus qu'il reste du contenu).
- **Limite connue** : la gouttière réservée ne vaut que pour les navigateurs à barre stylable (Chrome, Edge, Safari). Firefox reçoit la barre fine standard, au même ton.

## D-043 — Tableau sans filets ; un filet sous la ligne survolée

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : `.c-table` ne trace plus aucun filet entre ses lignes. Au survol, un filet d'un pixel se pose sous la ligne pointée. Le fond de survol (`--surface`) disparaît.
- **Raison** : suite de D-040. Avec un interligne constant et des colonnes ferrées, les filets de rang ne servaient qu'à suivre une ligne de l'œil ; ce service n'est utile que pour la ligne qu'on lit. Le survol par un fond contredisait aussi l'esprit de D-012 (un état ne change pas de fond).
- **Garde-fous** (proposés par Claude) : sans pointeur (`hover: none`, écrans tactiles), les filets discrets reviennent d'eux-mêmes, faute de quoi rien n'aide à suivre une rangée. `.c-table--ruled` les impose pour un tableau large, dense ou imprimé.
- **Ce qui reste** : le trait de somme avant le pied, les deux filets de 2 px de la ligne sélectionnée, le contour de focus.

## D-044 — Le survol annonce ce que fera le clic

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : au survol (et au focus), un élément interactif dit ce que fera le clic, par un trait ou un signe, jamais par un fond. Deux formes. La pointe de flèche au bout du filet de survol : automatique sur une ligne de tableau cliquable et sur une fiche cliquable. L'icône `.c-cue`, invisible au repos, qui glisse de 4 px en place : pour les autres actions (sortir, déplier, modifier, créer, télécharger).
- **Raison** : généralise D-043. Le filet nu dit « je te suis » ; le filet en flèche dit « et le clic t'emmène ». La différence entre une ligne lisible et une ligne cliquable devient visible sans rien ajouter au repos.
- **Choix de Claude** : la flèche de la ligne de tableau est la pointe du filet lui-même, pas une icône posée dans la marge. Une icône dans la marge débordait dès que la marge du volet se réduit, ou obligeait à décaler l'axe de droite des chiffres.
- **Limites posées** : le texte ne se décale jamais (seul l'indice bouge) ; un seul indice par élément ; pas d'indice sur un bouton à contour ni un contrôle de formulaire ; l'indice ne porte jamais seul une information, puisqu'un écran tactile n'a pas de survol — il y reste affiché en ton éteint.
- **Non traité** : les fonds de survol existants des menus, de la palette et des boutons à contour restent ; ce sont des contrôles dont la forme annonce déjà l'action. À revoir si l'on veut une règle sans exception.
- **Technique** : `build-icons.mjs` expose chaque icône en variable (`--i-nom`) pour qu'un pseudo-élément puisse en porter une.

## D-045 — Images : dessin du système, ou image brute encrée

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire
- **Décision** : `.c-media`. Un dessin conforme au système (SVG au trait d'un pixel, `currentColor`) entre tel quel. Toute image brute reçoit un traitement, en trois degrés : `--raw` encrée (gris, fondue dans le ton de la page, extrêmes rabattus) ; `--raster` encrée et tramée de lignes horizontales ; `--threshold` seuillée en deux tons.
- **Comment** : niveaux de gris, puis fusion avec le fond de la page — `screen` en encre (les noirs de l'image deviennent le fond), `multiply` en papier (ses blancs deviennent le fond) — et opacité de 70 % environ pour rabattre l'autre extrême. L'image ne touche ainsi ni le noir ni le blanc, dans les deux thèmes, sans réglage par image.
- **Raison** : une photo en couleur est la masse la plus forte de n'importe quel écran et ruine la règle du signal. Encrée, elle se comporte comme un aplat moyen.
- **Trame** : des lignes horizontales, pas des hachures (réservées au fond des modales, D-041) ni des points (réservés au canevas).
- **Règles** : dans une fiche, l'image vient après l'en-tête et le titre ; jamais de texte sur l'image ; les images comptent dans les masses tonales, un tiers de la vue au plus ; la couleur ne revient pas au survol.
- **Écarté** : une teinte monochrome (duotone signal) — la couleur deviendrait décorative ; un flou — c'est un effet.
- **Démonstration** : trois photographies libres de droits dans `catalogue/assets/img/` (sources dans `SOURCES.md`).

## D-046 — La modale est une petite page, sans habillage

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire (« trop modale classique »)
- **Contexte** : la modale reprenait l'anatomie habituelle — bandeau de titre fermé par un filet, croix dans l'angle, corps, pied séparé par un filet, fond d'un cran plus clair. Rien de cela ne vient des références.
- **Décision** : la modale a le fond et le contour de la page. Plus de bandeau ni de filet intérieur. De haut en bas : une ligne de service en petites capitales (nature · référence, et à droite « Fermer » avec la touche Échap dans son cadre), un titre en grand corps, le contenu, les actions ferrées à gauche — la principale, puis « Annuler » en bouton discret. Largeur par défaut ramenée de 32 à 30 rem ; marge intérieure portée à 32 px.
- **Raison** : depuis D-041, c'est la page hachurée dessous qui dit « modale ». L'habillage faisait double emploi. Et D-040 s'applique : un filet d'en-tête ou de pied ne se justifie que comme limite de défilement — il n'apparaît donc que si le contenu dépasse.
- **Abandonné** : la croix de fermeture (remplacée par le mot et la touche), `__aside` dans les actions (la référence monte dans la ligne de service), le filet du pied de « Aller à ».
- **Inchangé** : ancrage au tiers haut, tailles `--small` / `--large`, une seule modale par vue, la confirmation sans bouton fermer.

## D-047 — Le filet de survol d'une ligne cliquable dépasse à droite

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire · **Précise** : D-044
- **Décision** : sous une ligne de tableau cliquable, le filet de survol se prolonge de 8 px dans la marge de droite avant sa pointe (`--cue-reach`). Les chiffres gardent leur axe ; seule la flèche sort.
- **Garde-fou** : dans une zone qui défile en largeur (`.c-table-wrap`), rien ne dépasse, sinon la flèche créerait un défilement.

## D-048 — Modale éditoriale : un seul titre, actions à droite

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Demandée par** : le commanditaire · **Amende** : D-046
- **Contexte** : la ligne de service de D-046 (nature · référence) au-dessus du titre faisait « presque deux titres », et les actions à gauche ne convainquaient pas.
- **Décision** : un seul titre, en corps de titre (24 px), bas de casse. La ligne de service et le bouton « Fermer / Échap » disparaissent : Échap et « Annuler » ferment. La prose du corps passe en sans-serif de lecture (15 px), comme un chapeau de rapport. Le pied porte à gauche `__aside` (référence ou touche) et à droite les actions : « Annuler » discret, puis l'action principale tout au bout. Largeurs : 32 rem, `--small` 27 rem.
- **Raison** : la lecture d'une modale descend du titre au texte et s'achève en bas à droite ; l'action qui conclut s'y trouve. C'est une exception assumée au « ferré à gauche », limitée au pied de la modale : le titre, le texte et les champs restent sur l'axe gauche.
- **Ce qui reste de D-046** : fond et contour de la page, aucun filet intérieur, pas de croix, filet de défilement seulement si le contenu dépasse.
- **Abandonné** : `__head`, `__close`.

## D-049 — Modales portrait : le chiffre, l'étiquette, la colonne

- **Date** : 2026-11-12 · **Statut** : adoptée, voir D-050 · **Demandée par** : le commanditaire (« plus hautes que larges, sois créatif »)
- **Proposition** (de Claude) : une feuille au format A (1 : √2, 23 rem de large). Titre en haut en corps d'écran (32 px), sur deux lignes s'il le faut ; pied en bas ; le vide au milieu fait partie de la composition. Un bloc `__stake`, poussé au bas du corps, porte ce qui est en jeu : c'est la dernière chose lue avant le bouton. Trois compositions :
  - **le chiffre** — `--portrait` + un `.c-stat--hero` : ce que l'action engage, en un nombre ;
  - **l'étiquette** — `--portrait` + un `.c-kv` à filets conducteurs : la fiche de l'objet, comme une étiquette technique ;
  - **la colonne** — `--column` : toute la hauteur de l'écran, centrée, pour un formulaire de quatre à huit champs ou en deux temps ; la position se lit entre crochets.
- **Raison** : les références sont des pages et des étiquettes, pas des boîtes de dialogue ; le format portrait est le leur. Il laisse aussi la page hachurée visible des deux côtés.
- **À trancher** : le portrait devient-il le format par défaut de toute modale, ou reste-t-il une variante à côté du format paysage de D-048 ? La colonne ressemble-t-elle trop au tiroir écarté en D-020 ? Elle est centrée et modale, mais occupe la même hauteur.
- **Limite** : le format ne convient pas à un contenu large (tableau, « Aller à ») : `--large` reste.

## D-050 — La modale est portrait par défaut

- **Date** : 2026-11-12 · **Statut** : en vigueur · **Validée par** : le commanditaire (« ok pour la modale ») · **Suite de** : D-049
- **Décision** : les trois compositions de D-049 sont adoptées et la feuille portrait devient le format de `.c-dialog` sans modificateur : 23 rem de large, 1 : √2, titre en 32 px. `--column` garde la pleine hauteur. Les formats couchés restent en modificateurs : `--small` pour une confirmation d'une phrase, `--large` pour un contenu large (« Aller à », tableau). La classe `--portrait` de D-049 n'a plus lieu d'être.
- **Choix de Claude** sur les deux points laissés ouverts : portrait par défaut ; la colonne est gardée, pour quatre à huit champs — au-delà, une page.
- **Remplace dans D-048** : les largeurs (32 rem / 27 rem) et le corps du titre (24 px), qui ne valent plus que pour les formats couchés.
