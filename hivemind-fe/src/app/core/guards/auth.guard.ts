import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService, JwtService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      return of(true);
    }
    if (this.authService.isRefreshable()) {
      const jwtPair = this.jwtService.getJwtPair()!;
      return this.authService.refresh(jwtPair.refreshToken).pipe(
        map(() => true),
        catchError(() => {
          this.jwtService.clearJwtPair();
          return of(this.router.parseUrl('/auth/signin'));
        })
      );
    }
    return of(this.router.parseUrl('/auth/signin'));
  }
}
