<?php
require __DIR__ . '/_lib_grado.php';

sendJson(200, [
    'ok'             => true,
    'nombre'         => $result['nombre'],
    'programa'       => $result['programa'],
    'tipo'           => $result['tipo'],
    'registro'       => $result['code'],
    'hashValidacion' => $result['hashValidacion'],
]);
