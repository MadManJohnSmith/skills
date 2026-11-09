#!/usr/bin/env node
// Verificación de paridad 1:1 entre un SRT fuente (inglés) y un SRT traducido.
// Uso: node verify_srt.mjs <fuente.en.srt> <traducido.es.srt>
// Salida: "PARITY OK" o "PARITY FAIL" con diagnóstico. Exit 0/1.

import { readFileSync } from "node:fs";

function parseSrt(path) {
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();
  if (!raw) throw new Error(`${path}: vacío o ilegible`);
  const blocks = raw.split(/\n\s*\n/);
  const cues = [];
  for (const b of blocks) {
    const lines = b.split("\n");
    const idx = parseInt(lines[0], 10);
    if (!Number.isInteger(idx) || !lines[1] || !lines[1].includes("-->")) {
      throw new Error(`${path}: bloque malformado cerca de "${b.slice(0, 60)}"`);
    }
    cues.push({ idx, ts: lines[1].trim() });
  }
  return cues;
}

const [src, dst] = process.argv.slice(2);
if (!src || !dst) {
  console.error("Uso: node verify_srt.mjs <fuente.en.srt> <traducido.es.srt>");
  process.exit(2);
}

let a, b;
try {
  a = parseSrt(src);
  b = parseSrt(dst);
} catch (e) {
  console.log(`PARITY FAIL: ${e.message}`);
  process.exit(1);
}

const problems = [];
if (a.length !== b.length) {
  problems.push(`conteo de cues: fuente=${a.length} destino=${b.length}`);
} else {
  for (let i = 0; i < a.length; i++) {
    if (a[i].idx !== b[i].idx) { problems.push(`cue ${i + 1}: índice ${a[i].idx} vs ${b[i].idx}`); break; }
    if (a[i].ts !== b[i].ts) { problems.push(`cue ${i + 1}: timestamp "${a[i].ts}" vs "${b[i].ts}"`); break; }
  }
}

if (problems.length) {
  console.log(`PARITY FAIL (${a.length} vs ${b.length} cues): ${problems[0]}`);
  process.exit(1);
}
console.log(`PARITY OK: ${a.length} cues, índices y timestamps idénticos byte a byte`);
