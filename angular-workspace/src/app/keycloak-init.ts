import Keycloak from 'keycloak-js';
import { environment } from '../environments/environment';

const keycloak = new Keycloak({
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId,
});

export function initializeKeycloak(): Promise<boolean> {
  return keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
  });
}

export { keycloak };
