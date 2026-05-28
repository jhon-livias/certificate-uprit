import fs from 'fs';
import {
  getPdfPath,
  parseJsonBody,
  sendJson,
  validateRequest,
} from './lib/validate.js';

export async function handleDownloadRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Método no permitido' });
    return;
  }

  let payload;
  try {
    payload = await parseJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Solicitud inválida' });
    return;
  }

  const result = validateRequest(payload);
  if (!result.ok) {
    sendJson(res, result.status, { error: result.error });
    return;
  }

  const pdfPath = getPdfPath(result.code);
  if (!fs.existsSync(pdfPath)) {
    sendJson(res, 404, { error: 'PDF no encontrado' });
    return;
  }

  const pdf = fs.readFileSync(pdfPath);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdf.length);
  res.setHeader('Content-Disposition', `attachment; filename="${result.code}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end(pdf);
}
