<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Generado por npm run generate-grado-data
$records = require __DIR__ . '/_data_grado.php';

// ── Normalización (idéntica a normalize() en JS y validate-grado.js) ─────────
function normalizeStr(string $s): string {
    $s = mb_strtolower(trim($s), 'UTF-8');
    if (class_exists('Normalizer')) {
        $d = Normalizer::normalize($s, Normalizer::FORM_D);
        if ($d !== false) $s = $d;
    }
    $s = preg_replace('/[\x{0300}-\x{036f}]/u', '', $s);
    $s = preg_replace('/\s+/', ' ', $s);
    return $s;
}

// ── Hash maestro ──────────────────────────────────────────────────────────────
// SHA-256( norm(dni) + "|" + norm(codigo) + "|" + norm(nombre) )
function masterHash(string $dni, string $codigo, string $nombre): string {
    $input = normalizeStr($dni) . '|' . normalizeStr($codigo) . '|' . normalizeStr($nombre);
    return hash('sha256', $input);
}

function sendJson(int $status, array $data): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ── Validación ────────────────────────────────────────────────────────────────
function validatePayload(array $payload, array $records): array {
    if (!isset($payload['code'], $payload['dni'])) {
        sendJson(400, ['error' => 'Solicitud inválida']);
    }

    $code = trim($payload['code']);
    $dni  = trim($payload['dni']);

    // Código de barras: solo dígitos
    if (!preg_match('/^\d+$/', $code) || !preg_match('/^\d{7,12}$/', $dni)) {
        sendJson(400, ['error' => 'Datos inválidos']);
    }

    if (!isset($records[$code])) {
        sendJson(403, ['error' => 'No autorizado']);
    }

    $record   = $records[$code];
    $expected = masterHash($dni, $code, $record['nombre']);

    if ($record['hashValidacion'] !== $expected) {
        sendJson(403, ['error' => 'No autorizado']);
    }

    return [
        'code'           => $code,
        'dni'            => $dni,
        'nombre'         => $record['nombre'],
        'programa'       => $record['programa'],
        'tipo'           => $record['tipo'],
        'hashValidacion' => $record['hashValidacion'],
    ];
}

// ── Entry point ───────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(405, ['error' => 'Método no permitido']);
}

$body    = file_get_contents('php://input');
$payload = json_decode($body, true);
$result  = validatePayload($payload ?? [], $records);
