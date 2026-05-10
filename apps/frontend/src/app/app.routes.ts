import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-page.component').then((m) => m.LoginPage),
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./features/overview/overview-page.component').then((m) => m.OverviewPage),
    canActivate: [authGuard],
  },
  {
    path: 'input',
    loadComponent: () =>
      import('./features/input/input-page.component').then((m) => m.InputPage),
    canActivate: [authGuard],
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results/results-page.component').then((m) => m.ResultsPage),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: '**', redirectTo: '/overview' },
];
