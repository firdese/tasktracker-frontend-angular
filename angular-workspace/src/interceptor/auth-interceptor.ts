import { HttpInterceptorFn } from '@angular/common/http';
import { keycloak } from '../app/keycloak-init';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = keycloak.token;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
