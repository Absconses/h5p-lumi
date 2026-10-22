# Référence — Iframe Embedder (`H5P.IFrameEmbed` 1.0) : quels sites s'affichent ?

L'Iframe Embedder affiche une page web **dans** l'activité (Page, Livre…). Idéal pour que les
élèves restent dans le module au lieu de s'éparpiller dans les onglets. Mais c'est **le site
affiché qui décide** s'il accepte d'être encadré : beaucoup refusent (en-tête
`X-Frame-Options: SAMEORIGIN` ou `Content-Security-Policy: frame-ancestors`). Le cadre reste
alors **gris**, sans message pour l'élève (le refus n'apparaît que dans la console).

➡️ **Ne jamais intégrer un site absent du tableau ci-dessous sans l'avoir testé.**

## Paramètres

```json
{ "width": "1000px", "minWidth": "300px", "height": "1500px",
  "source": "https://fr.wikipedia.org/wiki/Aigle_royal", "resizeSupported": true }
```

Fabrique : `iframe(source, titre, { ratio })` dans `assets/lib/h5p-factories.mjs`.

## ⚠️ Trois limites vérifiées

1. **Le cadre ne défile pas.** Le module crée l'iframe avec `scrolling="no"`. Une page plus
   longue que le cadre est **coupée en bas**. Avec `resizeSupported:true`, la hauteur suit la
   largeur selon le rapport `height/width` : viser un rapport de 1,5 (1000px / 1500px) pour
   un article, et rappeler aux élèves le bouton plein écran.
2. **Pas de page web hébergée dans le module.** `source` accepte un chemin interne
   (`docs/page.html` → `H5P.getContentPath()/docs/page.html`), mais :
   - un `.html` dans `content/` fait **échouer l'import dans Lumi** : il n'est pas dans la
     liste blanche `contentWhitelist` de `@lumieducation/h5p-server` (vérifié dans le code) ;
   - un `.pdf` passe l'import, mais **disparaît du serveur** sur app.lumi.education (404
     « NoSuchKey ») : aucun champ de type fichier ne le référence (`source` est un simple
     texte), donc il n'est pas conservé. Résultat : zone vide.
   → Pour un corpus fermé, mettre les extraits directement dans un `H5P.AdvancedText`, avec la
   source.
3. **En ligne uniquement.** Pas de site externe hors connexion.

YouTube : passer par `H5P.Video` / `H5P.InteractiveVideo`, pas par l'Iframe.

## Tableau de compatibilité (testé le 2026-10-22 sur app.lumi.education et Digiquiz)

✅ = s'affiche · ❌ = cadre gris (refus du site)

| Catégorie | ✅ S'affiche | ❌ Refusé |
|---|---|---|
| Encyclopédies, dictionnaires | Wikipédia · Wiktionnaire · Wikimedia Commons · Britannica | Vikidia · Larousse · CNRTL · Gallica (BnF) |
| Moteurs de recherche | — | Qwant · DuckDuckGo · Ecosia · Bing · Google |
| Vérification de l'information | Hoaxbuster · CheckNews (Libération) · Fake Off (20 Minutes) · Vrai ou fake (franceinfo) · Wayback Machine | AFP Factuel · Les Décodeurs (Le Monde) · Les Surligneurs · Snopes · TinEye |
| Médias jeunesse, EMI | 1jour1actu | Lumni · CLEMI · Arte · Géo |
| Sciences, nature, météo | LPO · Climats et voyages | Futura Sciences · INPN (Muséum) · Météo-France · Infoclimat |
| Cartes, outils | OpenStreetMap (lien `export/embed.html`) · LearningApps · Digipad (La Digitale) | — |
| Fichiers internes | — | PDF dans `content/` · HTML dans `content/` (import refusé) |

URLs testées :
- Wikipédia `https://fr.wikipedia.org/wiki/Aigle_royal` · Wiktionnaire `https://fr.wiktionary.org/wiki/canular`
- Commons `https://commons.wikimedia.org/wiki/Main_Page` · Britannica `https://www.britannica.com/`
- Hoaxbuster `https://hoaxbuster.com/` · CheckNews `https://www.liberation.fr/checknews/`
- Fake Off `https://www.20minutes.fr/societe/desintox/` · Vrai ou fake `https://www.francetvinfo.fr/vrai-ou-fake/`
- Wayback Machine `https://web.archive.org/` · 1jour1actu `https://www.1jour1actu.com/`
- LPO `https://www.lpo.fr/` · Climats et voyages `https://www.climatsetvoyages.com/climat/canada/montreal`
- OpenStreetMap `https://www.openstreetmap.org/export/embed.html?bbox=<ouest>%2C<sud>%2C<est>%2C<nord>&layer=mapnik`
- LearningApps `https://learningapps.org/` · Digipad `https://digipad.app/`

Le refus vient du site, pas de la plateforme : le résultat est le même sur Lumi et Digiquiz.
Il peut changer si un site modifie ses en-têtes : en cas de cadre gris, ouvrir la console
(F12) et chercher « Refused to display … X-Frame-Options » ou « frame-ancestors ».

## Tester un nouveau site

Générer un Livre de test : un chapitre par catégorie, et pour chaque site un bandeau numéroté
(`H5P.AdvancedText`) suivi de son iframe (hauteur ~420px). L'utilisateur l'ouvre dans sa
plateforme et renvoie les numéros restés gris. Mettre ensuite ce tableau à jour.
