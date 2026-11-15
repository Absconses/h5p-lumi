# Banques d'images autorisées

Le skill n'est plus limité à Wikimedia Commons. Ce fichier dit **où chercher**, **ce que chaque
licence permet**, **comment créditer**, et **comment éviter de reprendre la même image d'un
module à l'autre**.

> Licences relues le 15 novembre 2026 sur les pages officielles citées en bas de fichier. Une
> licence peut changer : en cas de doute, relire la page officielle. Ce fichier n'est pas un
> avis juridique.

## 1. Les banques, par ordre de préférence

| Banque | Ce qu'on y trouve | Licence | Crédit | Outil |
|---|---|---|---|---|
| **Wikimedia Commons** | photos documentaires, archives, cartes, portraits historiques | Creative Commons ou domaine public, indiquée image par image | obligatoire sauf domaine public / CC0 | `scripts/Find-WikimediaImages.ps1` |
| **Openverse** | moteur qui interroge Flickr, Wikimedia, des musées… | Creative Commons ou domaine public, indiquée image par image | obligatoire sauf domaine public / CC0 ; l'API fournit la mention toute faite | `scripts/Find-OpenverseImages.ps1` |
| **Unsplash** | photos d'ambiance, objets, lieux | licence Unsplash (pas une Creative Commons) | non exigé, mais on crédite quand même | recherche à la main sur le site |
| **Pexels** | photos d'ambiance, scènes de classe, écrans | licence Pexels (pas une Creative Commons) | non exigé, mais on crédite quand même | recherche à la main sur le site |
| **Pixabay** | photos et illustrations | licence Pixabay (pas une Creative Commons) ; CC0 pour les contenus publiés avant le 9 janvier 2019 | non exigé, mais on crédite quand même | recherche à la main sur le site |

Unsplash, Pexels et Pixabay ont chacune une API, mais elle demande une clé personnelle : le
skill ne fournit pas de script pour elles. On cherche sur le site, on télécharge le fichier,
on note l'adresse de la page et le nom de l'auteur.

## 2. Ce que les licences permettent, et ce qu'elles ne couvrent pas

**Creative Commons (Wikimedia, Openverse).** Lire le sigle de chaque image :

- `CC0`, `PDM` (domaine public) : tout est permis, sans crédit.
- `BY` : crédit obligatoire.
- `BY-SA` : crédit obligatoire ; une version modifiée de l'image doit garder la même licence.
- `NC` (pas d'usage commercial) : **à écarter** dès qu'un module peut être vendu.
- `ND` (pas de modification) : **à écarter** si l'on recadre, annote ou assemble l'image.

`Find-OpenverseImages.ps1` ne garde par défaut que `cc0`, `pdm`, `by` et `by-sa`.

**Unsplash, Pexels, Pixabay.** Les trois licences autorisent l'usage gratuit, y compris
commercial, sans crédit obligatoire. Les trois interdisent de **revendre ou redistribuer
l'image seule**, sans travail de création autour. Une image intégrée à un module pédagogique
n'est pas vendue seule ; un lot d'images livré tel quel le serait.

**Ce qu'aucune de ces licences ne couvre.** La licence porte sur la photo, pas sur ce qu'elle
montre :

- **Personnes reconnaissables** : la licence ne vaut pas accord de la personne. À éviter dans
  un module vendu, et toujours pour illustrer un sujet sensible (harcèlement, addiction,
  maladie). Pexels et Pixabay interdisent de montrer une personne reconnaissable sous un jour
  négatif.
- **Marques et logos** visibles : pas d'usage qui laisse croire que la marque soutient le module.
- **Œuvres** (tableau, affiche, écran de jeu) photographiées : l'œuvre garde ses propres droits.

Pour des élèves reconnaissables, préférer un cadrage de dos, des mains, un objet, ou un dessin.

## 3. Le crédit

On crédite **toujours**, même quand la licence ne l'exige pas : c'est l'exemple qu'on donne aux
élèves. Format, sous l'image :

```
« Titre ou description », Auteur, Banque, Licence.
```

Exemples :

```
« Kiosque à journaux, Athènes », athenswalk, Wikimedia Commons, CC0.
Photo de Prénom Nom, Unsplash, licence Unsplash.
```

Renseigner aussi le champ `copyright` de l'image dans le JSON H5P (`license`, `author`,
`source`), et pas seulement la légende : le registre et les audits lisent ce champ.

## 4. Jamais la même image dans deux modules

Une image vue dans trois livres devient un décor : l'élève ne la regarde plus. Règle :

- **une image = un module**. La reprise n'est permise que si l'image est elle-même l'objet
  d'étude et que le second module y renvoie explicitement ;
- **on varie aussi les sujets** : pas trois « carnet et crayons » dans le même niveau.

L'outil `scripts/registre-images.py` tient le registre :

```
python scripts/registre-images.py <dossier des modules>            # liste les doublons
python scripts/registre-images.py <dossier des modules> --ecrire   # met à jour images-utilisees.json
python scripts/registre-images.py <dossier des modules> --verifier nouvelle.jpg
```

Il repère les doublons de deux façons : fichiers identiques, et crédits identiques (la même
photo recadrée garde le même crédit). Il sort avec le code 1 s'il trouve un doublon : à lancer
**avant** d'empaqueter un module.

`Find-OpenverseImages.ps1 -Registre images-utilisees.json` écarte d'office les images déjà
inscrites au registre.

## 5. Sources des licences

- Unsplash : https://unsplash.com/license et https://unsplash.com/terms
- Pexels : https://www.pexels.com/license/
- Pixabay : https://pixabay.com/service/license-summary/ et https://pixabay.com/service/terms/
- Openverse (API) : https://api.openverse.org/v1/
- Creative Commons : https://creativecommons.org/licenses/
