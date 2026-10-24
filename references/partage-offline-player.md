# Partager un .h5p par un lien cliquable (h5p-offline-player)

Pour diffuser une activité **sans plateforme** (pas de Nuage, pas de Digiquiz, pas d'export
HTML) : on met le `.h5p` en ligne et on donne aux élèves un lien qui l'ouvre dans le lecteur
**h5p-offline-player** (https://h5p-offline-player.vercel.app/, projet libre
`missing-elements/h5p-offline-player`, licence MIT). Rien à installer : l'élève clique, l'activité
se lance dans son navigateur (PC, tablette, téléphone).

## Quand le proposer

| Besoin | Outil |
|---|---|
| Résultats des élèves pour le prof | **Lumi Nuage** (seul à les garder) |
| Parcours suivi avec bilans (emi-cycle4) | site GitHub Pages dédié |
| Module isolé, non noté, à partager vite | **lien offline player** (ce fichier) |
| Type refusé par Nuage / Digiquiz (GeoQuiz, Impressive Presentation, Tabs…) | **lien offline player** |
| Tablettes sans wifi | app hors ligne du même site (`/app/`, à « installer » depuis le navigateur) |

### Comparaison réelle (testée le 2026-10-24 sur 4 modules de Pierre)

| Module (type) | Lumi Nuage | Digiquiz | Offline player |
|---|---|---|---|
| Wikipédia (Question Set, catalogue) | ✅ + résultats | ✅ | ✅ affichage plus propre (glisser-déposer non tronqué) |
| Qu'est-ce qu'Internet (Impressive Presentation) | ❌ refusé | ❌ « n'a pas pu être chargé » | ✅ après clic « Open with its own scripts » |
| Métiers de la télé (Virtual Tour 360) | (constaté OK par Pierre) | ✅ | ✅ quasi identique, pleine largeur |
| Enquête aigle (Interactive Book) | ✅ + résultats | ✅ | ✅ **plus fluide et moins contraint selon Pierre** ; apostrophe du titre affichée `&#039;` (corrigé, voir plus bas) |

Choix de Pierre (2026-10-24) : l'offline player et Lumi Nuage marchent tous deux très bien,
Digiquiz beaucoup moins. **Par défaut, livrer un lien offline player** (le plus simple à donner) ;
**Lumi Nuage quand il faut suivre la progression des élèves** ; Digiquiz en dernier recours.

Le lecteur **ne stocke aucun résultat** : le score s'affiche à l'élève, le prof ne le reçoit pas.
Le dire à l'utilisateur dès qu'il s'agit d'une activité évaluée.

## Forme du lien

```
https://h5p-offline-player.vercel.app/embed?src=<URL publique du .h5p>
```

- Utiliser **`/embed`** : la page n'affiche que l'activité (pas de menu, pas de texte en anglais).
  La page principale `/?src=` marche aussi mais montre toute la présentation du lecteur autour,
  ce qui parasite l'élève. `/app/` est l'app hors ligne pour fichiers locaux.
- L'hébergeur du `.h5p` doit autoriser les accès d'un autre site (en-tête
  `Access-Control-Allow-Origin`). **GitHub** convient (`raw.githubusercontent.com` et GitHub Pages
  renvoient `*`). L'ENT, Google Drive, Nextcloud : probablement non, à tester avant de promettre.
- Le dépôt GitHub doit être **public** ; sinon l'URL brute renvoie 404.

## Héberger sur GitHub

Le dossier `partage/` de ce dépôt sert à ça. Sur github.com : dossier `partage/` ▸ **Add file ▸
Upload files**, puis ouvrir le fichier ▸ clic droit sur **Raw** ▸ copier l'adresse. Ou en ligne
de commande : copier le `.h5p` dans `partage/`, commit, push.

Ensuite :

```powershell
.\scripts\New-H5PShareLink.ps1 -Path partage\mon-module.h5p          # branche main
.\scripts\New-H5PShareLink.ps1 -Path partage\mon-module.h5p -Test    # + vérifie que l'URL répond
```

Le script affiche l'URL brute et le lien à donner aux élèves (à coller dans l'ENT, un Digipad ou
un QR code). Les noms de fichiers : minuscules, tirets, sans accents ni espaces.

## Limites constatées (testé le 2026-10-24)

- **Taille** : l'envoi par le site github.com est limité à **25 Mo** par fichier, `git push` à
  **100 Mo**. Au-delà (ex. module à vidéos embarquées), passer les vidéos en YouTube ou rester sur
  Lumi. Pour ce partage, livrer la version allégée (`pack_slim`) plutôt que le paquet complet.
- **Mode « Untrusted » par défaut** quand le paquet vient d'un autre site : les types du
  catalogue officiel (Question Set, Vrai/Faux, Glisser-déposer, Texte à trous…) jouent tels quels
  avec les bibliothèques du lecteur. Un type **hors catalogue** ou **patché** (GeoQuiz,
  Impressive Presentation…) affiche d'abord un bandeau ; l'élève doit cliquer **« Open with its
  own scripts »** (bouton en anglais, le prévenir dans la consigne ; même chose sur `/embed`).
- Bibliothèques manquantes téléchargées depuis jsDelivr ; le site de démo charge Vercel Analytics.
  Aucune donnée élève n'est envoyée ; la progression reste dans le navigateur.
- Le site appartient à un particulier : il peut disparaître. Le `.h5p` reste lisible dans Lumi.
- **Scène trop zoomée (Impressive Presentation, Virtual Tour 360)** : sur `/embed`, ces types
  calent leur hauteur sur la largeur ; en pleine fenêtre, la scène déborde de l'écran (l'app
  `/app/` la limite, elle). **Toujours** ajouter au lien `&custom-css=` + l'URL **jsDelivr** de
  `partage/embed-960.css` (`https://cdn.jsdelivr.net/gh/Absconses/h5p-lumi@main/partage/embed-960.css`,
  encodée) : elle limite la scène à 960 px, centrée. Le script le fait avec `-Narrow`.
  - L'URL `raw.githubusercontent.com` ne marche pas pour un CSS (servie en `text/plain` +
    `nosniff`, le navigateur la refuse).
  - jsDelivr met quelques minutes à voir un nouveau commit : si la scène reste en pleine largeur
    juste après un push, retester plus tard, ou épingler un commit (`@<sha>` au lieu de `@main`).
  - Ne pas l'ajouter aux livres, quiz, etc. : leur hauteur suit le contenu, la pleine largeur
    leur va bien (Pierre préfère).
- **Apostrophe du titre** : le lecteur affiche `l&#039;aigle` si le titre de `h5p.json` contient
  une apostrophe droite `'`. Pour un `.h5p` destiné à ce lecteur, mettre l'apostrophe
  typographique `’` dans `h5p.json` > `title` (rezipper sans toucher au reste). Corrigé ainsi sur
  `partage/enquete-aigle-svt.h5p`.
- **Cache** : après avoir remplacé un fichier, ajouter `?v=2` (puis 3…) à l'URL brute dans le lien,
  sinon GitHub (≈5 min) ou le navigateur de l'élève peuvent servir l'ancienne version.
- Affichage souvent plus propre que Lumi (étiquettes de glisser-déposer non tronquées, plein
  écran).
