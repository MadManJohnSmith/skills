#!/usr/bin/env bash
# Sincroniza las skills del repo (skills/*/ y local/) hacia una carpeta
# plana de skills instaladas (por defecto ~/.agents/skills).
#
# Uso: scripts/sync-agents-skills.sh [destino]
#
# Copia cada skill que tenga SKILL.md. No borra nada en el destino;
# las skills que ya no existan en el repo quedan intactas alli.
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
dest="${1:-$HOME/.agents/skills}"

mkdir -p "$dest"
count=0
for skill_md in "$repo"/skills/*/*/SKILL.md "$repo"/local/*/SKILL.md; do
  [ -e "$skill_md" ] || continue
  src="$(dirname "$skill_md")"
  name="$(basename "$src")"
  mkdir -p "$dest/$name"
  rsync -a --delete-excluded --exclude '.git' "$src/" "$dest/$name/"
  count=$((count + 1))
done
echo "Sincronizadas $count skills en $dest"
