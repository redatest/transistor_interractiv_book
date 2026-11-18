# Le livre vivant : les transistors

*6 chapitres au total (le cahier des charges initial en prévoyait 5 au maximum, le sixième a été demandé ensuite).*

**Matière :** physique, lycée (programme français) · **Source :** *100 Transistor Circuits* (pages 1 à 133) · **Langue :** arabe (RTL) · **Format :** un seul fichier HTML, sans bibliothèque externe, hors ligne

**Erreur courante traitée :** comment « allumer » un transistor, et la différence entre NPN et PNP.

## Progression

| # | Chapitre | Idée clé | Loi | Type d'activité |
|---|----------|----------|-----|-----------------|
| 1 | Comment un doigt allume-t-il une lampe ? | Un petit courant de base commande un grand courant collecteur | I<sub>C</sub> = β × I<sub>B</sub> | Laboratoire + curseur |
| 2 | NPN ou PNP ? | Les deux types ont des polarités opposées | NPN ⇄ PNP | Laboratoire + bascules (**erreur courante**) |
| 3 | Deux transistors ensemble | Les gains se multiplient | β<sub>total</sub> = β₁ × β₂ × β₃ | Laboratoire + 1, 2 ou 3 étages |
| 4 | Où l'utilise-t-on ? | Interrupteur ou amplificateur | I<sub>B</sub> = (V<sub>in</sub> − V<sub>BE</sub>) / R<sub>B</sub> | Laboratoire à 5 exemples |
| 5 | Le chargeur solaire : quand arrêter la charge ? | Un régulateur arrête la charge à 13,7 V et la relance vers 12,5 V | P = V² / R | Laboratoire à hystérésis |
| 6 | Défi : moitié de la tension | Régler R<sub>B</sub> pour avoir V<sub>C</sub> = V<sub>CC</sub>/2 | V<sub>C</sub> = V<sub>CC</sub> − I<sub>C</sub> × R<sub>L</sub> | Jeu avec étoiles |

Chaque chapitre est une double page : à droite le cours (explication courte, loi, note en marge), à gauche le laboratoire. Une question « prédis puis révèle » précède chaque expérience, avec réponse sous une languette en papier.

## Détail des chapitres

### 1. Comment un doigt allume-t-il une lampe ? (p. 3 et 27)
- **Scène :** on touche deux fils, la LED s'allume ; plus on appuie, plus elle brille.
- **Prédis :** en appuyant plus fort, que deviennent la résistance du doigt et le courant de base ?
  - **Réponse :** la résistance baisse, I<sub>B</sub> augmente, I<sub>C</sub> augmente, la LED brille davantage.
- **Note :** le transistor ne se « déclenche » pas par la tension seule, mais par un courant qui entre dans la base.
- **Exemple du livre (p. 50) :** détecteur de mensonge, plus on appuie fort, plus de LED s'allument.
- **Calcul :** R<sub>doigt</sub> = 20 kΩ + (1 − p/100)² × 2 MΩ, I<sub>B</sub> = (9 − 0,6) / R<sub>doigt</sub>, I<sub>C</sub> = min(β·I<sub>B</sub>, I<sub>max</sub>).

### 2. NPN ou PNP ? (p. 1 et 21–24)
- **Prédis (erreur courante) :** on branche un PNP comme un NPN (plus côté collecteur) et on appuie fort. La LED s'allume-t-elle ?
  - **Réponse :** non. Un PNP demande la batterie inversée.
- **Laboratoire :** choix NPN/PNP, bouton « inverser la batterie ». Conduction si (type = NPN) ≠ (batterie inversée).
- **Note :** croire que les deux types se câblent pareil est faux, ils sont complémentaires.

### 3. Deux transistors ensemble (p. 24 et 28)
- **Idée :** un second transistor remplace le doigt, c'est la « paire super-alpha » (Darlington) du livre.
- **Chiffres du livre :** 200 × 200 pour deux, 200 × 200 × 200 = 8 000 000 pour trois (p. 28).
- **Prédis :** avec deux transistors, le gain total vaut-il 400 ou 40 000 ?
  - **Réponse :** 40 000, le gain se multiplie.
- **Calcul :** I<sub>B</sub> = (9 − n × 0,6) / R<sub>doigt</sub>, β<sub>total</sub> = 200<sup>n</sup>.
- **Laboratoire (refait) :** les boutons 1, 2, 3 ajoutent ou retirent de vrais transistors Q1, Q2, Q3 sur la carte. Le doigt alimente la base de Q1, chaque émetteur alimente la base du suivant, tous les collecteurs vont à la LED. Une étiquette par étage affiche son courant (β<sup>k</sup> × I<sub>B</sub>, plafonné par la charge) et les impulsions s'accélèrent d'un étage à l'autre.

### 4. Où l'utilise-t-on ? (index du livre et p. 50)
- **Rôles :** interrupteur (le courant de base ouvre ou ferme la charge) ou amplificateur (petit signal → grand signal).
- **Exemples du laboratoire :**
  - interrupteur tactile (p. 50) : LED et deuxième pastille tactile. Dans le livre, la peau envoie un petit courant à la paire super-alpha, qui commande un BC557, puis 4M7 maintient le circuit allumé ; deux plots OFF l'éteignent. Le laboratoire ne reproduit pas ce verrouillage ;
  - détecteur d'obscurité : LED et LDR sur le chemin de la base ;
  - moteur : hélice animée ;
  - haut-parleur : cône animé ;
  - relais : relais SONGLE et diode D1.
- **Prédis :** V<sub>in</sub> = 0,4 V seulement, à travers 10 kΩ. Le moteur tourne-t-il ?
  - **Réponse :** non. Sous 0,6 V, aucun courant de base, donc I<sub>C</sub> = 0.
- **Calcul :** I<sub>B</sub> = max(0, (V<sub>in</sub> − 0,6) / 10 kΩ), V<sub>in</sub> de 0 à 3 V.

### 5. Le chargeur solaire : quand arrêter la charge ? (p. 18)
- **Scène :** panneau 18 V, batterie 12 V, relais 12 V, BC547, potentiomètre 1 kΩ, 270 Ω, 22 µF et charge factice 100 Ω / 5 W (schéma du livre).
- **Chiffres du livre :** le potentiomètre règle la coupure du relais à 13,7 V ; la charge reprend vers 12,5 V ; la charge factice absorbe 3,25 W ; le panneau doit donner au moins 16 V à vide (25 à 28 cellules).
- **Prédis :** la batterie atteint 13,7 V. La charge continue-t-elle ? Et si la tension retombe à 13 V, reprend-elle ?
  - **Réponse :** non et non. Elle ne reprend que vers 12,5 V.
- **Laboratoire (refait) :** schéma simplifié en blocs : panneau, relais K1 avec un levier qui bascule entre la batterie (charge) et la charge factice (arrêt), bloc « BC547 + 1k » qui surveille la tension. Sous la scène, une jauge 11 à 14,5 V avec les seuils 12,5 V et 13,7 V, et deux pastilles d'état (charge / arrêt) qui montrent l'hystérésis. Curseur V<sub>batt</sub> avec mémoire d'état : arrêt dès 13,7 V, reprise à 12,5 V ou moins ; bouton avec ou sans charge factice ; la charge factice chauffe (orange) et affiche P = 18² / 100 ≈ 3,24 W.
- **Note :** le livre signale lui-même que le dessin montre 24 cellules alors qu'il en faut 28.

### 6. Défi : moitié de la tension (p. 3)
- **But :** régler R<sub>B</sub> pour que V<sub>C</sub> ≈ 2,5 V avec V<sub>CC</sub> = 5 V et R<sub>L</sub> = 22 kΩ. Le livre indique R<sub>B</sub> ≈ 2,2 MΩ.
- **Prédis :** si on diminue R<sub>B</sub>, que fait V<sub>C</sub> ?
  - **Réponse :** I<sub>B</sub> et I<sub>C</sub> augmentent, V<sub>C</sub> baisse.
- **Calcul :** R<sub>B</sub> = 100 kΩ × 100<sup>s/100</sup> (de 100 kΩ à 10 MΩ), I<sub>B</sub> = (5 − 0,6) / R<sub>B</sub>, I<sub>C</sub> = 57 × I<sub>B</sub> (plafonné à 5 / 22 kΩ), V<sub>C</sub> = max(0,2 ; 5 − I<sub>C</sub> × 22 kΩ).
- **Notation :** écart |V<sub>C</sub> − 2,5| < 0,1 V → 3 étoiles ; < 0,3 V → 2 ; < 0,6 V → 1.

## Interactions et mise en forme

- **Navigation :** flèches, balayage tactile, clavier ; bruit de page, bouton muet.
- **Mode enseignant :** agrandit le modèle et masque le cours.
- **Style :** livre 3D incliné ; carte PCB verte sur tapis de coupe (relais SONGLE, BC337-40, D1, R1) ; flux colorés, collecteur rouge, base bleue, émetteur vert, alimentation jaune ; badges V<sub>BE</sub> et V<sub>CE</sub> en direct ; thème sombre.

## Hypothèses (ne viennent pas du livre)

- **Alimentation 9 V, résistance 220 Ω, chute de la LED 2 V** → I<sub>max</sub> ≈ 31,8 mA (le livre cite 9 V et 1 kΩ en p. 23 pour le testeur).
- **V<sub>BE</sub> = 0,6 V** (n × 0,6 V pour n étages).
- **β = 200** aux chapitres 1 à 4 ; **β = 57** au chapitre 5 pour retrouver R<sub>B</sub> ≈ 2,2 MΩ.
- **V<sub>CE</sub> à saturation = 0,2 V** ; en mode relais, V<sub>CE</sub> = 9 V au repos, 0,2 V en conduction (bobine non modélisée).
- **Chapitre 5 :** le texte du livre dit « le relais retombe à 13,7 V » ; j'ai compris que la charge s'arrête à 13,7 V et reprend vers 12,5 V, sans simuler le circuit (la polarité du BC547 et du contact du relais n'est pas lisible dans le schéma).
- **Chapitre 4 :** R<sub>B</sub> = 10 kΩ et valeurs de charge ; les noms des exemples viennent de l'index, pas des schémas lus. La LDR est dans la liste des composants du kit, mais le schéma « Dark Detector » n'a pas été lu.
- **BC337-40 / BC327-40 :** pièces de la vidéo fournie (le livre utilise BC547 et BC557).

## Écarts relevés dans le livre

- P. 18 : la charge factice « absorbe 3,25 W » ; 18² / 100 = 3,24 W, c'est un arrondi.
- P. 18 : batterie 12 V × 1,2 Ah donne 14,4 Wh, le livre écrit 14 Wh (arrondi) ; 6 W × 3 h = 18 Wh ✓.
- P. 18 : le dessin montre 24 cellules, le livre indique 28.

- Gain annoncé d'environ 100 en p. 3, mais 200 en p. 27 (« circuit le plus simple »).
- Un second transistor est présenté en p. 3 comme multipliant la luminosité par environ 100 (figure G) ; en théorie les gains se multiplient, et p. 28 indique 200 × 200 × 200.
- R<sub>B</sub> = 2,2 MΩ donne V<sub>C</sub> = 2,5 V seulement si β ≈ 57 (avec β = 100, il faudrait environ 3,8 MΩ).

## Restant à faire (mis à jour)

- **Fait :** relais ouvert/fermé vérifié en capture, hélice du moteur qui tourne, rotation de la carte au doigt, feuille qui se tourne, absence de débordement horizontal à 390 px de large.
- **Non lu :** les schémas de l'amplificateur, du moteur et du détecteur d'obscurité ne sont pas décrits dans le texte du PDF (seulement dans l'index), donc ces exemples restent génériques.
- **Non testé :** fluidité sur un vrai téléphone, haut-parleur qui pulse vu en mouvement, sens du curseur en RTL (le minimum est à droite).
- **Possible :** chapitre dédié au vrai interrupteur tactile de la p. 50 (verrouillage par 4M7, plots OFF), mais le livre est déjà à 5 chapitres, limite du cahier des charges.

## Historique des modifications

| Version | Changement | Détails |
|---------|------------|---------|
| 1 | **Premier livre** | 3 chapitres (doigt/LED, NPN/PNP, défi) ; circuit dessiné en SVG plat au crayon ; livre 3D, languettes « prédis puis révèle », mode enseignant, thème sombre, navigation et bruit de page. Note : des textes de réponse n'étaient pas calculés (bug de chaînes simples), corrigé. |
| 2 | **Chapitres ajoutés** | Chapitre « deux transistors ensemble » (Darlington) et chapitre « où l'utilise-t-on ? » (exemples d'usage). Le défi passe en dernier chapitre. |
| 3 | **Style de la vidéo fournie** | Remplacement du SVG plat par une carte PCB verte en 3D sur tapis de coupe : relais SONGLE, BC337-40, D1, R1, bornier, sérigraphie « 12V REV A ». La vidéo ne durait qu'environ 2 secondes, seule la composition a été reprise. |
| 4 | **Animations refaites** | Scène construite une seule fois puis mise à jour (au lieu d'être redessinée) : chute des composants avec rebond, impulsions dans les pistes, LED qui s'allume progressivement, claquement du relais, balancement et rotation de la carte au doigt, feuille de page qui se tourne. Une récursion infinie introduite pendant la modification a été corrigée. |
| 5 | **Transistor et flux** | Boîtier agrandi (environ 1,8 fois), pattes et pastilles E-B-C colorées ; quatre pistes colorées (collecteur rouge, base bleue, émetteur vert, alimentation jaune) avec sens de circulation ; badges V<sub>BE</sub> et V<sub>CE</sub> en direct. |
| 6 | **Chapitres 4 et 5 sur la carte** | Chapitre 5 : défi sur la carte 3D avec V<sub>CE</sub> et « Objectif 2,5 V ». Chapitre 4 : un composant propre à chaque exemple (LED+tactile, LDR, moteur à hélice, haut-parleur, relais). Correction de l'indice séparé du R ou du V près des curseurs. |
| 7 | **Reste à faire traité** | Texte du chapitre 1 et du chapitre 4 aligné sur la p. 50 (détecteur de mensonge, interrupteur tactile). Hélice du moteur réparée (conflit de nom de classe avec la piste d'alimentation). Feuille de page : le dos reste visible, elle atterrit sur la page droite. |
| 8 | **Nouveau chapitre : chargeur solaire (p. 18)** | Chapitre 5 inséré avant le défi, qui devient le chapitre 6. Carte 3D avec panneau, relais, BC547, charge factice et batterie ; curseur V<sub>batt</sub> avec hystérésis (arrêt à 13,7 V, reprise à 12,5 V) ; charge factice qui chauffe. Test : arrêt à 13,7 V, toujours arrêté à 13,0 V, reprise à 12,5 V. |
| 9 | **Chapitres 3 et 5 refaits** | Chapitre 3 : la carte montrait toujours un seul transistor, elle affiche maintenant 1, 2 ou 3 étages réels avec courants par étage. Chapitre 5 : l'ancienne scène était trop chargée ; remplacée par un levier visible qui bascule, une jauge avec les deux seuils et des pastilles d'état. |

### Tests réalisés
- Syntaxe JavaScript vérifiée à chaque version, aucune erreur de page signalée sur les captures.
- Captures d'écran utilisées : chute des composants, LED allumée et pistes actives, changement de chapitre, modes relais, obscurité, moteur et haut-parleur, chapitre 5.

### Non vérifié
- Fluidité sur un vrai téléphone.
- Haut-parleur qui pulse et claquement du relais vus en mouvement (seuls les états ouvert/fermé ont été vus en capture).
