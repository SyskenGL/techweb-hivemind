import { Routes } from '@angular/router';
import { GuestGuard } from '@core/guards';
import { PlainLayoutComponent } from '@core/layouts';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'signin'
  },
  {
    path: '',
    canActivate: [GuestGuard],
    component: PlainLayoutComponent,
    children: [
      {
        path: 'signin',
        title: 'Hivemind - Dive In',
        loadComponent: () =>
          import('@features/auth/pages').then((pages) => pages.SignInComponent)
      },
      {
        path: 'signup',
        title: 'Hivemind - Join the Hive',
        loadComponent: () =>
          import('@features/auth/pages').then((pages) => pages.SignUpComponent)
      }
    ]
  }
];
