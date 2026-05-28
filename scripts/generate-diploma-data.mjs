import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(rootDir, 'scripts', 'diplomas-source.json');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const clientData = source.map(({ dni, nombre, registro }) => ({
  registroHash: sha256(registro),
  dniHash: sha256(`${dni}:${registro}`),
  nombreHash: sha256(nombre),
}));

const serverData = Object.fromEntries(
  source.map(({ dni, nombre, registro }) => [
    registro,
    { dniHash: sha256(`${dni}:${registro}`), nombre },
  ]),
);

const phpLines = source.map(({ dni, nombre, registro }) => {
  const dniHash = sha256(`${dni}:${registro}`);
  const escapedNombre = nombre.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `    '${registro}' => ['dniHash' => '${dniHash}', 'nombre' => '${escapedNombre}'],`;
});

const phpContent = `<?php
// Generado automáticamente — no editar a mano. Ejecutar: npm run generate-data
return [
${phpLines.join('\n')}
];
`;

fs.writeFileSync(
  path.join(rootDir, 'src', 'data', 'diplomas.json'),
  JSON.stringify(clientData, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(rootDir, 'api', 'server-data.json'),
  JSON.stringify(serverData, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(rootDir, 'public', 'api', '_data.php'),
  phpContent,
);

console.log(`Generados ${clientData.length} registros:`);
console.log('  - src/data/diplomas.json (solo hashes, frontend)');
console.log('  - api/server-data.json (servidor Node dev)');
console.log('  - public/api/_data.php (servidor Apache)');
