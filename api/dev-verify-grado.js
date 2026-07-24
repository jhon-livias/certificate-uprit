import {
  parseJsonBody,
  sendJson,
  validateGradoRequest,
} from './lib/validate-grado.js';

export async function handleVerifyGradoRequest(req, res) {
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

  sendJson(res, 200, {
    ok:             true,
    nombre:         result.nombre,
    programa:       result.programa,
    tipo:           result.tipo,
    registro:       result.code,
    hashValidacion: result.hashValidacion,
  });
}
