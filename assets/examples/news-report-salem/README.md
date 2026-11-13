# Breaking News from Salem, 1692 (anglais, collège)

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
