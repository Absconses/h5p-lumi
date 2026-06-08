# Référence — Cartes & panneaux de texte

## Accordéon — `H5P.Accordion`

Des titres dépliables ; le contenu de chaque panneau est une **sous-bibliothèque texte**
(`H5P.AdvancedText`).

```json
{
  "panels": [
    {
      "title": "Qu'est-ce qu'Internet ?",
      "content": {
        "library": "H5P.AdvancedText 1.1",
        "params": { "text": "<p>Internet est un <strong>réseau mondial</strong> qui relie des millions d'ordinateurs.</p>" },
        "subContentId": "<guid>",
        "metadata": { "contentType":"Text","license":"U","title":"Panneau 1" }
      }
    }
  ],
  "hTag": "h2"
}
```
Idéal pour une FAQ, un cours dépliable, un glossaire. Le gabarit Accordéon embarque `H5P.AdvancedText`.

## Dialog Cards (cartes à retourner) — `H5P.Dialogcards`

Recto/verso : on lit le recto, on retourne pour la réponse. **Pas de saisie.**

```json
{
  "title": "Vocabulaire de la recherche d'information",
  "description": "<p>Retourne chaque carte pour vérifier ta réponse.</p>",
  "dialogs": [
    { "text":"<p>Mot-clé</p>", "answer":"<p>Terme important saisi pour lancer une recherche.</p>", "tips":{} },
    { "text":"<p>Source</p>", "answer":"<p>Origine d'une information : qui l'a produite et publiée.</p>", "tips":{} }
  ],
  "behaviour": { "enableRetry":true,"disableBackwardsNavigation":false,"scaleTextNotCard":false,"randomCards":false },
  "answer":"Retourner","next":"Suivant","prev":"Précédent","retry":"Recommencer","progressText":"Carte @card sur @total"
}
```

## Flashcards (réponse à saisir) — `H5P.Flashcards`

Comme des cartes, mais l'élève **tape** la réponse, qui est ensuite vérifiée.

```json
{
  "description": "<p>Écris la réponse puis vérifie.</p>",
  "cards": [
    { "text":"Quel est le tout premier moteur de recherche ?", "answer":"Archie", "imageAltText":"" },
    { "text":"En quelle année naît le Web ?", "answer":"1989", "imageAltText":"" }
  ],
  "progressText":"Carte @card sur @total","next":"Suivant","previous":"Précédent","checkAnswerText":"Vérifier","defaultAnswerText":"Ta réponse","correctAnswerText":"Correct !","incorrectAnswerText":"Incorrect.","showSolutionText":"Solution","results":"Résultats","caseSensitive":false,"retry":"Recommencer"
}
```

**Différence clé** : *Dialog Cards* = on retourne pour mémoriser (vocabulaire, définitions) ;
*Flashcards* = on tape une réponse exacte (dates, mots précis). Pour ajouter une image à une
carte, il faut un fichier embarqué (objet `image` avec `path`/`mime`) — par défaut, on s'en
passe pour rester en texte simple.
