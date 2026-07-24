/**
 * Generador de datos hasheados para diplomas de GRADO — UPRIT
 * -----------------------------------------------------------
 * Lee los 4 Excels de uprit-diplomas/data/ y genera los mapeos
 * necesarios para el portal de verificación certificate-uprit.
 *
 * Columnas Excel (flexibles):
 *   PROGRAMA              → programa (se muestra en UI tras verificar)
 *   QR | APELLIDOS Y NOMBRES → nombre completo del egresado (solo servidor)
 *   DNI                   → parte del hash
 *   CREAR CODIGO DE BARRAS → registro / code (clave de lookup + parte del hash)
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

  let s = String(val).replace(/\s+/g, '').trim();

  // Notación científica de Excel (ej. 2.10200112540453165e+17)
  if (/e/i.test(s)) {
    const n = Number(s);
    if (!isNaN(n) && isFinite(n)) s = n.toFixed(0);
  }

  if (!/^\d+$/.test(s)) throw new Error(`Código de barras inválido: ${val}`);
  return s;
}

function findColumn(row, ...candidates) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const key = keys.find(k => k.trim().toUpperCase() === candidate.toUpperCase());
    if (key) return key;
  }
  return null;
}

// ── Definición de fuentes ────────────────────────────────────────────────────
const SOURCES = [
  { file: 'POSGRADO - CREAR CODIGOS.xlsx',                    tipo: 'posgrado' },
  { file: '2- MAESTRIAS.xlsx',                                tipo: 'posgrado' },
  { file: 'PREGRADO - CREAR CODIGOS.xlsx',                     tipo: 'bachiller' },
  { file: '1-CARPETA.xlsx',                                    tipo: 'bachiller' },
  { file: 'SEGUNDA ESPECIALIDAD - CREAR CODIGOS.xlsx',         tipo: 'segunda-especialidad' },
  { file: 'SEGUNDA ESPECIALIDAD - CREAR CODIGOS 45 SE.xlsx',  tipo: 'segunda-especialidad' },
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

  // Detectar columnas (nombres pueden variar entre archivos)
  const sampleRow   = rows[0] ?? {};
  const barcodeKey  = findColumn(sampleRow, 'CREAR CODIGO DE BARRAS');
  const nombreKey   = findColumn(sampleRow, 'QR', 'APELLIDOS Y NOMBRES');

  if (!barcodeKey) {
    console.error(`  ✗ No se encontró columna de barras en ${source.file}`);
    continue;
  }
  if (!nombreKey) {
    console.error(`  ✗ No se encontró columna de nombre en ${source.file}`);
    continue;
  }

  let count = 0;

  for (const row of rows) {
    const programa = String(row['PROGRAMA'] ?? '').trim();
    const nombre   = String(row[nombreKey]  ?? '').trim();
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
