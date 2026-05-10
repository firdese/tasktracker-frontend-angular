export const environment = {
  production: false,
  api: {
    baseUrl: 'https://localhost:7190',
  },
  auth: {
    provider: 'supabase',
    issuer: 'https://issuer',
    projectRef: 'project-ref',
    storageKey: 'sb-project-ref-auth-token',
    anonKey: '',
    keycloak: {
      issuer: 'http://localhost:8080',
      realm: 'myrealm',
      clientId: 'task-frontend',
    },
  },
};
