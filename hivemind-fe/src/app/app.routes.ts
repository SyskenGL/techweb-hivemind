import { Routes } from '@angular/router';
import { routes as authRoutes } from '@features/auth/auth.routes';
import { routes as legalRoutes } from '@features/legal/legal.routes';
import { routes as userRoutes } from '@features/user/user.routes';
import { routes as buzzRoutes } from '@features/buzz/buzz.routes';
import { routes as hubRoutes } from '@features/hub/hub.routes';

export const routes: Routes = [
  {
    path: '',
    title: 'Hivemind',
    children: [
      { path: 'legal', children: [...legalRoutes] },
      { path: 'auth', loadChildren: () => authRoutes },
      { path: 'user', loadChildren: () => userRoutes },
      { path: 'buzzes', loadChildren: () => buzzRoutes },
      { path: '', loadChildren: () => hubRoutes },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
