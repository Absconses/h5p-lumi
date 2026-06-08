---
name: emi-college-serie
description: Série récurrente de modules H5P pour l'EMI au collège (projet associé au skill h5p-lumi)
metadata:
  node_type: memory
  type: project
---

L'utilisateur produit **régulièrement** des modules H5P pour l'**EMI au collège** (Éducation aux Médias et à l'Information), à importer dans Lumi. C'est un **projet récurrent** associé au skill [[h5p-lumi-skill]].

## Cadre pédagogique — progression annuelle 6e (défini juin 2026)

Public : **6e (11-12 ans)**, professeur-documentaliste. La progression explore les **Espaces Informationnels**, **un seul par séance**. Les modules H5P sont des **exercices d'APPLICATION** qui clôturent la phase d'enseignement explicite de la séance.

**⚠️ RÈGLE D'OR :** se concentrer **uniquement sur l'espace ciblé** de la séance, **SANS jamais le comparer aux autres** — le tableau comparatif de tous les espaces n'est dressé qu'à la **toute fin de l'année**.

**Les 6 Espaces Informationnels :**
1. **Le CDI** — espace documentaire physique
2. **La Presse** (écrite, radio, TV) — espace éditorialisé
3. **Le Web & les moteurs de recherche** — espace indexé
4. **Wikipédia** — espace contributif
5. **Réseaux sociaux, messageries & Dark Social** — espace de l'attention et de la rumeur
6. **IA générative** — espace probabiliste

**Matrice d'analyse — 4 étapes invariables, dans l'ordre strict :**
1. **Genèse** — « Qui a inventé ça et pourquoi ? » (histoire, intention initiale)
2. **Mécanique** — « Comment la machine/l'humain choisit ce que je vois ? » (algorithme, ligne éditoriale, classement)
3. **Économie** — « Comment ils gagnent de l'argent ? » (modèle économique, pub, données, service public)
4. **Praxis** — « Comment je m'en sers sans me faire avoir ? » (mise en situation, éthique, bons réflexes)

**Choix du type H5P selon l'OBJECTIF COGNITIF** (pas l'outil) : *rappeler* → cartes (Flashcards, Dialog Cards) ; *appliquer* → exercice (QCM, glisser-déposer, texte à trous, marquer les mots, vrai/faux) ; *comprendre un support* → activité intégrée au document (points chauds sur image, vidéo interactive) ; *naviguer une séquence* → Livre interactif ou Présentation de cours (ou Game Map).

**Dossier de travail :** `Desktop\Claude\Sessions\emi-college\` — **un sous-dossier par module**. Chaque module garde sa source régénérable dans `build/` : `data.json` (contenu pédagogique FR, UTF-8) + `generate-book.ps1` (générateur ASCII) + `content.json` (sortie) + `tpl-*.json` (squelettes de `params` clonés depuis un gabarit). Le `.h5p` final est à la racine du sous-dossier. Réf. partagée des params : `emi-college\_inspect\content_content.json` (le livre démo extrait du gabarit).

**Modules produits :**
- `wikipedia-fonctionnement/wikipedia-fonctionnement.h5p` — « Wikipédia : comment ça marche ? », **6e (cycle 3)**, **Interactive Book** (5 chapitres, 13 modules : texte, accordéon, QCM, vrai/faux, texte à trous, glisser-les-mots, marquer-les-mots, bilan Summary). Thème : principe wiki, contrôle communautaire, sources/vérifiabilité, usage critique. Empaquetage vérifié sain (51 deps, 0 fantôme) ; **à confirmer dans Lumi**.

**Convention de production (fiable, sans Node) :** séparer le **contenu** (`data.json` UTF-8) du **générateur** (`.ps1` 100 % ASCII qui lit le texte FR depuis le JSON → évite le piège d'encodage de PowerShell 5.1). Le générateur **clone les `params` réels** d'un gabarit et n'y injecte que le contenu pédagogique. Détail technique « gabarit = banque de params » consigné dans [[h5p-lumi-skill]].

**Why:** capitaliser une série cohérente de modules EMI réutilisables plutôt que repartir de zéro à chaque fois.
**How to apply:** pour un nouveau module EMI, créer `emi-college\<nom>\build\`, écrire un `data.json`, réutiliser/adapter `generate-book.ps1`, valider (`Test-H5PJson`), empaqueter avec le bon gabarit, puis resynchroniser (`Backup-Memory.ps1` + git). Public par défaut : collège, programmes Eduscol, ton encourageant. Voir [[user-profile]].
