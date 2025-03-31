import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, map, Observable, Subject, switchMap, tap } from 'rxjs';
import urlJoin from 'url-join';
import { DeepPartial } from 'utility-types';
import { environment } from '@environments';
import { CursorQueryDto, CursorPageDto } from '@core/dto';
import { Comment } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly commentChangesSubject: Subject<
    { id: string } & DeepPartial<Comment>
  > = new Subject();

  constructor(private readonly http: HttpClient) {}

  get commentChanges$(): Observable<{ id: string } & DeepPartial<Comment>> {
    return this.commentChangesSubject.asObservable();
  }

  getCommentById(commentId: string): Observable<Comment> {
    return this.http.get<Comment>(
      urlJoin(environment.api.hivemind, `/v1/comments/${commentId}`)
    );
  }

  getBuzzComments(
    buzzId: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<Comment>> {
    return this.http.get<CursorPageDto<Comment>>(
      urlJoin(environment.api.hivemind, `/v1/buzzes/${buzzId}/comments`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  getCommentReplies(
    commentId: string,
    pagination: CursorQueryDto = {}
  ): Observable<CursorPageDto<Comment>> {
    return this.http.get<CursorPageDto<Comment>>(
      urlJoin(environment.api.hivemind, `/v1/comments/${commentId}/replies`),
      { params: new HttpParams({ fromObject: { ...pagination } }) }
    );
  }

  updateComment(commentId: string, content: string): Observable<void> {
    return this.http
      .patch(urlJoin(environment.api.hivemind, `/v1/comments/${commentId}`), {
        content
      })
      .pipe(map(() => {}));
  }

  postComment(buzzId: string, content: string): Observable<Comment> {
    return this.http
      .post(
        urlJoin(environment.api.hivemind, `/v1/buzzes/${buzzId}/comments`),
        { content },
        { observe: 'response' }
      )
      .pipe(
        switchMap((response: any) => {
          const location = response.headers.get('location');
          const commentId = location.split('/').pop();
          return this.getCommentById(commentId);
        })
      );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http
      .delete(urlJoin(environment.api.hivemind, `/v1/comments/${commentId}`))
      .pipe(map(() => {}));
  }

  vote(
    comment: Comment,
    vote: 'up' | 'down',
    notifyChanges: boolean = true
  ): Observable<void> {
    return comment.interaction.vote === vote
      ? EMPTY
      : this.http
          .post<void>(
            urlJoin(
              environment.api.hivemind,
              `/v1/comments/${comment.id}/votes`
            ),
            { type: vote }
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                const votes = {
                  ...comment.metric.votes,
                  [vote]: comment.metric.votes[vote] + 1
                };
                comment.interaction.vote && votes[comment.interaction.vote]--;
                this.commentChangesSubject.next({
                  id: comment.id,
                  interaction: { vote },
                  metric: { votes }
                });
              }
            })
          );
  }

  unvote(comment: Comment, notifyChanges: boolean = true): Observable<void> {
    return comment.interaction.vote === null
      ? EMPTY
      : this.http
          .delete<void>(
            urlJoin(
              environment.api.hivemind,
              `/v1/comments/${comment.id}/votes`
            )
          )
          .pipe(
            tap(() => {
              if (notifyChanges) {
                this.commentChangesSubject.next({
                  id: comment.id,
                  interaction: { vote: null },
                  metric: {
                    votes:
                      comment.interaction.vote === 'up'
                        ? { up: comment.metric.votes.up - 1 }
                        : { down: comment.metric.votes.down - 1 }
                  }
                });
              }
            })
          );
  }
}
