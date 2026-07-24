import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import serverData from '../server-data-grado.json' with { type: 'json' };

// Código de barras: solo dígitos, longitud flexible (~18 chars)
const CODE_PATTERN = /^\d+$/;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function normalize(str) {
  return String(str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function masterHash(dni, codigo, nombre) {
  const input = `${normalize(dni)}|${normalize(codigo)}|${normalize(nombre)}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

export function validateGradoRequest(payload) {
  const code = (payload.code ?? '').trim();
  const dni  = (payload.dni  ?? '').trim();

  if (!CODE_PATTERN.test(code) || !/^\d{7,12}$/.test(dni)) {
    return { ok: false, status: 400, error: 'Datos inválidos' };
  }

  const record = serverData[code];
  if (!record) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  const expected = masterHash(dni, code, record.nombre);
  if (record.hashValidacion !== expected) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return {
    ok: true,
    code,
    dni,
    nombre:         record.nombre,
    programa:       record.programa,
    tipo:           record.tipo,
    hashValidacion: record.hashValidacion,
  };
}

export function getPdfPathGrado(hashValidacion) {
  const p = path.join(rootDir, 'public', 'private', 'diplomado', `${hashValidacion}.pdf`);
  return p;
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
