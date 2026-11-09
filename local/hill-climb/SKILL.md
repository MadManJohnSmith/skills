---
name: hill-climb
description: "Subir una evaluación ejecutable al máximo y después comprimir el artefacto a ~1/3 sin bajar la puntuación. Usar solo cuando existe una eval determinista que protege el comportamiento; sin red, no se comprime."
disable-model-invocation: true
---

Dos fases sobre un artefacto y una **eval ejecutable** que puntúa su comportamiento. La regla: si puedes convertir el problema en un programa que da un puntaje, el agente sube ese puntaje. Sin eval no hay colina.

## Precondición (si falla, no se empieza)
- La eval corre con un comando fijado, determinista y sin modelo real si es posible.
- Tiene N casos y un umbral o puntaje de referencia. N=1 es una red débil: dilo antes de usar el método.
- El artefacto está versionado y el baseline queda registrado (puntaje + bytes).

## Fase 1: máximo
Itera cambios hasta alcanzar el umbral. Estabiliza: commit y registra el puntaje y el tamaño. La puntuación manda; la prolijidad todavía no importa.

## Fase 2: compresión
Con la puntuación congelada como guardia, comprime a ~1/3 del tamaño original (o al presupuesto declarado). Cada ronda: comprime, corre la eval, y si el puntaje baja, revierte ese paso. Se detiene al llegar al presupuesto o cuando ninguna compresión conserva el puntaje.

## Contaminación
El orquestador conoce el umbral; los subagentes evaluadores no. Decirles la meta numérica sesga sus notas.

## Registro
Deja en el ADR o el issue: comando de eval, número de casos, puntaje y bytes antes/después, y la tabla de rondas. Un cambio solo se queda si sube o mantiene el puntaje.

## Piloto
La primera aplicación es el prompt de Creator cuando el roster de #11 tenga casos calificados versionados. No se comprime prosa sin eval.
