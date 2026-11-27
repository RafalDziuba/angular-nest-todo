import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'resend-verification',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/resend-verification/resend-verification').then(
        (m) => m.ResendVerification,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'unauthorized',
    data: { code: 401 },
    loadComponent: () => import('./features/error-page/error-page').then((m) => m.ErrorPage),
  },
  {
    path: 'error',
    data: { code: 500 },
    loadComponent: () => import('./features/error-page/error-page').then((m) => m.ErrorPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    data: { code: 404 },
    loadComponent: () => import('./features/error-page/error-page').then((m) => m.ErrorPage),
  },
];
