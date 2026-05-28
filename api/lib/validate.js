import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import serverData from '../server-data.json' with { type: 'json' };

const CODE_PATTERN = /^\d{3}-FJEI-2026$/;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function masterHash(dni, registro, nombre) {
  const input = `${normalize(dni)}|${normalize(registro)}|${normalize(nombre)}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function normalizeCode(rawCode) {
  return rawCode?.trim().toUpperCase().replace(/\.PDF$/, '') ?? '';
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

export function validateRequest(payload) {
  const code = normalizeCode(payload.code);
  const dni  = payload.dni?.trim() ?? '';

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

  return { ok: true, code, dni, nombre: record.nombre, hashValidacion: record.hashValidacion };
}

export function getPdfPath(hashValidacion) {
  const publicPath = path.join(rootDir, 'public', 'private', 'diplomado', `${hashValidacion}.pdf`);
  const privatePath = path.join(rootDir, 'private', 'diplomado', `${hashValidacion}.pdf`);
  if (fs.existsSync(publicPath)) return publicPath;
  return privatePath;
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
