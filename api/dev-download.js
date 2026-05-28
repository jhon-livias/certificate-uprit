import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import diplomas from '../src/data/diplomas.json' with { type: 'json' };

const CODE_PATTERN = /^\d{3}-FJEI-2026$/;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function handleDownloadRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let payload;
    try {
      payload = body ? JSON.parse(body) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Solicitud inválida' }));
      return;
    }

    const normalizedCode = payload.code?.trim().toUpperCase().replace(/\.PDF$/, '') ?? '';
    const dni = payload.dni?.trim() ?? '';

    if (!CODE_PATTERN.test(normalizedCode) || !/^\d{7,12}$/.test(dni)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Datos inválidos' }));
      return;
    }

    const record = diplomas.find((item) => item.registro === normalizedCode);
    const expectedHash = sha256(dni + ':' + normalizedCode);
    if (!record || record.dniHash !== expectedHash) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No autorizado' }));
      return;
    }

    const pdfPath = path.join(rootDir, 'private', 'diplomado', `${normalizedCode}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'PDF no encontrado' }));
      return;
    }

    const pdf = fs.readFileSync(pdfPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Content-Disposition', `attachment; filename="${normalizedCode}.pdf"`);
    res.setHeader('Cache-Control', 'no-store');
    res.end(pdf);
  });
}
