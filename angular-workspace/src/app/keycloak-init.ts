import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',   // Keycloak server
  realm: 'myrealm',               // Your realm
  clientId: 'task-frontend',             // Your client
});

export function initializeKeycloak(): Promise<boolean> {
  return keycloak.init({
    onLoad: 'login-required',     // Force login on app load
    checkLoginIframe: false,      // Disable iframe session check
  });
}

export { keycloak };
