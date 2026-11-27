# L’affaire des livres sans pastille (polar, parcours différencié, 6e/5e)

Branching Scenario d’**apprentissage échelonné** : reconnaître un polar sur une quatrième de couverture
et dire pourquoi. Les élèves à l’aise prennent des raccourcis, les autres reçoivent de l’aide là où ils
butent, sans que personne n’attende personne. Paquet : `partage/polar/polar-differencie.h5p`.

**Objectif (verbe) :** reconnaître un polar et le justifier par ses ingrédients : un méfait, quelqu’un qui
enquête, une enquête (indices, suspects), une vérité à découvrir.
**Erreurs d’élèves visées :** « il y a un mort, donc c’est un polar », « ça fait peur, donc c’est un
polar », « pas de policier ou pas de meurtre, donc pas un polar », « le fantôme fait le genre »,
« on connaît le coupable, donc ce n’est plus un polar » (défi).

## Le chemin

```
mission → Pièce 1 (diagnostic : le genre, puis la preuve, sans correction immédiate)
  ├─ 2 bonnes réponses → raccourci proposé ─┬─ prendre le raccourci ───────────────┐
  │                                         └─ voir quand même la méthode ─┐       │
  └─ sinon → détour : Je découvre (Image Hotspots, rien à répondre) ←───────┘       │
             → Je retiens → Je suis accompagné (Drag Text + coups de pouce, pièce 2) │
             → pièce 2 : « le fantôme » est-il fantastique ? (retour immédiat)       │
Pièce 3 (je fais seul) ←────────────────────────────────────────────────────────────┘
  ├─ juste → pièce 4
  └─ « des gens ont disparu » → remédiation méfait  ┐→ cas jumeau 3 bis → pièce 4
     « on a peur jusqu’au bout » → remédiation peur ┘
Pièce 4 : même modèle (« aucun policier » / « ni crime ni mort ») → cas jumeau 4 bis
Fin commune : écrire sa définition (CP + zone de texte), la comparer à 3 définitions d’élèves,
Je retiens → défi bonus facultatif (pièce 5, polar inversé) ou fin.
```

Le scénario ne lit pas les scores : **ce sont les réponses elles-mêmes qui choisissent le chemin**. Chaque
mauvaise réponse d’une pièce « je fais seul » est une erreur type, avec sa propre remédiation, puis un cas
jumeau qui la reteste. Le cas jumeau, lui, suit le modèle « mauvais choix bloqué ».
Repères : chemin rapide ≈ 10 à 12 min, chemin avec tous les détours ≈ 25 min.

## Style

« Dossier d’enquête » : bureau, scellé « Genre : ? » à remplir, quatrième de couverture lisible
(Atkinson Hyperlegible), titres à la machine à écrire. Tout est dessiné en HTML (`render.mjs`), aucune image
générée. Les 7 livres sont **inventés** : on peut les remplacer par de vrais polars du CDI (il faut alors
de vraies quatrièmes et revoir les questions).

## Reconstruire

```bash
sh build.sh <dossier de travail> <sortie.h5p>     # images, graphe, validation, paquet
node play.mjs <paquet extrait> <préfixe> "Un polar|Zoé cherche|Prendre le raccourci|…"   # jouer un chemin
python3 ../../../scripts/audit-reponses.py <sortie.h5p>                                      # 0 ligne LONGUE
```

Alertes de validation attendues : `nextContentId missing` sur les questions (normal dans un Branching
Scenario) et `iconImage missing` (Image Hotspots en mode icône).
