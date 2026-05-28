import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import serverData from '../server-data.json' with { type: 'json' };

const CODE_PATTERN = /^\d{3}-FJEI-2026$/;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function normalizeCode(rawCode) {
  return rawCode?.trim().toUpperCase().replace(/\.PDF$/, '') ?? '';
}

export function hashDni(code, dni) {
  return crypto.createHash('sha256').update(`${dni}:${code}`).digest('hex');
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export function validateRequest(payload) {
  const code = normalizeCode(payload.code);
  const dni = payload.dni?.trim() ?? '';

  if (!CODE_PATTERN.test(code) || !/^\d{7,12}$/.test(dni)) {
    return { ok: false, status: 400, error: 'Datos inválidos' };
  }

  const record = serverData[code];
  const expectedHash = hashDni(code, dni);

  if (!record || record.dniHash !== expectedHash) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return { ok: true, code, dni, record };
}

export function getPdfPath(code) {
  return path.join(rootDir, 'private', 'diplomado', `${code}.pdf`);
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
