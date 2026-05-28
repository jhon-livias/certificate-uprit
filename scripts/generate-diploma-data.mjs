/**
 * Generador de datos hasheados para diplomas UPRIT
 * ------------------------------------------------
 * Lee `diplomas-source.json` (datos reales en texto plano),
 * aplica normalización y genera un hash maestro único por diploma.
 *
 * Hash maestro: SHA-256( normalize(dni) + "|" + normalize(registro) + "|" + normalize(nombre) )
 *
 * Normalización (debe ser idéntica en frontend React y en PHP):
 *   1. trim
 *   2. lowercase
 *   3. NFD + eliminar marcas diacríticas U+0300–U+036F  (quita tildes/acentos)
 *   4. colapsar espacios múltiples a uno solo
 *
 * Genera:
 *   - src/data/diplomas.json      → array de { hashValidacion } (va al bundle público)
 *   - api/server-data.json        → mapa registro → { hashValidacion, nombre } (solo servidor)
 *   - public/api/_data.php        → mismo mapa para Apache PHP (solo servidor)
 *
 * Uso:
 *   npm run generate-data
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(rootDir, 'scripts', 'diplomas-source.json');

// ── Normalización ────────────────────────────────────────────────────────────
function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes/acentos
    .replace(/\s+/g, ' ');           // colapsa espacios múltiples
}

function masterHash(dni, registro, nombre) {
  const input = normalize(dni) + '|' + normalize(registro) + '|' + normalize(nombre);
  return crypto.createHash('sha256').update(input).digest('hex');
}
// ─────────────────────────────────────────────────────────────────────────────

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

// ── Frontend: solo hashValidacion, sin datos en claro ───────────────────────
const clientData = source.map(({ dni, registro, nombre }) => ({
  hashValidacion: masterHash(dni, registro, nombre),
}));

// ── Servidor (Node dev + Apache): hash + nombre para validar solo con DNI ───
const serverData = Object.fromEntries(
  source.map(({ dni, registro, nombre }) => [
    registro,
    { hashValidacion: masterHash(dni, registro, nombre), nombre },
  ]),
);

// ── Servidor Apache PHP ───────────────────────────────────────────────────────
const phpLines = source.map(({ dni, registro, nombre }) => {
  const h = masterHash(dni, registro, nombre);
  const escapedNombre = nombre.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `    '${registro}' => ['hashValidacion' => '${h}', 'nombre' => '${escapedNombre}'],`;
});

const phpContent = `<?php
// Generado automáticamente — no editar a mano.
// Para regenerar: npm run generate-data
return [
${phpLines.join('\n')}
];
`;

// ── Escribir archivos ────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(rootDir, 'src', 'data', 'diplomas.json'),
  JSON.stringify(clientData, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(rootDir, 'api', 'server-data.json'),
  JSON.stringify(serverData, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(rootDir, 'public', 'api', '_data.php'),
  phpContent,
);

// ── Resumen ──────────────────────────────────────────────────────────────────
console.log(`\n✔ Generados ${clientData.length} hashes maestros:\n`);
source.forEach(({ dni, registro, nombre }) => {
  const h = masterHash(dni, registro, nombre);
  const input = `${normalize(dni)}|${normalize(registro)}|${normalize(nombre)}`;
  console.log(`  ${registro}`);
  console.log(`    input  : "${input}"`);
  console.log(`    hash   : ${h.slice(0, 20)}…\n`);
});
console.log('Archivos generados:');
console.log('  - src/data/diplomas.json   (frontend: solo hashes)');
console.log('  - api/server-data.json     (servidor Node dev)');
console.log('  - public/api/_data.php     (servidor Apache)');
