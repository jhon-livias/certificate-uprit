/**
 * Generador de datos hasheados para diplomas de GRADO — UPRIT
 * -----------------------------------------------------------
 * Lee los 4 Excels de uprit-diplomas/data/ y genera los mapeos
 * necesarios para el portal de verificación certificate-uprit.
 *
 * Columnas Excel:
 *   A: PROGRAMA     → programa (se muestra en UI tras verificar)
 *   B: QR           → nombre completo del egresado (solo servidor)
 *   C: DNI          → parte del hash
 *   D: CREAR CODIGO DE BARRAS → registro / code (clave de lookup + parte del hash)
 *
 * Hash maestro: SHA-256( normalize(dni) + "|" + normalize(codigo) + "|" + normalize(nombre) )
 * Normalización: trim → lowercase → NFD + quitar diacríticos → colapsar espacios
 *
 * Genera:
 *   - api/server-data-grado.json   → mapa codigo → { hashValidacion, nombre, programa, tipo }
 *   - public/api/_data_grado.php   → mismo mapa para Apache PHP
 *
 * Uso:
 *   npm run generate-grado-data
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { read as xlsxRead, utils as xlsxUtils } from 'xlsx';

const rootDir   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir   = path.resolve(rootDir, '..', 'uprit-diplomas', 'data');

// ── Normalización (idéntica a validate.js y _lib.php) ───────────────────────
function normalize(str) {
  return String(str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function masterHash(dni, codigo, nombre) {
  const input = `${normalize(dni)}|${normalize(codigo)}|${normalize(nombre)}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

// ── Normalizar código de barras (mismo criterio que main.py) ─────────────────
function normalizeCodigo(val) {
  if (val === null || val === undefined) throw new Error('Código de barras vacío');
  const s = String(val).replace(/\s+/g, '').trim();
  // Puede llegar en notación científica si Excel lo guardó como float grande
  const n = Number(s);
  if (!isNaN(n) && isFinite(n)) return Math.round(n).toString();
  if (/^\d+$/.test(s)) return s;
  throw new Error(`Código de barras inválido: ${val}`);
}

// ── Definición de fuentes ────────────────────────────────────────────────────
const SOURCES = [
  {
    file: 'POSGRADO - CREAR CODIGOS.xlsx',
    tipo: 'posgrado',
  },
  {
    file: 'PREGRADO - CREAR CODIGOS.xlsx',
    tipo: 'bachiller',
  },
  {
    file: 'SEGUNDA ESPECIALIDAD - CREAR CODIGOS.xlsx',
    tipo: 'titulo-profesional',
  },
  {
    file: 'SEGUNDA ESPECIALIDAD - CREAR CODIGOS 45 SE.xlsx',
    tipo: 'titulo-profesional',
  },
];

// ── Leer y procesar Excels ───────────────────────────────────────────────────
const serverData = {};
let total = 0;
let skipped = 0;

for (const source of SOURCES) {
  const filePath = path.join(dataDir, source.file);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠  No encontrado: ${source.file} — omitido`);
    continue;
  }

  const buf  = fs.readFileSync(filePath);
  const wb   = xlsxRead(buf, { type: 'buffer' });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsxUtils.sheet_to_json(ws, { defval: '' });

  // Detectar nombre real de la columna de barras (puede tener espacio al final)
  const sampleRow  = rows[0] ?? {};
  const barcodeKey = Object.keys(sampleRow).find(
    k => k.trim().toUpperCase() === 'CREAR CODIGO DE BARRAS',
  );

  if (!barcodeKey) {
    console.error(`  ✗ No se encontró columna de barras en ${source.file}`);
    continue;
  }

  let count = 0;

  for (const row of rows) {
    const programa = String(row['PROGRAMA'] ?? '').trim();
    const nombre   = String(row['QR']       ?? '').trim();
    const dniRaw   = String(row['DNI']      ?? '').trim();

    let codigo;
    try {
      codigo = normalizeCodigo(row[barcodeKey]);
    } catch (err) {
      console.warn(`    ↳ Fila omitida (${source.file}): ${err.message}`);
      skipped++;
      continue;
    }

    if (!nombre || !dniRaw || !codigo) {
      skipped++;
      continue;
    }

    const hash = masterHash(dniRaw, codigo, nombre);

    if (serverData[codigo]) {
      // Duplicado entre fuentes (segunda-especialidad tiene dos archivos)
      console.warn(`    ↳ Código duplicado ${codigo} en ${source.file} — se conserva el primero`);
      skipped++;
      continue;
    }

    serverData[codigo] = {
      hashValidacion: hash,
      nombre,
      programa,
      tipo: source.tipo,
    };

    count++;
    total++;
  }

  console.log(`  ✔ ${source.file}: ${count} registros`);
}

// ── Escribir server-data-grado.json ─────────────────────────────────────────
fs.writeFileSync(
  path.join(rootDir, 'api', 'server-data-grado.json'),
  JSON.stringify(serverData, null, 2) + '\n',
);

// ── Escribir _data_grado.php ─────────────────────────────────────────────────
const phpLines = Object.entries(serverData).map(([codigo, rec]) => {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return (
    `    '${codigo}' => ` +
    `['hashValidacion' => '${rec.hashValidacion}', ` +
    `'nombre' => '${esc(rec.nombre)}', ` +
    `'programa' => '${esc(rec.programa)}', ` +
    `'tipo' => '${rec.tipo}'],`
  );
});

const phpContent = `<?php
// Generado automáticamente — no editar a mano.
// Para regenerar: npm run generate-grado-data
return [
${phpLines.join('\n')}
];
`;

fs.writeFileSync(
  path.join(rootDir, 'public', 'api', '_data_grado.php'),
  phpContent,
);

// ── Resumen ──────────────────────────────────────────────────────────────────
console.log(`\n✔ Total: ${total} registros | ${skipped} omitidos`);
console.log('Archivos generados:');
console.log('  - api/server-data-grado.json   (servidor Node dev)');
console.log('  - public/api/_data_grado.php   (servidor Apache)');
