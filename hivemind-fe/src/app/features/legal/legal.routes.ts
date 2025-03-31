import { Routes } from '@angular/router';
import { ArticleLayoutComponent } from '@core/layouts';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tos'
  },
  {
    path: '',
    component: ArticleLayoutComponent,
    children: [
      {
        path: 'tos',
        title: 'Hivemind - Terms of Service',
        loadComponent: () =>
          import('@features/legal/pages').then((pages) => pages.TosComponent)
      }
    ]
  }
];
