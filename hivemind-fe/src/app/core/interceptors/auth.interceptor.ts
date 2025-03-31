import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  catchError,
  EMPTY,
  finalize,
  Observable,
  Subject,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { environment } from '@environments';
import { AuthService, JwtService } from '@core/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing: boolean = false;
  private refreshSubject!: Subject<void>;

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !request.url.startsWith(environment.api.hivemind) ||
      !!request.headers.get('X-Exclude-Bearer')
    ) {
      return next.handle(request);
    }
    if (!this.authService.isAuthenticated()) {
      return this.handleError401(request, next);
    }
    return next.handle(this.addAuthorization(request)).pipe(
      catchError((error) => {
        return ['hm-auth-e002', 'hm-auth-e003'].includes(error?.error?.code)
          ? this.handleError401(request, next)
          : throwError(() => error);
      })
    );
  }

  private handleError401(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.refreshing) {
      return this.refreshSubject.pipe(
        catchError(() => EMPTY),
        switchMap(() => next.handle(this.addAuthorization(request)))
      );
    }
    if (this.authService.isRefreshable()) {
      const jwtPair = this.jwtService.getJwtPair()!;
      this.refreshing = true;
      this.refreshSubject = new Subject();
      return this.authService.refresh(jwtPair.refreshToken).pipe(
        tap(() => this.refreshSubject.next()),
        catchError((error) => {
          this.refreshSubject.error(error);
          this.jwtService.clearJwtPair();
          this.router.navigateByUrl('/auth/signin');
          return EMPTY;
        }),
        finalize(() => (this.refreshing = false)),
        switchMap(() => next.handle(this.addAuthorization(request)))
      );
    }
    this.router.navigateByUrl('/auth/signin');
    return EMPTY;
  }

  private addAuthorization(request: HttpRequest<any>): HttpRequest<any> {
    const jwtPair = this.jwtService.getJwtPair();
    const clonedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${jwtPair?.accessToken}` }
    });
    return clonedRequest;
  }
}
