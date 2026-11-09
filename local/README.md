# local/

Skills propias, mantenidas fuera del upstream (`mattpocock/skills`). Este
directorio no entra en conflicto en los rebases contra `upstream/main`
porque toca archivos distintos.

Skills incluidas (recuperadas del respaldo del 2026-11-09):

- `agentic-code-hygiene` — pasada de higiene sobre el diff generado por agentes.
- `evidence-gated-eval` — evaluaciones con evidencia primaria, sin consenso circular.
- `hill-climb` — subir una eval ejecutable y comprimir el artefacto sin bajar el puntaje.
- `tamabin-translate` — pipeline de subtitulos TaMaBin del homelab.
- `gepeto` — guia de desarrollo para launchers de Pinokio.

Instalarlas: `scripts/sync-agents-skills.sh [destino]`.

## Actualizar el fork tras cambios del upstream

```
git fetch upstream
git rebase upstream/main     # en la rama custom
git push --force-with-lease origin custom
```

Los conflictos, si los hay, marcan exactamente donde el upstream cambio
las zonas personalizadas (code-review, implement-spec, grilling).
