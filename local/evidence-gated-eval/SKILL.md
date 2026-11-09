---
name: evidence-gated-eval
description: "Definir y juzgar una evaluacion del runtime agentico sin consentimiento circular ni veredictos inventados, con procedencia, coste y clasificacion de fallo. Usar al medir si un cambio en el framework mejora, al construir un caso o roster de evaluacion, o al revisar por que una evaluacion dio un fallo."
---

# Evaluacion con evidencia

Para medir si un cambio mejora el framework. La pieza ausente en la mayoria de
las evaluaciones agenticas no es el caso: es **como se juzga el caso y que se
hace cuando el juicio queda en duda**.

Adaptado para este framework desde dos repos clonados:
`paperclip/.agents/skills/add-runner-eval/SKILL.md` (procedencia, roster y
cobertura) y `Switchyard/.../gold-review/SKILL.md` (evidencia propia frente a
consenso). Reimplementado y reescrito en espanol.

## El principio que descarta el resto

**No confies en el consenso de los agentes.** Los agentes son el sujeto que se
mide; usar su voto por mayoria para validar el patron es razonamiento circular.
La salida del agente es una senal secundaria, en el mejor de los casos.

La evidencia primaria es tu **propia lectura del codigo**. Si siete agentes de
siete reportan una funcion pero el codigo muestra que es irrelevante para la
pregunta, se queda fuera. Si cero de siete la reportan pero el codigo muestra
que es el mecanismo central, entra.

Aplica igual al patron: si la mayoria de los casos "pasa", pero el criterio de
exito era demasiado debil para fallar, entonces no hay medicion.

## Lo que un caso debe declarar

Un caso sin estas partes no es un caso:

- **Entrada**: la tarea, la fixture o el encargo, versionada y con digest.
- **Patron esperado**: la respuesta o el veredicto que el evaluador considera
  correcto, con el razonamiento que lo sostiene.
- **Origen del patron**: quien lo establecio y con que lectura. Un patron sin
  procedencia no puede defenderse y no puede revisarse.
- **Veredicto del evaluador**: de un conjunto cerrado. Si el evaluador no puede
  pronunciarse, la respuesta es abstenerse, nunca fallar en silencio.

## Rosters y presupuesto

Un **roster** es la seleccion declarada de modelos y configuraciones que se
ejecutan. Un caso no evalua nada hasta que pertenece a un roster mantenido:
un fichero nuevo solo no se ha unido a la campana.

Registra por caso, no solo el veredicto:

- **Cobertura de uso y coste**: tokens, invocaciones, y si el caso camino
  completo o se salto pasos.
- **Reintentos**: cuantos y por que. Un caso que pasa al segundo intento mide
  una robustez distinta de la que crees estar midiendo.
- **Temporizacion**: el tiempo hasta el veredicto. Una mejora que multiplica
  por diez el tiempo no es una mejora.

**Un solo cambio por comparacion.** Si cambias el caso y la configuracion a la
vez, el delta no se puede atribuir a ninguno.

## Clasificacion de fallo

Cuando un caso falla, clasifica la causa **despues de observarla**, no antes.
Las categorias que separan los arreglos posibles:

- **Producto**: la implementacion del framework hace lo incorrecto.
- **Modelo**: el modelo no resolvio una tarea que si podia resolverse.
- **Evidencia de evaluacion**: el patron, el evaluador o la afirmacion eran
  incorrectos. Aqui se arregla la evaluacion, no el framework.
- **Infraestructura**: el entorno, la red o la fixture fallaron por causa ajena
  al cambio.

Inventar la causa antes de mirar produce el arreglo equivocado con toda la
confianza. Es el mismo fallo que saltar a la hipotesis sin lazo en
`diagnosis-feedback-loop`.

## Integridad de la trayectoria

Si dispones de las ejecuciones reales, comprueba lo siguiente antes de aceptar
el veredicto:

| Comprobacion | Lo que detecta | Accion si falla |
|---|---|---|
| **Contaminacion del patron** | El agente leyo el patron o la respuesta antes de resolver | Descartar el caso: no mide nada |
| **Fuga de entorno** | La solucion dependia de un dato que solo existe en la maquina que la genero | Ejecutar en entorno limpio antes de creer el resultado |
| **Sena debil** | El criterio de exito no podia fallar | Reescribir el caso, no el framework |

Un caso contaminado no es un caso imperfecto: **no es un caso**.

## Lo que esta skill no hace

No ejecuta sesiones de modelo, no inventa observaciones cuando el entorno no
esta disponible y no convierte un veredicto dudoso en una mejora. Si no puedes
pronunciarte, abstenerse y nombrar lo que falta es el resultado correcto.
