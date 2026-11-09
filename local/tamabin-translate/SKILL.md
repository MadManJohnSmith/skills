---
name: tamabin-translate
description: Traduce subtítulos de series y películas del servidor homelab a español latinoamericano neutro con estándar TaMaBin (doble sidecar .es/.es-MX, paridad 1:1 de cues, deploy 0664, Jellyfin FullRefresh). Usar siempre que el usuario pida subtítulos en español latino para cualquier título del servidor, busque/traduzca subtítulos, o mencione TaMaBin — aunque no nombre la skill.
---

# Traducción de subtítulos TaMaBin

Pipeline probado en producción: The Twilight Zone 1959 S01 (36/36), Doctor Who 2005 S02 (13/13). Esta skill existe porque dos corridas previas fallaron igual: éxito declarado en texto sin evidencia del sistema, y artefactos en `/tmp` que se perdieron. Las dos reglas que evitan repetirlo son la 1 y la 2.

## Pasos

1. **Estado real primero.** Lista el contenido real de la carpeta en el servidor (`ssh root@192.168.1.220 'ls "/data/local/TV/<Serie>/Season N/"'`) y decide qué episodios faltan: falta quien no tenga **el par completo** `.es.srt` + `.es-MX.srt`. Un `.es.srt` sin su `.es-MX.srt` es trabajo incompleto, no hecho. Guarda esta lista: es tu criterio de terminación.

2. **Directorio de trabajo persistente.** Crea `~/homelab-phone/subs-work/<slug-de-la-serie>-s<NN>/` en el host local. Todos los SRTs (fuentes y traducidos) viven ahí. Nada en `/tmp`: ya se perdió una temporada entera de progreso por eso.

3. **Fuente en inglés.** Descarga un `.en.srt` sincronizado por episodio a WORK siguiendo la jerarquía y comandos exactos de [references/tamabin-rules.md](references/tamabin-rules.md) (Gestdown → watchsomuch → SubDL/OpenSubtitles → extraer del MKV). Criterio de fin: cada episodio pendiente tiene un `.en.srt` mayor a 10 KB en WORK y `grep -c ' --> '` (conteo de cues) mayor a 50. Si un título no tiene fuente en inglés en ningún sitio, repórtalo y sigue con los que sí.

4. **Traducción con subagentes paralelos.** Un subagente del Agent tool por episodio, hasta 10 en paralelo, reasoning estándar. Copia el prompt literal de [references/tamabin-rules.md](references/tamabin-rules.md) sustituyendo `{SRC}`, `{DST}` y `{GLOSSARY}`. Está prohibido usar endpoints de traducción automática gratuita (Google gtx y similares): la calidad de registro es inferior y las corridas exitosas usaron el modelo vía subagentes.

5. **Verificación de paridad 1:1.** Ejecuta `node <base-de-esta-skill>/scripts/verify_srt.mjs <fuente.en.srt> <destino.es.srt>` por episodio: debe imprimir `PARITY OK` con el mismo número de cues y timestamps idénticos byte a byte. Además `cmp -s <destino.es.srt> <destino.es-MX.srt>` (el par es-MX es copia exacta del es: cambia el nombre, no el contenido). Criterio de fin: `PARITY OK` por cada episodio pendiente. Si falla, manda el archivo a re-traducirse, no lo despliegues.

6. **Deploy.** `scp` ambos sidecars a la carpeta de la serie en `/data/local/TV/...`, luego en el servidor `chmod 0664` y `chown root:root` sobre cada uno. Verifica con `ls -la` del servidor que existen ambos y con permisos `-rw-rw-r--`. Ese ls es la evidencia del paso, no la frase "ya están subidos".

7. **Jellyfin.** Por cada episodio: `POST /Items/{itemId}/Refresh?MetadataRefreshMode=FullRefresh&ImageRefreshMode=None&ReplaceAllMetadata=false` con la API key (ubicación en references). El refresco simple de biblioteca NO indexa sidecars nuevos si el mtime del MKV no cambió. Verifica con `GET /Users/{userId}/Items/{itemId}` que `MediaStreams` contiene `Type: "Subtitle"`, `Language: "spa"`, `IsExternal: true`. Ese JSON es la evidencia final.

8. **Reporte.** Tabla por episodio: fuente usada, cues fuente/destino, paridad, archivos en servidor con permisos, estado Jellyfin. Los números salen de los comandos de los pasos 5-7.

## Reglas duras

- **Evidencia externa para todo éxito.** Cada paso termina en la salida de un comando (grep, ls, JSON de API), nunca en una frase. Si un paso no puede producir evidencia, no ocurrió.
- **Nunca toques los MKV.** Los sidecars van junto a ellos en `/data/local` (los MKVs pueden vivir físicamente en `/data/remote`; la ruta mergerfs `/data/media` es de lectura para verificar, la escritura va a `/data/local`).
- **Reanudar es gratis.** Antes de traducir un episodio comprueba si ya tiene el par en WORK con `PARITY OK`: sáltalo. Antes de descargar, comprueba si el `.en.srt` ya está en WORK.
- Si la herramienta Bash falla con error de parámetros vacíos, escribe el archivo con Write y ejecútalo en una llamada; no edits código línea por línea con un executor de emergencia.
- Restricciones del homelab vigentes (AGENTS.md del repo): prohibido reboot salvo `adb reboot recovery`; sin `chmod -R 777`; no imprimir RTSP ni credenciales.
