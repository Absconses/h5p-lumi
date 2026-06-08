---
name: git-push-auto
description: Pousser la synchro mémoire/skill sur git sans demander confirmation
metadata:
  node_type: memory
  type: feedback
---

Quand la mémoire ou le skill [[h5p-lumi-skill]] évolue, **pousser directement sur git sans demander** (commit + push vers le dépôt privé `Absconses/h5p-lumi`). L'utilisateur l'a demandé explicitement (« pousse toujours sans demander », juin 2026) : ne plus proposer ni attendre de confirmation pour ce dépôt.

**Why:** le dépôt privé existe précisément pour synchroniser ce PC avec les autres ; demander à chaque fois est une friction inutile.
**How to apply:** après toute modif mémoire/skill, enchaîner automatiquement `Backup-Memory.ps1` puis `git add -A ; git commit ; git push`. Garder les messages de commit en **ASCII** (pas d'accents : PowerShell 5.1 + git les corrompt). Sur un PC neuf, si `git commit` échoue (« Author identity unknown »), configurer l'identité **locale** du dépôt depuis l'auteur des commits existants (`git -C <repo> config user.name` / `user.email`) — ici **Pierre PEMPIE <ppempie@dupanloup-edu.local>**. Voir [[emi-college-serie]], [[user-profile]].
