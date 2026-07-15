import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Klonujemy żądanie i włączamy withCredentials: true.
  // Jest to niezbędne, aby przeglądarka wysyłała i odbierała ciasteczka HttpOnly
  // w zapytaniach typu Cross-Origin (czyli z portu 4200 na port 3000).
  let clonedReq = req.clone({
    withCredentials: true,
  });

  // Automatycznie dodajemy prefiks z adresem backendu ze zmiennych środowiskowych,
  // jeśli ścieżka zaczyna się od "/" (np. "/auth/login" zamieni się na "http://localhost:3000/auth/login").
  if (req.url.startsWith('/') && !req.url.startsWith('/assets')) {
    clonedReq = clonedReq.clone({
      url: `${environment.apiUrl}${req.url}`,
    });
  }

  return next(clonedReq);
};
