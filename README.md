# Skill `h5p-lumi` (+ mémoire) — dépôt portable

Ce dépôt contient mon skill **Claude Code** `h5p-lumi` (génération de contenu **H5P** prêt à
importer dans **Lumi**) **et** un instantané de sa **mémoire**. Objectif : pouvoir l'utiliser et
continuer à l'enrichir sur **plusieurs PC**, en synchronisant via Git.

> ⚠️ Dépôt **privé** conseillé : il contient des notes personnelles (profil, mémoire de travail).

## Contenu
- `SKILL.md`, `references/`, `scripts/`, `assets/templates/` → le skill lui-même.
- `_memory/` → instantané des fichiers mémoire (`MEMORY.md`, `user-profile.md`, `h5p-lumi-skill.md`).
- `Deploy-Memory.ps1` / `Backup-Memory.ps1` → synchro de la mémoire (voir plus bas).

---

## 🖥️ Installer sur un NOUVEAU PC
Prérequis : **Git** + **Claude Code** installés.

1. **Cloner le dépôt à l'emplacement des skills de Claude** (PowerShell) :
   ```powershell
   git clone <URL_DU_DEPOT> "$env:USERPROFILE\.claude\skills\h5p-lumi"
   ```
2. **Déployer la mémoire** sur ce PC :
   ```powershell
   cd "$env:USERPROFILE\.claude\skills\h5p-lumi"
   .\Deploy-Memory.ps1
   ```
3. Lance Claude Code depuis ton **dossier de travail habituel** (par défaut
   `Bureau\Claude\Sessions`). Le skill est reconnu et la mémoire est chargée. ✅

> 💡 Pour que la **mémoire** se charge automatiquement, garde le **même dossier de travail**
> (`...\Desktop\Claude\Sessions`). Si tu utilises un autre chemin, passe-le au script :
> `.\Deploy-Memory.ps1 -WorkingDir "D:\MonDossier\Claude"`.

---

## 🔄 Synchroniser entre tes PC

**Après avoir amélioré le skill ou la mémoire sur un PC :**
```powershell
cd "$env:USERPROFILE\.claude\skills\h5p-lumi"
.\Backup-Memory.ps1          # récupère la mémoire vivante dans le dépôt
git add -A
git commit -m "maj du skill et de la mémoire"
git push
```

**Sur l'autre PC, avant de travailler :**
```powershell
cd "$env:USERPROFILE\.claude\skills\h5p-lumi"
git pull
.\Deploy-Memory.ps1          # remet la mémoire à jour sur ce PC
```

---

## ☁️ Première mise en ligne (une seule fois)
Depuis ce PC, une fois le dépôt local prêt :
1. Crée un dépôt **privé vide** sur GitHub (sans README), nommé `h5p-lumi`.
2. Relie-le et pousse :
   ```powershell
   cd "$env:USERPROFILE\.claude\skills\h5p-lumi"
   git remote add origin https://github.com/<TON_PSEUDO>/h5p-lumi.git
   git branch -M main
   git push -u origin main
   ```
