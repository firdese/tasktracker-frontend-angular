import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { getAccessToken, signOut } from '../app/auth-session';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getAccessToken();
  const router = inject(Router);

  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        signOut();
        router.navigate(['/login'], {
          queryParams: { returnUrl: req.url ?? '/' },
        });
      }
      return throwError(() => error);
    }),
  );
};
