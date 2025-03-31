import { Routes } from '@angular/router';
import { AuthGuard, PendingChangesGuard } from '@core/guards';
import { MainLayoutComponent } from '@core/layouts';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'create',
        canDeactivate: [PendingChangesGuard],
        title: 'Hivemind - Create',
        loadComponent: () =>
          import('@features/buzz/pages').then(
            (pages) => pages.CreateBuzzComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/buzz/pages').then((pages) => pages.BuzzComponent)
      }
    ]
  }
];
