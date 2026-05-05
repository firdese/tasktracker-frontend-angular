import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { hasAccessToken } from './auth-session';

export const authGuard: CanActivateFn = (_route, state) => {
  if (hasAccessToken()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url || '/' },
  });
};
