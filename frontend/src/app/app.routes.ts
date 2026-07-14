import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'resend-verification',
    loadComponent: () => import('./features/auth/resend-verification/resend-verification').then(m => m.ResendVerification)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
