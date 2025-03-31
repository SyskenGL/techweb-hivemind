import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, map, Observable, Subject, tap } from 'rxjs';
import urlJoin from 'url-join';
import { DeepPartial } from 'utility-types';
import { environment } from '@environments';
import { Buzz, Comment } from '@core/models';
import {
  CursorQueryDto,
  CursorPageDto,
  BuzzCriterionQueryDto,
  PostBuzzRequestDto
} from '@core/dto';
import { CommentService } from './comment.service';
import { UserService } from './user.service';
import { merge } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class BuzzService {
  private readonly buzzChangesSubject: Subject<
    ({ id: string } & DeepPartial<Buzz>) | { id: string; action: 'delete' }
  > = new Subject();

  constructor(
    private readonly http: HttpClient,
    private readonly commentService: CommentService,
    private readonly userService: UserService
  ) {}

  get buzzChanges$(): Observable<
    ({ id: string } & DeepPartial<Buzz>) | { id: string; action: 'delete' }
  > {
    return this.buzzChangesSubject.asObservable();
  }

  getBuzzesByCriterion(
    criterion: BuzzCriterionQueryDto,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<Buzz>> {
    return this.http.get<CursorPageDto<Buzz>>(
      urlJoin(environment.api.hivemind, `/v1/buzzes`),
      {
        params: new HttpParams({ fromObject: { ...criterion, ...pagination } })
      }
    );
  }

  getUserBuzzes(
    userId: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<Buzz>> {
    return this.http.get<CursorPageDto<Buzz>>(
      urlJoin(environment.api.hivemind, `/v1/users/${userId}/buzzes`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  getUserBookmarks(
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<Buzz>> {
    return this.http.get<CursorPageDto<Buzz>>(
      urlJoin(environment.api.hivemind, `/v1/bookmarks/buzzes`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  getBuzzById(buzzId: string): Observable<Buzz> {
    return this.http.get<Buzz>(
      urlJoin(environment.api.hivemind, `/v1/buzzes/${buzzId}`)
    );
  }

  postBuzz(postBuzzRequest: PostBuzzRequestDto): Observable<string> {
    return this.http
      .post(urlJoin(environment.api.hivemind, `/v1/buzzes/`), postBuzzRequest, {
        observe: 'response'
      })
      .pipe(
        tap(() => {
          const currentUser = this.userService.currentUser!;
          this.userService.currentUser = merge(currentUser, {
            metric: { buzzes: currentUser.metric.buzzes + 1 }
          });
        }),
        map((response: any) => {
          const location = response.headers.get('location');
          const imageId = location.split('/').pop();
          return imageId;
        })
      );
  }

  deleteBuzz(buzzId: string): Observable<void> {
    return this.http
      .delete(urlJoin(environment.api.hivemind, `/v1/buzzes/${buzzId}`))
      .pipe(
        tap(() => {
          const currentUser = this.userService.currentUser!;
          this.userService.currentUser = merge(currentUser, {
            metric: { buzzes: currentUser.metric.buzzes - 1 }
          });
          this.buzzChangesSubject.next({ id: buzzId, action: 'delete' });
        }),
        map(() => {})
      );
  }

  addComment(
    buzz: Buzz,
    content: string,
    notifyChanges: boolean = true
  ): Observable<Comment> {
    return this.commentService.postComment(buzz.id, content).pipe(
      tap(() => {
        if (notifyChanges) {
          this.buzzChangesSubject.next({
            id: buzz.id,
            metric: { comments: buzz.metric.comments + 1 },
            interaction: { comments: buzz.interaction.comments + 1 }
          });
        }
      })
    );
  }

  removeComment(
    buzz: Buzz,
    commentId: string,
    notifyChanges: boolean = true
  ): Observable<void> {
    return this.commentService.deleteComment(commentId).pipe(
      tap(() => {
        if (notifyChanges) {
          this.buzzChangesSubject.next({
            id: buzz.id,
            metric: { comments: buzz.metric.comments - 1 },
            interaction: { comments: buzz.interaction.comments - 1 }
          });
        }
      })
    );
  }

  view(buzz: Buzz, notifyChanges: boolean = true): Observable<void> {
    return this.http
      .post<void>(
        urlJoin(environment.api.hivemind, `/v1/buzzes/${buzz.id}/views`),
        {}
      )
      .pipe(
        tap(() => {
          if (notifyChanges) {
            this.buzzChangesSubject.next({
              id: buzz.id,
              metric: { views: buzz.metric.views + 1 }
            });
          }
        })
      );
  }

  vote(
    buzz: Buzz,
    vote: 'up' | 'down',
    notifyChanges: boolean = true
  ): Observable<void> {
    return buzz.interaction.vote === vote
      ? EMPTY
      : this.http
          .post<void>(
            urlJoin(environment.api.hivemind, `/v1/buzzes/${buzz.id}/votes`),
            { type: vote }
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                const votes = {
                  ...buzz.metric.votes,
                  [vote]: buzz.metric.votes[vote] + 1
                };
                buzz.interaction.vote && votes[buzz.interaction.vote]--;
                this.buzzChangesSubject.next({
                  id: buzz.id,
                  interaction: { vote },
                  metric: { votes }
                });
              }
            })
          );
  }

  unvote(buzz: Buzz, notifyChanges: boolean = true): Observable<void> {
    return buzz.interaction.vote === null
      ? EMPTY
      : this.http
          .delete<void>(
            urlJoin(environment.api.hivemind, `/v1/buzzes/${buzz.id}/votes`)
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.buzzChangesSubject.next({
                  id: buzz.id,
                  interaction: { vote: null },
                  metric: {
                    votes:
                      buzz.interaction.vote === 'up'
                        ? { up: buzz.metric.votes.up - 1 }
                        : { down: buzz.metric.votes.down - 1 }
                  }
                });
              }
            })
          );
  }

  bookmark(buzz: Buzz, notifyChanges: boolean = true): Observable<void> {
    return buzz.interaction.bookmarked
      ? EMPTY
      : this.http
          .post<void>(
            urlJoin(
              environment.api.hivemind,
              `/v1/bookmarks/buzzes/${buzz.id}`
            ),
            {}
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.buzzChangesSubject.next({
                  id: buzz.id,
                  interaction: { bookmarked: true }
                });
              }
            })
          );
  }

  unbookmark(buzz: Buzz, notifyChanges: boolean = true): Observable<void> {
    return !buzz.interaction.bookmarked
      ? EMPTY
      : this.http
          .delete<void>(
            urlJoin(environment.api.hivemind, `/v1/bookmarks/buzzes/${buzz.id}`)
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.buzzChangesSubject.next({
                  id: buzz.id,
                  interaction: { bookmarked: false }
                });
              }
            })
          );
  }
}
