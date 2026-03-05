import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeKeycloak, keycloak } from './app/keycloak-init';

initializeKeycloak()
  .then((authenticated) => {
    if (!authenticated) {
      void keycloak.login();
      return;
    }

    bootstrapApplication(AppComponent, appConfig).catch((err) =>
      console.error(err),
    );
  })
  .catch((err) => {
    console.error('Keycloak init failed', err);
  });
