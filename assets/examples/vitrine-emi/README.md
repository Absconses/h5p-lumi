# Exemple : livre vitrine « S'informer, vérifier, publier » (EMI, cycle 4)

Livre interactif de **démonstration**, écrit pour être montré à une direction d'établissement :
sur un seul thème (l'éducation aux médias et à l'information), **chaque chapitre est bâti sur un
type H5P différent**, et chacun reste un vrai moment de cours. Chaque chapitre s'ouvre sur une
**fiche technique** destinée à l'adulte (type, ce qu'il apporte, où il fonctionne et s'il est noté) ;
la suite s'adresse aux élèves.

Fil conducteur : recevoir une information (1-6), la vérifier (7-12), la partager et protéger ses
données (13-17).

| Chapitre | Type mis en avant | Noté |
|---|---|---|
| Avant-propos | Accordéon (questions de la direction : fabrication, RGPD, programme) | — |
| 1. Quel internaute es-tu ? | Personality Quiz *(cadre)* | non |
| 2. Cinq siècles de médias | Timeline (images Wikimedia en lien) + Vrai/Faux | oui |
| 3. Les métiers de la télé | Virtual Tour 360 *(cadre)* + Drag Text | oui |
| 4. Mon fil d'actualité | **Interactive Video** (vidéo fabriquée, 5 arrêts + QCM) | oui |
| 5. Fait ou opinion ? | Mark the Words + QCM | oui |
| 6. Le cadrage change le sens | **Agamotto** (3 recadrages d'une même photo) + QCM | oui |
| 7. Le voyage d'une infox | Impressive Presentation *(cadre)* + Single Choice Set | oui |
| 8. Partager ou vérifier ? | **Branching Scenario** *(cadre)* + Vrai/Faux | oui |
| 9. Enquêter sur une source | Tabs *(cadre)* | non |
| 10. Le dividende du menteur | Course Presentation nichée + QCM *(repris de « Qui t'informe ? »)* | oui |
| 11. L'IA dans la rédaction | Drag and Drop *(repris de « Qui t'informe ? »)* | oui |
| 12. Wikipédia | Sort the Paragraphs *(cadre)* + QCM | oui |
| 13. Privé, ça veut dire quoi ? | Grid Checker *(cadre)* + QCM | oui |
| 14. Où voyagent mes données ? | GeoQuiz *(cadre)* + QCM | oui |
| 15. À toi d'enquêter | **Documentation Tool** (4 pages + export Word) | trace écrite |
| 16. Les mots de l'EMI | Dialog Cards + Crossword *(cadre)* | non |
| 17. Ce que je retiens | Summary + crédits | oui |

Les modules en cadre sont dans `partage/vitrine-emi/` (scénario, mots croisés, onglets,
présentation 3D) ou réutilisés depuis `partage/` (visite 360, grille, GeoQuiz, Personality Quiz,
Sort the Paragraphs). Méthode et ratios : `references/iframe-modules.md`.

## Reconstruire

```bash
node rec.cjs <dossier_feed>          # enregistre feed.html en vidéo (Playwright) → ffmpeg → mp4 + webm
node shot.cjs article.html:760 chat.html:560   # captures du scénario
node modules.mjs <dossier_sortie> <mots-croises_extrait>      # Branching Scenario + Crossword
node book.mjs <gabarit_interactivebook_reporter_extrait> <base_url_partage> \
     <c.json de journalisme-ia> <iv-base.json> <tl-credits.json> livre.json
python3 ../visite-coulisses-info/validate.py <gabarit_extrait> livre.json "H5P.InteractiveBook 1.11"
python3 packbook.py <gabarit.h5p> livre.json <media> sortie.h5p "<titre>"
```

- **gabarit** : `gabarit-interactivebook-reporter.h5p` (le seul qui contient `DocumentExportPage`,
  nécessaire au chapitre 15).
- `packbook.py` = `pack.py` étendu aux vidéos (`videos/…`, stockées sans compression).
- `iv-base.json` : params d'une Interactive Video clonés d'un paquet existant.
- `tl-credits.json` : crédits Wikimedia + URL des vignettes utilisées par la frise.
- `feed.html` fabrique la vidéo du chapitre 4 : un faux fil d'actualité qui défile, cinq messages
  de natures différentes (information, publicité, opinion, rumeur, parodie), sans aucune marque
  réelle. Les arrêts de la vidéo (6 s, puis toutes les 7 s) correspondent aux `duration.from` des
  interactions dans `book.mjs`.

Sources complètes (images, vidéo, captures) : dossier projet `h5p/sources/vitrine-emi/`.

## Deux points appris ici

- **Documentation Tool** : `inputFieldSize` n'accepte que `'1'`, `'3'` ou `'10'`. La page d'export
  (`H5P.DocumentExportPage 1.5`) doit être le dernier élément de `pagesList`.
- **Interactive Video** : fournir le mp4 **et** le webm (le Chromium de test ne lit pas le H.264) ;
  le serveur de test doit répondre aux requêtes `Range`, sinon la vidéo ne démarre pas.
