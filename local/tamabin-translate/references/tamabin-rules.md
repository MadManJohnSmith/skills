# Referencia TaMaBin: fuentes, reglas de traducción y prompt del subagente

## 1. Jerarquía de fuentes en inglés (probar en orden)

1. **watchsomuch** (sincronizados por release exacta — mejor para emisiones HDTV):
   `curl -L -o WORK/<Ep>.en.srt "https://a2.watchsomuch.tv/Subs/<movieId>-<subId>-S34E03-en.srt?title=<release>"`
   Los IDs son estables entre sesiones; si un enlace muere, buscar en watchsomuch.tv por título de release.
2. **Gestdown (mirror Addic7ed, sin Cloudflare):**
   - Buscar show: `curl -s "https://api.gestdown.info/subtitles/search/<nombre-serie>"` → anotar `showId`.
   - Descargar: `curl -s "https://api.gestdown.info/subtitles/get/<showId>/<season>/<episode>/English" -o WORK/<Ep>.en.srt`
3. **SubDL API** (cuota 50/día): `https://api.subdl.com/api/v1/subtitles?api_key={subdl_key}&film_name={name}` — key en config de Bazarr del servidor, nunca en logs.
4. **OpenSubtitles.com** (cuota 20/día, header `Api-Key`).
5. **Extraer del MKV**: `ssh root@192.168.1.220 'ffprobe -v error -show_entries stream=index,codec_name:stream_tags=language "<ruta mkv>"'` y si hay stream srt/subrip en inglés, extraer con `ffmpeg -map 0:s:N out.srt`.

Tras cada descarga: `wc -c` (>10 KB) y `grep -c ' --> '` (cuenta de cues). Si llega HTML o un archivo vacío, la fuente falló: probar la siguiente.

## 2. Reglas de traducción TaMaBin

- **Español latinoamericano neutro estricto.** Sin registro peninsular: `vosotros/vosotras → ustedes`; `coche → auto/carro` según contexto; `ordenador → computadora`; `móvil → celular`; `vale`, `tío`, `guay`, `aparcar` → equivalente neutro o se omiten como muletilla.
- **Signos de apertura** `¿` `¡` siempre.
- **Guion de diálogo `- `** únicamente con 2+ interlocutores en el mismo cue (una línea por hablante). Una persona hablando en dos líneas nunca lleva guiones.
- **Cursivas `<i>...</i>`** heredadas del inglés para voz en off, llamadas, radio/TV en pantalla, intercomunicadores, pensamientos. No inventar cursivas nuevas.
- **Mayúsculas fijas de CC** (SUBTÍTULOS TODO EN MAYÚSCULAS) → capitalización normal de oración.
- **Marcas SDH**: `[Music] → [música]`, `[Applause] → [aplausos]`, `[Laughter] → [risas]`, `[♪]` se conserva.
- **Nombres propios y glosario** de la serie sin traducir (personajes, lugares, marcas).
- **Omitir** marcas de agua, rips de uploader y anuncios al final del archivo.
- Registro conversacional natural: frases cortas de pantalla (~42 caracteres/línea, máx 2 líneas por cue), humor adaptado sin calcar modismos.
- Tratamiento natural según relación entre personajes (tú entre iguales/familiares, usted formal cuando corresponde), mezcla coherente.

## 3. Prompt literal del subagente traductor

Sustituir `{SRC}`, `{DST}`, `{GLOSSARY}` antes de despachar. Un subagente por episodio.

```
Eres traductor profesional de subtítulos. Traduce {SRC} (inglés) a español latinoamericano neutro estilo TaMaBin y escribe el resultado en {DST} con el tool Write.

PARIDAD ESTRUCTURAL (inviolable):
- Conserva EXACTAMENTE los números de cue y las líneas de timestamp, byte a byte.
- El archivo destino tiene el MISMO número de cues que el fuente.
- Estructura de cada bloque: número / línea de timestamp / 1-2 líneas de texto traducido / línea en blanco. Nada más, nada menos.

ESTILO:
- Español latinoamericano neutro estricto; sin modismos peninsulares (vosotros→ustedes, coche→auto, ordenador→computadora, móvil→celular; "vale"/"tío"/"guay" se adaptan u omiten como muletilla).
- ¿ ¡ de apertura siempre.
- Guion de diálogo "- " SOLO con 2+ interlocutores en el mismo cue; una sola persona en dos líneas nunca lleva guiones.
- Cursivas <i>…</i> heredadas del inglés solo para voz en off/llamadas/radio/TV/pensamientos; no inventar.
- Mayúsculas fijas de CC → capitalización normal. [Music]→[música], [Applause]→[aplausos], [Laughter]→[risas], [♪] igual.
- Glosario sin traducir: {GLOSSARY}
- Omite marcas de agua/anuncios de uploader al final.
- Frases cortas de pantalla (~42 caracteres/línea, máx 2 líneas/cue), tono conversacional natural.

PROCESO:
1. Lee {SRC} completo por secciones (Read con offset/limit).
2. Escribe {DST} completo con Write en una sola llamada.
3. Verifica: `grep -c ' --> ' {SRC}` y `grep -c ' --> ' {DST}` — los dos números deben coincidir exactamente.
4. Responde SOLO: "cues fuente: N / cues destino: N / escrito: {DST}". Si los números no coinciden, repara el archivo antes de responder.
```

## 4. Jellyfin: API key y refresh

- API key: en el servidor, `sqlite3 /var/lib/jellyfin/data/jellyfin.db 'SELECT AccessToken FROM ApiKeys'` (si la tabla difiere: `.tables` y buscar ApiKeys), o en los logs de dispositivos autorizados. Nunca imprimir el token completo en el reporte.
- itemId de cada episodio: `curl -s "http://127.0.0.1:8096/Items?api_key=<KEY>&Recursive=true&IncludeItemTypes=Episode&Path=<carpeta>" | jq '.Items[] | {Name, Id}'` (jq no existe en el teléfono: usar `python3 -m json.tool` + grep, o filtrar con grep -o).
- Refresh obligatorio por episodio:
  `curl -X POST "http://127.0.0.1:8096/Items/<itemId>/Refresh?MetadataRefreshMode=FullRefresh&ImageRefreshMode=None&ReplaceAllMetadata=false&api_key=<KEY>"`
- Verificación: `curl -s "http://127.0.0.1:8096/Users/<userId>/Items/<itemId>?api_key=<KEY>"` y comprobar en `MediaStreams`: `Type: "Subtitle"`, `Language: "spa"`, `IsExternal: true`, `DisplayTitle` contiene `Spanish - SUBRIP - External`.

## 5. Gotchas de entorno

- El `python3` del host local es un AppImage de ZCode sin stdlib completa: para scripts usa `node` (disponible) o `docker run --rm -v ... python:3-alpine`.
- Si el tool Bash del harness falla con "missing parameter", Write del script + una ejecución; `mcp__rea__capture_process_scenario` solo como ejecutor puntual.
- SSH sin contraseña: `root@192.168.1.220`. Los MKVs pueden estar físicamente en `/data/remote` (Drive); escribir sidecars siempre en `/data/local`.
