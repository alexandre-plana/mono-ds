# Philosophie

Ce document dit **pourquoi** MONO est ce qu'il est. Les autres documents disent
quoi faire ; celui-ci sert à trancher quand ils ne disent rien, et à reconnaître
un écart avant qu'il ne s'installe. En cas de doute sur une règle, c'est ici que
l'on revient.

## En une phrase

> MONO traite l'écran comme une page imprimée : une encre, un papier, des filets,
> beaucoup de vide — et une seule couleur, gardée pour ce qui ne doit pas être manqué.

## D'où il vient

Le système est né de cinq images : un dos de pochette de disque, une étiquette
technique sérigraphiée, et trois pages d'un rapport annuel (une carte, un arbre de
décision, un histogramme). Aucune n'est une interface. Toutes ont en commun :

- **Un fond sombre qui n'est pas noir, un texte clair qui n'est pas blanc.**
  On sent la matière : une encre, un carton.
- **Une seule famille de caractères, en monospace.** La hiérarchie vient de la
  graisse, des capitales et de l'espacement, presque jamais de la taille.
- **Des filets très fins pour tout structurer** : relier un nom à un rôle,
  porter une grille, tracer un lien. Aucune boîte.
- **De grands vides assumés.** Le contenu se regroupe, le reste de la page se tait.
- **Une couleur, rare.** Quelques points rouges sur une double page grise : on
  les voit avant de lire quoi que ce soit.

MONO est la traduction de ces cinq constats en règles pour l'écran. Quand une
décision hésite, la question est : *cela aurait-il sa place sur ces pages ?*

## Les convictions

### 1. L'écran est une page

Une page a un format, des marges, un titre courant, un folio. Elle est composée
une fois, pour être lue. MONO compose donc des **vues**, pas des assemblages de
widgets : un en-tête, un colophon, des axes, un point focal.

- *Implique* : cadre de page constant, marges égales, ferré à gauche, grille de
  douze colonnes, trois ou quatre axes verticaux, et des alignements au cordeau :
  une rangée partage sa première ligne de base, un axe est tenu par le texte.
- *La feuille et le plan de travail* : la page a un bord — un contour d'un pixel —
  et repose sur un plan de travail uni, un ton plus sombre, en retrait de l'écran.
  Les hachures ne décorent pas : elles couvrent la page sous une modale, et
  désignent ce qui est hors d'atteinte. C'est ce qui permettra
  de poser à côté d'elle un inspecteur ou des fenêtres.
- *Serait un écart* : un tableau de bord fait de tuiles interchangeables ; un
  contenu centré ; une page qui n'a pas de « haut à gauche ».

### 2. La retenue fait la hiérarchie

Le clair, le gras, la grande taille et la couleur ne valent que parce qu'ils sont
rares. Chaque emploi les dévalue. MONO les traite comme des **budgets** (voir plus
bas) : dépenser l'un d'eux doit répondre à une intention que l'on peut énoncer.

- *Implique* : un seul point focal, un seul bouton primaire, un seul chiffre
  héros, trois corps de texte, quatre niveaux de ton pour le texte.
- *Serait un écart* : deux actions « principales » ; un paragraphe entier au ton
  fort ; un titre agrandi « pour qu'on le voie mieux ».

### 3. Le gris est une matière

Le monochrome n'est pas une couleur en moins : c'est treize tons choisis, bornés
avant le noir et avant le blanc, légèrement froids dans les sombres et chauds
dans les clairs. Les extrêmes sont exclus parce qu'ils fatiguent, qu'ils
aplatissent la matière et qu'ils ne laissent aucune marge pour hiérarchiser.

- *Implique* : des rôles sémantiques plutôt que des valeurs ; l'élévation par le
  ton ; des aplats en gris moyen ; deux thèmes symétriques, encre et papier.
- *Serait un écart* : un `#000` « pour plus de contraste » ; un gris ajouté à la
  main entre deux tons ; une transparence qui fabrique un ton non mesuré.

### 4. La couleur est un événement

Le signal n'est ni une identité ni une décoration ni un langage d'états. C'est une
alarme : il n'a de force que s'il est presque toujours absent. Un écran sans
aucune couleur est l'état normal du système, pas un écran inachevé.

- *Implique* : une seule teinte ; moins de 1 % de la vue ; un seul fait désigné
  par écran ; toujours doublée d'une forme ou d'un mot ; posée en dernier.
- *Serait un écart* : un vert pour « succès » ; le signal sur l'action courante ;
  une teinte par série ; un logo ou un bandeau coloré.

### 5. Le vide travaille

L'espace n'est pas ce qui reste quand on a tout placé : c'est lui qui forme les
groupes, donne l'ordre de lecture et fait exister le point focal. Un écran plein
n'est pas plus informatif, il est seulement plus lent à lire.

- *Implique* : un tiers de la vue libre ; serré dans un groupe, très large entre
  deux ; un contrepoids plutôt qu'un remplissage.
- *Serait un écart* : étirer un contenu pour occuper la largeur ; ajouter un
  élément « parce qu'il y a de la place » ; un intervalle uniforme partout.

### 6. La structure se trace, elle ne s'emboîte pas

Un filet d'un pixel sépare, relie et aligne sans rien enfermer. La boîte, elle,
ajoute quatre bords, une marge intérieure et un niveau d'imbrication : elle parle
plus fort que ce qu'elle contient.

- *Implique* : filet avant cadre ; la fiche est un filet et non une boîte ; pas
  d'ombre, pas de dégradé, pas d'arrondi ; une superposition se détache par un
  voile et un trait.
- *Serait un écart* : une carte par indicateur ; un cadre dans un cadre ; une
  ombre « pour détacher » la modale.

### 7. Une forme, un sens

Le système possède peu de formes et chacune ne dit qu'une chose, partout :

| Forme | Sens |
|---|---|
| Filet plein | Structure |
| Filet tireté | Relation, inactif, provisoire, à venir |
| Filet pointillé | Repère : ce qui aide à lire sans être lu |
| Ligne pointillée sous une valeur | On peut écrire ici — la ligne des formulaires papier |
| Repères d'angle, règle, barre d'échelle, crochets, ligne de rappel | Une zone, une mesure, une longueur, une position, une annotation |
| Épaisseur de 2 px et plus | L'actif, le sélectionné, la donnée |
| Contour de 2 px en gris moyen, fond inchangé | Le sélectionné |
| Hachures | Ce qui est hors d'atteinte : la page sous une modale. Jamais un fond permanent |
| Capitales espacées | Le service : labels, légendes, titres courants |
| Graisse 600 | Ce qui nomme |
| Aplat clair | L'action primaire à faire — jamais un choix déjà fait |
| Carré / rond | Choix multiple / choix unique ; critique / normal |

- *Serait un écart* : un tireté décoratif ; un contour épais sans état ; des
  capitales pour une phrase ; un aplat clair qui n'est pas une action.

### 8. La sélection s'efface devant son résultat

Choisir un onglet, cocher un filtre, sélectionner une fiche : ce sont des moyens.
Ce que l'on veut voir ensuite, c'est ce que l'action a produit — la vue qui
s'ouvre, la liste qui se resserre, le chiffre qui change. Un contrôle sélectionné
qui s'allume en clair retient l'œil sur le geste déjà fait et vole l'éclat au
contenu.

- *Implique* : le sélectionné se marque par son **contour seul** — 2 px en gris
  moyen (`--selected-line`) — et par la graisse. Son fond ne change pas : un
  aplat, même discret, ferait du contrôle une tache. On le retrouve si on le
  cherche, il n'attire pas. Le ton clair va au résultat.
- *Serait un écart* : un onglet actif souligné de blanc ; un filtre actif en
  aplat, clair ou gris ; une fiche choisie encadrée au ton fort ; une ligne sélectionnée
  plus claire que les chiffres qu'elle contient.
- *À ne pas confondre* : le **focus clavier** n'est pas une sélection. Il doit
  rester très visible (contour de 2 px au ton fort) — c'est une exigence
  d'accessibilité, et il ne dure que le temps de la navigation.

### 9. Lisible avant d'être beau

L'esthétique des références flirte avec l'illisible : textes minuscules, gris sur
gris. MONO garde l'allure et refuse le coût. Quand le style et la lisibilité
s'opposent, la lisibilité gagne, toujours, et sans discussion.

- *Implique* : 11 px au moins et pour les seules capitales ; 4,5 : 1 pour tout
  texte, 7 : 1 pour le texte courant ; contrastes contrôlés par script ; l'inactif
  reste lisible ; l'état ne passe jamais par la seule teinte.
- *Serait un écart* : un « mode compact » à 10 px ; un texte tertiaire plus pâle
  « parce que c'est plus élégant » ; un contrôle désactivé par opacité.

## Les budgets

Par vue, c'est-à-dire par écran visible sans défilement.

| Ressource | Budget | Pourquoi |
|---|---|---|
| Signal | Un fait, moins de 1 % de la surface — le plus souvent zéro | Conviction 4 |
| Éclat (ton opposé au fond) | 3 % au plus, et jamais pour un état sélectionné | Convictions 2, 3, 8 |
| Bouton primaire | 0 ou 1 — seulement quand l'écran existe pour accomplir une action | Seul aplat clair autorisé ; sur un écran de consultation, le clair va au contenu |
| Chiffre héros | 1 | C'est le point focal |
| Bloc inversé | 1, un tiers de la vue au plus | Seule grande masse du ton opposé |
| Corps de texte | 3 | La hiérarchie passe par la graisse et le ton |
| Niveaux de ton du texte | 4 | En dessous, un gris est un filet |
| Axes verticaux | 3 ou 4 | Au-delà, plus aucun bord ne se répète |
| Plans de profondeur | 3 dans la page : creux, fond, surface — plus le plan de travail dessous | L'élévation n'existe pas |
| Modale | 1 à la fois | Une interruption se mérite |
| Fenêtre flottante | 2 au plus sur une page ; libre en version bureau, où les fenêtres sont les pages | Elle accompagne, elle n'encombre pas |
| Vide | Un tiers au moins | Conviction 5 |

Un budget dépassé n'est pas une faute de goût : c'est le signe que l'écran essaie
de dire deux choses. La réponse est de choisir, pas d'agrandir le budget.

## Ordre d'arbitrage

Quand deux règles s'opposent, la première de cette liste l'emporte :

1. **Lisibilité et accessibilité** — tailles, contrastes, clavier, état sans teinte.
2. **Clarté de la hiérarchie** — un point focal, un ordre de lecture évident.
3. **Cohérence du système** — une forme, un sens ; pas de cas particulier.
4. **Sobriété** — moins d'éléments, moins de tons, moins de bords.
5. **Fidélité aux références** — l'allure, en dernier.

Exemple : une valeur critique à 11 px dans un tableau dense. La sobriété voudrait
la laisser ainsi, la hiérarchie demande qu'on la voie : on lui donne la graisse
et le signal (2), on ne réduit pas le reste du tableau sous le plancher (1).

## Les tests d'écart

À passer avant d'ajouter un élément, un composant ou une règle.

1. **Le test du gris.** L'écran se comprend-il sans le signal, imprimé en noir et
   blanc ? Sinon la couleur porte une information qu'aucune forme ne double.
2. **Le test de la page.** Cet élément aurait-il sa place sur une page imprimée
   des références ? Une ombre, un arrondi, un dégradé : non.
3. **Le test du retrait.** Si on l'enlève, perd-on une information ou une
   structure ? Sinon il est ornemental : on l'enlève.
4. **Le test de la phrase.** Peut-on dire en une phrase ce que l'écran doit faire
   voir, et est-ce bien l'élément le plus clair ?
5. **Le test du budget.** Quel budget cet ajout consomme-t-il, et qui le cède ?
6. **Le test du vocabulaire.** Exprime-t-on la chose avec les rôles, les formes
   et les classes existants ? S'il faut un nouveau ton ou une nouvelle forme, la
   demande est probablement à reformuler.
7. **Le test des yeux plissés.** Écran flouté : voit-on un point clair, deux ou
   trois nappes grises, et le reste uni ?

## Demandes fréquentes, réponses du système

| On demande | Pourquoi c'est un écart | Ce que MONO répond |
|---|---|---|
| « Du vert pour le succès, de l'orange pour l'alerte » | Trois teintes font un langage d'états ; le signal n'alerte plus | Le glyphe et le mot : `.c-status--on`, `--warning`. Seul le critique prend le signal |
| « Une ombre pour détacher la modale » | L'élévation n'existe pas | Un voile sur la page, une surface d'un cran, un filet |
| « Arrondir un peu les boutons, c'est plus doux » | Une seconde famille de formes | Le rayon reste à 0 ; la douceur vient des tons bornés et du vide |
| « Une couleur de marque » | Le signal deviendrait une identité | La marque s'exprime par le titre espacé, la typographie et la composition |
| « Une couleur par série, sinon on ne distingue pas » | Conviction 4 | Ton et trait pour trois séries ; au-delà, des petits multiples |
| « Mettre chaque indicateur dans une carte » | La boîte parle plus fort que le chiffre | Une rangée de `.c-stat--ruled` : un filet au-dessus, de l'espace autour |
| « Agrandir le titre pour qu'il ressorte » | Le corps est le dernier levier | Graisse, capitales, ton fort — et retirer ce qui lui fait concurrence |
| « Un mode dense à 10 px » | Sous le plancher de lisibilité | `.c-table--dense` réduit l'interligne, jamais le corps |
| « Des icônes devant chaque entrée du menu » | Ornement : le mot suffit | Le numéro d'ordre, qui est une information |
| « Griser le bouton désactivé » | L'opacité fabrique un texte illisible | Contour tireté, texte au ton tertiaire |
| « Un fond au survol, pour montrer que ça se clique » | Un état ne change pas de fond ; et le fond ne dit pas ce que fera le clic | Le survol annonce : un filet terminé en pointe, ou une icône `.c-cue` |
| « Mettre la photo telle quelle, elle est belle » | Sa couleur et ses extrêmes écrasent tout le reste de la page | `.c-media--raw` : encrée, au ton de la page ; `--raster` si elle pèse encore |
| « Rendre la couleur de l'image au survol » | La seule couleur est le signal | L'image reste encrée ; le survol annonce le clic, pas l'image |
| « Une animation à l'apparition » | Rien d'ornemental | Transitions de 120 ms sur la couleur et la bordure, rien d'autre |
| « Centrer l'état vide, c'est plus équilibré » | Ferré à gauche, sans exception | `.c-empty` sur l'axe du contenu qu'il remplace |
| « L'onglet actif en blanc, pour bien voir où l'on est » | Le clair irait au contrôle, pas au contenu qu'il vient d'ouvrir | Contour de 2 px en gris moyen, fond inchangé ; c'est le contenu de la vue qui porte le clair |
| « Un spinner pendant l'enregistrement » | Le cercle tournant est une forme étrangère au système | `.c-spinner` : un caractère qui tourne, `\| / - \\`, à côté de la valeur concernée |
| « Une bibliothèque d'icônes » | Une seconde main de dessin, arrondie ou trop grasse pour des filets d'un pixel | Un jeu propre de 49 signes, tracé comme les filets |
| « D'autres éléments graphiques, pour enrichir » | Rien d'ornemental | Oui, s'ils ont un sens : six signes admis, quatre refusés (voir `fondations.md`) |
| « Un menu au clic droit, avec des sous-menus » | Un sous-menu cache, et le clic droit ne se découvre pas | Oui, sur un seul niveau, et aucune action ne doit exister seulement là |
| « Un rail de navigation à gauche, comme partout » | Une région fixe de plus, qui charge chaque écran pour un besoin ponctuel | Deux lignes fixes. La ligne de tête porte le chemin, ou le fil d'Ariane sous des onglets persistants ; le plan de travail sert de carte ; deux pages se posent côte à côte |
| « Deux boutons pleins, les deux actions comptent » | Deux points focaux | Choisir ; l'autre est en contour |
| « Un fond coloré pour l'alerte » | Le signal n'est jamais une surface | `.c-notice--signal` : un trait de 2 px et un mot |

## Vocabulaire

| Terme | Sens |
|---|---|
| **Encre / Papier** | Les deux thèmes : clair sur sombre, sombre sur clair |
| **Fond** | La masse dominante de la vue : fond, creux, surfaces |
| **Trame** | Les gris moyens : filets, texte secondaire, marques de données |
| **Éclat** | Le ton opposé au fond : titres, chiffres, action primaire |
| **Signal** | L'unique couleur |
| **Filet** | Un trait d'un pixel |
| **Filet conducteur** | Le filet qui relie un label à sa valeur éloignée |
| **Grappe / silence** | Un groupe dense / le vide qui le sépare du suivant |
| **Axe** | Un bord gauche répété par plusieurs blocs |
| **Point focal** | L'élément le plus clair de la vue |
| **Contrepoids** | Le petit élément marqué qui répond, en diagonale, à la masse principale |
| **Bloc inversé** | Un panneau du thème opposé |
| **Fiche** | La « carte » de MONO : un filet, un en-tête, un contenu, un pied |
| **Rôle** | Un token sémantique (`--fg`, `--line`) par opposition à un ton brut |

## Ce que MONO n'est pas

- **Pas un thème sombre.** Le thème papier est son égal ; ce qui définit le
  système, c'est la retenue, pas la luminosité.
- **Pas un minimalisme décoratif.** On ne retire pas pour faire épuré, on retire
  ce qui ne porte ni information ni structure.
- **Pas une esthétique « terminal ».** Le monospace est là pour l'alignement des
  chiffres et l'égalité des caractères, pas pour évoquer le code. Ni curseur
  clignotant, ni vert phosphore, ni art ASCII. La console (`.c-console`) existe
  parce qu'un journal et une ligne de commande sont utiles, et elle obéit aux
  mêmes règles que le reste : niveaux lus à la forme, signal pour la seule erreur.
- **Pas un système de marque.** Il ne porte aucune identité colorée et n'en
  accueillera pas.
- **Pas une boîte à outils neutre.** Il a un avis sur la composition ; un écran
  peut n'employer que des composants MONO et ne pas être MONO.

## Faire évoluer le système

- **Un nouveau composant** s'exprime avec les rôles, les formes et les échelles
  existants. S'il ne le peut pas, c'est le besoin qu'on réexamine d'abord.
- **Un nouveau token** est une décision de fondation : il se justifie par un rôle
  que plusieurs composants partagent, il entre dans `scripts/contrast.mjs`, et il
  ne crée jamais de teinte.
- **Une exception** se documente à l'endroit où elle est faite, avec la conviction
  qu'elle contredit et la raison. Une exception répétée trois fois est une règle
  à écrire ou une erreur à corriger — pas une habitude.
- **Une règle se retire** aussi : si elle n'empêche plus aucun écart, elle encombre.
