import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards';
import { MainLayoutComponent } from '@core/layouts';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        title: 'Hivemind - Home',
        loadComponent: () =>
          import('@features/hub/pages').then((pages) => pages.HomeComponent)
      },
      {
        path: 'bookmarks',
        title: 'Hivemind - Bookmarks',
        loadComponent: () =>
          import('@features/hub/pages').then(
            (pages) => pages.BookmarksComponent
          )
      },
      {
        path: 'explore',
        title: 'Hivemind - Explore',
        loadComponent: () =>
          import('@features/hub/pages').then((pages) => pages.ExploreComponent)
      }
    ]
  }
];
