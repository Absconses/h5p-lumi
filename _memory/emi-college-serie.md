---
name: emi-college-serie
description: Série récurrente de modules H5P pour l'EMI au collège (projet associé au skill h5p-lumi)
metadata:
  node_type: memory
  type: project
---

L'utilisateur produit **régulièrement** des modules H5P pour l'**EMI au collège** (Éducation aux Médias et à l'Information), à importer dans Lumi. C'est un **projet récurrent** associé au skill [[h5p-lumi-skill]].

**Dossier de travail :** `Desktop\Claude\Sessions\emi-college\` — **un sous-dossier par module**. Chaque module garde sa source régénérable dans `build/` : `data.json` (contenu pédagogique FR, UTF-8) + `generate-book.ps1` (générateur ASCII) + `content.json` (sortie) + `tpl-*.json` (squelettes de `params` clonés depuis un gabarit). Le `.h5p` final est à la racine du sous-dossier. Réf. partagée des params : `emi-college\_inspect\content_content.json` (le livre démo extrait du gabarit).

**Modules produits :**
- `wikipedia-fonctionnement/wikipedia-fonctionnement.h5p` — « Wikipédia : comment ça marche ? », **6e (cycle 3)**, **Interactive Book** (5 chapitres, 13 modules : texte, accordéon, QCM, vrai/faux, texte à trous, glisser-les-mots, marquer-les-mots, bilan Summary). Thème : principe wiki, contrôle communautaire, sources/vérifiabilité, usage critique. Empaquetage vérifié sain (51 deps, 0 fantôme) ; **à confirmer dans Lumi**.

**Convention de production (fiable, sans Node) :** séparer le **contenu** (`data.json` UTF-8) du **générateur** (`.ps1` 100 % ASCII qui lit le texte FR depuis le JSON → évite le piège d'encodage de PowerShell 5.1). Le générateur **clone les `params` réels** d'un gabarit et n'y injecte que le contenu pédagogique. Détail technique « gabarit = banque de params » consigné dans [[h5p-lumi-skill]].

**Why:** capitaliser une série cohérente de modules EMI réutilisables plutôt que repartir de zéro à chaque fois.
**How to apply:** pour un nouveau module EMI, créer `emi-college\<nom>\build\`, écrire un `data.json`, réutiliser/adapter `generate-book.ps1`, valider (`Test-H5PJson`), empaqueter avec le bon gabarit, puis resynchroniser (`Backup-Memory.ps1` + git). Public par défaut : collège, programmes Eduscol, ton encourageant. Voir [[user-profile]].
