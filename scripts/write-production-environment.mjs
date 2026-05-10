import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputPath = resolve(
  "src",
  "environments",
  "environment.generated.production.ts",
);

const requiredKeys = ["APP_API_BASE_URL"];

function readEnv(name) {
  return process.env[name]?.trim() ?? "";
}

function escapeValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function getStorageKey(projectRef) {
  const explicitStorageKey = readEnv("APP_AUTH_STORAGE_KEY");
  if (explicitStorageKey) {
    return explicitStorageKey;
  }

  return `sb-${projectRef}-auth-token`;
}

async function main() {
  const authProvider = readEnv("APP_AUTH_PROVIDER") || "supabase";
  const authKeys =
    authProvider === "keycloak"
      ? [
          "APP_AUTH_KEYCLOAK_ISSUER",
          "APP_AUTH_KEYCLOAK_REALM",
          "APP_AUTH_KEYCLOAK_CLIENT_ID",
        ]
      : ["APP_AUTH_ISSUER", "APP_AUTH_PROJECT_REF", "APP_AUTH_ANON_KEY"];

  const missingKeys = requiredKeys.filter((key) => !readEnv(key));
  const missingAuthKeys = authKeys.filter((key) => !readEnv(key));
  if (missingKeys.length || missingAuthKeys.length) {
    console.error(
      `Missing required production environment variables: ${[
        ...missingKeys,
        ...missingAuthKeys,
      ].join(", ")}`,
    );
    process.exit(1);
  }

  const apiBaseUrl = readEnv("APP_API_BASE_URL");
  const issuer = readEnv("APP_AUTH_ISSUER");
  const projectRef = readEnv("APP_AUTH_PROJECT_REF");
  const anonKey = readEnv("APP_AUTH_ANON_KEY");
  const storageKey = getStorageKey(projectRef);
  const keycloakIssuer = readEnv("APP_AUTH_KEYCLOAK_ISSUER");
  const keycloakRealm = readEnv("APP_AUTH_KEYCLOAK_REALM");
  const keycloakClientId = readEnv("APP_AUTH_KEYCLOAK_CLIENT_ID");

  const fileContents = `export const environment = {
  production: true,
  api: {
    baseUrl: '${escapeValue(apiBaseUrl)}',
  },
  auth: {
    provider: '${escapeValue(authProvider)}',
    issuer: '${escapeValue(issuer)}',
    projectRef: '${escapeValue(projectRef)}',
    storageKey: '${escapeValue(storageKey)}',
    anonKey: '${escapeValue(anonKey)}',
    keycloak: {
      issuer: '${escapeValue(keycloakIssuer)}',
      realm: '${escapeValue(keycloakRealm)}',
      clientId: '${escapeValue(keycloakClientId)}',
    },
  },
};
`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, fileContents, "utf8");
  console.log(`Wrote production environment to ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to generate production environment file.", error);
  process.exit(1);
});
