import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const outputPath = resolve(
  'src',
  'environments',
  'environment.generated.production.ts',
);

const requiredKeys = [
  'APP_API_BASE_URL',
  'APP_AUTH_ISSUER',
  'APP_AUTH_PROJECT_REF',
  'APP_AUTH_ANON_KEY',
];

function readEnv(name) {
  return process.env[name]?.trim() ?? '';
}

function escapeValue(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function getStorageKey(projectRef) {
  const explicitStorageKey = readEnv('APP_AUTH_STORAGE_KEY');
  if (explicitStorageKey) {
    return explicitStorageKey;
  }

  return `sb-${projectRef}-auth-token`;
}

async function main() {
  const missingKeys = requiredKeys.filter((key) => !readEnv(key));
  if (missingKeys.length) {
    console.error(
      `Missing required production environment variables: ${missingKeys.join(', ')}`,
    );
    process.exit(1);
  }

  const apiBaseUrl = readEnv('APP_API_BASE_URL');
  const issuer = readEnv('APP_AUTH_ISSUER');
  const projectRef = readEnv('APP_AUTH_PROJECT_REF');
  const anonKey = readEnv('APP_AUTH_ANON_KEY');
  const storageKey = getStorageKey(projectRef);

  const fileContents = `export const environment = {
  production: true,
  api: {
    baseUrl: '${escapeValue(apiBaseUrl)}',
  },
  auth: {
    issuer: '${escapeValue(issuer)}',
    projectRef: '${escapeValue(projectRef)}',
    storageKey: '${escapeValue(storageKey)}',
    anonKey: '${escapeValue(anonKey)}',
  },
};
`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, fileContents, 'utf8');
  console.log(`Wrote production environment to ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate production environment file.', error);
  process.exit(1);
});
