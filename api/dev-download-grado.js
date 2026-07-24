import fs from 'fs';
import {
  getPdfPathGrado,
  parseJsonBody,
  sendJson,
  validateGradoRequest,
} from './lib/validate-grado.js';

export async function handleDownloadGradoRequest(req, res) {
  if (req.method !== 'POST') {
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

  const result = validateGradoRequest(payload);
  if (!result.ok) {
    sendJson(res, result.status, { error: result.error });
    return;
  }

  const pdfPath = getPdfPathGrado(result.hashValidacion);
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
