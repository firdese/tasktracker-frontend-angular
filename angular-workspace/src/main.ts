import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeAuth } from './app/auth-session';

initializeAuth()
  .then(() => {
    bootstrapApplication(AppComponent, appConfig).catch((err) =>
      console.error(err),
    );
  })
  .catch((err) => {
    console.error('Auth init failed', err);
  });
