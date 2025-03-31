import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import urlJoin from 'url-join';
import { environment } from '@environments';
import { JwtPairDto, SignInRequestDto, SignUpRequestDto } from '@core/dto';
import { JwtService, UserService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  signIn(
    signInRequest: SignInRequestDto,
    keepSignedIn: boolean
  ): Observable<void> {
    return this.http
      .post<JwtPairDto>(
        urlJoin(environment.api.hivemind, '/v1/auth/signin'),
        signInRequest,
        { headers: { 'X-Exclude-Bearer': 'true' } }
      )
      .pipe(
        tap((jwtPair) => this.jwtService.saveJwtPair(jwtPair, keepSignedIn)),
        switchMap(() => this.loadCurrentUser()),
        catchError((error) => {
          this.jwtService.clearJwtPair();
          return throwError(() => error);
        })
      );
  }

  signUp(signUpRequest: SignUpRequestDto): Observable<void> {
    return this.http
      .post<JwtPairDto>(
        urlJoin(environment.api.hivemind, '/v1/auth/signup'),
        signUpRequest,
        { headers: { 'X-Exclude-Bearer': 'true' } }
      )
      .pipe(
        tap((jwtPair) => this.jwtService.saveJwtPair(jwtPair, false)),
        switchMap(() => this.loadCurrentUser()),
        catchError((error) => {
          this.jwtService.clearJwtPair();
          return throwError(() => error);
        })
      );
  }

  signOut(): Observable<void> {
    return this.http
      .post<void>(urlJoin(environment.api.hivemind, '/v1/auth/signout'), {})
      .pipe(
        finalize(() => {
          this.jwtService.clearJwtPair();
          this.userService.currentUser = undefined;
        })
      );
  }

  refresh(refreshToken: string): Observable<void> {
    return this.http
      .post<JwtPairDto>(
        urlJoin(environment.api.hivemind, '/v1/auth/refresh'),
        { refreshToken },
        { headers: { 'X-Exclude-Bearer': 'true' } }
      )
      .pipe(map((jwtPair) => this.jwtService.saveJwtPair(jwtPair)));
  }

  isAuthenticated(): boolean {
    const jwtPair = this.jwtService.getJwtPair();
    return jwtPair ? !this.jwtService.isJwtExpired(jwtPair.accessToken) : false;
  }

  isRefreshable(): boolean {
    const jwtPair = this.jwtService.getJwtPair();
    return jwtPair
      ? !this.jwtService.isJwtExpired(jwtPair.refreshToken)
      : false;
  }

  loadCurrentUser(): Observable<void> {
    return !this.isAuthenticated() && !this.isRefreshable()
      ? of(void 0)
      : this.userService.getUserById(this.jwtService.getSub()!).pipe(
          map((user) => {
            this.userService.currentUser = user;
          })
        );
  }
}
