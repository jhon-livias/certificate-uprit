import {
  parseJsonBody,
  sendJson,
  validateRequest,
} from './lib/validate.js';

export async function handleVerifyRequest(req, res) {
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

  sendJson(res, 200, {
    ok: true,
    nombre: result.nombre,
    registro: result.code,
  });
}
