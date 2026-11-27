import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/resend-verification',
  '/auth/me',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Klonujemy żądanie i włączamy withCredentials: true.
  // Jest to niezbędne, aby przeglądarka wysyłała i odbierała ciasteczka HttpOnly
  // w zapytaniach typu Cross-Origin (czyli z portu 4200 na port 3000).
  let clonedReq = req.clone({
    withCredentials: true,
  });

  // Automatycznie dodajemy prefiks z adresem backendu ze zmiennych środowiskowych,
  // jeśli ścieżka zaczyna się od "/" i nie jest zasobem statycznym.
  if (
    req.url.startsWith('/') &&
    !req.url.startsWith('/assets') &&
    !req.url.startsWith('/images')
  ) {
    clonedReq = clonedReq.clone({
      url: `${environment.apiUrl}${req.url}`,
    });
  }

  const isAuthPublicEndpoint = AUTH_PUBLIC_PATHS.some((path) => req.url.startsWith(path));

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthPublicEndpoint) {
        authService.clearSession();
        router.navigate(['/unauthorized'], { queryParams: { code: 401 } });
      } else if (error.status === 403) {
        router.navigate(['/unauthorized'], { queryParams: { code: 403 } });
      } else if (error.status >= 500) {
        router.navigate(['/error'], { queryParams: { code: error.status } });
      }

      return throwError(() => error);
    }),
  );
};
