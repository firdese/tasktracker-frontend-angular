import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeKeycloak } from './app/keycloak-init';

initializeKeycloak()
  .then(() => {
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  })
  .catch(err => {
    console.error("Keycloak init failed", err);
  });
