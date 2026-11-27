#!/bin/sh
# Construit polar-differencie.h5p.  usage : sh build.sh <dossier de travail> <sortie.h5p>
# Prérequis : node + playwright-core (Chromium /opt/pw-browsers/chromium), python3.
set -e
H=$(cd "$(dirname "$0")" && pwd); W=$1; OUT=$2
mkdir -p "$W/tpl" "$W/media"
[ -f "$W/tpl/h5p.json" ] || (cd "$W/tpl" && unzip -oq "$H/../../templates/gabarit-branching.h5p")
node "$H/render.mjs" "$W/media"
node "$H/scenario.mjs" "$W/content.json" "$W/media/hotspots.json"
python3 "$H/validate.py" "$W/tpl" "$W/content.json" "H5P.BranchingScenario 1.8"
mkdir -p "$W/images" && cp "$W/media/"*.jpg "$W/images/"
python3 "$H/pack.py" "$W/tpl" "$W/content.json" "$OUT" "L’affaire des livres sans pastille" "$W/images"
