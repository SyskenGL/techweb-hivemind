import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards';
import { MainLayoutComponent } from '@core/layouts';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: ':id',
        title: 'Hivemind',
        loadComponent: () =>
          import('@features/user/pages').then((pages) => pages.ProfileComponent)
      }
    ]
  }
];
