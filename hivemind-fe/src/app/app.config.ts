import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withInMemoryScrolling,
  withPreloading
} from '@angular/router';
import { IMAGE_LOADER } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLoadingBarRouter } from '@ngx-loading-bar/router';
import { provideToastr } from 'ngx-toastr';
import { AuthInterceptor } from '@core/interceptors';
import { CustomReuseStrategy, imageLoader } from '@core/strategies';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideLoadingBarRouter(),
    provideToastr({
      preventDuplicates: true,
      progressBar: true,
      positionClass: 'toast-bottom-center'
    }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: IMAGE_LOADER, useValue: imageLoader },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ]
};
