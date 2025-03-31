import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpStatusCode } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  Subject,
  tap,
  throwError
} from 'rxjs';
import urlJoin from 'url-join';
import { merge } from 'lodash-es';
import { DeepPartial } from 'utility-types';
import { environment } from '@environments';
import { User } from '@core/models';
import {
  CursorPageDto,
  CursorQueryDto,
  UpdateProfileRequestDto
} from '@core/dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userChangesSubject: Subject<{ id: string } & DeepPartial<User>> =
    new Subject();
  private currentUserSubject: BehaviorSubject<User | undefined> =
    new BehaviorSubject<User | undefined>(undefined);

  constructor(private readonly http: HttpClient) {}

  get userChanges$(): Observable<{ id: string } & DeepPartial<User>> {
    return this.userChangesSubject.asObservable();
  }

  get currentUser$(): Observable<User | undefined> {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): User | undefined {
    return this.currentUserSubject.getValue();
  }

  set currentUser(user: User | undefined) {
    this.currentUserSubject.next(user);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(
      urlJoin(environment.api.hivemind, `/v1/users/${userId}`)
    );
  }

  getUsersBySearchTerm(
    search: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<User>> {
    return this.http.get<CursorPageDto<User>>(
      urlJoin(environment.api.hivemind, `/v1/users`),
      { params: new HttpParams({ fromObject: { ...pagination, search } }) }
    );
  }

  getSuggestedUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      urlJoin(environment.api.hivemind, `/v1/users`)
    );
  }

  getUserFollowers(
    userId: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<User>> {
    return this.http.get<CursorPageDto<User>>(
      urlJoin(environment.api.hivemind, `/v1/users/${userId}/followers`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  getUserFollowings(
    userId: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<User>> {
    return this.http.get<CursorPageDto<User>>(
      urlJoin(environment.api.hivemind, `/v1/users/${userId}/followings`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  updateProfile(
    updateProfileRequest: UpdateProfileRequestDto
  ): Observable<void> {
    return this.http
      .patch(
        urlJoin(environment.api.hivemind, `/v1/users`),
        updateProfileRequest
      )
      .pipe(
        map(() => {
          const { birthdate, ...profile } = updateProfileRequest;
          merge(this.currentUser, {
            birthdate: birthdate,
            profile
          });
        })
      );
  }

  isUsernameOrEmailAvailable(usernameOrEmail: string): Observable<Boolean> {
    return this.http
      .head<void>(urlJoin(environment.api.hivemind, '/v1/users'), {
        headers: { 'X-Exclude-Bearer': 'true' },
        params: { usernameOrEmail }
      })
      .pipe(
        map(() => true),
        catchError((error) => {
          return error.status === HttpStatusCode.Conflict
            ? of(false)
            : throwError(() => error);
        })
      );
  }

  follow(user: User, notifyChanges: boolean = true): Observable<void> {
    return !user.relation || user.relation.followed
      ? EMPTY
      : this.http
          .post<void>(
            urlJoin(environment.api.hivemind, `/v1/users/${user.id}/followers`),
            {}
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.userChangesSubject.next({
                  id: user.id,
                  relation: { followed: true },
                  metric: { followers: user.metric.followers + 1 }
                });
              }
              this.currentUserSubject.next(
                merge(this.currentUser, {
                  metric: {
                    followings: this.currentUser!.metric.followings + 1
                  }
                })
              );
            })
          );
  }

  unfollow(user: User, notifyChanges: boolean = true): Observable<void> {
    return user.relation && !user.relation.followed
      ? EMPTY
      : this.http
          .delete<void>(
            urlJoin(environment.api.hivemind, `/v1/users/${user.id}/followers`),
            {}
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.userChangesSubject.next({
                  id: user.id,
                  relation: { followed: false },
                  metric: { followers: user.metric.followers - 1 }
                });
              }
              this.currentUserSubject.next(
                merge(this.currentUser, {
                  metric: {
                    followings: this.currentUser!.metric.followings - 1
                  }
                })
              );
            })
          );
  }
}
