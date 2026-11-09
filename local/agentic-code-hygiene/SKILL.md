---
name: agentic-code-hygiene
description: "Revisar un diff de código generado por agentes antes de darlo por terminado: comentarios decorativos, defensas innecesarias, casts que ocultan errores y estilo ajeno al módulo. Usar después de implementar o revisar cambios en scripts, schemas o tests de Improvement; no para alterar lógica por estética."
---

# Higiene del codigo generado por agentes

Una pasada corta y concreta sobre **el diff del encargo**, no sobre todo el
repositorio. Adaptada de `anti-slop/skills/antislop-code/SKILL.md` y
`claude-code-templates/cli-tool/components/skills/sentry/deslop/SKILL.md`.
La primera solo toca comentarios; la segunda examina el diff. Esta version
combina ambos limites sin heredar la orden de borrar cambios legitimos.

## Alcance

1. Establece la base del encargo: commit, rama o diff antes de editar. No
   supongas que `main...HEAD` representa el trabajo de esta sesion; comprueba
   primero la rama y los cambios sin commit.
2. Abre el diff y lee las lineas vecinas de cada cambio antes de modificarlo.
   Compara con las convenciones que ya usa ese modulo.
3. No limpies codigo previo que no este en el alcance autorizado. No
   conviertas esta pasada en un refactor de producto.

## Senales que merecen una segunda mirada

- Comentarios que repiten literalmente el codigo, encabezados ornamentales,
  separadores de caracteres o frases que justifican al agente ante un revisor
  pero no informan al proximo lector.
- `try/except`, defaults, comprobaciones nulas o conversiones de tipo nuevos
  que disimulan una invariante comprobada antes o una entrada que deberia
  fallar cerrada.
- Casts a `Any`/`any` que hacen desaparecer un error de contrato sin
  resolverlo.
- Imports o helpers nuevos solo para evitar entender el patron que ya usa
  el modulo.
- Pruebas que solo confirman que el codigo ejecuta, sin afirmar la conducta
  que el encargo necesitaba.

**Una senal no es un veredicto.** Una comprobacion defensiva puede ser la
frontera de confianza que protege al Host. Un comentario puede expresar una
restriccion que el codigo no muestra. Demuestra el exceso antes de quitarlo.

## Regla de comentarios

Conserva el comentario que documenta una restriccion invisible en el codigo:
orden de eventos, invariante de seguridad, compatibilidad del runtime o motivo
de un valor no obvio. Elimina el comentario que solo narra la siguiente linea,
explica el origen de un cambio o declara que este es correcto. No toques codigo
ejecutable para que el comentario quede mas bonito.

## Gate de entrega

- El gate corre **solo si cambiaste algo**, y se escala con lo que tocaste:
  si la pasada quedo en inspeccion o solo corrigio prosa ajena al codigo, la
  comprobacion es el diff leido dos veces, no la suite. Si tocaste codigo,
  esquemas, fixtures o documentos que el Host consume, corres las pruebas
  pertinentes —un modulo de prueba afectado, no la suite completa, salvo que el
  cambio toque un limite compartido entre modulos.
- Comprueba el diff final contra la base elegida: que no haya cambios ajenos,
  ni perdida de restricciones ni de evidencia.
- Si solo era una inspeccion y no cambiaste nada, dilo. Si eliminaste algo,
  nombra el patron y la prueba que confirma que la conducta se conserva.

Esta skill no concede permisos, no autoriza borrar archivos ni instala nada en
proyectos de usuarios.
