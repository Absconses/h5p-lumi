# Breaking News from Salem, 1692 (anglais, 3e advanced)

**v3 (build.mjs, 2026-11-13)** après trois retours de Pierre : classe de 3e advanced (trop de temps
sur l'évident en v1), le script s'écrit **à la main**, le rendu est une **vidéo** filmée à la maison ou
en classe. 3 chapitres, aucun exercice noté, aucune trame en ligne :
1. The brief (consigne + « level up » par rôle + critères) ;
2. Your toolkit (accordéon à ouvrir pendant l'écriture : format en 30 s, modèle Londres 1666, langue
   B1-B2 par rôle, vocabulaire Salem) ;
3. Film your report (outils : téléphone, Canva, Clipchamp, iMovie ; cadrage, lumière, son ; décor par
   rôle ; en classe / à la maison ensemble ou séparément ; jeu face caméra ; rendu, pas de publication).
La v1 ci-dessous reste dans build-v1.mjs.

## v1 (build-v1.mjs)

Livre interactif pour **lancer** une activité de reportage télévisé en groupes de 3
(Reporter / Witness / Historian) sur les procès de Salem. Il enseigne le format, pas le contenu :
le modèle porte sur un autre sujet (le Grand incendie de Londres, 1666).

| Étape | Forme | Pourquoi cette forme |
|---|---|---|
| 1. Your mission | texte, 3 encadrés de rôle (couleur = rôle) | la consigne, reprise telle quelle |
| 2. Modèle (Londres 1666) | script coloré + Single Choice Set « Who says it? » | reconnaître la fonction de chaque rôle sur des répliques nouvelles |
| 3. Les 5 parties | Drag Text (extraits mélangés) puis conducteur dessiné | ordonner = la structure du reportage |
| 4. Écrire un script | brouillon fautif + QCM multi (3 problèmes) | diagnostiquer les erreurs typiques (noms, didascalies, questions fermées) |
| 5. Bonnes questions | Drag Text open/closed + Blanks (mot interrogatif) | distinguer puis produire |
| 6. Toolbox | Accordion par rôle + banque de mots Salem + voix | outil à consulter pendant l'écriture, pas un exercice |
| 7. Write and rehearse | Documentation Tool (trame exportable Word) + Audio Recorder + checklist | produire, répéter, s'auto-évaluer |

Construction (cloud) : `python3 draw.py <raw> media` (peintures du domaine public via Wikimedia Commons :
Matteson, *Trial of George Jacobs* ; anonyme, *The Great Fire of London*), puis
`node build.mjs <gabarit-interactivebook-reporter extrait> content.json media` ; validation et
empaquetage avec `validate.py` / `pack.py` du module Découvrir le CDI v4. Paramètres = défauts anglais
des `semantics.json` (pas de clonage du gabarit français).
